// ==============================================================================
// STAFF MATCHING SERVICE (PLACEHOLDER & FUTURE INTEGRATION BLUEPRINT)
// ==============================================================================
// This service finds available and suitable care staff for a given shift.
// In this first version, it queries internal synthetic demo staff.
//
// 🔌 FUTURE INTEGRATION ARCHITECTURE:
// In Phase 2, this function will call the external "UK NHS & Care Workforce API":
// const externalUrl = `${process.env.STAFF_BANK_API_URL}/workers/search?q=${encodeURIComponent(shift.jobTitle)}`;
// and filter by shift.requiredSkills, shift.location, and availability!
// ==============================================================================

import prisma from '../utils/prisma';

export interface SuitableStaffResult {
  id: number;
  name: string;
  role: string;
  experience: string;
  skills: string;
  location: string;
  availability: string;
  matchScore: number; // Percentage match based on skills & role
  source: 'internal_demo' | 'external_staff_bank_api';
}

export async function findSuitableStaffForShift(shiftId: number): Promise<SuitableStaffResult[]> {
  // 1. Fetch shift requirements
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: {
      assignments: {
        select: { staffId: true },
      },
    },
  });

  if (!shift) {
    throw new Error(`Shift #${shiftId} not found`);
  }

  // Already assigned staff IDs (don't propose staff who are already confirmed on this shift)
  const assignedStaffIds = shift.assignments.map((a) => a.staffId);

  // 2. Query available synthetic staff
  const candidates = await prisma.staff.findMany({
    where: {
      id: { notIn: assignedStaffIds },
    },
  });

  const shiftSkills = shift.requiredSkills
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // 3. Compute suitability match score (based on job role match & skill overlap)
  const matchedStaff: SuitableStaffResult[] = candidates.map((staff) => {
    let score = 50; // Base score for available worker

    // Role similarity
    if (staff.role.toLowerCase() === shift.jobTitle.toLowerCase()) {
      score += 30;
    } else if (
      staff.role.toLowerCase().includes('nurse') &&
      shift.jobTitle.toLowerCase().includes('nurse')
    ) {
      score += 25;
    } else if (
      staff.role.toLowerCase().includes('assistant') &&
      shift.jobTitle.toLowerCase().includes('assistant')
    ) {
      score += 20;
    }

    // Skill overlap
    const staffSkills = staff.skills.toLowerCase();
    let matchedSkillCount = 0;
    shiftSkills.forEach((skill) => {
      if (staffSkills.includes(skill)) {
        matchedSkillCount++;
      }
    });

    if (shiftSkills.length > 0) {
      const skillBonus = Math.round((matchedSkillCount / shiftSkills.length) * 20);
      score += skillBonus;
    }

    // Location proximity bonus
    if (staff.location.toLowerCase() === shift.location.toLowerCase()) {
      score += 10;
    }

    return {
      id: staff.id,
      name: staff.name,
      role: staff.role,
      experience: staff.experience,
      skills: staff.skills,
      location: staff.location,
      availability: staff.availability,
      matchScore: Math.min(100, score),
      source: 'internal_demo',
    };
  });

  // Sort by highest match score
  return matchedStaff.sort((a, b) => b.matchScore - a.matchScore);
}
