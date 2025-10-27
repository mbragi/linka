import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  farcasterFid?: number;
  walletAddress: string;
  encryptedPrivateKey: string;
  phoneNumber?: string; // whatsapp phone number
  googleId?: string;
  consentGiven: boolean;
  onboardingCompleted: boolean;
  baseName?: string;
  ensName?: string;
  profile: {
    name: string;
    bio?: string;
    isVendor: boolean;
    categories?: string[];
    avatar?: string;
    location?: string;
    website?: string;
  };
  reputation: {
    score: number;
    totalTransactions: number;
    completedTransactions: number;
    disputes: number;
    totalVolume: number;
    lastUpdated: Date;
  };
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    privacyLevel: 'public' | 'private' | 'friends';
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    kycCompleted: boolean;
    documentsUploaded: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [/^[a-z0-9_.-]+$/, 'Username can only contain lowercase letters, numbers, dots, underscores, and hyphens']
  },
  password: {
    type: String,
    required: true
  },
  farcasterFid: {
    type: Number,
    unique: true,
    sparse: true,
    index: true
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  encryptedPrivateKey: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    sparse: true,
    index: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  consentGiven: {
    type: Boolean,
    default: false
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  baseName: {
    type: String,
    sparse: true,
    index: true
  },
  ensName: {
    type: String,
    sparse: true,
    index: true
  },
  profile: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    bio: {
      type: String,
      maxlength: 500
    },
    isVendor: {
      type: Boolean,
      default: false
    },
    categories: [{
      type: String,
      enum: [
        'electronics', 'clothing', 'food', 'services', 'digital', 
        'art', 'collectibles', 'automotive', 'home', 'beauty', 'sports'
      ]
    }],
    avatar: String,
    location: String,
    website: String
  },
  reputation: {
    score: {
      type: Number,
      default: 500,
      min: 0,
      max: 1000
    },
    totalTransactions: {
      type: Number,
      default: 0
    },
    completedTransactions: {
      type: Number,
      default: 0
    },
    disputes: {
      type: Number,
      default: 0
    },
    totalVolume: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    emailUpdates: {
      type: Boolean,
      default: true
    },
    privacyLevel: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'public'
    }
  },
  verification: {
    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    kycCompleted: {
      type: Boolean,
      default: false
    },
    documentsUploaded: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
UserSchema.index({ username: 1 });
UserSchema.index({ 'profile.isVendor': 1, 'reputation.score': -1 });
UserSchema.index({ 'profile.categories': 1 });
UserSchema.index({ 'reputation.totalVolume': -1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
