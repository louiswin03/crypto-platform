import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/services/emailService'
import { createClient } from '@supabase/supabase-js'

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
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    console.log('📧 Tentative de réinitialisation pour:', email)

    // Vérifier si l'utilisateur existe
    console.log('🔍 Recherche de l\'utilisateur...')
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .limit(1)

    if (userError) {
      console.error('❌ Erreur lors de la recherche de l\'utilisateur:', userError)
      return NextResponse.json(
        { error: 'Erreur lors de la recherche de l\'utilisateur' },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      console.log('❌ Utilisateur non trouvé')
      return NextResponse.json(
        { error: 'Aucun compte associé à cette adresse email' },
        { status: 404 }
      )
    }

    const user = users[0]
    console.log('✅ Utilisateur trouvé:', user.email)

    // Générer un token de réinitialisation sécurisé
    const token = crypto.randomBytes(32).toString('hex')
    console.log('🔐 Token généré')

    // Le token expire dans 3 heures (pour compenser les problèmes de timezone)
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000)
    console.log('⏰ Token expire à (UTC):', expiresAt.toISOString())

    // Supprimer les anciens tokens non utilisés pour cet utilisateur
    console.log('🗑️ Suppression des anciens tokens...')
    const { error: deleteError } = await supabase
      .from('reset_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false)

    if (deleteError) {
      console.error('⚠️ Erreur lors de la suppression des anciens tokens:', deleteError)
      // Continuer quand même
    }

    // Stocker le token dans la base de données
    console.log('💾 Insertion du nouveau token...')
    const { error: insertError } = await supabase
      .from('reset_tokens')
      .insert({
        user_id: user.id,
        token: token,
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion du token:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du token de réinitialisation' },
        { status: 500 }
      )
    }
    console.log('✅ Token stocké en base')

    // Envoyer l'email de réinitialisation
    console.log('Tentative d\'envoi d\'email à:', user.email)

    try {
      const emailResult = await sendPasswordResetEmail(
        user.email,
        token,
        user.email.split('@')[0] // Utiliser la partie avant @ comme nom
      )

      if (!emailResult.success) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailResult.error)
        // Ne pas bloquer si l'email échoue, juste logger
        console.log('⚠️ Email non envoyé, mais token créé')
      } else {
        console.log(`✅ Email de réinitialisation envoyé à: ${email}`)
        if (emailResult.previewUrl) {
          console.log(`📧 Voir l'email de test: ${emailResult.previewUrl}`)
        }
      }
    } catch (emailError: any) {
      console.error('Exception lors de l\'envoi d\'email:', emailError.message)
      // Continuer quand même - le token est créé
    }

    return NextResponse.json({
      success: true,
      message: 'Un email de réinitialisation a été envoyé'
    })

  } catch (error: any) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    console.error('Détails de l\'erreur:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    })
    return NextResponse.json(
      {
        error: 'Erreur serveur lors de la réinitialisation du mot de passe',
        details: error?.message
      },
      { status: 500 }
    )
  }
}
