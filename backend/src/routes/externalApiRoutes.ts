// ==============================================================================
// EXTERNAL API ROUTES
// ==============================================================================
// Protected routes for service-to-service communication
// Requires valid API key in X-API-Key header
// ==============================================================================

import { Router } from 'express';
import {
  getShiftsForExternalService,
  getShiftByIdForExternalService,
  getCareHomesForExternalService,
} from '../controllers/externalApiController';
import { validateApiKey } from '../middleware/apiKeyAuth';

const router = Router();

// All external API routes are protected by API key validation
router.use(validateApiKey);

// Shift endpoints for external services
router.get('/shifts', getShiftsForExternalService);
router.get('/shifts/:id', getShiftByIdForExternalService);
router.get('/care-homes', getCareHomesForExternalService);

export default router;
