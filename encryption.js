/**
 * encryption.js - AES-256-GCM Verschlüsselung für JSON-Datenbank
 * SHADOW-JSON: Datensicherheit durch Verschlüsselung im Ruhezustand
 */

const crypto = require('crypto');

class DatabaseEncryption {
  constructor(encryptionKey) {
    // Konvertiere Hex-String zu Buffer (32 Bytes für AES-256)
    this.key = Buffer.from(encryptionKey, 'hex');
    
    if (this.key.length !== 32) {
      throw new Error('Encryption key must be 32 bytes (256 bits)');
    }
  }

  /**
   * Verschlüsselt einen JSON-String mit AES-256-GCM
   * @param {string} plaintext - Der zu verschlüsselnde JSON-String
   * @returns {string} Base64-kodierte Verschlüsselung mit IV und AuthTag
   */
  encrypt(plaintext) {
    try {
      // Generiere einen zufälligen IV (Initialization Vector)
      const iv = crypto.randomBytes(16);

      // Erstelle Cipher mit AES-256-GCM
      const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);

      // Verschlüssele den Plaintext
      let encrypted = cipher.update(plaintext, 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      // Hole den Authentication Tag
      const authTag = cipher.getAuthTag();

      // Kombiniere IV + AuthTag + Ciphertext
      const combined = Buffer.concat([iv, authTag, encrypted]);

      // Rückgabe als Base64
      return combined.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error.message);
      throw error;
    }
  }

  /**
   * Entschlüsselt einen AES-256-GCM verschlüsselten String
   * @param {string} ciphertext - Die Base64-kodierte Verschlüsselung
   * @returns {string} Der entschlüsselte JSON-String
   */
  decrypt(ciphertext) {
    try {
      // Konvertiere Base64 zurück zu Buffer
      const combined = Buffer.from(ciphertext, 'base64');

      // Extrahiere Komponenten
      const iv = combined.slice(0, 16);
      const authTag = combined.slice(16, 32);
      const encrypted = combined.slice(32);

      // Erstelle Decipher mit AES-256-GCM
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);

      // Setze den Authentication Tag
      decipher.setAuthTag(authTag);

      // Entschlüssele
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption error:', error.message);
      throw error;
    }
  }

  /**
   * Liest eine verschlüsselte JSON-Datei und gibt das Objekt zurück
   * @param {string} filePath - Pfad zur verschlüsselten Datei
   * @returns {object} Das entschlüsselte JSON-Objekt
   */
  readEncryptedFile(filePath) {
    try {
      const fs = require('fs');
      const encryptedContent = fs.readFileSync(filePath, 'utf8');
      const decryptedContent = this.decrypt(encryptedContent);
      return JSON.parse(decryptedContent);
    } catch (error) {
      console.error(`Error reading encrypted file ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Schreibt ein JSON-Objekt verschlüsselt in eine Datei
   * @param {string} filePath - Pfad zur Zieldatei
   * @param {object} data - Das JSON-Objekt zum Speichern
   */
  writeEncryptedFile(filePath, data) {
    try {
      const fs = require('fs');
      const jsonString = JSON.stringify(data, null, 2);
      const encrypted = this.encrypt(jsonString);
      fs.writeFileSync(filePath, encrypted, 'utf8');
    } catch (error) {
      console.error(`Error writing encrypted file ${filePath}:`, error.message);
      throw error;
    }
  }
}

module.exports = DatabaseEncryption;
