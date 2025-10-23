import { BlockchainService } from './BlockchainService';
import { ethers } from 'ethers';

export class PaymentService extends BlockchainService {
  constructor(provider: any, privateKey: string, paymentProcessorAddress: string) {
    const paymentProcessorABI = [
      "function makePayment(address _payee, uint256 _amount, address _token) external payable returns (bytes32)"
    ];
    
    super(provider, privateKey, paymentProcessorAddress, paymentProcessorABI);
  }

  async makePayment(payee: string, amount: string, tokenAddress: string): Promise<any> {
    const parsedAmount = ethers.parseEther(amount);
    
    if (tokenAddress === ethers.ZeroAddress) {
      return this.executeTransaction('makePayment', payee, parsedAmount, tokenAddress, { value: parsedAmount });
    } else {
      return this.executeTransaction('makePayment', payee, parsedAmount, tokenAddress);
    }
  }
}
