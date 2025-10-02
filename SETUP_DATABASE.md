# Configuration de votre base de données existante

## ✅ Bonne nouvelle : Votre schéma est parfait !

Votre schéma de base de données est déjà très complet et bien structuré. Nous avons adapté notre code pour qu'il s'intègre parfaitement avec votre architecture existante.

## 🔧 Seule modification nécessaire : Table auth.users

Il manque uniquement la table `auth.users` dans le schéma que vous avez fourni. Voici la requête SQL à exécuter pour la créer :

```sql
-- Créer le schéma auth s'il n'existe pas
CREATE SCHEMA IF NOT EXISTS auth;

-- Table des utilisateurs pour l'authentification
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

-- Index pour la performance
CREATE INDEX idx_auth_users_email ON auth.users(email);
CREATE INDEX idx_auth_users_active ON auth.users(is_active);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at sur auth.users
CREATE TRIGGER update_auth_users_updated_at
    BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🎯 Adaptations apportées

Nous avons adapté notre code pour qu'il fonctionne avec votre schéma :

### 1. Table `user_profiles`
- ✅ Utilise `id` au lieu de `user_id` (comme dans votre schéma)
- ✅ Inclut `plan`, `subscription_expires_at`, `member_since`
- ✅ Compatible avec vos champs existants

### 2. Table `strategies`
- ✅ Utilise `type` au lieu de `strategy_type`
- ✅ Inclut `is_template` et `is_public`
- ✅ Types : 'dca', 'buy_hold', 'rsi', 'ma_crossover', 'custom'

### 3. Table `backtests`
- ✅ Inclut tous vos champs : `portfolio_id`, `symbols`, `start_date`, `end_date`
- ✅ Métriques complètes : `final_value_usd`, `sharpe_ratio`, etc.
- ✅ Support pour `execution_time_ms` et `error_message`

## 🚀 Configuration de l'environnement

Créez un fichier `.env.local` avec vos paramètres de base de données :

```env
# Base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=votre_nom_de_base
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe

# JWT pour l'authentification
JWT_SECRET=votre-super-secret-jwt-key-change-in-production

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=another-secret-for-nextauth
```

## 📦 Installation des dépendances

Les dépendances ont déjà été installées :
- ✅ `pg` - Client PostgreSQL
- ✅ `bcryptjs` - Hachage des mots de passe
- ✅ `jsonwebtoken` - Authentification JWT

## 🔄 Migration des données localStorage

Le système détectera automatiquement les anciennes données localStorage et proposera à l'utilisateur de créer un compte pour les migrer. Après inscription réussie, les anciennes données sont automatiquement nettoyées.

## ✅ Fonctionnalités intégrées

Votre plateforme bénéficiera maintenant de :

1. **Authentification sécurisée** avec hachage bcrypt et JWT
2. **Gestion des profils utilisateur** avec plans et préférences
3. **Sauvegarde des stratégies** dans PostgreSQL
4. **Historique des backtests** avec métriques complètes
5. **Évolutivité** pour gérer plusieurs utilisateurs
6. **Sécurité** avec sessions et logs d'activité

## 🎉 Prêt à utiliser !

Une fois la table `auth.users` créée et le fichier `.env.local` configuré, votre application sera prête à utiliser PostgreSQL avec votre schéma existant !