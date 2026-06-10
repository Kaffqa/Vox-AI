import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AnimatedBackground from '../shared/AnimatedBackground';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

/* ────────────────────────────────────────────── */
/*  Component                                     */
/* ────────────────────────────────────────────── */

const AppLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#06070a' }}>
      {/* Animated background (fixed) */}
      <AnimatedBackground />

      {/* Sidebar – desktop only */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main content area */}
      <main
        className={`relative min-h-screen pb-20 md:pb-0 overflow-x-hidden transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-[88px]' : 'md:ml-[280px]'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 h-full">
          <Outlet />
        </div>
      </main>

      {/* Mobile nav – mobile only */}
      <MobileNav />
    </div>
  );
};

export default AppLayout;
