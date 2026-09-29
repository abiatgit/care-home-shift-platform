'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { shiftsAPI } from '@/lib/api';
import { Shift, Staff } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import Loading from '@/components/Loading';

export default function ShiftDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shiftId = parseInt(params.id as string);

  const [shift, setShift] = useState<Shift | null>(null);
  const [suitableStaff, setSuitableStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStaffSelection, setShowStaffSelection] = useState(false);

  useEffect(() => {
    fetchShiftDetails();
    fetchSuitableStaff();
  }, [shiftId]);

  async function fetchShiftDetails() {
    try {
      const response = await shiftsAPI.getById(shiftId);
      if (response.success && response.data) {
        setShift(response.data);
      }
    } catch (error) {
      console.error('Error fetching shift details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSuitableStaff() {
    try {
      const response = await shiftsAPI.getSuitableStaff(shiftId);
      if (response.success && response.data) {
        setSuitableStaff(response.data);
      }
    } catch (error) {
      console.error('Error fetching suitable staff:', error);
    }
  }

  async function handleAssignStaff(staffId: number) {
    try {
      const response = await shiftsAPI.assignStaff(shiftId, staffId);
      if (response.success) {
        await fetchShiftDetails();
        setShowStaffSelection(false);
      }
    } catch (error) {
      console.error('Error assigning staff:', error);
      alert('Failed to assign staff');
    }
  }

  async function handleUnassignStaff(staffId: number) {
    if (!confirm('Are you sure you want to unassign this staff member?')) return;

    try {
      const response = await shiftsAPI.unassignStaff(shiftId, staffId);
      if (response.success) {
        await fetchShiftDetails();
      }
    } catch (error) {
      console.error('Error unassigning staff:', error);
      alert('Failed to unassign staff');
    }
  }

  async function handleCancelShift() {
    if (!confirm('Are you sure you want to cancel this shift?')) return;

    try {
      const response = await shiftsAPI.updateStatus(shiftId, 'CANCELLED');
      if (response.success) {
        await fetchShiftDetails();
      }
    } catch (error) {
      console.error('Error cancelling shift:', error);
      alert('Failed to cancel shift');
    }
  }

  if (loading) return <Loading />;
  if (!shift) return <div className="p-8 text-center">Shift not found</div>;

  const assignedStaffIds = shift.assignments?.map(a => a.staffId) || [];
  const availableStaff = suitableStaff.filter(s => !assignedStaffIds.includes(s.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/shifts" className="text-blue-600 hover:underline mb-2 block">
              ← Back to Shifts
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Shift Details</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancelShift}
              disabled={shift.status === 'CANCELLED'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Cancel Shift
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{shift.jobTitle}</h2>
                  <p className="text-gray-600">{shift.careHome?.name}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <PriorityBadge priority={shift.priority} />
                  <StatusBadge status={shift.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{shift.shiftDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{shift.startTime} - {shift.endTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{shift.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{shift.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Care Type</p>
                  <p className="font-medium">{shift.careType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pay Rate</p>
                  <p className="font-medium">{shift.payRate}</p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold mb-4">Requirements</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {shift.requiredSkills.split(',').map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience Required</p>
                  <p className="font-medium">{shift.experienceRequired}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Required Staff</p>
                  <p className="font-medium text-lg">{shift.filledStaff} / {shift.requiredStaff}</p>
                </div>
                {shift.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium">{shift.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Staff */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Assigned Staff ({shift.assignments?.length || 0})</h3>
                {shift.status !== 'CANCELLED' && shift.status !== 'FILLED' && (
                  <button
                    onClick={() => setShowStaffSelection(!showStaffSelection)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    {showStaffSelection ? 'Hide Staff Selection' : 'Assign Staff'}
                  </button>
                )}
              </div>

              {shift.assignments && shift.assignments.length > 0 ? (
                <div className="space-y-3">
                  {shift.assignments.map((assignment) => (
                    <div key={assignment.id} className="flex justify-between items-center p-4 border rounded">
                      <div>
                        <p className="font-medium">{assignment.staff.name}</p>
                        <p className="text-sm text-gray-600">{assignment.staff.role}</p>
                        <p className="text-sm text-gray-500">Experience: {assignment.staff.experience}</p>
                      </div>
                      {shift.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUnassignStaff(assignment.staffId)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No staff assigned yet</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Care Home Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold mb-4">Care Home</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{shift.careHome?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm">{shift.careHome?.address}</p>
                  <p className="text-sm">{shift.careHome?.town}, {shift.careHome?.postcode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manager</p>
                  <p className="text-sm">{shift.careHome?.managerName}</p>
                  <p className="text-sm text-blue-600">{shift.careHome?.managerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm">{shift.careHome?.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Selection Modal */}
        {showStaffSelection && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold mb-4">Available Staff for Selection</h3>
            {availableStaff.length === 0 ? (
              <p className="text-gray-500">No available staff to assign</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableStaff.map((staff) => (
                  <div key={staff.id} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">{staff.name}</p>
                        <p className="text-sm text-gray-600">{staff.role}</p>
                      </div>
                      <button
                        onClick={() => handleAssignStaff(staff.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Assign
                      </button>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-500">Experience:</span> {staff.experience}</p>
                      <p><span className="text-gray-500">Location:</span> {staff.location}</p>
                      <p><span className="text-gray-500">Skills:</span></p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {staff.skills.split(',').map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
