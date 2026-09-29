import { Router } from 'express';
import {
  getShifts,
  getOpenShifts,
  getUrgentShifts,
  getUpcomingShifts,
  getShiftById,
  createShift,
  updateShift,
  updateShiftStatus,
  deleteShift,
  assignStaffToShift,
  unassignStaffFromShift,
  getSuitableStaff,
} from '../controllers/shiftController';
import { validateShift } from '../middleware/validateShift';

const router = Router();

// Static routes first to prevent :id shadowing
router.get('/open', getOpenShifts);
router.get('/urgent', getUrgentShifts);
router.get('/upcoming', getUpcomingShifts);

// Collection routes
router.get('/', getShifts);
router.post('/', validateShift, createShift);

// Single shift routes
router.get('/:id', getShiftById);
router.put('/:id', validateShift, updateShift);
router.delete('/:id', deleteShift);
router.patch('/:id/status', updateShiftStatus);

// Staff Allocation Workflow routes
router.post('/:id/assign', assignStaffToShift);
router.delete('/:id/unassign/:staffId', unassignStaffFromShift);
router.get('/:id/suitable-staff', getSuitableStaff);

export default router;
