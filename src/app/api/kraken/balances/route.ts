import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { decrypt } from '@/lib/encryption'
import jwt from 'jsonwebtoken'

function generateKrakenSignature(path: string, nonce: string, postData: string, apiSecret: string): string {
  const message = nonce + postData
  const hash = crypto.createHash('sha256').update(message).digest()
  const hmac = crypto.createHmac('sha512', Buffer.from(apiSecret, 'base64'))
  hmac.update(path)
  hmac.update(hash)
  return hmac.digest('base64')
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const userToken = authHeader.substring(7)

    let userId: string
    try {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET || 'your-super-secret-jwt-key') as { userId: string }
      userId = decoded.userId
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      )
    }

    const user = await SupabaseDatabaseService.getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      )
    }

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

    const apiKey = decrypt(exchangeKey.api_key_encrypted)
    const apiSecret = decrypt(exchangeKey.api_secret_encrypted)

    // Récupérer les balances
    const nonce = Date.now().toString()
    const path = '/0/private/Balance'
    const postData = `nonce=${nonce}`
    const signature = generateKrakenSignature(path, nonce, postData, apiSecret)

    const balanceResponse = await fetch(`https://api.kraken.com${path}`, {
      method: 'POST',
      headers: {
        'API-Key': apiKey,
        'API-Sign': signature,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: postData
    })

    if (!balanceResponse.ok) {
      return NextResponse.json(
        { error: 'Erreur Kraken API' },
        { status: 400 }
      )
    }

    const balanceData = await balanceResponse.json()

    if (balanceData.error && balanceData.error.length > 0) {
      return NextResponse.json(
        { error: `Erreur Kraken: ${balanceData.error[0]}` },
        { status: 400 }
      )
    }

    // Récupérer les prix via l'API publique
    const tickerResponse = await fetch('https://api.kraken.com/0/public/Ticker?pair=XXBTZUSD,XETHZUSD,XLTCZUSD')
    let prices: any = {}

    if (tickerResponse.ok) {
      const tickerData = await tickerResponse.json()
      if (tickerData.result) {
        prices = tickerData.result
      }
    }

    // Convertir les balances
    const balances = Object.entries(balanceData.result || {})
      .filter(([asset, amount]: any) => parseFloat(amount) > 0)
      .map(([asset, amount]: any) => {
        const balance = parseFloat(amount)
        let valueUsd = 0

        // Kraken utilise des noms bizarres (XXBT = BTC, XETH = ETH, ZUSD = USD)
        const cleanAsset = asset.replace(/^X/, '').replace(/^Z/, '')

        if (asset === 'ZUSD' || cleanAsset === 'USD') {
          valueUsd = balance
        } else {
          // Essayer de trouver le prix
          const pairKey = Object.keys(prices).find(k => k.includes(asset))
          if (pairKey && prices[pairKey]?.c) {
            const price = parseFloat(prices[pairKey].c[0])
            valueUsd = balance * price
          } else {
            valueUsd = balance // Fallback
          }
        }

        return {
          asset: cleanAsset,
          amount: balance,
          valueUsd: valueUsd
        }
      })

    const totalValueUsd = balances.reduce((sum, b) => sum + b.valueUsd, 0)

    await supabase
      .from('exchange_keys')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('exchange_name', 'kraken')

    return NextResponse.json({
      balances: balances.sort((a, b) => b.valueUsd - a.valueUsd),
      totalValueUsd,
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
