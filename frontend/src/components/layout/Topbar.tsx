import { Search, Bell, Droplet, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect, useRef } from 'react';
import { notificationService } from '../../services/notification.service';
import { formatDistanceToNow } from 'date-fns';

export function Topbar() {
  const user = useAuthStore((state) => state.user);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifs();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id || n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

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
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-[#A8B0BF] hover:text-white transition-colors hover:scale-105 transform"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF5E5E] text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-[#10151D] border border-white/5 rounded-2xl shadow-xl shadow-black/50 z-50 overflow-hidden">
              <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#151B24]">
                <h3 className="font-bold text-white text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-[#32D5F4] hover:text-white transition">Mark all read</button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[#A8B0BF]">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id || notif.id} 
                      className={`p-4 border-b border-white/5 flex gap-3 hover:bg-white/5 transition ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                    >
                      <div className="flex-1">
                        <p className={`text-sm ${!notif.read ? 'text-white font-semibold' : 'text-[#A8B0BF]'}`}>{notif.title}</p>
                        <p className="text-xs text-[#6F7887] mt-1">{notif.message}</p>
                        <p className="text-[10px] text-[#6F7887] mt-2">{notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Recently'}</p>
                      </div>
                      {!notif.read && (
                        <button onClick={(e) => handleMarkAsRead(notif._id || notif.id, e)} className="text-[#A8B0BF] hover:text-[#7CFF4D] transition p-1 h-fit">
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
