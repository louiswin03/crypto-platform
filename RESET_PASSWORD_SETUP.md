# Configuration de la Réinitialisation de Mot de Passe

## 📋 Étapes de configuration

### 1. Créer la table `reset_tokens` dans PostgreSQL

Exécutez le fichier SQL fourni dans votre base de données PostgreSQL :

```bash
psql -U your_username -d your_database -f reset_tokens_migration.sql
```

Ou connectez-vous à votre base de données et exécutez directement :

```sql
CREATE TABLE IF NOT EXISTS reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_token ON reset_tokens(token);
CREATE INDEX idx_user_id ON reset_tokens(user_id);
CREATE INDEX idx_expires_at ON reset_tokens(expires_at);
```

### 2. Configuration de l'envoi d'emails

#### Option A : Mode Test (par défaut - Ethereal Email)

Le système utilise actuellement **Ethereal Email** pour les tests. Aucune configuration n'est nécessaire !

Lorsqu'un email est envoyé, vous verrez dans la console du serveur un lien pour visualiser l'email :
```
📧 Voir l'email de test: https://ethereal.email/message/xxxxx
```

#### Option B : Production avec Gmail

1. Créez un "Mot de passe d'application" dans votre compte Gmail :
   - Allez dans https://myaccount.google.com/apppasswords
   - Créez un nouveau mot de passe d'application

2. Ajoutez les variables d'environnement dans `.env.local` :

```env
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-application
NEXT_PUBLIC_APP_URL=http://localhost:3000  # ou votre domaine en production
```

3. Modifiez `src/services/emailService.ts` :

Remplacez la section de création du transporteur par :

```typescript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})
```

#### Option C : Production avec SendGrid / Resend

Pour utiliser SendGrid ou Resend, installez leur SDK et configurez selon leur documentation.

### 3. Test du flux complet

1. **Demander une réinitialisation** :
   - Allez sur `/auth/reset-password`
   - Entrez votre email
   - Cliquez sur "Envoyer le lien"

2. **Vérifier l'email** :
   - En mode test : copiez le lien depuis la console
   - En production : ouvrez l'email reçu

3. **Réinitialiser le mot de passe** :
   - Cliquez sur le lien (ou visitez l'URL avec le token)
   - Entrez votre nouveau mot de passe
   - Confirmez

4. **Connexion automatique** :
   - Vous êtes automatiquement connecté avec votre nouveau mot de passe

## 🔒 Sécurité

- Les tokens expirent après **1 heure**
- Les tokens ne peuvent être utilisés qu'**une seule fois**
- Les anciens tokens sont automatiquement supprimés lors d'une nouvelle demande
- Les mots de passe sont hashés avec bcrypt

## 🧹 Nettoyage (Optionnel)

Pour nettoyer automatiquement les tokens expirés, vous pouvez créer un cron job :

```sql
DELETE FROM reset_tokens WHERE expires_at < NOW() OR used = TRUE;
```

## 📝 Flux Complet

```
1. User clique sur "Mot de passe oublié?"
   ↓
2. User entre son email
   ↓
3. API vérifie si l'email existe
   ↓
4. API génère un token unique
   ↓
5. API enregistre le token dans la BD (expires in 1h)
   ↓
6. API envoie un email avec le lien
   ↓
7. User clique sur le lien dans l'email
   ↓
8. User entre son nouveau mot de passe
   ↓
9. API valide le token
   ↓
10. API met à jour le mot de passe
    ↓
11. User est automatiquement connecté
    ↓
12. Redirection vers la page d'accueil
```

## ⚙️ Variables d'environnement

Ajoutez dans `.env.local` :

```env
# Base de données (déjà configuré normalement)
DATABASE_URL=your_postgresql_connection_string

# Email (optionnel - pour production)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🐛 Dépannage

### "Erreur serveur lors de la réinitialisation du mot de passe"

1. Vérifiez que la table `reset_tokens` existe
2. Vérifiez les logs de la console pour plus de détails
3. Vérifiez votre connexion PostgreSQL

### L'email n'arrive pas

1. En mode test, vérifiez la console pour le lien preview
2. En production, vérifiez vos identifiants EMAIL_USER et EMAIL_PASSWORD
3. Vérifiez que le "Mot de passe d'application" Gmail est correctement configuré

### "Token invalide ou expiré"

1. Le token expire après 1 heure
2. Le token ne peut être utilisé qu'une fois
3. Demandez un nouveau lien de réinitialisation
