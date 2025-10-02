# Dépendances requises pour PostgreSQL

Pour installer les nouvelles dépendances nécessaires :

```bash
npm install pg bcryptjs jsonwebtoken
npm install --save-dev @types/pg @types/bcryptjs @types/jsonwebtoken
```

## Variables d'environnement à ajouter

Créer un fichier `.env.local` avec :

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crypto_platform
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-to-something-very-long-and-random

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=another-secret-for-nextauth
```

## Script SQL à exécuter

Voici le script pour créer votre base de données selon votre schéma :

```sql
-- Créer les schémas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS public;

-- Table des utilisateurs (auth.users)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE
);

-- Table des profils utilisateur
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(150),
  bio TEXT,
  avatar_url VARCHAR(500),
  timezone VARCHAR(50),
  language VARCHAR(10) DEFAULT 'fr',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des stratégies
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  strategy_type VARCHAR(50) DEFAULT 'custom' CHECK (strategy_type IN ('custom', 'recommended')),
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}'
);

-- Table des backtests
CREATE TABLE backtests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  results JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour la performance
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_active ON auth.users(is_active);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
CREATE INDEX idx_strategies_active ON strategies(is_active);
CREATE INDEX idx_backtests_user_id ON backtests(user_id);
CREATE INDEX idx_backtests_status ON backtests(status);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backtests_updated_at BEFORE UPDATE ON backtests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```