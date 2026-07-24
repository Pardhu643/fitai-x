import { LucideIcon } from 'lucide-react';
import { Card } from './Card';

interface StatisticsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  iconColor?: string;
  bgColor?: string;
}

export function StatisticsCard({
  icon: Icon,
  label,
  value,
  change,
  iconColor = 'text-primary-600',
  bgColor = 'bg-primary-100',
}: StatisticsCardProps) {
  return (
    <Card variant="bordered">
      <div className="flex items-center gap-4">
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={iconColor} size={24} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
