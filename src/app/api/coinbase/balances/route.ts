import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { decrypt } from '@/lib/encryption'
import { getUserIdFromRequest } from '@/lib/jwt'

function generateCoinbaseJWT(apiKeyName: string, privateKey: string, requestMethod: string, requestPath: string): string {
  const now = Math.floor(Date.now() / 1000)
  const uri = `${requestMethod} api.coinbase.com${requestPath}`

  const payload = {
    sub: apiKeyName,
    iss: 'cdp',
    nbf: now,
    exp: now + 120,
    uri: uri
  }

  const cleanedPrivateKey = privateKey.replace(/\\n/g, '\n').trim()

  return jwt.sign(payload, cleanedPrivateKey, {
    algorithm: 'ES256',
    header: {
      kid: apiKeyName,
      nonce: crypto.randomBytes(16).toString('hex')
    }
  })
}

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

    const userToken = authHeader.substring(7)

    // Vérifier le token JWT
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

    // Récupérer l'utilisateur
    const user = await SupabaseDatabaseService.getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      )
    }

    // Récupérer les clés Coinbase chiffrées de l'utilisateur
    const { data: exchangeKey, error } = await supabase
      .from('exchange_keys')
      .select('api_key_encrypted, api_secret_encrypted')
      .eq('user_id', user.id)
      .eq('exchange_name', 'coinbase')
      .eq('status', 'active')
      .single()

    if (error || !exchangeKey) {
      return NextResponse.json(
        { error: 'Compte Coinbase non connecté' },
        { status: 404 }
      )
    }

    // Déchiffrer les clés
    const apiKeyName = decrypt(exchangeKey.api_key_encrypted)
    const privateKey = decrypt(exchangeKey.api_secret_encrypted)

    const requestMethod = 'GET'
    const requestPath = '/api/v3/brokerage/accounts'

    // Générer le JWT pour Coinbase Cloud API
    const coinbaseJWT = generateCoinbaseJWT(apiKeyName, privateKey, requestMethod, requestPath)

    // Récupérer les comptes depuis Coinbase Cloud API
    const url = `https://api.coinbase.com${requestPath}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${coinbaseJWT}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      let errorMessage = 'Erreur inconnue'

      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        errorMessage = errorData.message || 'Erreur inconnue'
      } else {
        errorMessage = await response.text()
      }

      return NextResponse.json(
        { error: `Erreur Coinbase: ${errorMessage}` },
        { status: 400 }
      )
    }

    const accountData = await response.json()

    // Récupérer les prix en USD pour chaque compte avec conversion
    const balances = await Promise.all(
      accountData.accounts
        .filter((account: any) => parseFloat(account.available_balance?.value || 0) > 0)
        .map(async (account: any) => {
          const amount = parseFloat(account.available_balance?.value || 0)
          const currency = account.available_balance?.currency || 'USD'

          let valueUsd = 0

          // Si c'est déjà en USD ou stablecoin
          if (currency === 'USD' || currency === 'USDC' || currency === 'USDT') {
            valueUsd = amount
          } else {
            // Récupérer le prix spot depuis CoinGecko ou Coinbase
            try {
              // Utiliser l'API publique de Coinbase pour les taux de change
              const rateResponse = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${currency}`)
              if (rateResponse.ok) {
                const rateData = await rateResponse.json()
                const usdRate = parseFloat(rateData.data?.rates?.USD || 0)
                valueUsd = amount * usdRate
              } else {
                // Si ça échoue, essayer avec le prix du producteur
                valueUsd = amount // Fallback
              }
            } catch (err) {
              console.error(`Erreur prix pour ${currency}:`, err)
              valueUsd = amount // Fallback
            }
          }

          return {
            asset: currency,
            name: account.name,
            amount: amount,
            valueUsd: valueUsd,
            type: account.type || 'CRYPTO'
          }
        })
    )

    // Calculer la valeur totale
    const totalValueUsd = balances.reduce((sum, b) => sum + b.valueUsd, 0)

    // Mettre à jour last_sync_at dans la base
    await supabase
      .from('exchange_keys')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('exchange_name', 'coinbase')

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
