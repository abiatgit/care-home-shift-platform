import { ShiftPriority } from '@/types';

interface PriorityBadgeProps {
  priority: ShiftPriority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const styles = {
    NORMAL: 'bg-gray-100 text-gray-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${styles[priority]}`}>
      {priority}
    </span>
  );
}
