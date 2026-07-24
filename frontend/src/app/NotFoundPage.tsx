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
    <div className="min-h-screen flex items-center justify-center bg-[#080B10]">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-extrabold text-[#FFC400] tracking-tight">404</h1>
        <div>
          <p className="text-xl font-bold text-white">Page Not Found</p>
          <p className="text-xs text-[#A8B0BF] mt-1 leading-relaxed max-w-xs mx-auto">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to={homePath}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFC400] hover:bg-[#FFD43B] text-black font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-[#FFC400]/10 transition-all"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
