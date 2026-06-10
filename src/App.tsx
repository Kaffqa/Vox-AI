import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/auth/AuthGuard';
import AppLayout from './components/layout/AppLayout';

const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SpeechToText = lazy(() => import('./pages/SpeechToText'));
const TextToSpeech = lazy(() => import('./pages/TextToSpeech'));
const History = lazy(() => import('./pages/History'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="min-h-screen bg-[#06070a]" />}>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Landing />} />

            {/* Protected Routes */}
            <Route element={<AuthGuard />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/speech-to-text" element={<SpeechToText />} />
                <Route path="/text-to-speech" element={<TextToSpeech />} />
                <Route path="/history" element={<History />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        
        {/* Global Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f1117',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
