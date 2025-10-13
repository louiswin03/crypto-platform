# 🔒 Documentation de Sécurité

## Vue d'ensemble

Cette application implémente plusieurs couches de sécurité pour protéger les données utilisateur et prévenir les attaques courantes.

## Protections implémentées

### 1. Protection CSRF (Cross-Site Request Forgery)

**Localisation**: `src/lib/csrf.ts`, `src/middleware.ts`

**Comment ça marche**:
- Génération de tokens CSRF cryptographiquement sécurisés (32 bytes aléatoires)
- Stockage dans un cookie HttpOnly sécurisé
- Validation à chaque requête mutante (POST, PUT, DELETE, PATCH)
- Vérification d'origine (origin vs host)

**Utilisation**:

```typescript
// Côté client - Récupérer le token CSRF
const response = await fetch('/api/csrf')
const { token } = await response.json()

// Inclure le token dans les requêtes
await fetch('/api/binance/connect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token,
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify({ apiKey, apiSecret })
})
```

**Routes protégées**:
- `/api/binance/connect`
- `/api/kraken/connect`
- `/api/coinbase/connect`
- Toutes les routes API mutantes

---

### 2. Protection XSS (Cross-Site Scripting)

**Localisation**: `src/lib/sanitize.ts`, `src/middleware.ts`

**Défenses multiples**:

1. **React** : Échappement automatique des valeurs
2. **CSP (Content Security Policy)** : Restreint les sources de contenu autorisées
3. **Sanitization** : Nettoyage explicite des inputs utilisateur

**Fonctions de sanitization**:

```typescript
import { escapeHtml, sanitizeInput, sanitizeEmail } from '@/lib/sanitize'

// Échapper HTML
const safe = escapeHtml('<script>alert("xss")</script>')
// Résultat: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;

// Sanitize input avec options
const clean = sanitizeInput(userInput, {
  maxLength: 500,
  allowHtml: false,
  trim: true
})

// Nettoyer email
const email = sanitizeEmail('USER@EXAMPLE.COM  ')
// Résultat: user@example.com
```

---

### 3. Headers de sécurité HTTP

**Localisation**: `src/middleware.ts`, `next.config.ts`

**Headers configurés**:

| Header | Valeur | Protection |
|--------|--------|------------|
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | XSS (navigateurs anciens) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Fuite d'informations |
| `Permissions-Policy` | Restreint caméra, micro, géolocalisation | Accès non autorisé |
| `Content-Security-Policy` | Politique stricte | XSS, injection de code |
| `Strict-Transport-Security` | `max-age=31536000` (prod) | Force HTTPS |

---

### 4. Chiffrement des données sensibles

**Localisation**: `src/lib/encryption.ts`

**Méthode**: AES-256-GCM (mode authentifié)

**Caractéristiques**:
- IV aléatoire de 16 bytes par chiffrement
- Tag d'authentification pour détecter les modifications
- Clé dérivée avec scrypt depuis `ENCRYPTION_KEY`

**Données chiffrées**:
- Clés API des exchanges (Binance, Kraken, Coinbase)
- Secrets API des exchanges

**Format stocké**: `iv:authTag:encryptedData`

```typescript
import { encrypt, decrypt } from '@/lib/encryption'

// Chiffrer
const encrypted = encrypt('ma-cle-secrete')
// Format: "abc123def456:789ghi012jkl:345mno678pqr"

// Déchiffrer
const decrypted = decrypt(encrypted)
// Résultat: "ma-cle-secrete"
```

---

### 5. Authentication JWT sécurisée

**Localisation**: Routes API `/api/**/connect`

**Implémentation**:
- Tokens JWT signés avec `JWT_SECRET`
- Validation sur toutes les routes protégées
- Expiration des tokens
- Vérification de l'utilisateur en base

---

## Variables d'environnement requises

**IMPORTANT**: Ces clés doivent être générées aléatoirement et **JAMAIS** commitées dans Git.

```bash
# Générer ENCRYPTION_KEY (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Générer JWT_SECRET (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**`.env.local`**:
```env
# Chiffrement AES-256-GCM (REQUIS)
ENCRYPTION_KEY=votre_cle_generee_aleatoirement_32_bytes

# JWT Authentication (REQUIS)
JWT_SECRET=votre_secret_jwt_genere_aleatoirement

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

---

## Checklist de sécurité

### Développement

- [x] Protection CSRF implémentée
- [x] Protection XSS implémentée
- [x] Headers de sécurité configurés
- [x] Chiffrement AES-256-GCM pour données sensibles
- [x] Sanitization des inputs utilisateur
- [x] Validation JWT sur routes API
- [x] `.env.local` dans `.gitignore`

### Production

- [ ] `ENCRYPTION_KEY` générée aléatoirement (32 bytes)
- [ ] `JWT_SECRET` généré aléatoirement (64 bytes)
- [ ] Variables d'environnement configurées sur le provider (Vercel, AWS, etc.)
- [ ] HTTPS forcé (via Vercel ou CloudFlare)
- [ ] Monitoring des erreurs de sécurité
- [ ] Rate limiting sur les routes API
- [ ] Rotation régulière des secrets

---

## Tests de sécurité

### Tester la protection CSRF

```bash
# Sans token CSRF (doit échouer)
curl -X POST http://localhost:3000/api/binance/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer votre_jwt" \
  -d '{"apiKey":"test","apiSecret":"test"}'

# Résultat attendu: 403 Forbidden
```

### Tester la sanitization

```typescript
// Test XSS
const malicious = '<script>alert("xss")</script>'
const safe = escapeHtml(malicious)
console.log(safe) // &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;

// Test SQL injection detection
const sqlInjection = "'; DROP TABLE users; --"
console.log(detectSqlInjection(sqlInjection)) // true
```

---

## Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

---

## Contact Sécurité

Pour signaler une vulnérabilité de sécurité, contactez: **security@cryptoplatform.com**

**Ne publiez JAMAIS de vulnérabilités publiquement avant qu'elles ne soient corrigées.**
