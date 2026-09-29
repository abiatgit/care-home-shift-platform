// ==============================================================================
// STAFF MATCHING SERVICE WITH EXTERNAL API INTEGRATION
// ==============================================================================
// This service finds available and suitable care staff for a given shift.
//
// NOW INTEGRATED with the external "UK NHS & Care Workforce API"
// Calls the Keris Nurses Data UK backend to fetch real staff availability
// Falls back to internal demo staff if external API is unavailable
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

/**
 * Calls the external Keris API to fetch staff members
 */
async function fetchStaffFromExternalAPI(shift: any): Promise<SuitableStaffResult[]> {
  const KERIS_API_URL = process.env.KERIS_API_URL || 'http://localhost:5001/api';
  const SERVICE_API_KEY = process.env.SERVICE_API_KEY;

  if (!SERVICE_API_KEY) {
    throw new Error('SERVICE_API_KEY not configured');
  }

  // Build query parameters based on shift requirements
  const params = new URLSearchParams({
    role: shift.jobTitle,
    location: shift.location,
    availability: 'Available',
    limit: '50',
  });

  // Add required skills as comma-separated string
  const shiftSkills = shift.requiredSkills
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean)
    .join(',');

  if (shiftSkills) {
    params.append('skills', shiftSkills);
  }

  const url = `${KERIS_API_URL}/external/staff?${params.toString()}`;

  console.log(`[Staff Matching] Calling external API: ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-Key': SERVICE_API_KEY,
      'X-Service-Name': 'care-home-shift-platform',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`External API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success || !data.data) {
    throw new Error('Invalid response from external API');
  }

  // Transform external API data to our format
  const shiftSkillsList = shift.requiredSkills
    .split(',')
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean);

  return data.data.map((worker: any) => {
    let score = 50; // Base score

    // Role exact match
    if (worker.jobTitle.toLowerCase() === shift.jobTitle.toLowerCase()) {
      score += 30;
    } else if (
      worker.jobTitle.toLowerCase().includes('nurse') &&
      shift.jobTitle.toLowerCase().includes('nurse')
    ) {
      score += 25;
    } else if (
      worker.jobTitle.toLowerCase().includes('assistant') &&
      shift.jobTitle.toLowerCase().includes('assistant')
    ) {
      score += 20;
    }

    // Skill overlap
    const workerSkillNames = worker.skills.map((s: any) => s.name.toLowerCase());
    let matchedSkillCount = 0;
    shiftSkillsList.forEach((skill: string) => {
      if (workerSkillNames.includes(skill)) {
        matchedSkillCount++;
      }
    });

    if (shiftSkillsList.length > 0) {
      const skillBonus = Math.round((matchedSkillCount / shiftSkillsList.length) * 20);
      score += skillBonus;
    }

    // Location match
    if (worker.location.toLowerCase() === shift.location.toLowerCase()) {
      score += 10;
    }

    return {
      id: worker.id,
      name: worker.fullName,
      role: worker.jobTitle,
      experience: `${worker.yearsOfExperience} years`,
      skills: worker.skills.map((s: any) => s.name).join(', '),
      location: worker.location,
      availability: worker.availability,
      matchScore: Math.min(100, score),
      source: 'external_staff_bank_api',
    };
  });
}

/**
 * Fallback: Query internal demo staff if external API is unavailable
 */
async function fetchStaffFromInternalDemo(shift: any, assignedStaffIds: number[]): Promise<SuitableStaffResult[]> {
  console.log('[Staff Matching] Using fallback internal demo staff');

  const candidates = await prisma.staff.findMany({
    where: {
      id: { notIn: assignedStaffIds },
    },
  });

  const shiftSkills = shift.requiredSkills
    .split(',')
    .map((s: string) => s.trim().toLowerCase())
    .filter(Boolean);

  return candidates.map((staff) => {
    let score = 50;

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
}

/**
 * Main function: Find suitable staff for a shift
 * Tries external API first, falls back to internal demo if unavailable
 */
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

  const assignedStaffIds = shift.assignments.map((a) => a.staffId);

  // 2. Try to fetch from external API
  let matchedStaff: SuitableStaffResult[];

  try {
    matchedStaff = await fetchStaffFromExternalAPI(shift);
    console.log(`[Staff Matching] Successfully fetched ${matchedStaff.length} staff from external API`);
  } catch (error) {
    console.error('[Staff Matching] External API failed, using internal fallback:', error);
    matchedStaff = await fetchStaffFromInternalDemo(shift, assignedStaffIds);
  }

  // 3. Sort by highest match score
  return matchedStaff.sort((a, b) => b.matchScore - a.matchScore);
}
