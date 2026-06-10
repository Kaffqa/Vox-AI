import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Mic, Volume2, History, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/* ────────────────────────────────────────────── */
/*  Mobile nav items                              */
/* ────────────────────────────────────────────── */

const mobileNavItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'STT', path: '/speech-to-text', icon: Mic },
  { label: 'TTS', path: '/text-to-speech', icon: Volume2 },
  { label: 'History', path: '/history', icon: History },
];

/* ────────────────────────────────────────────── */
/*  Component                                     */
/* ────────────────────────────────────────────── */

const MobileNav = () => {
  const { signOut } = useAuth();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        backgroundColor: 'rgba(6, 7, 10, 0.95)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-colors"
            >
              {({ isActive }) => (
                <>
                  {/* Active dot indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="mobile-active-indicator"
                      className="absolute -top-2 w-5 h-[3px] rounded-full"
                      style={{
                        background: 'linear-gradient(to right, #06b6d4, #8b5cf6)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  <Icon
                    className="w-5 h-5 transition-colors"
                    style={{
                      color: isActive ? '#06b6d4' : '#64748b',
                    }}
                  />
                  <span
                    className="text-[10px] font-medium transition-colors"
                    style={{
                      color: isActive ? '#f1f5f9' : '#64748b',
                    }}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Log Out Button for Mobile */}
        <button
          onClick={() => signOut()}
          className="relative flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-colors text-slate-500 hover:text-rose-400"
        >
          <LogOut className="w-5 h-5 transition-colors" />
          <span className="text-[10px] font-medium transition-colors">
            Log Out
          </span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNav;
