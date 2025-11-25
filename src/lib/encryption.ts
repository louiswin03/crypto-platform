import crypto from 'crypto'

// Utiliser une vraie clé de chiffrement depuis les variables d'environnement
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY must be set in environment variables')
}

// Valider que la clé fait exactement 64 caractères hexadécimaux (32 bytes pour AES-256)
if (ENCRYPTION_KEY.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(ENCRYPTION_KEY)) {
  throw new Error('ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes). Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"')
}

// Convertir directement la clé hexadécimale en buffer (pas de scrypt avec salt statique)
const KEY_BUFFER = Buffer.from(ENCRYPTION_KEY, 'hex')

/**
 * Chiffre une chaîne avec AES-256-GCM (mode authentifié)
 * Plus sécurisé que CBC car il détecte les modifications
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-gcm', KEY_BUFFER, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Récupérer le tag d'authentification
    const authTag = cipher.getAuthTag()

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {

    throw new Error('Failed to encrypt data')
  }
}

/**
 * Déchiffre une chaîne chiffrée avec AES-256-GCM
 */
export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format')
    }

    const [ivHex, authTagHex, encrypted] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY_BUFFER, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {

    throw new Error('Failed to decrypt data')
  }
}

/**
 * Hash une chaîne avec SHA-256 (pour stocker des hashes non réversibles)
 */
export function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}
