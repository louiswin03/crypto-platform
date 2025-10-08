# 📧 Configuration EmailJS pour le formulaire de contact

## Étapes de configuration (5 minutes) :

### 1. Créer un compte EmailJS
1. Allez sur [https://www.emailjs.com/](https://www.emailjs.com/)
2. Cliquez sur **"Sign Up"** (gratuit)
3. Créez votre compte avec votre email

### 2. Configurer votre Service Email
1. Une fois connecté, allez dans **"Email Services"**
2. Cliquez sur **"Add New Service"**
3. Choisissez **Gmail** (ou votre provider email préféré)
4. Connectez votre compte email
5. **Copiez le Service ID** (ex: `service_abc123`)

### 3. Créer un Template d'Email
1. Allez dans **"Email Templates"**
2. Cliquez sur **"Create New Template"**
3. Configurez le template comme suit :

**Nom du template :** Contact Form - CryptoPlatform

**To Email :** `{{to_email}}` (ou mettez directement votre email)

**From Name :** `{{from_name}}`

**Reply To :** `{{from_email}}`

**Subject :** `[CryptoPlatform Contact] {{subject}}`

**Content (Body) :**
```
Nouveau message de contact depuis CryptoPlatform

Nom: {{from_name}}
Email: {{from_email}}
Sujet: {{subject}}

Message:
{{message}}

---
Envoyé depuis le formulaire de contact CryptoPlatform
```

4. **Testez** le template avec le bouton "Test It"
5. **Copiez le Template ID** (ex: `template_xyz789`)

### 4. Récupérer votre Public Key
1. Allez dans **"Account"** > **"General"**
2. Trouvez **"Public Key"** (sous "API Keys")
3. **Copiez la Public Key** (ex: `aBcD123eFgH456`)

### 5. Configurer les variables d'environnement

Créez/modifiez le fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz789
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=aBcD123eFgH456
```

⚠️ **IMPORTANT** : Remplacez les valeurs par vos VRAIES clés !

### 6. Redémarrer le serveur de développement

```bash
# Arrêtez le serveur (Ctrl+C)
# Relancez-le
npm run dev
```

## ✅ Test du formulaire

1. Allez sur `http://localhost:3000/contact`
2. Remplissez le formulaire
3. Cliquez sur "Envoyer le message"
4. Vous devriez recevoir l'email dans votre boîte de réception ! 🎉

## 📊 Limites du plan gratuit

- **200 emails/mois** gratuits
- Largement suffisant pour commencer
- Si vous dépassez, passez au plan payant (9$/mois pour 1000 emails)

## 🔒 Sécurité

Les clés publiques EmailJS sont **sécurisées** :
- Elles sont destinées à être exposées côté client
- EmailJS a des protections anti-spam intégrées
- Vous pouvez restreindre les domaines autorisés dans les paramètres EmailJS

## ❓ Problèmes courants

### L'email n'arrive pas
- Vérifiez vos dossiers spam/indésirables
- Vérifiez que le Service est bien connecté dans EmailJS
- Testez le template depuis le dashboard EmailJS

### Erreur "EmailJS not configured"
- Vérifiez que le fichier `.env.local` existe
- Vérifiez que les clés sont correctes
- Redémarrez le serveur après modification du `.env.local`

### L'email arrive mais sans les bonnes informations
- Vérifiez que les noms des variables dans le template correspondent
- Utilisez bien `{{from_name}}`, `{{from_email}}`, `{{subject}}`, `{{message}}`

## 📞 Support

Si vous avez des questions, consultez :
- Documentation EmailJS : https://www.emailjs.com/docs/
- Dashboard EmailJS : https://dashboard.emailjs.com/

---

✨ **C'est tout !** Une fois configuré, votre formulaire de contact enverra de vrais emails !
