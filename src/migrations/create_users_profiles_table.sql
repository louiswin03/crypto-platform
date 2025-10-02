-- Table pour stocker les profils utilisateur étendus
CREATE TABLE IF NOT EXISTS users_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Informations personnelles
  phone VARCHAR(20),
  location VARCHAR(255),

  -- Préférences utilisateur
  preferences JSONB DEFAULT '{}',
  plan VARCHAR(50) DEFAULT 'free',

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_users_profiles_user_id ON users_profiles(user_id);

-- RLS (Row Level Security)
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs ne peuvent voir que leur propre profil
CREATE POLICY "Users can view own profile" ON users_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can create own profile" ON users_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON users_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent supprimer leur propre profil
CREATE POLICY "Users can delete own profile" ON users_profiles
  FOR DELETE USING (auth.uid() = user_id);