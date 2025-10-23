import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';

const router = Router();

// Initialize controller with services (will be injected)
let transactionController: TransactionController;

export const initializeTransactionRoutes = (paymentService: any, reputationService: any) => {
  transactionController = new TransactionController(paymentService, reputationService);
};

// Transaction management routes
router.get('/:email', (req, res) => transactionController.getTransactions(req, res));
router.get('/:email/:transactionId', (req, res) => transactionController.getTransaction(req, res));
router.put('/:transactionId/status', (req, res) => transactionController.updateTransactionStatus(req, res));
router.get('/:transactionId/timeline', (req, res) => transactionController.getTransactionTimeline(req, res));

// Payment routes
router.post('/payment/direct', (req, res) => transactionController.makeDirectPayment(req, res));

export default router;
