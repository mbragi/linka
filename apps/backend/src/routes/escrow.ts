import { Router } from 'express';
import { EscrowController } from '../controllers/EscrowController';

const router = Router();

// Initialize controller with services (will be injected)
let escrowController: EscrowController;

export const initializeEscrowRoutes = (escrowService: any, disputeService: any) => {
  escrowController = new EscrowController(escrowService, disputeService);
};

// Escrow management routes
router.post('/create', (req, res) => escrowController.createEscrow(req, res));
router.post('/:escrowId/release', (req, res) => escrowController.releaseEscrow(req, res));
router.post('/:escrowId/refund', (req, res) => escrowController.refundEscrow(req, res));
router.post('/:escrowId/dispute', (req, res) => escrowController.disputeEscrow(req, res));
router.get('/:escrowId', (req, res) => escrowController.getEscrow(req, res));

// Dispute resolution routes
router.post('/:escrowId/disputes/open', (req, res) => escrowController.openDispute(req, res));
router.post('/:escrowId/disputes/evidence', (req, res) => escrowController.addEvidence(req, res));
router.post('/:escrowId/disputes/resolve', (req, res) => escrowController.resolveDispute(req, res));
router.get('/:escrowId/disputes', (req, res) => escrowController.getDispute(req, res));

export default router;
