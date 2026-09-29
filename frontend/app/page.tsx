import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            UK Care Home Shift Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive shift and vacancy management system for care homes across the UK.
            Manage staff requirements, track shift statuses, and streamline workforce allocation.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/shifts"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              View All Shifts
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-bold mb-3">Shift Management</h3>
            <p className="text-gray-600">
              Create, edit, and manage shifts with detailed requirements including skills,
              experience levels, and staff counts.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-bold mb-3">Status Tracking</h3>
            <p className="text-gray-600">
              Real-time status updates from OPEN to PARTIALLY_FILLED to FILLED with automatic
              workflow management.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-bold mb-3">Staff Allocation</h3>
            <p className="text-gray-600">
              Match suitable staff to shifts based on skills, experience, and availability
              requirements.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-sm text-yellow-800">
            <strong>Demo/Learning Project:</strong> This is a synthetic learning platform using
            fictional care homes and staff data for educational purposes only. Not for production use.
          </p>
        </div>
      </div>
    </div>
  );
}
