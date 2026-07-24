import { Card } from '../../components/ui/Card';
import { Calendar } from 'lucide-react';

export function CalendarPage() {
  return (
    <div className="container-custom py-12 flex justify-center">
      <Card variant="bordered" className="max-w-md text-center p-8 space-y-4">
        <div className="bg-[#1B1B1B] text-[#FFC400] p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
          <Calendar size={24} />
        </div>
        <h1 className="text-2xl font-bold text-white">Workout Calendar</h1>
        <p className="text-gray-400 text-sm">
          A premium dynamic calendar interface is coming in a future phase.
        </p>
      </Card>
    </div>
  );
}
