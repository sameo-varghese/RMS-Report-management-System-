import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  UserPlus, 
  UserCheck, 
  UserX, 
  FileText, 
  Sparkles, 
  Download, 
  Calendar,
  Loader2
} from 'lucide-react';

export const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ name: '', email: '', password: '' });
  
  const [annualYear, setAnnualYear] = useState(new Date().getFullYear());
  const [generatingAnnual, setGeneratingAnnual] = useState(false);
  const [annualReport, setAnnualReport] = useState(null);

  const [systemStatus, setSystemStatus] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await client.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const res = await client.get('/system/status');
      setSystemStatus(res.data?.services);
    } catch (err) {
      console.error('Failed to fetch system status:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchSystemStatus();
    }
  }, [isAdmin]);

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      await client.post('/users', { ...newFaculty, role: 'faculty' });
      alert('Faculty account created successfully.');
      setShowAddModal(false);
      setNewFaculty({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const toggleUserStatus = async (userId, currentActive) => {
    try {
      const endpoint = currentActive ? `/users/${userId}/deactivate` : `/users/${userId}/activate`;
      await client.put(endpoint);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Action failed');
    }
  };

  const handleGenerateAnnualReport = async (e) => {
    e.preventDefault();
    setGeneratingAnnual(true);
    setAnnualReport(null);

    try {
      const res = await client.post('/reports/annual', { year: parseInt(annualYear) });
      setAnnualReport(res.data);
      alert(`Annual Department Report for ${annualYear} generated successfully!`);
    } catch (err) {
      alert(err.response?.data?.detail || `Failed to generate annual report for ${annualYear}. Ensure activities exist for this year.`);
    } finally {
      setGeneratingAnnual(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-rose-900">Access Denied</h2>
        <p className="text-xs text-rose-700 mt-1">Admin (HOD) privileges required to access this panel.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-[#1F3864] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex justify-between items-center">
        <div>
          <span className="px-3 py-1 bg-amber-500/30 text-amber-200 text-xs font-bold rounded-full border border-amber-400/30">
            HOD / Admin Operations
          </span>
          <h1 className="text-2xl font-extrabold mt-2 tracking-tight">Admin Control Panel</h1>
          <p className="text-xs text-amber-100 mt-1">Manage departmental faculty accounts, cloud services integration, and generate annual activity summaries</p>
        </div>
      </div>

      {/* Cloud Services Integration Live Status Bar */}
      {systemStatus && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cloud Services & Database Integration Status</span>
            </h2>
            <button
              onClick={fetchSystemStatus}
              className="text-xs text-[#1A7A6A] hover:underline font-semibold"
            >
              Refresh Status
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* MongoDB Card */}
            <div className={`p-4 rounded-2xl border ${
              systemStatus.mongodb?.status === 'connected' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider">MongoDB Atlas</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  systemStatus.mongodb?.status === 'connected' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {systemStatus.mongodb?.status === 'connected' ? 'CONNECTED (Atlas)' : 'MOCK MODE'}
                </span>
              </div>
              <p className="text-xs font-semibold">{systemStatus.mongodb?.mode}</p>
              <p className="text-[11px] opacity-80 mt-1">{systemStatus.mongodb?.message}</p>
            </div>

            {/* Cloudinary Card */}
            <div className={`p-4 rounded-2xl border ${
              systemStatus.cloudinary?.status === 'configured' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider">Cloudinary Media</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  systemStatus.cloudinary?.status === 'configured' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {systemStatus.cloudinary?.status === 'configured' ? 'READY' : 'MOCK FALLBACK'}
                </span>
              </div>
              <p className="text-xs font-semibold">Cloud: {systemStatus.cloudinary?.cloud_name}</p>
              <p className="text-[11px] opacity-80 mt-1">{systemStatus.cloudinary?.message}</p>
            </div>

            {/* Gemini AI Card */}
            <div className={`p-4 rounded-2xl border ${
              systemStatus.gemini?.status === 'configured' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider">Google Gemini AI</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  systemStatus.gemini?.status === 'configured' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {systemStatus.gemini?.status === 'configured' ? 'ACTIVE' : 'BUILT-IN ENGINE'}
                </span>
              </div>
              <p className="text-xs font-semibold">{systemStatus.gemini?.model}</p>
              <p className="text-[11px] opacity-80 mt-1">{systemStatus.gemini?.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Faculty Accounts Management */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Faculty Account Directory</h2>
              <p className="text-xs text-slate-500">Manage active/deactivated faculty credentials</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-[#1A7A6A] hover:bg-[#0F5548] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Faculty</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading faculty roster...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-800">{u.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>

                  {u.role !== 'admin' && (
                    <button
                      onClick={() => toggleUserStatus(u.id, u.is_active)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 ${
                        u.is_active
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      <span>{u.is_active ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Annual Department Summary Generator */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 text-[#1F3864]">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold">Annual Report Generator</h2>
          </div>

          <form onSubmit={handleGenerateAnnualReport} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
              <input
                type="number"
                value={annualYear}
                onChange={(e) => setAnnualYear(e.target.value)}
                placeholder="2026"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
              />
            </div>

            <button
              type="submit"
              disabled={generatingAnnual}
              className="w-full py-2.5 bg-[#1F3864] hover:bg-[#152646] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              {generatingAnnual ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Annual Summary...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Generate Annual PDF Summary</span>
                </>
              )}
            </button>
          </form>

          {annualReport && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2">
              <div className="font-bold text-emerald-900">Annual Summary Ready!</div>
              <a
                href={annualReport.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg inline-flex items-center space-x-1 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Annual PDF</span>
              </a>
            </div>
          )}
        </div>

      </div>

      {/* Add Faculty Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#1F3864]">Add New Faculty Member</h3>
            
            <form onSubmit={handleAddFaculty} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newFaculty.name}
                  onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                  placeholder="Prof. John Doe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={newFaculty.email}
                  onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                  placeholder="johndoe@ucc.edu.in"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newFaculty.password}
                  onChange={(e) => setNewFaculty({ ...newFaculty, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 text-xs font-bold hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A7A6A] hover:bg-[#0F5548] text-white text-xs font-bold rounded-lg"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

