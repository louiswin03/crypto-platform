import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { decrypt } from '@/lib/encryption'
import { getUserIdFromRequest } from '@/lib/jwt'

// Fonction pour générer un JWT Coinbase Cloud API
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
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
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

    // Paramètres optionnels
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000)

    // Récupérer tous les comptes depuis Coinbase Cloud API v3
    const accountsPath = '/api/v3/brokerage/accounts'
    const coinbaseJWT = generateCoinbaseJWT(apiKeyName, privateKey, 'GET', accountsPath)

    const accountsResponse = await fetch(`https://api.coinbase.com${accountsPath}`, {
      headers: {
        'Authorization': `Bearer ${coinbaseJWT}`,
        'Content-Type': 'application/json'
      }
    })

    if (!accountsResponse.ok) {
      let errorMessage = 'Erreur inconnue'
      const contentType = accountsResponse.headers.get('content-type')

      try {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await accountsResponse.json()
          errorMessage = errorData.errors?.[0]?.message || errorData.message || `Status ${accountsResponse.status}`
        } else {
          const errorText = await accountsResponse.text()
          errorMessage = errorText || `Status ${accountsResponse.status}`
        }
      } catch (e) {
        errorMessage = `Status ${accountsResponse.status}`
      }

      return NextResponse.json(
        { error: `Erreur Coinbase: ${errorMessage}` },
        { status: 400 }
      )
    }

    const accountsData = await accountsResponse.json()
    const accounts = accountsData.accounts || []

    const allTransactions: any[] = []

    // Pour chaque compte, récupérer les transactions via l'API v3
    for (const account of accounts) {
      const balance = parseFloat(account.available_balance?.value || 0)
      if (balance === 0) continue

      try {
        // API v3 pour les transactions: /api/v3/brokerage/accounts/{account_uuid}/transactions
        const txPath = `/api/v3/brokerage/accounts/${account.uuid}/transactions`
        const txJWT = generateCoinbaseJWT(apiKeyName, privateKey, 'GET', txPath)

        const txResponse = await fetch(`https://api.coinbase.com${txPath}?limit=${Math.min(limit, 100)}`, {
          headers: {
            'Authorization': `Bearer ${txJWT}`,
            'Content-Type': 'application/json'
          }
        })

        if (txResponse.ok) {
          const txData = await txResponse.json()
          const transactions = txData.transactions || []

          // Transformer les transactions au format unifié
          const formattedTransactions = transactions.map((tx: any) => ({
            id: `coinbase-${tx.id}`,
            exchange: 'coinbase',
            type: tx.type || 'unknown', // Types v3: SEND, BUY, SELL, etc.
            status: tx.status || 'completed',
            amount: {
              value: Math.abs(parseFloat(tx.amount?.value || 0)),
              currency: tx.amount?.currency || account.currency
            },
            time: tx.created_at || tx.updated_at,
            timestamp: new Date(tx.created_at || tx.updated_at).getTime(),
            description: tx.description || `${tx.type} ${tx.amount?.currency}`,
            accountId: account.uuid,
            accountName: account.name,
            accountCurrency: account.currency,
            details: tx
          }))

          allTransactions.push(...formattedTransactions)
        } else {
        }

        // Petit délai pour éviter le rate limit
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (err) {
      }
    }

    // Trier par date décroissante
    allTransactions.sort((a, b) => b.timestamp - a.timestamp)
    // Normaliser les types Coinbase v3 vers notre format standard
    allTransactions.forEach(tx => {
      const type = tx.type?.toLowerCase() || 'unknown'
      if (type === 'buy' || type === 'purchase') {
        tx.type = 'buy'
      } else if (type === 'sell') {
        tx.type = 'sell'
      } else if (type === 'send' || type === 'transfer' || type === 'withdraw' || type === 'withdrawal') {
        tx.type = 'withdrawal'
      } else if (type === 'receive' || type === 'deposit') {
        tx.type = 'deposit'
      }
    })

    // Séparer par type de transaction
    const trades = allTransactions.filter(tx => ['buy', 'sell'].includes(tx.type))
    const deposits = allTransactions.filter(tx => tx.type === 'deposit')
    const withdrawals = allTransactions.filter(tx => tx.type === 'withdrawal')
    const others = allTransactions.filter(tx => !['buy', 'sell', 'deposit', 'withdrawal'].includes(tx.type))

    return NextResponse.json({
      transactions: allTransactions.slice(0, limit),
      trades,
      deposits,
      withdrawals,
      others,
      total: {
        all: allTransactions.length,
        trades: trades.length,
        deposits: deposits.length,
        withdrawals: withdrawals.length,
        others: others.length
      },
      lastUpdate: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || error?.toString() || 'Erreur serveur inconnue' },
      { status: 500 }
    )
  }
}
