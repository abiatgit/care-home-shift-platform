import { ShiftStatus } from '@/types';

interface StatusBadgeProps {
  status: ShiftStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    OPEN: 'bg-blue-100 text-blue-800',
    PARTIALLY_FILLED: 'bg-yellow-100 text-yellow-800',
    FILLED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
