import { Card } from '../../components/ui/Card';
import { Utensils } from 'lucide-react';

export function NutritionPage() {
  return (
    <div className="container-custom py-12 flex justify-center">
      <Card variant="bordered" className="max-w-md text-center p-8 space-y-4">
        <div className="bg-primary-50 text-primary-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
          <Utensils size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Nutrition Planning</h1>
        <p className="text-gray-600 text-sm">
          Nutrition planning will be available in a later phase.
        </p>
      </Card>
    </div>
  );
}
