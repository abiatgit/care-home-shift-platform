// ==============================================================================
// API KEY AUTHENTICATION MIDDLEWARE
// ==============================================================================
// Protects service-to-service API endpoints
// Validates that incoming requests from other services have a valid API key
// ==============================================================================

import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  serviceClient?: string;
}

export function validateApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.SERVICE_API_KEY;

  if (!validApiKey) {
    console.error('[API Auth] SERVICE_API_KEY not configured in environment');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
    });
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Missing API key. Include X-API-Key header.',
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({
      success: false,
      error: 'Invalid API key',
    });
  }

  // Identify the calling service (optional, for logging)
  const serviceName = req.headers['x-service-name'] as string;
  req.serviceClient = serviceName || 'unknown-service';

  next();
}
