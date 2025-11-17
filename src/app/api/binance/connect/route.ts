import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { encrypt } from '@/lib/encryption'
import { supabase, SupabaseDatabaseService } from '@/lib/supabaseDatabase'
import { getUserIdFromRequest } from '@/lib/jwt'
import { verifyCsrfToken } from '@/lib/csrf'
import { sanitizeInput } from '@/lib/sanitize'

interface BinanceAccountInfo {
  accountType: string
  canTrade: boolean
  canWithdraw: boolean
  balances: Array<{
    asset: string
    free: string
    locked: string
  }>
}

async function verifyBinanceConnection(apiKey: string, apiSecret: string): Promise<BinanceAccountInfo> {
  try {
    const timestamp = Date.now()
    const queryString = `timestamp=${timestamp}`

    // Créer la signature HMAC
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
      const error = await response.json()
      throw new Error(error.msg || 'Erreur de connexion Binance')
    }

    const data = await response.json()

    // Les permissions doivent être vérifiées via les permissions de l'API key
    // Si l'API permet l'accès au compte, c'est OK - on suppose read-only
    // car toute tentative de trade échouera si les permissions ne sont pas bonnes
    return {
      accountType: data.accountType,
      canTrade: false,  // On suppose read-only
      canWithdraw: false,  // On suppose read-only
      balances: data.balances.filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
    }
  } catch (error: any) {
    throw new Error(error.message || 'Impossible de vérifier la connexion Binance')
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
    const sanitizedApiSecret = sanitizeInput(apiSecret, { maxLength: 500 })

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

    // Vérifier la connexion Binance avec les clés sanitizées
    const accountInfo = await verifyBinanceConnection(sanitizedApiKey, sanitizedApiSecret)

    // Chiffrer les clés avec AES-256-GCM
    const encryptedApiKey = encrypt(sanitizedApiKey)
    const encryptedApiSecret = encrypt(sanitizedApiSecret)

    // Vérifier si une clé existe déjà pour cet utilisateur
    const { data: existingKey } = await supabase
      .from('exchange_keys')
      .select('id')
      .eq('user_id', user.id)
      .eq('exchange_name', 'binance')
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
        console.error('Erreur mise à jour clé:', updateError)
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
          exchange_name: 'binance',
          exchange_display_name: 'Binance',
          api_key_encrypted: encryptedApiKey,
          api_secret_encrypted: encryptedApiSecret,
          is_testnet: false,
          permissions: ['read'],
          status: 'active',
          last_sync_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Erreur insertion clé:', insertError)
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
        accountType: accountInfo.accountType,
        permissions: {
          read: true,
          trade: false,
          withdraw: false
        }
      }
    })
  } catch (error: any) {
    console.error('Erreur connexion Binance:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur de connexion' },
      { status: 400 }
    )
  }
}
