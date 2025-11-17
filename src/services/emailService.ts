// Fix pour Turbopack - utiliser require au lieu de import
const nodemailer = require('nodemailer')

// Configuration du transporteur email
// Pour l'instant, on utilise un compte de test Ethereal (emails factices)
// En production, utilisez Gmail, SendGrid, Resend, etc.

async function createTransporter() {
  // Si les variables d'environnement EMAIL_USER et EMAIL_PASSWORD existent, utiliser Gmail
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('📧 Utilisation de Gmail pour l\'envoi d\'emails')
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
    return transporter
  }

  // Sinon, utiliser Ethereal pour les tests
  console.log('📧 Utilisation d\'Ethereal (test) pour l\'envoi d\'emails')
  const testAccount = await nodemailer.createTestAccount()

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })

  return transporter
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userName?: string
) {
  try {
    const transporter = await createTransporter()

    // URL de réinitialisation (en production, utilisez votre domaine réel)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password/confirm?token=${token}`

    const mailOptions = {
      from: process.env.EMAIL_USER || '"Crypto Platform" <noreply@cryptoplatform.com>',
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .content {
              padding: 30px;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
              <p>Bonjour${userName ? ` ${userName}` : ''},</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte Crypto Platform.</p>
              <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              <p>Ou copiez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                ${resetUrl}
              </p>
              <div class="warning">
                <strong>⚠️ Important :</strong>
                <ul style="margin: 10px 0;">
                  <li>Ce lien est valide pendant <strong>1 heure</strong></li>
                  <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                  <li>Ne partagez jamais ce lien avec personne</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé par Crypto Platform</p>
              <p>Si vous avez des questions, contactez notre support</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Bonjour${userName ? ` ${userName}` : ''},

        Vous avez demandé à réinitialiser votre mot de passe pour votre compte Crypto Platform.

        Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :
        ${resetUrl}

        Important :
        - Ce lien est valide pendant 1 heure
        - Si vous n'avez pas demandé cette réinitialisation, ignorez cet email
        - Ne partagez jamais ce lien avec personne

        Cordialement,
        L'équipe Crypto Platform
      `,
    }

    const info = await transporter.sendMail(mailOptions)

    console.log('Email envoyé:', info.messageId)
    // Pour Ethereal, vous pouvez voir l'email ici :
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info))

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info), // Pour les tests
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
