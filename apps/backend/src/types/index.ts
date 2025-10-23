import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    walletAddress: string;
    farcasterFid?: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VendorSearchQuery extends PaginationQuery {
  category?: string;
  minReputation?: number;
  location?: string;
  isVerified?: boolean;
}

export interface TransactionQuery extends PaginationQuery {
  status?: string;
  type?: 'marketplace' | 'service';
  buyerEmail?: string;
  sellerEmail?: string;
}
