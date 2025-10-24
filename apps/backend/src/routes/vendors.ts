import { Router } from 'express';
import { IdentityController } from '../controllers/IdentityController';

const router = Router();

// Vendor CRUD operations
router.post('/', IdentityController.createVendor);
router.get('/', IdentityController.getVendors);
router.put('/:email', IdentityController.updateVendor);
router.get('/:email', IdentityController.getVendor);

export default router;
