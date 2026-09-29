import { Request, Response, NextFunction } from 'express';

const ALLOWED_STATUSES = ['OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'EXPIRED'];
const ALLOWED_PRIORITIES = ['NORMAL', 'HIGH', 'URGENT'];

export function validateShift(req: Request, res: Response, next: NextFunction) {
  const {
    careHomeId,
    jobTitle,
    shiftDate,
    startTime,
    endTime,
    requiredStaff,
    priority,
    status,
  } = req.body;

  const errors: string[] = [];

  if (!careHomeId || isNaN(parseInt(careHomeId, 10))) {
    errors.push('A valid Care Home selection is required.');
  }

  if (!jobTitle || typeof jobTitle !== 'string' || jobTitle.trim().length === 0) {
    errors.push('Job title is required.');
  }

  if (!shiftDate || typeof shiftDate !== 'string') {
    errors.push('Shift date is required (YYYY-MM-DD format).');
  }

  if (!startTime || typeof startTime !== 'string') {
    errors.push('Start time is required (e.g. 07:00).');
  }

  if (!endTime || typeof endTime !== 'string') {
    errors.push('End time is required (e.g. 19:00).');
  }

  if (requiredStaff === undefined || typeof requiredStaff !== 'number' || requiredStaff < 1) {
    errors.push('Required staff count must be at least 1.');
  }

  if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}`);
  }

  if (status && !ALLOWED_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
}
