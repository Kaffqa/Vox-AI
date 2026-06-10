import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  LayoutDashboard,
  Volume2,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NAV_ITEMS } from '../../constants';

/* ────────────────────────────────────────────── */
/*  Icon map                                      */
/* ────────────────────────────────────────────── */

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  LayoutDashboard,
  Mic,
  Volume2,
  History,
};

/* ────────────────────────────────────────────── */
/*  Animation variants                            */
/* ────────────────────────────────────────────── */

const sidebarVariants: any = {
  hidden: { x: -40, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const itemVariant: any = {
  hidden: { x: -16, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { duration: 0.3 } },
};

/* ────────────────────────────────────────────── */
/*  Component                                     */
/* ────────────────────────────────────────────── */

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const { user, signOut } = useAuth();

  const initials =
    user?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?';

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="show"
      className={`hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col transition-all duration-300 ${
        isCollapsed ? 'w-[88px]' : 'w-[280px]'
      }`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-9 z-50 flex items-center justify-center w-7 h-7 rounded-full bg-[#06070a] border hover:bg-white/5 transition-colors"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* ── Logo ───────────────────────────────── */}
      <motion.div
        variants={itemVariant}
        className={`flex items-center gap-3 px-6 py-7 border-b transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : ''}`}
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
          style={{
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          }}
        >
          <Mic className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-xl font-bold bg-clip-text text-transparent overflow-hidden whitespace-nowrap"
              style={{
                backgroundImage: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              }}
            >
              VoxAI
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Navigation ─────────────────────────── */}
      <nav className={`flex-1 flex flex-col gap-1 py-4 overflow-y-auto ${isCollapsed ? 'px-3' : 'px-3'}`}>
        {NAV_ITEMS.map((navItem) => {
          const Icon = iconMap[navItem.icon] ?? LayoutDashboard;

          return (
            <motion.div key={navItem.path} variants={itemVariant}>
              <NavLink
                to={navItem.path}
                className={`group relative flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isCollapsed ? 'px-0 justify-center' : 'px-4'
                }`}
                style={({ isActive }) => ({
                  color: isActive ? '#f1f5f9' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                })}
                title={isCollapsed ? navItem.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className={`absolute top-2 bottom-2 w-[3px] rounded-full ${
                          isCollapsed ? 'left-0' : 'left-0'
                        }`}
                        style={{
                          background: 'linear-gradient(to bottom, #06b6d4, #8b5cf6)',
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}

                    <Icon
                      className="w-5 h-5 flex-shrink-0 transition-colors"
                      style={{
                        color: isActive ? '#06b6d4' : '#64748b',
                      }}
                    />
                    {!isCollapsed && <span className="whitespace-nowrap">{navItem.label}</span>}
                  </>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* ── User section ───────────────────────── */}
      <motion.div
        variants={itemVariant}
        className="border-t px-4 py-4 flex flex-col items-center"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className={`flex items-center gap-3 mb-3 w-full ${isCollapsed ? 'justify-center' : ''}`}>
          {/* Avatar */}
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-9 h-9 rounded-full object-cover shrink-0"
              style={{ border: '2px solid rgba(255,255,255,0.1)' }}
            />
          ) : (
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold shrink-0"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                color: '#fff',
              }}
            >
              {initials}
            </div>
          )}

          {!isCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p
                className="text-sm font-medium truncate"
                style={{ color: '#f1f5f9' }}
              >
                {user?.full_name || 'User'}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: '#64748b' }}
              >
                {user?.email || ''}
              </p>
            </div>
          )}
        </div>

        {/* Sign Out */}
        <motion.button
          type="button"
          onClick={() => signOut()}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
            isCollapsed ? 'w-10 h-10 px-0' : 'w-full px-4'
          }`}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            color: '#94a3b8',
          }}
          whileHover={{
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            borderColor: 'rgba(244, 63, 94, 0.2)',
            color: '#fb7185',
          }}
          whileTap={{ scale: 0.97 }}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
        </motion.button>
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;
