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

    // Récupérer les clés Binance chiffrées de l'utilisateur
    const { data: exchangeKey, error } = await supabase
      .from('exchange_keys')
      .select('api_key_encrypted, api_secret_encrypted')
      .eq('user_id', user.id)
      .eq('exchange_name', 'binance')
      .eq('status', 'active')
      .single()

    if (error || !exchangeKey) {
      return NextResponse.json(
        { error: 'Compte Binance non connecté' },
        { status: 404 }
      )
    }

    // Déchiffrer les clés
    const apiKey = decrypt(exchangeKey.api_key_encrypted)
    const apiSecret = decrypt(exchangeKey.api_secret_encrypted)

    // Paramètres optionnels pour filtrer les transactions
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000)
    const startTime = searchParams.get('startTime') // timestamp en ms
    const endTime = searchParams.get('endTime') // timestamp en ms

    // Récupérer l'historique des trades depuis Binance
    const timestamp = Date.now()
    let queryString = `timestamp=${timestamp}`

    // Ajouter les paramètres optionnels
    if (startTime) queryString += `&startTime=${startTime}`
    if (endTime) queryString += `&endTime=${endTime}`

    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex')

    // Récupérer tous les trades de tous les symboles
    // D'abord, récupérer la liste des symboles avec balance
    const accountUrl = `https://api.binance.com/api/v3/account?timestamp=${timestamp}&signature=${crypto
      .createHmac('sha256', apiSecret)
      .update(`timestamp=${timestamp}`)
      .digest('hex')}`

    const accountResponse = await fetch(accountUrl, {
      headers: {
        'X-MBX-APIKEY': apiKey
      }
    })

    if (!accountResponse.ok) {
      const errorData = await accountResponse.json()
      return NextResponse.json(
        { error: `Erreur Binance: ${errorData.msg}` },
        { status: 400 }
      )
    }

    const accountData = await accountResponse.json()

    // Récupérer tous les symboles de trading disponibles
    const exchangeInfoResponse = await fetch('https://api.binance.com/api/v3/exchangeInfo')
    const exchangeInfo = await exchangeInfoResponse.json()
    const allSymbols = exchangeInfo.symbols.map((s: any) => s.symbol)

    // Récupérer les trades pour les symboles principaux (limité pour éviter rate limit)
    const mainAssets = accountData.balances
      .filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map((b: any) => b.asset)
      .slice(0, 20) // Limiter à 20 assets principaux

    const allTrades: any[] = []

    // Pour chaque asset, récupérer les trades
    for (const asset of mainAssets) {
      const symbols = [`${asset}USDT`, `${asset}BUSD`, `${asset}BTC`, `${asset}ETH`]

      for (const symbol of symbols) {
        // Vérifier si le symbol existe
        if (!allSymbols.includes(symbol)) continue

        try {
          const tradeTimestamp = Date.now()
          let tradeQueryString = `symbol=${symbol}&timestamp=${tradeTimestamp}&limit=${limit}`

          if (startTime) tradeQueryString += `&startTime=${startTime}`
          if (endTime) tradeQueryString += `&endTime=${endTime}`

          const tradeSignature = crypto
            .createHmac('sha256', apiSecret)
            .update(tradeQueryString)
            .digest('hex')

          const tradesUrl = `https://api.binance.com/api/v3/myTrades?${tradeQueryString}&signature=${tradeSignature}`

          const tradesResponse = await fetch(tradesUrl, {
            headers: {
              'X-MBX-APIKEY': apiKey
            }
          })

          if (tradesResponse.ok) {
            const trades = await tradesResponse.json()

            // Transformer les trades au format unifié
            const formattedTrades = trades.map((trade: any) => ({
              id: `binance-${trade.id}`,
              exchange: 'binance',
              symbol: trade.symbol,
              type: trade.isBuyer ? 'buy' : 'sell',
              price: parseFloat(trade.price),
              quantity: parseFloat(trade.qty),
              quoteQuantity: parseFloat(trade.quoteQty),
              commission: parseFloat(trade.commission),
              commissionAsset: trade.commissionAsset,
              time: new Date(trade.time).toISOString(),
              timestamp: trade.time,
              orderId: trade.orderId,
              isBuyer: trade.isBuyer,
              isMaker: trade.isMaker
            }))

            allTrades.push(...formattedTrades)
          }

          // Petit délai pour éviter le rate limit
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (err) {
          console.error(`Erreur récupération trades ${symbol}:`, err)
        }
      }
    }

    // Trier par date décroissante
    allTrades.sort((a, b) => b.timestamp - a.timestamp)

    // Limiter au nombre demandé
    const limitedTrades = allTrades.slice(0, limit)

    // Récupérer aussi les dépôts et retraits
    const depositTimestamp = Date.now()
    const depositQueryString = `timestamp=${depositTimestamp}`
    const depositSignature = crypto
      .createHmac('sha256', apiSecret)
      .update(depositQueryString)
      .digest('hex')

    let deposits: any[] = []
    let withdrawals: any[] = []

    try {
      // Dépôts
      const depositsUrl = `https://api.binance.com/sapi/v1/capital/deposit/hisrec?${depositQueryString}&signature=${depositSignature}`
      const depositsResponse = await fetch(depositsUrl, {
        headers: {
          'X-MBX-APIKEY': apiKey
        }
      })

      if (depositsResponse.ok) {
        const depositsData = await depositsResponse.json()
        deposits = depositsData.map((d: any) => ({
          id: `binance-deposit-${d.id || d.txId}`,
          exchange: 'binance',
          type: 'deposit',
          asset: d.coin,
          amount: parseFloat(d.amount),
          status: d.status,
          time: new Date(d.insertTime).toISOString(),
          timestamp: d.insertTime,
          txId: d.txId,
          network: d.network
        }))
      }

      // Retraits
      const withdrawTimestamp = Date.now()
      const withdrawQueryString = `timestamp=${withdrawTimestamp}`
      const withdrawSignature = crypto
        .createHmac('sha256', apiSecret)
        .update(withdrawQueryString)
        .digest('hex')

      const withdrawalsUrl = `https://api.binance.com/sapi/v1/capital/withdraw/history?${withdrawQueryString}&signature=${withdrawSignature}`
      const withdrawalsResponse = await fetch(withdrawalsUrl, {
        headers: {
          'X-MBX-APIKEY': apiKey
        }
      })

      if (withdrawalsResponse.ok) {
        const withdrawalsData = await withdrawalsResponse.json()
        withdrawals = withdrawalsData.map((w: any) => ({
          id: `binance-withdraw-${w.id}`,
          exchange: 'binance',
          type: 'withdrawal',
          asset: w.coin,
          amount: parseFloat(w.amount),
          status: w.status,
          time: new Date(w.applyTime).toISOString(),
          timestamp: w.applyTime,
          txId: w.txId,
          network: w.network,
          fee: parseFloat(w.transactionFee || 0)
        }))
      }
    } catch (err) {
      console.error('Erreur récupération deposits/withdrawals:', err)
    }

    return NextResponse.json({
      trades: limitedTrades,
      deposits,
      withdrawals,
      total: {
        trades: limitedTrades.length,
        deposits: deposits.length,
        withdrawals: withdrawals.length
      },
      lastUpdate: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Erreur récupération transactions:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
