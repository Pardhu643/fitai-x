import { Outlet } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

export function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="text-primary-600" size={28} />
          <span className="text-xl font-bold text-gray-900">FitAI X</span>
        </div>
        <div className="text-sm font-semibold text-gray-500">
          Onboarding
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}
