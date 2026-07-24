import { Outlet } from 'react-router-dom';
import { Navigation } from '../../components/layout/Navigation';
import { Topbar } from '../../components/layout/Topbar';

export function Layout() {
  return (
    <div className="flex h-screen bg-[#080B10] text-[#F8FAFC] overflow-hidden">
      {/* Left Sidebar */}
      <Navigation />

      {/* Right Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[#080B10] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
