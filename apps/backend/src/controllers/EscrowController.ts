import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware';
import { ApiResponse } from '../types';
import { ethers } from 'ethers';

export class EscrowController {
  constructor(
    private escrowService: any,
    private disputeService: any
  ) {}

  createEscrow = asyncHandler(async (req: Request, res: Response) => {
    const { seller, amount, tokenAddress, deadline, buyerEmail, sellerEmail, metadata, conversationContext } = req.body;
    
    // Create escrow on blockchain
    const tx = await this.escrowService.createEscrow(seller, amount, tokenAddress, deadline);
    
    // Create transaction record in database
    const transaction = new Transaction({
      transactionId: tx.hash,
      escrowId: tx.hash, // In real implementation, extract escrow ID from transaction
      buyerEmail,
      sellerEmail,
      amount: parseFloat(amount),
      currency: tokenAddress === ethers.ZeroAddress ? 'ETH' : 'USDC',
      type: metadata.milestones ? 'service' : 'marketplace',
      metadata,
      conversationContext,
      timeline: [{
        status: 'pending',
        description: 'Escrow created',
        actor: buyerEmail
      }]
    });

    await transaction.save();
    
    const response: ApiResponse = {
      success: true,
      data: {
        hash: tx.hash,
        transactionId: transaction.transactionId,
        escrowId: transaction.escrowId
      }
    };
    
    res.status(200).json(response);
  });

  releaseEscrow = asyncHandler(async (req: Request, res: Response) => {
    const { escrowId } = req.params;
    const tx = await this.escrowService.releaseEscrow(escrowId);
    
    // Update transaction status
    await Transaction.findOneAndUpdate(
      { escrowId },
      { 
        status: 'completed',
        $push: {
          timeline: {
            status: 'completed',
            description: 'Payment released to seller',
            actor: 'system'
          }
        }
      }
    );
    
    const response: ApiResponse = {
      success: true,
      data: { hash: tx.hash }
    };
    
    res.status(200).json(response);
  });

  refundEscrow = asyncHandler(async (req: Request, res: Response) => {
    const { escrowId } = req.params;
    const tx = await this.escrowService.refundEscrow(escrowId);
    
    // Update transaction status
    await Transaction.findOneAndUpdate(
      { escrowId },
      { 
        status: 'cancelled',
        $push: {
          timeline: {
            status: 'cancelled',
            description: 'Payment refunded to buyer',
            actor: 'system'
          }
        }
      }
    );
    
    const response: ApiResponse = {
      success: true,
      data: { hash: tx.hash }
    };
    
    res.status(200).json(response);
  });

  disputeEscrow = asyncHandler(async (req: Request, res: Response) => {
    const { escrowId } = req.params;
    const { reason, evidence } = req.body;
    
    const tx = await this.escrowService.disputeEscrow(escrowId);
    
    // Update transaction status and add dispute info
    await Transaction.findOneAndUpdate(
      { escrowId },
      { 
        status: 'disputed',
        dispute: {
          reason,
          evidence: evidence || [],
          createdAt: new Date()
        },
        $push: {
          timeline: {
            status: 'disputed',
            description: `Dispute filed: ${reason}`,
            actor: 'system'
          }
        }
      }
    );
    
    const response: ApiResponse = {
      success: true,
      data: { hash: tx.hash }
    };
    
    res.status(200).json(response);
  });

  getEscrow = asyncHandler(async (req: Request, res: Response) => {
    const { escrowId } = req.params;
    const escrow = await this.escrowService.getEscrow(escrowId);
    
    const response: ApiResponse = {
      success: true,
      data: escrow
    };
    
    res.status(200).json(response);
  });

  openDispute = asyncHandler(async (req: Request, res: Response) => {
    const { escrowId } = req.params;
    const { evidence } = req.body;
    
    const tx = await this.disputeService.openDispute(escrowId, evidence);
    
    const response: ApiResponse = {
      success: true,
      data: { hash: tx.hash }
    };
    
    res.status(200).json(response);
  });

  addEvidence = asyncHandler(async (req: Request, res: Response) => {
    const { escrowId } = req.params;
    const { evidence } = req.body;
    
    const tx = await this.disputeService.addEvidence(escrowId, evidence);
    
    const response: ApiResponse = {
      success: true,
      data: { hash: tx.hash }
    };
    
    res.status(200).json(response);
  });

  resolveDispute = asyncHandler(async (req: Request, res: Response) => {
    const { escrowId } = req.params;
    const { winnerAddress } = req.body;
    
    const tx = await this.disputeService.resolveDispute(escrowId, winnerAddress);
    
    const response: ApiResponse = {
      success: true,
      data: { hash: tx.hash }
    };
    
    res.status(200).json(response);
  });

  getDispute = asyncHandler(async (req: Request, res: Response) => {
    const { escrowId } = req.params;
    const dispute = await this.disputeService.getDispute(escrowId);
    
    const response: ApiResponse = {
      success: true,
      data: dispute
    };
    
    res.status(200).json(response);
  });
}
