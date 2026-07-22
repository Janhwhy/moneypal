import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TapPage } from './pages/TapPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { EditExpensePage } from './pages/EditExpensePage';
import { LoginPage } from './pages/LoginPage';
import { BottomNav } from './components/BottomNav';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const { token } = useAuth();
  const location = useLocation();
  const showNav = Boolean(token) && location.pathname !== '/login';

  return (
    <div className="w-full max-w-[430px] h-[100dvh] md:h-[880px] md:my-auto md:rounded-[48px] md:shadow-[0_20px_60px_rgba(140,50,82,0.15)] md:border-[8px] md:border-[#FFFFFF] relative flex flex-col overflow-hidden bg-background">
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative bg-background">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected */}
          <Route path="/" element={<ProtectedRoute><TapPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/expenses/:id/edit" element={<ProtectedRoute><EditExpensePage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* BottomNav shown when authenticated */}
      {showNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          {/* Desktop outer canvas */}
          <div className="min-h-screen bg-[#F4F0EB] text-on-background font-sans selection:bg-[#E47A9D]/30 flex justify-center items-center">
            <AppContent />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}


export default App;
