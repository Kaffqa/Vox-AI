import { Outlet } from 'react-router-dom';
import AnimatedBackground from '../shared/AnimatedBackground';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

/* ────────────────────────────────────────────── */
/*  Component                                     */
/* ────────────────────────────────────────────── */

const AppLayout = () => {

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#06070a' }}>
      {/* Animated background (fixed) */}
      <AnimatedBackground />

      {/* Sidebar – desktop only */}
      <Sidebar />

      {/* Main content area */}
      <main
        className="relative min-h-screen pb-20 md:pb-0 md:ml-[280px]"
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
