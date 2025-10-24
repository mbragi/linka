import express from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware';

// Import services
import { EscrowService } from './services/EscrowService';
import { PaymentService } from './services/PaymentService';
import { ReputationService } from './services/ReputationService';
import { DisputeService } from './services/DisputeService';

// Import routes
import identityRoutes from './routes/identity';
import vendorRoutes from './routes/vendors';
import escrowRoutes, { initializeEscrowRoutes } from './routes/escrow';
import transactionRoutes, { initializeTransactionRoutes } from './routes/transactions';
import reputationRoutes, { initializeReputationRoutes } from './routes/reputation';

dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Database connection
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/linka')
  .then(() => logger.info('Connected to MongoDB'))
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Initialize blockchain services
const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
const privateKey = process.env.PRIVATE_KEY;
const escrowManagerAddress = process.env.ESCROW_MANAGER_ADDRESS;
const paymentProcessorAddress = process.env.PAYMENT_PROCESSOR_ADDRESS;
const reputationRegistryAddress = process.env.REPUTATION_REGISTRY_ADDRESS;
const disputeResolutionAddress = process.env.DISPUTE_RESOLUTION_ADDRESS;

if (!privateKey || !escrowManagerAddress || !paymentProcessorAddress || !reputationRegistryAddress || !disputeResolutionAddress) {
  logger.error("Missing environment variables for contract services. Please check .env file.");
  process.exit(1);
}

const escrowService = new EscrowService(provider, privateKey, escrowManagerAddress);
const paymentService = new PaymentService(provider, privateKey, paymentProcessorAddress);
const reputationService = new ReputationService(provider, privateKey, reputationRegistryAddress);
const disputeService = new DisputeService(provider, privateKey, disputeResolutionAddress);

// Initialize route controllers with services
initializeEscrowRoutes(escrowService, disputeService);
initializeTransactionRoutes(paymentService, reputationService);
initializeReputationRoutes(reputationService);

// API Routes
app.use('/api/identity', identityRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reputation', reputationRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Linka Backend Service is running!',
    version: '1.0.0',
    services: ['identity', 'escrow', 'payment', 'reputation', 'transactions', 'vendors']
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Linka Backend Service listening on port ${port}`);
});