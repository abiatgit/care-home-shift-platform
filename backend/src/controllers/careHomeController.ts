import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export async function getCareHomes(req: Request, res: Response, next: NextFunction) {
  try {
    const careHomes = await prisma.careHome.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            shifts: true,
          },
        },
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

export async function getCareHomeById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next(new AppError('Invalid care home ID', 400));

    const careHome = await prisma.careHome.findUnique({
      where: { id },
      include: {
        shifts: {
          orderBy: { shiftDate: 'asc' },
        },
      },
    });

    if (!careHome) {
      return res.status(404).json({ success: false, message: `Care home #${id} not found` });
    }

    res.json({
      success: true,
      data: careHome,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCareHome(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name,
      address,
      town,
      postcode,
      county,
      numberOfBeds,
      managerName,
      managerEmail,
      phone,
      careType,
    } = req.body;

    if (!name || !town || !careType) {
      return res.status(400).json({
        success: false,
        message: 'Name, town, and careType are required.',
      });
    }

    const careHome = await prisma.careHome.create({
      data: {
        name,
        address: address || 'Main Road',
        town,
        postcode: postcode || 'BT1 1AA',
        county: county || 'County Antrim',
        numberOfBeds: numberOfBeds ? parseInt(numberOfBeds, 10) : 40,
        managerName: managerName || 'Care Home Manager',
        managerEmail: managerEmail || 'manager@carehome-demo.co.uk',
        phone: phone || '+44 7700 900100',
        careType,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Care Home created successfully',
      data: careHome,
    });
  } catch (error) {
    next(error);
  }
}
