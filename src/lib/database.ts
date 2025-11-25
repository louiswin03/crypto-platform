import { Pool, PoolConfig } from 'pg'

// Configuration de la base de données
const config: PoolConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'crypto_platform',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

// Pool de connexions
let pool: Pool | null = null

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool(config)

    pool.on('error', (err) => {
    })
  }

  return pool
}

// Interface utilisateur basée sur votre schéma existant
export interface DatabaseUser {
  id: string
  email: string
  password_hash: string
  created_at: Date
  updated_at: Date
  last_login: Date | null
  is_active: boolean
  email_verified: boolean
  two_factor_enabled: boolean
}

export interface UserProfile {
  id: string // Dans votre schéma, c'est directement id, pas user_id
  display_name: string | null
  avatar_url: string | null
  phone: string | null
  location: string | null
  plan: string
  subscription_expires_at: Date | null
  member_since: Date
  preferences: Record<string, any>
  created_at: Date
  updated_at: Date
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
  created_at: Date
  updated_at: Date
}

export interface Backtest {
  id: string
  user_id: string
  strategy_id: string | null
  portfolio_id: string | null
  name: string
  description: string | null
  symbols: string[]
  start_date: Date
  end_date: Date
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
  created_at: Date
  completed_at: Date | null
}

// Service de base de données
export class DatabaseService {
  private static pool = getPool()

  // Méthodes utilisateur
  static async createUser(email: string, passwordHash: string, displayName?: string): Promise<DatabaseUser> {
    const client = await this.pool.connect()

    try {
      await client.query('BEGIN')

      // Créer l'utilisateur dans public.users
      const userResult = await client.query(
        `INSERT INTO public.users (email, password_hash, created_at, updated_at, is_active, email_verified, two_factor_enabled)
         VALUES ($1, $2, NOW(), NOW(), true, false, false)
         RETURNING *`,
        [email, passwordHash]
      )

      const user = userResult.rows[0]

      // Créer le profil utilisateur avec votre schéma
      await client.query(
        `INSERT INTO user_profiles (id, display_name, plan, member_since, preferences, created_at, updated_at)
         VALUES ($1, $2, 'free', NOW(), '{}', NOW(), NOW())`,
        [user.id, displayName || email.split('@')[0]]
      )

      await client.query('COMMIT')
      return user

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  static async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    const result = await this.pool.query(
      'SELECT * FROM public.users WHERE email = $1 AND is_active = true',
      [email]
    )

    return result.rows[0] || null
  }

  static async getUserById(id: string): Promise<DatabaseUser | null> {
    const result = await this.pool.query(
      'SELECT * FROM public.users WHERE id = $1 AND is_active = true',
      [id]
    )

    return result.rows[0] || null
  }

  static async updateUserLastLogin(userId: string): Promise<void> {
    await this.pool.query(
      'UPDATE public.users SET last_login = NOW(), updated_at = NOW() WHERE id = $1',
      [userId]
    )
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const result = await this.pool.query(
      'SELECT * FROM user_profiles WHERE id = $1',
      [userId]
    )

    return result.rows[0] || null
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const setClauses = []
    const values = []
    let paramCount = 1

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        setClauses.push(`${key} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    setClauses.push(`updated_at = NOW()`)
    values.push(userId)

    const query = `
      UPDATE user_profiles
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await this.pool.query(query, values)
    return result.rows[0]
  }

  // Méthodes stratégies
  static async createStrategy(userId: string, strategy: Partial<Strategy>): Promise<Strategy> {
    const result = await this.pool.query(
      `INSERT INTO strategies (user_id, name, description, type, config, is_template, is_public, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        userId,
        strategy.name,
        strategy.description,
        strategy.type || 'custom',
        JSON.stringify(strategy.config || {}),
        strategy.is_template || false,
        strategy.is_public || false
      ]
    )

    return result.rows[0]
  }

  static async getUserStrategies(userId: string): Promise<Strategy[]> {
    const result = await this.pool.query(
      'SELECT * FROM strategies WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )

    return result.rows
  }

  static async getStrategy(id: string, userId: string): Promise<Strategy | null> {
    const result = await this.pool.query(
      'SELECT * FROM strategies WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    return result.rows[0] || null
  }

  static async updateStrategy(id: string, userId: string, updates: Partial<Strategy>): Promise<Strategy> {
    const setClauses = []
    const values = []
    let paramCount = 1

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'user_id' && key !== 'created_at') {
        if (key === 'config') {
          setClauses.push(`${key} = $${paramCount}`)
          values.push(JSON.stringify(value))
        } else {
          setClauses.push(`${key} = $${paramCount}`)
          values.push(value)
        }
        paramCount++
      }
    })

    setClauses.push(`updated_at = NOW()`)
    values.push(id, userId)

    const query = `
      UPDATE strategies
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `

    const result = await this.pool.query(query, values)
    return result.rows[0]
  }

  static async deleteStrategy(id: string, userId: string): Promise<void> {
    await this.pool.query(
      'DELETE FROM strategies WHERE id = $1 AND user_id = $2',
      [id, userId]
    )
  }

  // Méthodes backtests
  static async createBacktest(userId: string, backtest: Partial<Backtest>): Promise<Backtest> {
    const result = await this.pool.query(
      `INSERT INTO backtests (
        user_id, strategy_id, portfolio_id, name, description, symbols,
        start_date, end_date, initial_capital_usd, config, status, created_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', NOW())
       RETURNING *`,
      [
        userId,
        backtest.strategy_id,
        backtest.portfolio_id,
        backtest.name,
        backtest.description,
        backtest.symbols || [],
        backtest.start_date,
        backtest.end_date,
        backtest.initial_capital_usd,
        JSON.stringify(backtest.config || {})
      ]
    )

    return result.rows[0]
  }

  static async updateBacktestResults(id: string, results: any, status: string, metrics?: {
    final_value_usd?: number
    total_return_percent?: number
    annualized_return_percent?: number
    max_drawdown_percent?: number
    sharpe_ratio?: number
    volatility_percent?: number
    win_rate_percent?: number
    profit_factor?: number
    execution_time_ms?: number
  }): Promise<Backtest> {
    const result = await this.pool.query(
      `UPDATE backtests
       SET results = $1, status = $2, completed_at = NOW(),
           final_value_usd = $4, total_return_percent = $5, annualized_return_percent = $6,
           max_drawdown_percent = $7, sharpe_ratio = $8, volatility_percent = $9,
           win_rate_percent = $10, profit_factor = $11, execution_time_ms = $12
       WHERE id = $3
       RETURNING *`,
      [
        JSON.stringify(results),
        status,
        id,
        metrics?.final_value_usd,
        metrics?.total_return_percent,
        metrics?.annualized_return_percent,
        metrics?.max_drawdown_percent,
        metrics?.sharpe_ratio,
        metrics?.volatility_percent,
        metrics?.win_rate_percent,
        metrics?.profit_factor,
        metrics?.execution_time_ms
      ]
    )

    return result.rows[0]
  }

  static async getUserBacktests(userId: string): Promise<Backtest[]> {
    const result = await this.pool.query(
      'SELECT * FROM backtests WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )

    return result.rows
  }

  // Méthode de fermeture du pool
  static async closePool(): Promise<void> {
    if (pool) {
      await pool.end()
      pool = null
    }
  }
}