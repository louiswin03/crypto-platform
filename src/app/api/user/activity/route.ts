import { NextResponse, NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

// Fonction pour vérifier le token JWT et récupérer l'userId (même que dans profile)
async function getUserFromToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre-super-secret-jwt-key-changez-en-production') as { userId: string }
    return decoded.userId
  } catch (error) {
    console.error('Erreur vérification token:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Pour l'instant, créons une activité basée sur les actions réelles de l'utilisateur
    const activities = []

    // Récupérer les informations de connexion récentes depuis users
    const { data: userData } = await supabase
      .from('users')
      .select('last_login, created_at')
      .eq('id', userId)
      .single()

    if (userData?.last_login) {
      activities.push({
        id: 'login_' + Date.now(),
        action: 'Connexion réussie',
        details: `Connexion depuis votre navigateur`,
        timestamp: userData.last_login,
        type: 'auth'
      })
    }

    // Récupérer les modifications de profil récentes
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('updated_at, created_at')
      .eq('id', userId)
      .single()

    if (profile?.created_at) {
      activities.push({
        id: 'profile_created_' + Date.now(),
        action: 'Compte créé',
        details: 'Bienvenue sur CryptoBacktest !',
        timestamp: profile.created_at,
        type: 'auth'
      })
    }

    if (profile?.updated_at && profile.updated_at !== profile.created_at) {
      activities.push({
        id: 'profile_updated_' + Date.now(),
        action: 'Profil mis à jour',
        details: 'Informations personnelles modifiées',
        timestamp: profile.updated_at,
        type: 'auth'
      })
    }

    // TODO: Ajouter d'autres activités quand les tables seront créées
    /*
    // Activités de backtests
    const { data: backtests } = await supabase
      .from('backtests')
      .select('id, strategy_name, created_at, total_return')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (backtests) {
      backtests.forEach(backtest => {
        activities.push({
          id: 'backtest_' + backtest.id,
          action: 'Backtest créé',
          details: `Stratégie: ${backtest.strategy_name} (${backtest.total_return > 0 ? '+' : ''}${(backtest.total_return * 100).toFixed(1)}%)`,
          timestamp: backtest.created_at,
          type: 'backtest'
        })
      })
    }

    // Activités de sécurité
    const { data: securityEvents } = await supabase
      .from('security_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (securityEvents) {
      securityEvents.forEach(event => {
        activities.push({
          id: 'security_' + event.id,
          action: event.action,
          details: event.details,
          timestamp: event.created_at,
          type: 'security'
        })
      })
    }
    */

    // Trier par date décroissante et limiter à 10 activités
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({ activities: sortedActivities })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}