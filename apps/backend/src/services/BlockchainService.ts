import { ethers } from 'ethers';
import { logger } from '../utils/logger';

export class BlockchainService {
  protected contract: ethers.Contract;
  protected wallet: ethers.Wallet;
  protected provider: ethers.Provider;

  constructor(
    provider: ethers.Provider, 
    privateKey: string, 
    contractAddress: string,
    abi: string[]
  ) {
    this.provider = provider;
    this.wallet = new ethers.Wallet(privateKey, provider);
    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
    logger.info(`BlockchainService initialized with contract at ${contractAddress}`);
  }

  protected async executeTransaction(method: string, ...args: any[]): Promise<ethers.ContractTransactionResponse> {
    try {
      const tx = await (this.contract as any)[method](...args);
      logger.info(`Transaction ${method} executed: ${tx.hash}`);
      return tx;
    } catch (error: any) {
      logger.error(`Transaction ${method} failed: ${error.message}`);
      throw error;
    }
  }

  protected async executeView(method: string, ...args: any[]): Promise<any> {
    try {
      const result = await (this.contract as any)[method](...args);
      logger.info(`View ${method} executed successfully`);
      return result;
    } catch (error: any) {
      logger.error(`View ${method} failed: ${error.message}`);
      throw error;
    }
  }
}
