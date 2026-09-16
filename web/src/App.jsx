import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProposalForm } from './pages/ProposalForm';
import { ProposalList } from './pages/ProposalList';
import { ActivityForm } from './pages/ActivityForm';
import { ActivityDetail } from './pages/ActivityDetail';
import { Archive } from './pages/Archive';
import { ReportView } from './pages/ReportView';
import { AdminPanel } from './pages/AdminPanel';

const ProtectedLayout = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/proposals" element={<ProposalList />} />
          <Route path="/proposals/new" element={<ProposalForm />} />
          <Route path="/activities/new" element={<ActivityForm />} />
          <Route path="/activities/:id" element={<ActivityDetail />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/reports/view/:reportId" element={<ReportView />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        School of Computer Applications — Union Christian College, Aluva (Autonomous) • MCA CP 307 Mini Project
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
