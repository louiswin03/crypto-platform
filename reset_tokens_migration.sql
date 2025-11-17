-- Table pour stocker les tokens de réinitialisation de mot de passe
CREATE TABLE IF NOT EXISTS reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_token ON reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_user_id ON reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_expires_at ON reset_tokens(expires_at);

-- Nettoyer les tokens expirés automatiquement (optionnel, peut être fait par un cron job)
-- DELETE FROM reset_tokens WHERE expires_at < NOW() OR used = TRUE;
