import { Search, Bell, Droplet } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function Topbar() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-20 border-b border-white/5 bg-[#080B10] px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6F7887]">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full bg-[#171D26] border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-[#F8FAFC] placeholder-[#6F7887] focus:outline-none focus:border-[#FFC400] transition-colors"
        />
        <kbd className="absolute right-3 top-2.5 bg-[#10151D] text-xs text-[#6F7887] px-1.5 py-0.5 rounded border border-white/5">
          /
        </kbd>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-[#A8B0BF] hover:text-white transition-colors hover:scale-105 transform">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF5E5E] text-[10px] font-bold text-white rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Recovery Link */}
        <button className="p-2 text-[#A8B0BF] hover:text-white transition-colors hover:scale-105 transform flex items-center gap-1.5 bg-[#171D26] border border-white/5 rounded-xl px-3 py-1.5">
          <Droplet size={18} className="text-[#7CFF4D]" />
          <span className="text-xs font-semibold text-gray-300">Recovery</span>
        </button>

        {/* Profile Avatar / Badge */}
        <div className="flex items-center gap-3 border-l border-white/5 pl-6">
          <div className="w-10 h-10 rounded-full bg-[#FFC400] text-black font-bold flex items-center justify-center text-sm shadow-md shadow-[#FFC400]/10">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-sm font-bold text-white">{user?.name}</span>
            <span className="block text-[10px] font-bold text-[#FFC400] tracking-wider uppercase">
              Pro Member
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
