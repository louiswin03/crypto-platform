import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/services/emailService'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/lib/rateLimit'

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting strict - Protection contre spam de reset password
    const clientIp = getClientIp(request.headers)
    const rateLimitResult = checkRateLimit(clientIp, RATE_LIMIT_PRESETS.PASSWORD_RESET)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Trop de demandes de réinitialisation. Veuillez réessayer plus tard.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimitResult.retryAfter! / 1000)),
            'X-RateLimit-Limit': String(RATE_LIMIT_PRESETS.PASSWORD_RESET.maxRequests),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetTime)
          }
        }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .limit(1)

    if (userError) {

      return NextResponse.json(
        { error: 'Erreur lors de la recherche de l\'utilisateur' },
        { status: 500 }
      )
    }

    // Si l'utilisateur n'existe pas, retourner quand même un message de succès
    // pour éviter l'énumération d'utilisateurs
    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
      })
    }

    const user = users[0]

    // Générer un token de réinitialisation sécurisé
    const token = crypto.randomBytes(32).toString('hex')

    // Le token expire dans 1 heure (réduit pour sécurité)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // Supprimer les anciens tokens non utilisés pour cet utilisateur
    const { error: deleteError } = await supabase
      .from('reset_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false)

    if (deleteError) {

      // Continuer quand même
    }

    // Stocker le token dans la base de données
    const { error: insertError } = await supabase
      .from('reset_tokens')
      .insert({
        user_id: user.id,
        token: token,
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {

      return NextResponse.json(
        { error: 'Erreur lors de la création du token de réinitialisation' },
        { status: 500 }
      )
    }

    // Envoyer l'email de réinitialisation
    try {
      const emailResult = await sendPasswordResetEmail(
        user.email,
        token,
        user.email.split('@')[0] // Utiliser la partie avant @ comme nom
      )

      if (!emailResult.success) {

      }
    } catch (emailError: unknown) {
      const errorMessage = emailError instanceof Error ? emailError.message : 'Erreur inconnue'

      // Continuer quand même - le token est créé
    }

    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
    })

  } catch (error: unknown) {

    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : undefined

    return NextResponse.json(
      {
        error: 'Erreur serveur lors de la réinitialisation du mot de passe',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
