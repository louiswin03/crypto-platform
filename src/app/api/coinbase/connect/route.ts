import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { encrypt } from '@/lib/encryption'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { getUserIdFromRequest } from '@/lib/jwt'
import { verifyCsrfToken } from '@/lib/csrf'
import { sanitizeInput } from '@/lib/sanitize'

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

  // Nettoyer la clé privée
  const cleanedPrivateKey = privateKey.replace(/\\n/g, '\n').trim()

  console.log('🔧 JWT Payload:', JSON.stringify(payload, null, 2))

  return jwt.sign(payload, cleanedPrivateKey, {
    algorithm: 'ES256',
    header: {
      kid: apiKeyName,
      nonce: crypto.randomBytes(16).toString('hex')
    }
  })
}

interface CoinbaseAccountInfo {
  name: string
  balance: {
    amount: string
    currency: string
  }
}

async function verifyCoinbaseConnection(apiKeyName: string, privateKey: string): Promise<{ accounts: any[] }> {
  try {
    const requestMethod = 'GET'
    const requestPath = '/api/v3/brokerage/accounts'

    // Générer le JWT pour Coinbase Cloud API
    const coinbaseJWT = generateCoinbaseJWT(apiKeyName, privateKey, requestMethod, requestPath)

    // Utiliser l'API Cloud pour lister les comptes
    const url = `https://api.coinbase.com${requestPath}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${coinbaseJWT}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur de connexion Coinbase')
      } else {
        const errorText = await response.text()
        throw new Error(`Coinbase API error: ${errorText}`)
      }
    }

    const data = await response.json()
    return {
      accounts: data.accounts || []
    }
  } catch (error: any) {
    throw new Error(error.message || 'Impossible de vérifier la connexion Coinbase')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier le token CSRF
    const csrfCheck = await verifyCsrfToken(request.headers)
    if (!csrfCheck.valid) {
      return NextResponse.json(
        { error: csrfCheck.error || 'Protection CSRF échouée' },
        { status: 403 }
      )
    }

    const { apiKey, apiSecret } = await request.json()

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'API Key et Secret Key requis' },
        { status: 400 }
      )
    }

    // Sanitize les inputs
    const sanitizedApiKey = sanitizeInput(apiKey, { maxLength: 500 })
    const sanitizedApiSecret = sanitizeInput(apiSecret, { maxLength: 2000 }) // Plus long pour la clé privée

    // Si l'API key ne contient pas "organizations/", construire le nom complet
    let apiKeyName = sanitizedApiKey
    if (!sanitizedApiKey.includes('organizations/')) {
      // Extraire l'organization ID et l'API key ID depuis la clé privée ou un format attendu
      // Pour Coinbase Cloud, on a besoin du format complet
      // On va demander à l'utilisateur de fournir aussi l'organization ID
      return NextResponse.json(
        { error: 'Format API Key invalide. Utilisez le format complet: organizations/xxx/apiKeys/xxx' },
        { status: 400 }
      )
    }

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

    // Vérifier la connexion Coinbase avec les clés sanitizées
    const accountInfo = await verifyCoinbaseConnection(apiKeyName, sanitizedApiSecret)

    // Chiffrer les clés avec AES-256-GCM
    const encryptedApiKey = encrypt(sanitizedApiKey)
    const encryptedApiSecret = encrypt(sanitizedApiSecret)

    // Vérifier si une clé existe déjà pour cet utilisateur
    const { data: existingKey } = await supabase
      .from('exchange_keys')
      .select('id')
      .eq('user_id', user.id)
      .eq('exchange_name', 'coinbase')
      .single()

    if (existingKey) {
      // Mettre à jour la clé existante
      const { error: updateError } = await supabase
        .from('exchange_keys')
        .update({
          api_key_encrypted: encryptedApiKey,
          api_secret_encrypted: encryptedApiSecret,
          permissions: ['read'],
          status: 'active',
          last_sync_at: new Date().toISOString(),
          error_message: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingKey.id)

      if (updateError) {

        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour de la connexion' },
          { status: 500 }
        )
      }
    } else {
      // Créer une nouvelle entrée
      const { error: insertError } = await supabase
        .from('exchange_keys')
        .insert({
          user_id: user.id,
          exchange_name: 'coinbase',
          exchange_display_name: 'Coinbase',
          api_key_encrypted: encryptedApiKey,
          api_secret_encrypted: encryptedApiSecret,
          is_testnet: false,
          permissions: ['read'],
          status: 'active',
          last_sync_at: new Date().toISOString()
        })

      if (insertError) {

        return NextResponse.json(
          { error: 'Erreur lors de l\'enregistrement de la connexion' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie et sécurisée',
      accountInfo: {
        accountCount: accountInfo.accounts.length,
        permissions: {
          read: true,
          trade: false,
          withdraw: false
        }
      }
    })
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Erreur de connexion' },
      { status: 400 }
    )
  }
}
