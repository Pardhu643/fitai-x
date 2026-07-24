import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, Calendar, TrendingUp, Utensils, Settings, LogOut, Target, Droplet, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import { useQueryClient } from '@tanstack/react-query';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const isLandingPage = location.pathname === '/';

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: TrendingUp },
    { to: '/workouts', label: 'Workouts', icon: Dumbbell },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/goals', label: 'Goals', icon: Target },
    { to: '/nutrition', label: 'Nutrition', icon: Utensils },
    { to: '/recovery', label: 'Recovery', icon: Droplet },
    { to: '/workouts/history', label: 'Progress', icon: Sparkles },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate('/signin', { replace: true });
  };

  if (isLandingPage) {
    return null;
  }

  return (
    <aside className="w-72 bg-[#0B1017] border-r border-white/5 flex flex-col justify-between h-full p-6 select-none flex-shrink-0 z-40">
      {/* Top Section */}
      <div className="space-y-8">
        {/* Branding Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 px-2">
          <Dumbbell className="text-[#FFC400]" size={32} />
          <span className="text-2xl font-extrabold text-white tracking-tight">FitAI <span className="text-[#FFC400]">X</span></span>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to || (link.to !== '/dashboard' && location.pathname.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group',
                  isActive
                    ? 'bg-[#FFC400] text-black shadow-md shadow-[#FFC400]/10'
                    : 'text-[#A8B0BF] hover:text-white hover:bg-white/5'
                )}
              >
                <link.icon 
                  size={20} 
                  className={cn(
                     'transition-colors duration-200',
                     isActive ? 'text-black' : 'text-[#A8B0BF] group-hover:text-white'
                  )}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-6">
        {/* Upgrade to Pro Card */}
        <div className="bg-[#151B24] border border-white/5 rounded-2xl p-4 text-center relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#FFC400]/10 rounded-full blur-xl group-hover:bg-[#FFC400]/20 transition-all duration-300"></div>
          <Sparkles className="text-[#FFC400] mx-auto mb-2" size={24} />
          <h4 className="text-sm font-bold text-white mb-1">Go Pro</h4>
          <p className="text-xs text-[#A8B0BF] mb-3 leading-relaxed">Unlock AI Coach, advanced insights and more.</p>
          <button className="w-full bg-[#FFC400] hover:bg-[#FFD43B] text-black text-xs font-bold py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-1 shadow-md shadow-[#FFC400]/10">
            Upgrade Now
            <ChevronRight size={14} />
          </button>
        </div>

        {/* User profile card & Logout */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4 px-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FFC400] text-black font-extrabold flex items-center justify-center text-xs shadow-md shadow-[#FFC400]/10">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-left max-w-[120px] truncate">
              <span className="block text-xs font-bold text-white truncate">{user?.name}</span>
              <span className="block text-[10px] text-[#6F7887] truncate">Level 3 • 1,240 XP</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-[#A8B0BF] hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
            aria-label="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
