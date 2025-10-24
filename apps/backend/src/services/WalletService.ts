import { ethers } from 'ethers';
import * as crypto from 'crypto';
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
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      
      // Split the encrypted data
      const parts = encryptedPrivateKey.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted private key format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = Buffer.from(parts[1], 'hex');

      // Decrypt
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      
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
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(algorithm, key, iv);

      let encrypted = cipher.update(privateKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Combine IV and encrypted data
      return `${iv.toString('hex')}:${encrypted}`;
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
   * Get wallet balance with fallback handling
   */
  async getWalletBalance(encryptedPrivateKey: string, provider?: ethers.Provider): Promise<string> {
    try {
      const wallet = this.getWallet(encryptedPrivateKey);
      
      // Try to get balance from provider
      if (provider) {
        try {
          const balance = await provider.getBalance(wallet.address);
          return ethers.formatEther(balance);
        } catch (providerError) {
          logger.warn('Provider failed, trying fallback:', providerError);
        }
      }
      
      // Fallback: try to create a new provider
      const rpcUrl = process.env.BASE_RPC_URL;
      if (rpcUrl) {
        try {
          const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);
          const balance = await rpcProvider.getBalance(wallet.address);
          return ethers.formatEther(balance);
        } catch (rpcError) {
          logger.warn('RPC provider failed, using fallback balance:', rpcError);
        }
      }
      
      // Final fallback: return 0 balance
      logger.warn(`Using fallback balance for wallet ${wallet.address}`);
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
