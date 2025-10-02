import { createClient } from '@supabase/supabase-js'

// Configuration Supabase pour côté serveur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Interfaces pour votre schéma Supabase
export interface DatabaseUser {
  id: string
  email: string
  password_hash: string
  created_at: string
  updated_at: string
  last_login: string | null
  is_active: boolean
  email_verified: boolean
  two_factor_enabled: boolean
}

export interface UserProfile {
  id: string
  display_name: string | null
  avatar_url: string | null
  phone: string | null
  location: string | null
  plan: string
  subscription_expires_at: string | null
  member_since: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Strategy {
  id: string
  user_id: string
  name: string
  description: string | null
  type: 'dca' | 'buy_hold' | 'rsi' | 'ma_crossover' | 'custom'
  config: Record<string, any>
  is_template: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Backtest {
  id: string
  user_id: string
  strategy_id: string | null
  portfolio_id: string | null
  name: string
  description: string | null
  symbols: string[]
  start_date: string
  end_date: string
  initial_capital_usd: number
  config: Record<string, any>
  results: Record<string, any> | null
  final_value_usd: number | null
  total_return_percent: number | null
  annualized_return_percent: number | null
  max_drawdown_percent: number | null
  sharpe_ratio: number | null
  volatility_percent: number | null
  win_rate_percent: number | null
  profit_factor: number | null
  status: 'pending' | 'running' | 'completed' | 'failed'
  execution_time_ms: number | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

// Service de base de données Supabase
export class SupabaseDatabaseService {
  // Méthodes utilisateur
  static async createUser(email: string, passwordHash: string, displayName?: string): Promise<DatabaseUser> {
    try {
      // Créer l'utilisateur dans la table users
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          password_hash: passwordHash,
          is_active: true,
          email_verified: false,
          two_factor_enabled: false
        })
        .select()
        .single()

      if (userError) throw userError

      // Créer le profil utilisateur
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: user.id,
          display_name: displayName || email.split('@')[0],
          plan: 'free',
          preferences: {}
        })

      if (profileError) throw profileError

      return user
    } catch (error) {
      console.error('Erreur createUser:', error)
      throw error
    }
  }

  static async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Erreur getUserByEmail:', error)
      return null
    }
  }

  static async getUserById(id: string): Promise<DatabaseUser | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Erreur getUserById:', error)
      return null
    }
  }

  static async updateUserLastLogin(userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Erreur updateUserLastLogin:', error)
      throw error
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Erreur getUserProfile:', error)
      return null
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur updateUserProfile:', error)
      throw error
    }
  }

  // Méthodes stratégies
  static async createStrategy(userId: string, strategy: Partial<Strategy>): Promise<Strategy> {
    try {
      const { data, error } = await supabaseAdmin
        .from('strategies')
        .insert({
          user_id: userId,
          name: strategy.name,
          description: strategy.description,
          type: strategy.type || 'custom',
          config: strategy.config || {},
          is_template: strategy.is_template || false,
          is_public: strategy.is_public || false
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur createStrategy:', error)
      throw error
    }
  }

  static async getUserStrategies(userId: string): Promise<Strategy[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('strategies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur getUserStrategies:', error)
      return []
    }
  }

  static async getStrategy(id: string, userId: string): Promise<Strategy | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('strategies')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Erreur getStrategy:', error)
      return null
    }
  }

  static async updateStrategy(id: string, userId: string, updates: Partial<Strategy>): Promise<Strategy> {
    try {
      const { data, error } = await supabaseAdmin
        .from('strategies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur updateStrategy:', error)
      throw error
    }
  }

  static async deleteStrategy(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('strategies')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Erreur deleteStrategy:', error)
      throw error
    }
  }

  // Méthodes backtests
  static async getUserBacktests(userId: string): Promise<Backtest[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('backtests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur getUserBacktests:', error)
      return []
    }
  }
}