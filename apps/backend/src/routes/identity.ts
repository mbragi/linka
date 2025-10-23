import { Router } from 'express';
import { IdentityController } from '../controllers/IdentityController';

const router = Router();

// User management routes
router.post('/create', IdentityController.createUser);
router.get('/:email', IdentityController.getUser);
router.put('/:email/link-farcaster', IdentityController.linkFarcaster);
router.put('/:email/profile', IdentityController.updateProfile);

// Vendor search routes
router.get('/', IdentityController.getVendors);

export default router;
