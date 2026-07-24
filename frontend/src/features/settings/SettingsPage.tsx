import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Settings, User } from 'lucide-react';

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="container-custom py-12 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Settings size={28} />
        Account Settings
      </h1>

      <Card variant="elevated" className="space-y-4">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="bg-primary-100 text-primary-700 p-2.5 rounded-full">
            <User size={24} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.role} Profile</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Email Address</span>
            <span className="text-gray-900 font-semibold">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Onboarding Status</span>
            <span className="text-green-600 font-semibold">Completed</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
