import { Request, Response } from 'express';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware';
import { ApiResponse } from '../types';
import { WalletService } from '../services/WalletService';
import { ethers } from 'ethers';

export class IdentityController {
  private static walletService = new WalletService();
  private static provider: ethers.Provider | null = null;

  // Initialize provider with error handling
  private static initializeProvider(): ethers.Provider | null {
    if (this.provider) {
      return this.provider;
    }

    const rpcUrl = process.env.BASE_RPC_URL;
    if (!rpcUrl) {
      logger.warn('BASE_RPC_URL not set, wallet balance will use fallback');
      return null;
    }

    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      logger.info(`Initialized RPC provider with URL: ${rpcUrl}`);
      return this.provider;
    } catch (error) {
      logger.warn('Failed to initialize RPC provider:', error);
      return null;
    }
  }

  static createUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, profile, consentGiven, googleId, phoneNumber, baseName, ensName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'User already exists' 
      });
    }

    // Create wallet
    const { address: walletAddress, encryptedPrivateKey } = await IdentityController.walletService.createWallet();

    const user = new User({
      email,
      walletAddress,
      encryptedPrivateKey,
      consentGiven: consentGiven || false,
      onboardingCompleted: true,
      googleId,
      phoneNumber,
      baseName,
      ensName,
      profile: {
        name: profile.name,
        bio: profile.bio,
        isVendor: profile.isVendor || false,
        categories: profile.categories || [],
        avatar: profile.avatar,
        location: profile.location,
        website: profile.website
      }
    });

    await user.save();
    
    const response: ApiResponse = {
      success: true,
      message: 'User created successfully',
      data: {
        email: user.email,
        walletAddress: user.walletAddress,
        profile: user.profile,
        onboardingCompleted: user.onboardingCompleted
      }
    };
    
    res.status(201).json(response);
  });

  static getUser = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        email: user.email,
        walletAddress: user.walletAddress,
        profile: user.profile,
        onboardingCompleted: user.onboardingCompleted,
        consentGiven: user.consentGiven,
        reputation: user.reputation
      }
    };

    res.status(200).json(response);
  });

  static checkOnboarding = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    const response: ApiResponse = {
      success: true,
      data: {
        exists: !!user,
        onboardingCompleted: user?.onboardingCompleted || false,
        user: user ? {
          email: user.email,
          profile: user.profile,
          walletAddress: user.walletAddress
        } : null
      }
    };

    res.status(200).json(response);
  });

  static completeOnboarding = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;
    const { consentGiven } = req.body;
    
    const user = await User.findOneAndUpdate(
      { email },
      { 
        onboardingCompleted: true,
        consentGiven: consentGiven || false
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
        consentGiven: user.consentGiven
      }
    };

    res.status(200).json(response);
  });

  static getWalletBalance = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    try {
      const provider = IdentityController.initializeProvider();
      const balance = await IdentityController.walletService.getWalletBalance(user.encryptedPrivateKey, provider || undefined);

      // Get network information
      let networkInfo = { name: 'Base Sepolia', chainId: 84532 };
      if (provider) {
        try {
          const network = await provider.getNetwork();
          networkInfo = {
            name: network.name,
            chainId: Number(network.chainId)
          };
        } catch (error) {
          logger.warn('Could not get network info, using defaults:', error);
        }
      }

      const response: ApiResponse = {
        success: true,
        data: {
          walletAddress: user.walletAddress,
          balance: balance,
          currency: 'ETH',
          network: networkInfo
        }
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting wallet balance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get wallet balance'
      });
    }
  });

  static linkFarcaster = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;
    const { farcasterFid } = req.body;
    
    const user = await User.findOneAndUpdate(
      { email },
      { farcasterFid },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Farcaster linked successfully',
      data: user
    };

    res.status(200).json(response);
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;
    const { profile } = req.body;
    
    const user = await User.findOneAndUpdate(
      { email },
      { profile },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: user
    };

    res.status(200).json(response);
  });

  static createVendor = asyncHandler(async (req: Request, res: Response) => {
    const { email, profile, consentGiven, googleId, phoneNumber, baseName, ensName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'User already exists' 
      });
    }

    // Create wallet
    const { address: walletAddress, encryptedPrivateKey } = await IdentityController.walletService.createWallet();

    const user = new User({
      email,
      walletAddress,
      encryptedPrivateKey,
      consentGiven: consentGiven || false,
      onboardingCompleted: true,
      googleId,
      phoneNumber,
      baseName,
      ensName,
      profile: {
        name: profile.name,
        bio: profile.bio,
        isVendor: true, // Force vendor status
        categories: profile.categories || [],
        avatar: profile.avatar,
        location: profile.location,
        website: profile.website
      }
    });

    await user.save();
    
    const response: ApiResponse = {
      success: true,
      message: 'Vendor created successfully',
      data: {
        email: user.email,
        walletAddress: user.walletAddress,
        profile: user.profile,
        onboardingCompleted: user.onboardingCompleted
      }
    };
    
    res.status(201).json(response);
  });

  static updateVendor = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;
    const { profile } = req.body;
    
    const user = await User.findOneAndUpdate(
      { email, 'profile.isVendor': true },
      { 
        profile: {
          ...profile,
          isVendor: true // Ensure vendor status is maintained
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Vendor not found' 
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Vendor profile updated successfully',
      data: {
        email: user.email,
        profile: user.profile
      }
    };

    res.status(200).json(response);
  });

  static getVendor = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;
    const user = await User.findOne({ email, 'profile.isVendor': true });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Vendor not found' 
      });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        email: user.email,
        walletAddress: user.walletAddress,
        profile: user.profile,
        reputation: user.reputation
      }
    };

    res.status(200).json(response);
  });

  static getVendors = asyncHandler(async (req: Request, res: Response) => {
    const { category, minReputation = 0, page = 1, limit = 20 } = req.query;
    
    const query: any = {
      'profile.isVendor': true,
      'reputation.score': { $gte: Number(minReputation) }
    };
    
    if (category) {
      query['profile.categories'] = category;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const vendors = await User.find(query)
      .sort({ 'reputation.score': -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await User.countDocuments(query);

    const response: ApiResponse = {
      success: true,
      data: {
        vendors: vendors.map(vendor => ({
          id: vendor._id,
          email: vendor.email,
          walletAddress: vendor.walletAddress,
          profile: vendor.profile,
          reputation: vendor.reputation
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    };

    res.status(200).json(response);
  });
}
