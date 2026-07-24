import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function NotFoundPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  let homePath = '/';
  if (isAuthenticated) {
    if (user && !user.hasCompletedOnboarding) {
      homePath = '/onboarding';
    } else {
      homePath = '/dashboard';
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          to={homePath}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Home size={20} />
          Go Home
        </Link>
      </div>
    </div>
  );
}
