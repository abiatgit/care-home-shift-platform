// ==============================================================================
// API Client for Care Home Shift Platform
// ==============================================================================

import {
  CareHome,
  Shift,
  Staff,
  DashboardSummary,
  ApiResponse,
  CreateShiftInput
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

// ==============================================================================
// Generic Fetch Wrapper
// ==============================================================================
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ==============================================================================
// Care Homes API
// ==============================================================================
export const careHomesAPI = {
  getAll: () => fetchAPI<CareHome[]>('/care-homes'),
  getById: (id: number) => fetchAPI<CareHome>(`/care-homes/${id}`),
};

// ==============================================================================
// Shifts API
// ==============================================================================
export const shiftsAPI = {
  getAll: (params?: {
    status?: string;
    priority?: string;
    jobTitle?: string;
    location?: string;
    careHomeId?: number;
    date?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return fetchAPI<Shift[]>(`/shifts${query ? `?${query}` : ''}`);
  },

  getById: (id: number) => fetchAPI<Shift>(`/shifts/${id}`),

  getOpen: () => fetchAPI<Shift[]>('/shifts/open'),

  getUrgent: () => fetchAPI<Shift[]>('/shifts/urgent'),

  getUpcoming: () => fetchAPI<Shift[]>('/shifts/upcoming'),

  create: (data: CreateShiftInput) =>
    fetchAPI<Shift>('/shifts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CreateShiftInput>) =>
    fetchAPI<Shift>(`/shifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number, status: string) =>
    fetchAPI<Shift>(`/shifts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: number) =>
    fetchAPI<void>(`/shifts/${id}`, {
      method: 'DELETE',
    }),

  assignStaff: (shiftId: number, staffId: number) =>
    fetchAPI<Shift>(`/shifts/${shiftId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ staffId }),
    }),

  unassignStaff: (shiftId: number, staffId: number) =>
    fetchAPI<Shift>(`/shifts/${shiftId}/unassign/${staffId}`, {
      method: 'DELETE',
    }),

  getSuitableStaff: (shiftId: number) =>
    fetchAPI<Staff[]>(`/shifts/${shiftId}/suitable-staff`),
};

// ==============================================================================
// Dashboard API
// ==============================================================================
export const dashboardAPI = {
  getSummary: () => fetchAPI<DashboardSummary>('/dashboard/summary'),
};
