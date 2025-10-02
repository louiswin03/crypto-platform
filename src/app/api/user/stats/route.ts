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

    console.log('🔍 Recherche du profil pour userId:', userId)

    // Récupérer l'utilisateur depuis la table users pour avoir l'email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('👤 Données utilisateur:', userData)
    console.log('❌ Erreur utilisateur:', userError)

    // Récupérer le profil utilisateur depuis user_profiles (table existante)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)  // user_profiles utilise 'id' directement
      .single()

    console.log('📋 Données profil COMPLÈTES:', profile)
    console.log('📱 Téléphone récupéré de la base:', profile?.phone)
    console.log('📍 Localisation récupérée de la base:', profile?.location)
    console.log('❌ Erreur profil:', profileError)

    // Si pas de profil, créer un profil vide
    if (profileError && profileError.code === 'PGRST116') {
      console.log('⚠️ Aucun profil trouvé pour cet utilisateur')
    }

    // Récupérer les vraies données de backtests
    const { data: backtests, error: backtestError } = await supabase
      .from('user_backtests')
      .select('*')
      .eq('user_id', userId)

    let backtestStats = {
      backtests_count: 0,
      strategies_count: 0,
      success_rate: 0,
      total_pnl: 0,
      best_strategy: null,
      last_backtest_date: null
    }

    if (!backtestError && backtests && backtests.length > 0) {
      backtestStats.backtests_count = backtests.length

      // Compter les stratégies uniques
      const uniqueStrategies = [...new Set(backtests.map(b => b.strategy_name))]
      backtestStats.strategies_count = uniqueStrategies.length

      // Calculer le taux de réussite global
      const totalTrades = backtests.reduce((sum, b) => sum + (b.total_trades || 0), 0)
      const totalWinningTrades = backtests.reduce((sum, b) => sum + (b.winning_trades || 0), 0)
      backtestStats.success_rate = totalTrades > 0 ? (totalWinningTrades / totalTrades) * 100 : 0

      // PnL total
      backtestStats.total_pnl = backtests.reduce((sum, b) => sum + (b.total_pnl || 0), 0)

      // Dernière date de backtest
      const sortedBacktests = backtests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      backtestStats.last_backtest_date = sortedBacktests[0].created_at

      // Meilleure stratégie (par rendement)
      const bestBacktest = backtests.sort((a, b) => (b.total_return || 0) - (a.total_return || 0))[0]
      backtestStats.best_strategy = bestBacktest?.strategy_name || null
    }

    // TODO: Quand la table backtests sera créée, remplacer par :
    /*
    const { data: backtests, error: backtestError } = await supabase
      .from('backtests')
      .select('*')
      .eq('user_id', user.id)

    if (!backtestError && backtests) {
      backtestStats.backtests_count = backtests.length
      backtestStats.strategies_count = [...new Set(backtests.map(b => b.strategy_name))].length

      const successfulBacktests = backtests.filter(b => b.total_return > 0)
      backtestStats.success_rate = backtests.length > 0 ? (successfulBacktests.length / backtests.length) * 100 : 0

      backtestStats.total_pnl = backtests.reduce((sum, b) => sum + (b.total_pnl || 0), 0)

      if (backtests.length > 0) {
        const sortedBacktests = backtests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        backtestStats.last_backtest_date = sortedBacktests[0].created_at

        const bestBacktest = backtests.sort((a, b) => (b.total_return || 0) - (a.total_return || 0))[0]
        backtestStats.best_strategy = bestBacktest.strategy_name
      }
    }
    */

    // Statistiques d'activité récente
    const recentActivity = []

    // TODO: Implémenter la récupération d'activité depuis une table activity_log
    /*
    const { data: activities } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (activities) {
      recentActivity = activities
    }
    */

    // Données de performance simulées (à remplacer par de vraies données)
    const performanceData = {
      monthly_return: 0,
      quarterly_return: 0,
      yearly_return: 0,
      sharpe_ratio: 0,
      max_drawdown: 0
    }

    const stats = {
      user_info: {
        id: userId,
        email: userData?.email || 'Non disponible',  // Email récupéré depuis la table users
        created_at: profile?.created_at || userData?.created_at || new Date().toISOString(),
        plan: profile?.plan || 'free',
        phone: profile?.phone || '',
        location: profile?.location || '',
        preferences: profile?.preferences || {}
      },
      backtest_stats: backtestStats,
      performance_data: performanceData,
      recent_activity: recentActivity,
      account_stats: {
        exchanges_count: 0, // TODO: compter depuis une table exchanges
        api_keys_count: 0,  // TODO: compter depuis une table api_keys
        total_login_count: 1,
        last_login: new Date().toISOString()
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}