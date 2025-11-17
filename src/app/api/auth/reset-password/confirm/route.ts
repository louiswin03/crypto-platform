import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
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
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et mot de passe requis' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Vérifier si le token existe et est valide
    const { data: tokenData, error: tokenError } = await supabase
      .from('reset_tokens')
      .select(`
        id,
        user_id,
        expires_at,
        used,
        users!inner(email)
      `)
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      console.error('Token non trouvé:', tokenError)
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 404 }
      )
    }

    // Extraire l'email de l'objet users
    const email = (tokenData.users as any).email

    console.log('🔍 Données du token:', {
      expires_at: tokenData.expires_at,
      used: tokenData.used,
      now: new Date().toISOString(),
      expiresDate: new Date(tokenData.expires_at).toISOString()
    })

    // Vérifier si le token a déjà été utilisé
    if (tokenData.used) {
      console.log('❌ Token déjà utilisé')
      return NextResponse.json(
        { error: 'Ce lien a déjà été utilisé' },
        { status: 400 }
      )
    }

    // Vérifier si le token a expiré
    const expiresAt = new Date(tokenData.expires_at)
    const now = new Date()

    console.log('⏰ Comparaison des dates:', {
      expiresAt: expiresAt.getTime(),
      now: now.getTime(),
      isExpired: expiresAt < now
    })

    if (expiresAt < now) {
      console.log('❌ Token expiré')
      return NextResponse.json(
        { error: 'Ce lien a expiré. Veuillez demander un nouveau lien de réinitialisation' },
        { status: 400 }
      )
    }

    console.log('✅ Token valide et non expiré')

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log('🔒 Hash du nouveau mot de passe généré')

    // Mettre à jour le mot de passe de l'utilisateur
    const { error: updatePasswordError } = await supabase
      .from('users')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenData.user_id)

    if (updatePasswordError) {
      console.error('Erreur lors de la mise à jour du mot de passe:', updatePasswordError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du mot de passe' },
        { status: 500 }
      )
    }

    // Marquer le token comme utilisé
    const { error: updateTokenError } = await supabase
      .from('reset_tokens')
      .update({ used: true })
      .eq('id', tokenData.id)

    if (updateTokenError) {
      console.error('Erreur lors de la mise à jour du token:', updateTokenError)
      // Continuer quand même - le mot de passe a été changé
    }

    console.log(`Mot de passe réinitialisé pour l'utilisateur: ${email}`)

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      email: email // Pour connecter automatiquement l'utilisateur
    })

  } catch (error) {
    console.error('Erreur lors de la confirmation de réinitialisation du mot de passe:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    )
  }
}
