// ==============================================================================
// SHIFT CONTROLLER
// ==============================================================================
// Handles shift creation, filtering, status transitions, and staff assignment.
// Automatically manages the workflow:
// OPEN -> PARTIALLY_FILLED -> FILLED (or CANCELLED)
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { findSuitableStaffForShift } from '../services/staffMatchingService';

// Helper function to recalculate status based on filledStaff vs requiredStaff
export function calculateShiftStatus(requiredStaff: number, filledStaff: number, currentStatus: string): string {
  if (currentStatus === 'CANCELLED' || currentStatus === 'EXPIRED') {
    return currentStatus;
  }
  if (filledStaff >= requiredStaff) {
    return 'FILLED';
  }
  if (filledStaff > 0) {
    return 'PARTIALLY_FILLED';
  }
  return 'OPEN';
}

// ------------------------------------------------------------------------------
// GET /api/shifts
// List all shifts with filtering, searching, and pagination
// ------------------------------------------------------------------------------
export async function getShifts(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      status,
      priority,
      jobTitle,
      location,
      careHomeId,
      date,
      q,
      page = '1',
      limit = '20',
      sortBy = 'shiftDate',
      sortOrder = 'asc',
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (priority && typeof priority === 'string') {
      where.priority = priority;
    }

    if (jobTitle && typeof jobTitle === 'string') {
      where.jobTitle = { equals: jobTitle };
    }

    if (location && typeof location === 'string') {
      where.location = { equals: location };
    }

    if (careHomeId && typeof careHomeId === 'string') {
      where.careHomeId = parseInt(careHomeId, 10);
    }

    if (date && typeof date === 'string') {
      where.shiftDate = date;
    }

    // Free text search
    if (q && typeof q === 'string' && q.trim()) {
      const searchTerm = q.trim();
      where.OR = [
        { jobTitle: { contains: searchTerm } },
        { location: { contains: searchTerm } },
        { department: { contains: searchTerm } },
        { requiredSkills: { contains: searchTerm } },
        { careHome: { name: { contains: searchTerm } } },
      ];
    }

    const validSortFields = ['id', 'shiftDate', 'createdAt', 'requiredStaff', 'filledStaff', 'priority', 'status'];
    const orderField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'shiftDate';
    const direction = (sortOrder as string).toLowerCase() === 'desc' ? 'desc' : 'asc';

    const [total, shifts] = await Promise.all([
      prisma.shift.count({ where }),
      prisma.shift.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [orderField]: direction },
        include: {
          careHome: {
            select: { id: true, name: true, town: true, phone: true },
          },
          assignments: {
            include: {
              staff: {
                select: { id: true, name: true, role: true, experience: true },
              },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    res.json({
      success: true,
      meta: {
        total,
        page: pageNumber,
        pageSize,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
      data: shifts,
    });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------------------------
// Shortcuts: OPEN, URGENT, UPCOMING
// ------------------------------------------------------------------------------
export async function getOpenShifts(req: Request, res: Response, next: NextFunction) {
  try {
    const shifts = await prisma.shift.findMany({
      where: { status: { in: ['OPEN', 'PARTIALLY_FILLED'] } },
      orderBy: { shiftDate: 'asc' },
      include: {
        careHome: { select: { id: true, name: true, town: true } },
      },
      take: 20,
    });
    res.json({ success: true, count: shifts.length, data: shifts });
  } catch (error) {
    next(error);
  }
}

export async function getUrgentShifts(req: Request, res: Response, next: NextFunction) {
  try {
    const shifts = await prisma.shift.findMany({
      where: {
        priority: 'URGENT',
        status: { in: ['OPEN', 'PARTIALLY_FILLED'] },
      },
      orderBy: { shiftDate: 'asc' },
      include: {
        careHome: { select: { id: true, name: true, town: true } },
      },
      take: 10,
    });
    res.json({ success: true, count: shifts.length, data: shifts });
  } catch (error) {
    next(error);
  }
}

export async function getUpcomingShifts(req: Request, res: Response, next: NextFunction) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const shifts = await prisma.shift.findMany({
      where: {
        shiftDate: { gte: today },
        status: { notIn: ['CANCELLED', 'EXPIRED'] },
      },
      orderBy: { shiftDate: 'asc' },
      include: {
        careHome: { select: { id: true, name: true, town: true } },
      },
      take: 10,
    });
    res.json({ success: true, count: shifts.length, data: shifts });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------------------------
// GET /api/shifts/:id
// Retrieve complete shift details with CareHome and allocated staff
// ------------------------------------------------------------------------------
export async function getShiftById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next(new AppError('Invalid shift ID format', 400));

    const shift = await prisma.shift.findUnique({
      where: { id },
      include: {
        careHome: true,
        assignments: {
          include: {
            staff: true,
          },
          orderBy: { assignedAt: 'asc' },
        },
      },
    });

    if (!shift) {
      return res.status(404).json({ success: false, message: `Shift #${id} not found` });
    }

    res.json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------------------------
// POST /api/shifts
// Care Home Manager creates a new shift vacancy
// ------------------------------------------------------------------------------
export async function createShift(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      careHomeId,
      jobTitle,
      shiftDate,
      startTime,
      endTime,
      requiredStaff,
      location,
      department,
      careType,
      requiredSkills,
      experienceRequired,
      payRate,
      notes,
      priority = 'NORMAL',
    } = req.body;

    const careHome = await prisma.careHome.findUnique({
      where: { id: parseInt(careHomeId, 10) },
    });

    if (!careHome) {
      return res.status(404).json({ success: false, message: 'Care Home not found' });
    }

    const shift = await prisma.shift.create({
      data: {
        careHomeId: careHome.id,
        jobTitle,
        shiftDate,
        startTime,
        endTime,
        requiredStaff: parseInt(requiredStaff, 10),
        filledStaff: 0,
        location: location || careHome.town,
        department: department || 'General Care Unit',
        careType: careType || careHome.careType,
        requiredSkills: requiredSkills || 'Personal Care, Communication',
        experienceRequired: experienceRequired || 'No experience',
        payRate: payRate || '£13.50/hr',
        notes: notes || null,
        status: 'OPEN',
        priority: priority || 'NORMAL',
      },
      include: {
        careHome: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Shift created successfully',
      data: shift,
    });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------------------------
// PUT /api/shifts/:id
// Update an existing shift
// ------------------------------------------------------------------------------
export async function updateShift(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next(new AppError('Invalid shift ID', 400));

    const existing = await prisma.shift.findUnique({
      where: { id },
      include: { assignments: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: `Shift #${id} not found` });
    }

    const {
      careHomeId,
      jobTitle,
      shiftDate,
      startTime,
      endTime,
      requiredStaff,
      location,
      department,
      careType,
      requiredSkills,
      experienceRequired,
      payRate,
      notes,
      priority,
      status,
    } = req.body;

    const reqCount = requiredStaff !== undefined ? parseInt(requiredStaff, 10) : existing.requiredStaff;
    const filledCount = existing.assignments.length;
    const computedStatus = status || calculateShiftStatus(reqCount, filledCount, existing.status);

    const updated = await prisma.shift.update({
      where: { id },
      data: {
        ...(careHomeId && { careHomeId: parseInt(careHomeId, 10) }),
        ...(jobTitle && { jobTitle }),
        ...(shiftDate && { shiftDate }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(requiredStaff !== undefined && { requiredStaff: reqCount }),
        filledStaff: filledCount,
        ...(location && { location }),
        ...(department && { department }),
        ...(careType && { careType }),
        ...(requiredSkills && { requiredSkills }),
        ...(experienceRequired && { experienceRequired }),
        ...(payRate && { payRate }),
        ...(notes !== undefined && { notes }),
        ...(priority && { priority }),
        status: computedStatus,
      },
      include: {
        careHome: true,
        assignments: { include: { staff: true } },
      },
    });

    res.json({
      success: true,
      message: 'Shift updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------------------------
// PATCH /api/shifts/:id/status
// Update status directly (e.g. Cancel Shift)
// ------------------------------------------------------------------------------
export async function updateShiftStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next(new AppError('Invalid shift ID', 400));

    const { status } = req.body;
    const validStatuses = ['OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'EXPIRED'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updated = await prisma.shift.update({
      where: { id },
      data: { status },
      include: { careHome: true },
    });

    res.json({
      success: true,
      message: `Shift status changed to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------------------------
// DELETE /api/shifts/:id
// Physical deletion
// ------------------------------------------------------------------------------
export async function deleteShift(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next(new AppError('Invalid shift ID', 400));

    await prisma.shift.delete({ where: { id } });

    res.json({
      success: true,
      message: `Shift #${id} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------------------------
// POST /api/shifts/:id/assign
// STAFF SELECTION WORKFLOW: Assign a staff member to this shift
// Automatically updates filledStaff and status (OPEN -> PARTIALLY_FILLED -> FILLED)
// ------------------------------------------------------------------------------
export async function assignStaffToShift(req: Request, res: Response, next: NextFunction) {
  try {
    const shiftId = parseInt(req.params.id, 10);
    const { staffId } = req.body;

    if (!staffId || isNaN(parseInt(staffId, 10))) {
      return res.status(400).json({ success: false, message: 'Valid staffId is required' });
    }

    const targetShift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: { assignments: true },
    });

    if (!targetShift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    if (targetShift.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Cannot assign staff to a cancelled shift' });
    }

    // Check if staff already assigned
    const alreadyAssigned = targetShift.assignments.some((a) => a.staffId === parseInt(staffId, 10));
    if (alreadyAssigned) {
      return res.status(400).json({ success: false, message: 'This staff member is already assigned to this shift' });
    }

    // Create assignment
    await prisma.shiftAssignment.create({
      data: {
        shiftId,
        staffId: parseInt(staffId, 10),
        status: 'CONFIRMED',
      },
    });

    // Recalculate filledStaff count
    const updatedAssignments = await prisma.shiftAssignment.findMany({
      where: { shiftId },
    });

    const newFilledCount = updatedAssignments.length;
    const newStatus = calculateShiftStatus(targetShift.requiredStaff, newFilledCount, targetShift.status);

    const updatedShift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        filledStaff: newFilledCount,
        status: newStatus,
      },
      include: {
        careHome: true,
        assignments: { include: { staff: true } },
      },
    });

    res.json({
      success: true,
      message: `Staff assigned! Shift is now ${newStatus} (${newFilledCount}/${targetShift.requiredStaff} staff).`,
      data: updatedShift,
    });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------------------------
// DELETE /api/shifts/:id/unassign/:staffId
// Unassign a staff member from a shift and recalculate status
// ------------------------------------------------------------------------------
export async function unassignStaffFromShift(req: Request, res: Response, next: NextFunction) {
  try {
    const shiftId = parseInt(req.params.id, 10);
    const staffId = parseInt(req.params.staffId, 10);

    const targetShift = await prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!targetShift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    await prisma.shiftAssignment.deleteMany({
      where: { shiftId, staffId },
    });

    const remainingAssignments = await prisma.shiftAssignment.findMany({
      where: { shiftId },
    });

    const newFilledCount = remainingAssignments.length;
    const newStatus = calculateShiftStatus(targetShift.requiredStaff, newFilledCount, targetShift.status);

    const updatedShift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        filledStaff: newFilledCount,
        status: newStatus,
      },
      include: {
        careHome: true,
        assignments: { include: { staff: true } },
      },
    });

    res.json({
      success: true,
      message: `Staff unassigned. Shift is now ${newStatus} (${newFilledCount}/${targetShift.requiredStaff}).`,
      data: updatedShift,
    });
  } catch (error) {
    next(error);
  }
}

// ------------------------------------------------------------------------------
// GET /api/shifts/:id/suitable-staff
// Retrieve suitable staff for matching
// ------------------------------------------------------------------------------
export async function getSuitableStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const shiftId = parseInt(req.params.id, 10);
    if (isNaN(shiftId)) return next(new AppError('Invalid shift ID', 400));

    const suitableStaff = await findSuitableStaffForShift(shiftId);

    res.json({
      success: true,
      count: suitableStaff.length,
      data: suitableStaff,
    });
  } catch (error) {
    next(error);
  }
}
