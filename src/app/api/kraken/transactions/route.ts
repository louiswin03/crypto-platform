import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { decrypt } from '@/lib/encryption'
import { getUserIdFromRequest } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'utilisateur depuis le token JWT
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Vérifier le token JWT
    let userId: string
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key') as { userId: string }
      userId = decoded.userId
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    // Récupérer l'utilisateur
    const user = await SupabaseDatabaseService.getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      )
    }

    // Récupérer les clés Kraken chiffrées de l'utilisateur
    const { data: exchangeKey, error } = await supabase
      .from('exchange_keys')
      .select('api_key_encrypted, api_secret_encrypted')
      .eq('user_id', user.id)
      .eq('exchange_name', 'kraken')
      .eq('status', 'active')
      .single()

    if (error || !exchangeKey) {
      return NextResponse.json(
        { error: 'Compte Kraken non connecté' },
        { status: 404 }
      )
    }

    // Déchiffrer les clés
    const apiKey = decrypt(exchangeKey.api_key_encrypted)
    const apiSecret = decrypt(exchangeKey.api_secret_encrypted)

    // Paramètres optionnels
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 50) // Kraken limite à 50

    // Fonction pour créer la signature Kraken
    function createKrakenSignature(path: string, nonce: string, postData: string): string {
      const message = path + crypto.createHash('sha256').update(nonce + postData).digest('binary')
      const secret = Buffer.from(apiSecret, 'base64')
      return crypto.createHmac('sha512', secret).update(message, 'binary').digest('base64')
    }

    // Récupérer l'historique des trades
    const tradesNonce = Date.now().toString()
    const tradesPath = '/0/private/TradesHistory'
    const tradesPostData = `nonce=${tradesNonce}`
    const tradesSignature = createKrakenSignature(tradesPath, tradesNonce, tradesPostData)

    const tradesResponse = await fetch(`https://api.kraken.com${tradesPath}`, {
      method: 'POST',
      headers: {
        'API-Key': apiKey,
        'API-Sign': tradesSignature,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tradesPostData
    })

    if (!tradesResponse.ok) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des trades Kraken' },
        { status: 400 }
      )
    }

    const tradesData = await tradesResponse.json()

    if (tradesData.error && tradesData.error.length > 0) {
      return NextResponse.json(
        { error: `Erreur Kraken: ${tradesData.error.join(', ')}` },
        { status: 400 }
      )
    }

    const trades = tradesData.result?.trades || {}

    // Transformer les trades au format unifié
    const formattedTrades = Object.entries(trades).map(([txid, trade]: [string, any]) => ({
      id: `kraken-${txid}`,
      exchange: 'kraken',
      type: trade.type, // 'buy' ou 'sell'
      orderType: trade.ordertype,
      price: parseFloat(trade.price),
      cost: parseFloat(trade.cost),
      fee: parseFloat(trade.fee),
      volume: parseFloat(trade.vol),
      margin: parseFloat(trade.margin || 0),
      pair: trade.pair,
      time: new Date(trade.time * 1000).toISOString(),
      timestamp: trade.time * 1000,
      orderId: trade.ordertxid,
      positionStatus: trade.posstatus,
      maker: trade.maker
    }))

    // Récupérer l'historique des dépôts/retraits (Ledgers)
    const ledgersNonce = Date.now().toString()
    const ledgersPath = '/0/private/Ledgers'
    const ledgersPostData = `nonce=${ledgersNonce}`
    const ledgersSignature = createKrakenSignature(ledgersPath, ledgersNonce, ledgersPostData)

    let ledgers: any[] = []

    try {
      const ledgersResponse = await fetch(`https://api.kraken.com${ledgersPath}`, {
        method: 'POST',
        headers: {
          'API-Key': apiKey,
          'API-Sign': ledgersSignature,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: ledgersPostData
      })

      if (ledgersResponse.ok) {
        const ledgersData = await ledgersResponse.json()

        if (!ledgersData.error || ledgersData.error.length === 0) {
          const ledgerEntries = ledgersData.result?.ledger || {}

          ledgers = Object.entries(ledgerEntries).map(([ledgerId, ledger]: [string, any]) => ({
            id: `kraken-ledger-${ledgerId}`,
            exchange: 'kraken',
            type: ledger.type, // 'deposit', 'withdrawal', 'trade', 'margin', etc.
            asset: ledger.asset,
            amount: parseFloat(ledger.amount),
            fee: parseFloat(ledger.fee),
            balance: parseFloat(ledger.balance),
            time: new Date(ledger.time * 1000).toISOString(),
            timestamp: ledger.time * 1000,
            refId: ledger.refid
          }))
        }
      }
    } catch (err) {
      console.error('Erreur récupération ledgers:', err)
    }

    // Séparer dépôts et retraits
    const deposits = ledgers.filter(l => l.type === 'deposit')
    const withdrawals = ledgers.filter(l => l.type === 'withdrawal')

    // Trier tous les trades par date décroissante
    formattedTrades.sort((a, b) => b.timestamp - a.timestamp)

    return NextResponse.json({
      trades: formattedTrades.slice(0, limit),
      deposits,
      withdrawals,
      ledgers,
      total: {
        trades: formattedTrades.length,
        deposits: deposits.length,
        withdrawals: withdrawals.length,
        ledgers: ledgers.length
      },
      lastUpdate: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Erreur récupération transactions Kraken:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
