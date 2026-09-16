import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  FolderArchive, 
  PlusCircle, 
  Sparkles, 
  Users, 
  Award, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, actRes] = await Promise.all([
          client.get('/proposals'),
          client.get('/activities?limit=10')
        ]);
        setProposals(propRes.data);
        setActivities(actRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingCount = proposals.filter(p => p.status === 'Pending').length;
  const approvedCount = proposals.filter(p => p.status === 'Approved').length;
  const totalParticipants = activities.reduce((sum, a) => sum + (a.participants_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1F3864] via-[#0F5548] to-[#1A7A6A] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/20 rounded-full backdrop-blur-md">
            Academic Session 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-emerald-100 mt-2 leading-relaxed">
            School of Computer Applications — Union Christian College, Aluva (Autonomous). Propose events, document department milestones, and generate AI PDF reports seamlessly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/proposals/new"
              className="px-4 py-2.5 bg-white text-[#0F5548] font-bold text-xs rounded-xl hover:bg-emerald-50 transition-all flex items-center space-x-1.5 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Propose New Activity</span>
            </Link>
            <Link
              to="/archive"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 backdrop-blur-md border border-white/20"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Browse Activity Archive</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-[#E8F5F2] text-[#0F5548] rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{proposals.length}</div>
            <div className="text-xs font-semibold text-slate-500">Total Proposals</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{pendingCount}</div>
            <div className="text-xs font-semibold text-slate-500">Pending Review</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{activities.length}</div>
            <div className="text-xs font-semibold text-slate-500">Completed Activities</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{totalParticipants}</div>
            <div className="text-xs font-semibold text-slate-500">Total Participants</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activities Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Departmental Activities</h2>
              <p className="text-xs text-slate-500">Activities documented across all faculty members</p>
            </div>
            <Link to="/archive" className="text-xs font-bold text-[#1A7A6A] hover:underline flex items-center">
              View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No completed activities recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act.id} className="p-4 bg-slate-50 hover:bg-[#E8F5F2]/40 rounded-xl border border-slate-200/80 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-[#E8F5F2] text-[#0F5548] text-[10px] font-bold rounded">
                        {act.category}
                      </span>
                      <span className="text-xs font-medium text-slate-400">{act.activity_date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mt-1">{act.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">📍 {act.venue} • {act.faculty_name}</p>
                  </div>
                  <Link
                    to={`/activities/${act.id}`}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#1A7A6A] text-slate-700 hover:text-[#1A7A6A] rounded-lg text-xs font-bold transition-all flex-shrink-0"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proposals Quick Status Sidebar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Proposal Tracker</h2>
            <Link to="/proposals" className="text-xs font-bold text-[#1A7A6A] hover:underline">
              Manage
            </Link>
          </div>

          {proposals.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No proposals submitted yet.</div>
          ) : (
            <div className="space-y-3">
              {proposals.slice(0, 5).map((p) => (
                <div key={p.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start space-x-3">
                  {p.status === 'Approved' && <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />}
                  {p.status === 'Pending' && <Clock className="w-4 h-4 text-amber-600 mt-0.5" />}
                  {p.status === 'Rejected' && <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{p.title}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-400">{p.proposed_date}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        p.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
