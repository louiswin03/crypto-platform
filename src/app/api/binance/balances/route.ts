import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { decrypt } from '@/lib/encryption'
import { getUserIdFromRequest } from '@/lib/jwt'

// Types Binance
interface BinanceBalance {
  asset: string
  free: string
  locked: string
}

interface BinancePrice {
  symbol: string
  price: string
}

interface EnrichedBalance {
  asset: string
  free: number
  locked: number
  total: number
  valueUsd: number
  priceUsd: number
}

export async function GET(request: NextRequest) {
  try {
    // Authentification
    let userId: string
    try {
      userId = getUserIdFromRequest(request)
    } catch (error) {
      return NextResponse.json(
        { error: 'Non authentifié' },
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
    const balances = (accountData.balances as BinanceBalance[])
      .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map((b) => ({
        asset: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked),
        total: parseFloat(b.free) + parseFloat(b.locked)
      }))

    // Récupérer les prix actuels pour calculer la valeur en USD
    let pricesMap: Record<string, number> = {}

    if (balances.length > 0) {
      try {
        const priceResponse = await fetch(`https://api.binance.com/api/v3/ticker/price`)
        if (priceResponse.ok) {
          const prices = await priceResponse.json() as BinancePrice[]
          pricesMap = prices.reduce((acc, p) => {
            acc[p.symbol] = parseFloat(p.price)
            return acc
          }, {} as Record<string, number>)
        }
      } catch (err) {
        console.error('Erreur récupération prix:', err)
      }
    }

    // Enrichir les balances avec les prix
    const enrichedBalances: EnrichedBalance[] = balances.map((b) => {
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
    const totalValueUsd = enrichedBalances.reduce((sum, b) => sum + b.valueUsd, 0)

    // Mettre à jour last_sync_at dans la base
    await supabase
      .from('exchange_keys')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('exchange_name', 'binance')

    return NextResponse.json({
      balances: enrichedBalances.sort((a, b) => b.valueUsd - a.valueUsd),
      totalValueUsd,
      accountType: accountData.accountType,
      lastUpdate: new Date().toISOString()
    })
  } catch (error: unknown) {
    console.error('Erreur récupération balances:', error)

    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
