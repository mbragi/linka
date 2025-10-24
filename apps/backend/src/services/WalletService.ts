import { ethers } from 'ethers';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export class WalletService {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
    if (this.encryptionKey === 'default-key-change-in-production') {
      logger.warn('Using default encryption key. Change ENCRYPTION_KEY in production!');
    }
  }

  /**
   * Create a new wallet with encrypted private key storage
   */
  async createWallet(): Promise<{ address: string; encryptedPrivateKey: string }> {
    try {
      // Generate new wallet
      const wallet = ethers.Wallet.createRandom();
      const privateKey = wallet.privateKey;
      const address = wallet.address;

      // Encrypt private key
      const encryptedPrivateKey = this.encryptPrivateKey(privateKey);

      logger.info(`Created new wallet: ${address}`);

      return {
        address,
        encryptedPrivateKey
      };
    } catch (error) {
      logger.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }

  /**
   * Decrypt private key for wallet operations
   */
  decryptPrivateKey(encryptedPrivateKey: string): string {
    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      
      // Split the encrypted data
      const parts = encryptedPrivateKey.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted private key format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = Buffer.from(parts[2], 'hex');

      // Decrypt
      const decipher = crypto.createDecipherGCM(algorithm, key);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Error decrypting private key:', error);
      throw new Error('Failed to decrypt private key');
    }
  }

  /**
   * Encrypt private key for secure storage
   */
  private encryptPrivateKey(privateKey: string): string {
    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipherGCM(algorithm, key);
      cipher.setAAD(Buffer.from('linka-wallet', 'utf8'));

      let encrypted = cipher.update(privateKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Combine IV, auth tag, and encrypted data
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      logger.error('Error encrypting private key:', error);
      throw new Error('Failed to encrypt private key');
    }
  }

  /**
   * Get wallet instance from encrypted private key
   */
  getWallet(encryptedPrivateKey: string): ethers.Wallet {
    try {
      const privateKey = this.decryptPrivateKey(encryptedPrivateKey);
      return new ethers.Wallet(privateKey);
    } catch (error) {
      logger.error('Error getting wallet:', error);
      throw new Error('Failed to get wallet');
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(encryptedPrivateKey: string, provider?: ethers.Provider): Promise<string> {
    try {
      const wallet = this.getWallet(encryptedPrivateKey);
      
      if (provider) {
        const balance = await provider.getBalance(wallet.address);
        return ethers.formatEther(balance);
      }
      
      // Return mock balance if no provider
      return '0.0';
    } catch (error) {
      logger.error('Error getting wallet balance:', error);
      throw new Error('Failed to get wallet balance');
    }
  }

  /**
   * Validate wallet address format
   */
  isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }
}
