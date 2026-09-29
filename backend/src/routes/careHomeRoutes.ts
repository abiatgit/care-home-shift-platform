import { Router } from 'express';
import { getCareHomes, getCareHomeById, createCareHome } from '../controllers/careHomeController';

const router = Router();

router.get('/', getCareHomes);
router.get('/:id', getCareHomeById);
router.post('/', createCareHome);

export default router;
