-- Table pour stocker les backtests utilisateur
CREATE TABLE IF NOT EXISTS user_backtests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Configuration du backtest
  strategy_name VARCHAR(255) NOT NULL,
  strategy_type VARCHAR(50) NOT NULL, -- 'recommended' ou 'custom'
  crypto VARCHAR(10) NOT NULL, -- 'BTC', 'ETH', etc.
  period VARCHAR(20) NOT NULL,
  initial_capital DECIMAL(15,2) NOT NULL,
  position_size DECIMAL(5,2) NOT NULL,

  -- Configuration de la stratégie
  strategy_config JSONB NOT NULL,

  -- Gestion des risques
  stop_loss DECIMAL(5,2),
  take_profit DECIMAL(5,2),

  -- Résultats du backtest
  total_trades INTEGER NOT NULL DEFAULT 0,
  winning_trades INTEGER NOT NULL DEFAULT 0,
  losing_trades INTEGER NOT NULL DEFAULT 0,
  win_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_pnl DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_return DECIMAL(10,4) NOT NULL DEFAULT 0,
  max_drawdown DECIMAL(10,4),
  sharpe_ratio DECIMAL(10,4),

  -- Données détaillées (optionnel, peut être volumineux)
  detailed_results JSONB,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_backtests_user_id ON user_backtests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_backtests_created_at ON user_backtests(created_at);
CREATE INDEX IF NOT EXISTS idx_user_backtests_strategy_type ON user_backtests(strategy_type);

-- RLS (Row Level Security)
ALTER TABLE user_backtests ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs ne peuvent voir que leurs propres backtests
CREATE POLICY "Users can view own backtests" ON user_backtests
  FOR SELECT USING (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent créer leurs propres backtests
CREATE POLICY "Users can create own backtests" ON user_backtests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent modifier leurs propres backtests
CREATE POLICY "Users can update own backtests" ON user_backtests
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent supprimer leurs propres backtests
CREATE POLICY "Users can delete own backtests" ON user_backtests
  FOR DELETE USING (auth.uid() = user_id);