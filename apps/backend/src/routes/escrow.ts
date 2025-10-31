import { Router } from 'express';
import { EscrowController } from '../controllers/EscrowController';

const router = Router();

// Initialize controller with services (will be injected)
let escrowController: EscrowController;

export const initializeEscrowRoutes = (escrowService: any, disputeService: any) => {
  escrowController = new EscrowController(escrowService, disputeService);
};

// Escrow management routes
router.post('/create', (req, res, next) => escrowController.createEscrow(req, res, next));
router.post('/:escrowId/release', (req, res, next) => escrowController.releaseEscrow(req, res, next));
router.post('/:escrowId/refund', (req, res, next) => escrowController.refundEscrow(req, res, next));
router.post('/:escrowId/dispute', (req, res, next) => escrowController.disputeEscrow(req, res, next));
router.get('/:escrowId', (req, res, next) => escrowController.getEscrow(req, res, next));

// Dispute resolution routes
router.post('/:escrowId/disputes/open', (req, res, next) => escrowController.openDispute(req, res, next));
router.post('/:escrowId/disputes/evidence', (req, res, next) => escrowController.addEvidence(req, res, next));
router.post('/:escrowId/disputes/resolve', (req, res, next) => escrowController.resolveDispute(req, res, next));
router.get('/:escrowId/disputes', (req, res, next) => escrowController.getDispute(req, res, next));

export default router;
