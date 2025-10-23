import { Request, Response } from 'express';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware';
import { ApiResponse } from '../types';

export class IdentityController {
  static createUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, walletAddress, profile } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'User already exists' 
      });
    }

    const user = new User({
      email,
      walletAddress,
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
      data: user
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
      data: user
    };

    res.status(200).json(response);
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
        vendors,
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
