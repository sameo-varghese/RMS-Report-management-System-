import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@ucc.edu.in');
      setPassword('admin123');
    } else {
      setEmail('faculty@ucc.edu.in');
      setPassword('faculty123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0F5548] to-[#1F3864] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
        
        {/* Department Emblem Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1A7A6A] text-white mx-auto flex items-center justify-center shadow-xl shadow-[#1A7A6A]/30 mb-4">
            <Building2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1F3864] tracking-tight">Union Christian College</h1>
          <p className="text-xs font-semibold text-[#1A7A6A] mt-1">School of Computer Applications — MCA Dept</p>
          <div className="mt-3 inline-block px-3 py-1 bg-[#E8F5F2] text-[#0F5548] rounded-full text-xs font-bold border border-[#B4E3D8]">
            Activity Report Management System (RMS)
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@ucc.edu.in"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1A7A6A] hover:bg-[#0F5548] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#1A7A6A]/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Demo Login</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('faculty')}
              className="px-3 py-2 bg-slate-100 hover:bg-[#E8F5F2] hover:text-[#0F5548] text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1 border border-slate-200"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Faculty Demo</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1 border border-amber-200"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin (HOD)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
