// ==============================================================================
// DASHBOARD CONTROLLER: CARE HOME PLATFORM
// ==============================================================================
// Aggregates shift statistics, vacancies, priorities, and demographic breakdowns
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export async function getDashboardSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalShifts,
      openShifts,
      urgentShifts,
      partiallyFilled,
      filledShifts,
      cancelledShifts,
      totalCareHomes,
      shiftsByJobTitleRaw,
      shiftsByLocationRaw,
      shiftsByStatusRaw,
      shiftsByPriorityRaw,
      todaysShifts,
      upcomingShifts,
      recentShifts,
    ] = await Promise.all([
      // Totals & Statuses
      prisma.shift.count(),
      prisma.shift.count({ where: { status: 'OPEN' } }),
      prisma.shift.count({ where: { priority: 'URGENT', status: { in: ['OPEN', 'PARTIALLY_FILLED'] } } }),
      prisma.shift.count({ where: { status: 'PARTIALLY_FILLED' } }),
      prisma.shift.count({ where: { status: 'FILLED' } }),
      prisma.shift.count({ where: { status: 'CANCELLED' } }),
      prisma.careHome.count(),

      // Groupings
      prisma.shift.groupBy({
        by: ['jobTitle'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.shift.groupBy({
        by: ['location'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.shift.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.shift.groupBy({
        by: ['priority'],
        _count: { id: true },
      }),

      // Today's shifts
      prisma.shift.findMany({
        where: { shiftDate: today },
        include: { careHome: { select: { name: true, town: true } } },
        take: 5,
      }),

      // Upcoming shifts
      prisma.shift.findMany({
        where: {
          shiftDate: { gte: today },
          status: { in: ['OPEN', 'PARTIALLY_FILLED'] },
        },
        orderBy: { shiftDate: 'asc' },
        include: { careHome: { select: { name: true, town: true } } },
        take: 5,
      }),

      // Recently posted
      prisma.shift.findMany({
        orderBy: { createdAt: 'desc' },
        include: { careHome: { select: { name: true, town: true } } },
        take: 5,
      }),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalShifts,
          openShifts,
          urgentShifts,
          partiallyFilled,
          filledShifts,
          cancelledShifts,
          totalCareHomes,
        },
        distributions: {
          shiftsByJobTitle: shiftsByJobTitleRaw.map((j) => ({ jobTitle: j.jobTitle, count: j._count.id })),
          shiftsByLocation: shiftsByLocationRaw.map((l) => ({ location: l.location, count: l._count.id })),
          shiftsByStatus: shiftsByStatusRaw.map((s) => ({ status: s.status, count: s._count.id })),
          shiftsByPriority: shiftsByPriorityRaw.map((p) => ({ priority: p.priority, count: p._count.id })),
        },
        feed: {
          todaysShifts,
          upcomingShifts,
          recentShifts,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
