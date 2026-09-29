// ==============================================================================
// EXTERNAL API CONTROLLER
// ==============================================================================
// Service-to-service API endpoints for external platforms (e.g., Keris Staff Agency)
// Protected by API key authentication
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

// ==============================================================================
// GET /api/external/shifts - Get shifts with filtering
// ==============================================================================
export async function getShiftsForExternalService(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      status,
      priority,
      location,
      jobTitle,
      date,
      limit = '50',
    } = req.query;

    const where: any = {};

    if (status && typeof status === 'string') {
      where.status = status;
    } else {
      // Default: only return open or partially filled shifts
      where.status = { in: ['OPEN', 'PARTIALLY_FILLED'] };
    }

    if (priority && typeof priority === 'string') {
      where.priority = priority;
    }

    if (location && typeof location === 'string') {
      where.location = { equals: location };
    }

    if (jobTitle && typeof jobTitle === 'string') {
      where.jobTitle = { contains: jobTitle };
    }

    if (date && typeof date === 'string') {
      where.shiftDate = date;
    }

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        careHome: {
          select: {
            id: true,
            name: true,
            address: true,
            town: true,
            postcode: true,
            county: true,
            careType: true,
            managerName: true,
            phone: true,
          },
        },
      },
      take: Math.min(100, parseInt(limit as string) || 50),
      orderBy: [
        { priority: 'desc' },
        { shiftDate: 'asc' },
      ],
    });

    // Transform to external API format
    const response = shifts.map(shift => ({
      id: shift.id,
      careHome: {
        id: shift.careHome.id,
        name: shift.careHome.name,
        address: shift.careHome.address,
        town: shift.careHome.town,
        postcode: shift.careHome.postcode,
        county: shift.careHome.county,
        careType: shift.careHome.careType,
        contactPerson: shift.careHome.managerName,
        phone: shift.careHome.phone,
      },
      jobTitle: shift.jobTitle,
      shiftDate: shift.shiftDate,
      startTime: shift.startTime,
      endTime: shift.endTime,
      requiredStaff: shift.requiredStaff,
      filledStaff: shift.filledStaff,
      location: shift.location,
      department: shift.department,
      careType: shift.careType,
      requiredSkills: shift.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      experienceRequired: shift.experienceRequired,
      payRate: shift.payRate,
      notes: shift.notes,
      status: shift.status,
      priority: shift.priority,
    }));

    res.json({
      success: true,
      count: response.length,
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

// ==============================================================================
// GET /api/external/shifts/:id - Get detailed shift info
// ==============================================================================
export async function getShiftByIdForExternalService(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid shift ID',
      });
    }

    const shift = await prisma.shift.findUnique({
      where: { id },
      include: {
        careHome: true,
        assignments: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                role: true,
                experience: true,
                skills: true,
              },
            },
          },
        },
      },
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        error: 'Shift not found',
      });
    }

    const response = {
      id: shift.id,
      careHome: {
        id: shift.careHome.id,
        name: shift.careHome.name,
        address: shift.careHome.address,
        town: shift.careHome.town,
        postcode: shift.careHome.postcode,
        county: shift.careHome.county,
        numberOfBeds: shift.careHome.numberOfBeds,
        careType: shift.careHome.careType,
        managerName: shift.careHome.managerName,
        managerEmail: shift.careHome.managerEmail,
        phone: shift.careHome.phone,
      },
      jobTitle: shift.jobTitle,
      shiftDate: shift.shiftDate,
      startTime: shift.startTime,
      endTime: shift.endTime,
      requiredStaff: shift.requiredStaff,
      filledStaff: shift.filledStaff,
      location: shift.location,
      department: shift.department,
      careType: shift.careType,
      requiredSkills: shift.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      experienceRequired: shift.experienceRequired,
      payRate: shift.payRate,
      notes: shift.notes,
      status: shift.status,
      priority: shift.priority,
      assignedStaff: shift.assignments.map(a => ({
        id: a.staff.id,
        name: a.staff.name,
        role: a.staff.role,
        experience: a.staff.experience,
        skills: a.staff.skills,
        assignedAt: a.assignedAt,
        assignmentStatus: a.status,
      })),
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

// ==============================================================================
// GET /api/external/care-homes - Get all care homes
// ==============================================================================
export async function getCareHomesForExternalService(req: Request, res: Response, next: NextFunction) {
  try {
    const careHomes = await prisma.careHome.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        town: true,
        postcode: true,
        county: true,
        numberOfBeds: true,
        careType: true,
        phone: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      count: careHomes.length,
      data: careHomes,
    });
  } catch (error) {
    next(error);
  }
}
