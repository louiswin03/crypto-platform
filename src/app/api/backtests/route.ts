import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { supabase } from '@/lib/supabase'

// POST - Sauvegarder un nouveau backtest
export async function POST(request: Request) {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')

    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authorization.substring(7)

    // Vérifier le token et obtenir l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const body = await request.json()
    const {
      strategyName,
      config,
      results
    } = body

    if (!strategyName || !config || !results) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Calculer les statistiques du backtest
    const totalTrades = results.state?.trades?.length || 0
    const winningTrades = results.state?.trades?.filter((trade: any) => trade.pnl > 0).length || 0
    const losingTrades = totalTrades - winningTrades
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const totalPnl = results.state?.summary?.totalPnL || 0
    const totalReturn = results.state?.summary?.totalReturn || 0

    // Sauvegarder dans la base de données
    const { data, error } = await supabase
      .from('user_backtests')
      .insert({
        user_id: user.id,
        strategy_name: strategyName,
        strategy_type: config.strategyType || 'custom',
        crypto: config.crypto,
        period: config.period,
        initial_capital: config.initialCapital,
        position_size: config.positionSize,
        strategy_config: config,
        stop_loss: config.riskManagement?.stopLoss,
        take_profit: config.riskManagement?.takeProfit,
        total_trades: totalTrades,
        winning_trades: winningTrades,
        losing_trades: losingTrades,
        win_rate: winRate,
        total_pnl: totalPnl,
        total_return: totalReturn,
        max_drawdown: results.state?.summary?.maxDrawdown,
        sharpe_ratio: results.state?.summary?.sharpeRatio,
        detailed_results: results
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la sauvegarde du backtest:', error)
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
    }

    return NextResponse.json({ success: true, backtest: data })

  } catch (error) {
    console.error('Erreur API backtests POST:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// GET - Récupérer les backtests de l'utilisateur
export async function GET() {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')

    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const token = authorization.substring(7)

    // Vérifier le token et obtenir l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Récupérer les backtests de l'utilisateur
    const { data: backtests, error } = await supabase
      .from('user_backtests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des backtests:', error)
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 })
    }

    return NextResponse.json({ backtests: backtests || [] })

  } catch (error) {
    console.error('Erreur API backtests GET:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}