import { Router } from 'express';
import { ReputationController } from '../controllers/ReputationController';

const router = Router();

// Initialize controller with services (will be injected)
let reputationController: ReputationController;

export const initializeReputationRoutes = (reputationService: any) => {
  reputationController = new ReputationController(reputationService);
};

// Reputation management routes
router.get('/:userAddress', (req, res) => reputationController.getReputation(req, res));
router.post('/update', (req, res) => reputationController.updateReputation(req, res));

export default router;
