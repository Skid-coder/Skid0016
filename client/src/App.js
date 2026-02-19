import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import PipelinePage from './pages/PipelinePage';
import FollowUpsPage from './pages/FollowUpsPage';
import ImportExportPage from './pages/ImportExportPage';
import TargetsPage from './pages/TargetsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-gray-500">Loading...</div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="pipeline" element={<PipelinePage />} />
            <Route path="followups" element={<FollowUpsPage />} />
            <Route path="import-export" element={<ImportExportPage />} />
            <Route path="targets" element={<TargetsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
