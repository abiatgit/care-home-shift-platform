'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { careHomesAPI, shiftsAPI } from '@/lib/api';
import { CareHome, ShiftPriority } from '@/types';
import Loading from '@/components/Loading';

const JOB_TITLES = [
  'Care Assistant',
  'Senior Care Assistant',
  'Healthcare Assistant',
  'Support Worker',
  'Registered Nurse',
  'Senior Healthcare Assistant',
  'Night Care Assistant',
];

const SKILLS = [
  'Personal Care',
  'Dementia Care',
  'Manual Handling',
  'Medication Support',
  'Palliative Care',
  'First Aid',
  'Moving & Handling',
  'Catheter Care',
  'PEG Feeding',
  'NEWS2',
  'Vital Signs',
  'Wound Care',
  'Basic Life Support',
  'Patient Observation',
  'Learning Disability Support',
  'Mental Health Support',
  'Hoist Operation',
  'Infection Control',
  'Safeguarding',
  'Care Planning',
];

const EXPERIENCE_LEVELS = [
  'No experience',
  '1+ years',
  '2+ years',
  '3+ years',
  '5+ years',
  '10+ years',
];

export default function CreateShiftPage() {
  const router = useRouter();
  const [careHomes, setCareHomes] = useState<CareHome[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    careHomeId: '',
    jobTitle: '',
    shiftDate: '',
    startTime: '',
    endTime: '',
    requiredStaff: '1',
    location: '',
    department: '',
    careType: '',
    experienceRequired: 'No experience',
    payRate: '£13.50/hr',
    notes: '',
    priority: 'NORMAL' as ShiftPriority,
  });

  useEffect(() => {
    async function fetchCareHomes() {
      try {
        const response = await careHomesAPI.getAll();
        if (response.success && response.data) {
          setCareHomes(response.data);
        }
      } catch (error) {
        console.error('Error fetching care homes:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCareHomes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fill location and care type when care home is selected
    if (name === 'careHomeId') {
      const selectedHome = careHomes.find(ch => ch.id === parseInt(value));
      if (selectedHome) {
        setFormData(prev => ({
          ...prev,
          careHomeId: value,
          location: selectedHome.town,
          careType: selectedHome.careType,
        }));
      }
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.careHomeId || !formData.jobTitle || !formData.shiftDate) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const shiftData = {
        careHomeId: parseInt(formData.careHomeId),
        jobTitle: formData.jobTitle,
        shiftDate: formData.shiftDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        requiredStaff: parseInt(formData.requiredStaff),
        location: formData.location,
        department: formData.department || 'General Care Unit',
        careType: formData.careType,
        requiredSkills: selectedSkills.length > 0 ? selectedSkills.join(', ') : 'Personal Care',
        experienceRequired: formData.experienceRequired,
        payRate: formData.payRate,
        notes: formData.notes,
        priority: formData.priority,
      };

      const response = await shiftsAPI.create(shiftData);

      if (response.success && response.data) {
        router.push(`/shifts/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error creating shift:', error);
      alert('Failed to create shift. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/shifts" className="text-blue-600 hover:underline mb-2 block">
            ← Back to Shifts
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Shift</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
          {/* Care Home Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Care Home <span className="text-red-500">*</span>
            </label>
            <select
              name="careHomeId"
              value={formData.careHomeId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a care home</option>
              {careHomes.map(home => (
                <option key={home.id} value={home.id}>
                  {home.name} - {home.town}
                </option>
              ))}
            </select>
          </div>

          {/* Job Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <select
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select job title</option>
              {JOB_TITLES.map(title => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="shiftDate"
                value={formData.shiftDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Staff and Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Staff <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="requiredStaff"
                value={formData.requiredStaff}
                onChange={handleInputChange}
                min="1"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Memory Wing"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Care Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Care Type
            </label>
            <input
              type="text"
              name="careType"
              value={formData.careType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Required Skills */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 border rounded-lg">
              {SKILLS.map(skill => (
                <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{skill}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Selected: {selectedSkills.length > 0 ? selectedSkills.join(', ') : 'None'}
            </p>
          </div>

          {/* Experience and Pay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Required
              </label>
              <select
                name="experienceRequired"
                value={formData.experienceRequired}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {EXPERIENCE_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay Rate
              </label>
              <input
                type="text"
                name="payRate"
                value={formData.payRate}
                onChange={handleInputChange}
                placeholder="£13.50/hr"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Additional information about this shift..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Shift...' : 'Create Shift'}
            </button>
            <Link
              href="/shifts"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
