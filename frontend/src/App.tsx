import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TapPage } from './pages/TapPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { EditExpensePage } from './pages/EditExpensePage';
import { BottomNav } from './components/BottomNav';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-black text-white font-sans selection:bg-accent-teal/35">
          <Routes>
            <Route path="/" element={<TapPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/expenses/:id/edit" element={<EditExpensePage />} />
          </Routes>
          <BottomNav />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
