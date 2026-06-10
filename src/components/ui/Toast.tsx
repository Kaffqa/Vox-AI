// ============================================
// VoxAI — Toast Notification System
// ============================================

import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle, XCircle, Info } from 'lucide-react';

/**
 * Pre-styled Toaster component — render once at the app root.
 *
 * ```tsx
 * <CustomToaster />
 * ```
 */
export function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{ top: 20, right: 20 }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-glass)',
          borderRadius: '0.75rem',
          padding: '14px 18px',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-body)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          maxWidth: '420px',
        },
        success: {
          iconTheme: {
            primary: 'var(--accent-emerald)',
            secondary: 'var(--bg-secondary)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--accent-rose)',
            secondary: 'var(--bg-secondary)',
          },
          duration: 5000,
        },
      }}
    />
  );
}

// ---- Helper functions ----

/**
 * Show a success toast with an emerald check icon.
 */
export function showSuccess(message: string) {
  toast.success(message, {
    icon: <CheckCircle size={20} className="text-emerald-400 shrink-0" />,
  });
}

/**
 * Show an error toast with a rose X icon.
 */
export function showError(message: string) {
  toast.error(message, {
    icon: <XCircle size={20} className="text-rose-400 shrink-0" />,
  });
}

/**
 * Show an informational toast with a cyan info icon.
 */
export function showInfo(message: string) {
  toast(message, {
    icon: <Info size={20} className="text-cyan-400 shrink-0" />,
  });
}

export { toast };
