import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { decrypt } from '@/lib/encryption'
import jwt from 'jsonwebtoken'

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

    // Récupérer les balances depuis Binance
    const timestamp = Date.now()
    const queryString = `timestamp=${timestamp}`

    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex')

    const url = `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`

    const response = await fetch(url, {
      headers: {
        'X-MBX-APIKEY': apiKey
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: `Erreur Binance: ${errorData.msg}` },
        { status: 400 }
      )
    }

    const accountData = await response.json()

    // Filtrer les balances non nulles
    const balances = accountData.balances
      .filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map((b: any) => ({
        asset: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked),
        total: parseFloat(b.free) + parseFloat(b.locked)
      }))

    // Récupérer les prix actuels pour calculer la valeur en USD
    const symbols = balances.map((b: any) => `${b.asset}USDT`).join(',')

    let pricesMap: Record<string, number> = {}

    if (balances.length > 0) {
      try {
        const priceResponse = await fetch(`https://api.binance.com/api/v3/ticker/price`)
        if (priceResponse.ok) {
          const prices = await priceResponse.json()
          pricesMap = prices.reduce((acc: any, p: any) => {
            acc[p.symbol] = parseFloat(p.price)
            return acc
          }, {})
        }
      } catch (err) {
        console.error('Erreur récupération prix:', err)
      }
    }

    // Enrichir les balances avec les prix
    const enrichedBalances = balances.map((b: any) => {
      let valueUsd = 0

      if (b.asset === 'USDT' || b.asset === 'USDC' || b.asset === 'BUSD') {
        valueUsd = b.total
      } else {
        const priceKey = `${b.asset}USDT`
        if (pricesMap[priceKey]) {
          valueUsd = b.total * pricesMap[priceKey]
        }
      }

      return {
        ...b,
        valueUsd,
        priceUsd: pricesMap[`${b.asset}USDT`] || 0
      }
    })

    // Calculer la valeur totale
    const totalValueUsd = enrichedBalances.reduce((sum: number, b: any) => sum + b.valueUsd, 0)

    // Mettre à jour last_sync_at dans la base
    await supabase
      .from('exchange_keys')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('exchange_name', 'binance')

    return NextResponse.json({
      balances: enrichedBalances.sort((a: any, b: any) => b.valueUsd - a.valueUsd),
      totalValueUsd,
      accountType: accountData.accountType,
      lastUpdate: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Erreur récupération balances:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
