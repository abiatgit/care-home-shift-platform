'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dashboardAPI, shiftsAPI } from '@/lib/api';
import { DashboardSummary, Shift } from '@/types';
import StatsCard from '@/components/StatsCard';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import Loading from '@/components/Loading';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [urgentShifts, setUrgentShifts] = useState<Shift[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, urgentRes, upcomingRes] = await Promise.all([
          dashboardAPI.getSummary(),
          shiftsAPI.getUrgent(),
          shiftsAPI.getUpcoming(),
        ]);

        if (summaryRes.success && summaryRes.data) {
          setSummary(summaryRes.data);
        }
        if (urgentRes.success && urgentRes.data) {
          setUrgentShifts(urgentRes.data);
        }
        if (upcomingRes.success && upcomingRes.data) {
          setUpcomingShifts(upcomingRes.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Link
            href="/shifts/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create New Shift
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Shifts"
            value={summary?.totalShifts || 0}
            color="blue"
          />
          <StatsCard
            title="Open Shifts"
            value={summary?.openShifts || 0}
            color="yellow"
          />
          <StatsCard
            title="Urgent Shifts"
            value={summary?.urgentShifts || 0}
            color="red"
          />
          <StatsCard
            title="Filled Shifts"
            value={summary?.filledShifts || 0}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Partially Filled"
            value={summary?.partiallyFilled || 0}
            color="orange"
          />
          <StatsCard
            title="Cancelled"
            value={summary?.cancelledShifts || 0}
            color="gray"
          />
        </div>

        {/* Urgent Shifts */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Urgent Shifts</h2>
            <Link href="/shifts?priority=URGENT" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          {urgentShifts.length === 0 ? (
            <p className="text-gray-500">No urgent shifts at this time</p>
          ) : (
            <div className="space-y-3">
              {urgentShifts.slice(0, 5).map((shift) => (
                <Link
                  key={shift.id}
                  href={`/shifts/${shift.id}`}
                  className="block p-4 border rounded hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{shift.jobTitle}</h3>
                      <p className="text-sm text-gray-600">{shift.careHome?.name}</p>
                      <p className="text-sm text-gray-500">
                        {shift.shiftDate} | {shift.startTime} - {shift.endTime}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <PriorityBadge priority={shift.priority} />
                      <StatusBadge status={shift.status} />
                      <span className="text-sm font-medium">
                        {shift.filledStaff}/{shift.requiredStaff} Staff
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Shifts */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Upcoming Shifts</h2>
            <Link href="/shifts" className="text-blue-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          {upcomingShifts.length === 0 ? (
            <p className="text-gray-500">No upcoming shifts</p>
          ) : (
            <div className="space-y-3">
              {upcomingShifts.slice(0, 10).map((shift) => (
                <Link
                  key={shift.id}
                  href={`/shifts/${shift.id}`}
                  className="block p-4 border rounded hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{shift.jobTitle}</h3>
                      <p className="text-sm text-gray-600">{shift.careHome?.name}</p>
                      <p className="text-sm text-gray-500">
                        {shift.shiftDate} | {shift.startTime} - {shift.endTime}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <PriorityBadge priority={shift.priority} />
                      <StatusBadge status={shift.status} />
                      <span className="text-sm font-medium">
                        {shift.filledStaff}/{shift.requiredStaff} Staff
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
