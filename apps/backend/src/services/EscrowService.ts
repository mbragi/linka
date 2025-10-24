import { BlockchainService, ProviderConfig } from './BlockchainService';
import { logger } from '../utils/logger';
import { ethers } from 'ethers';

export class EscrowService extends BlockchainService {
  constructor(providerConfig: ProviderConfig, privateKey: string, escrowManagerAddress: string) {
    const escrowManagerABI = [
      "function createEscrow(address _seller, uint256 _amount, address _token, uint256 _deadline) external payable returns (bytes32)",
      "function releaseEscrow(bytes32 _escrowId) external",
      "function refundEscrow(bytes32 _escrowId) external",
      "function disputeEscrow(bytes32 _escrowId) external",
      "function escrows(bytes32) external view returns (address buyer, address seller, uint256 amount, address token, uint256 deadline, bool released, bool refunded, bool disputed)"
    ];
    
    super(providerConfig, privateKey, escrowManagerAddress, escrowManagerABI);
  }

  async createEscrow(seller: string, amount: string, tokenAddress: string, deadline: number): Promise<any> {
    logger.info(`Creating escrow: buyer=${this.wallet.address}, seller=${seller}, amount=${amount}, token=${tokenAddress}, deadline=${deadline}`);
    const parsedAmount = ethers.parseEther(amount);
    
    if (tokenAddress === ethers.ZeroAddress) {
      return this.executeTransaction('createEscrow', seller, parsedAmount, tokenAddress, deadline, { value: parsedAmount });
    } else {
      return this.executeTransaction('createEscrow', seller, parsedAmount, tokenAddress, deadline);
    }
  }

  async releaseEscrow(escrowId: string): Promise<any> {
    logger.info(`Releasing escrow: ${escrowId}`);
    return this.executeTransaction('releaseEscrow', escrowId);
  }

  async refundEscrow(escrowId: string): Promise<any> {
    logger.info(`Refunding escrow: ${escrowId}`);
    return this.executeTransaction('refundEscrow', escrowId);
  }

  async disputeEscrow(escrowId: string): Promise<any> {
    logger.info(`Disputing escrow: ${escrowId}`);
    return this.executeTransaction('disputeEscrow', escrowId);
  }

  async getEscrow(escrowId: string): Promise<any> {
    logger.info(`Fetching escrow: ${escrowId}`);
    const escrow = await this.executeView('escrows', escrowId);
    return {
      buyer: escrow.buyer,
      seller: escrow.seller,
      amount: ethers.formatEther(escrow.amount),
      token: escrow.token,
      deadline: Number(escrow.deadline),
      released: escrow.released,
      refunded: escrow.refunded,
      disputed: escrow.disputed,
    };
  }
}
