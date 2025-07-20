import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32)

export class EncryptionService {
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(algorithm, secretKey)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }

  static decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':')
    
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    
    const decipher = crypto.createDecipher(algorithm, secretKey)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }
}
