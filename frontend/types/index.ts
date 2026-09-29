// ==============================================================================
// TypeScript Type Definitions
// ==============================================================================

export interface CareHome {
  id: number;
  name: string;
  address: string;
  town: string;
  postcode: string;
  county: string;
  numberOfBeds: number;
  managerName: string;
  managerEmail: string;
  phone: string;
  careType: string;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: number;
  name: string;
  role: string;
  experience: string;
  skills: string;
  email: string;
  phone: string;
  location: string;
  availability: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftAssignment {
  id: number;
  shiftId: number;
  staffId: number;
  staff: Staff;
  assignedAt: string;
  status: string;
}

export interface Shift {
  id: number;
  careHomeId: number;
  careHome?: CareHome;
  jobTitle: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  requiredStaff: number;
  filledStaff: number;
  location: string;
  department: string;
  careType: string;
  requiredSkills: string;
  experienceRequired: string;
  payRate: string;
  notes?: string;
  status: ShiftStatus;
  priority: ShiftPriority;
  createdAt: string;
  updatedAt: string;
  assignments?: ShiftAssignment[];
}

export type ShiftStatus = 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED' | 'EXPIRED';
export type ShiftPriority = 'NORMAL' | 'HIGH' | 'URGENT';

export interface DashboardSummary {
  totalShifts: number;
  openShifts: number;
  urgentShifts: number;
  partiallyFilled: number;
  filledShifts: number;
  cancelledShifts: number;
  shiftsByStatus?: Record<string, number>;
  shiftsByPriority?: Record<string, number>;
  shiftsByJobTitle?: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateShiftInput {
  careHomeId: number;
  jobTitle: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  requiredStaff: number;
  location: string;
  department: string;
  careType: string;
  requiredSkills: string;
  experienceRequired: string;
  payRate: string;
  notes?: string;
  priority: ShiftPriority;
}
