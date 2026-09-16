import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { SocialShareModal } from '../components/SocialShareModal';
import { 
  Sparkles, 
  Share2, 
  FileText, 
  Calendar, 
  MapPin, 
  Users, 
  User, 
  ArrowLeft, 
  ImageIcon, 
  Film,
  Download,
  Loader2,
  Trash2
} from 'lucide-react';

export const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [actRes, mediaRes] = await Promise.all([
        client.get(`/activities/${id}`),
        client.get(`/media/activity/${id}`)
      ]);
      setActivity(actRes.data);
      setMediaItems(mediaRes.data);

      try {
        const repRes = await client.get(`/reports/${id}`);
        setReport(repRes.data);
      } catch (err) {
        setReport(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await client.post('/reports/generate', { activity_id: id });
      setReport(res.data);
      alert('AI PDF Report generated successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Report generation failed');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDeleteActivity = async () => {
    if (!window.confirm("Delete this activity and all linked Cloudinary media and PDF reports?")) return;
    try {
      await client.delete(`/activities/${id}`);
      navigate('/archive');
    } catch (err) {
      alert(err.response?.data?.detail || 'Deletion failed');
    }
  };

  if (loading) return <div className="text-center py-12 text-xs text-slate-400">Loading activity details...</div>;
  if (!activity) return <div className="text-center py-12 text-xs text-slate-400">Activity record not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      <button
        onClick={() => navigate('/archive')}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Archive</span>
      </button>

      {/* Main Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4 relative">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-[#E8F5F2] text-[#0F5548] text-xs font-bold rounded-lg border border-[#B4E3D8]">
                {activity.category}
              </span>
              <span className="text-xs font-semibold text-slate-400">📅 {activity.activity_date}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1F3864] mt-2 leading-tight">{activity.title}</h1>
            <p className="text-xs text-slate-500 mt-1">📍 {activity.venue} • Faculty Coordinator: <strong>{activity.faculty_name}</strong></p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShareModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Social Share</span>
            </button>

            <button
              onClick={handleDeleteActivity}
              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
              title="Delete Activity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Report Generation Action Bar */}
        <div className="p-4 bg-gradient-to-r from-[#1A7A6A]/10 via-[#0F5548]/10 to-[#1F3864]/10 rounded-2xl border border-[#1A7A6A]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#1A7A6A] text-white rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1F3864]">AI Report Engine (Gemini 1.5 Flash)</h3>
              <p className="text-[11px] text-slate-500">Generate formal academic report with embedded photos & server-side WeasyPrint PDF compile</p>
            </div>
          </div>

          {report ? (
            <Link
              to={`/reports/view/${report.id}`}
              className="px-4 py-2 bg-[#1A7A6A] hover:bg-[#0F5548] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>View & Download AI PDF Report</span>
            </Link>
          ) : (
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="px-4 py-2 bg-[#1A7A6A] hover:bg-[#0F5548] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center space-x-1.5"
            >
              {generatingReport ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing AI Report...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Report</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Activity Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Description & Outcomes */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#1F3864] uppercase tracking-wider">Event Overview & Proceedings</h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{activity.description}</p>
          </div>

          {activity.outcomes && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#1A7A6A] uppercase tracking-wider">Key Outcomes & Student Learning</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{activity.outcomes}</p>
            </div>
          )}
        </div>

        {/* Info Card Sidebar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity Metadata</h3>
          
          <div className="space-y-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-700">
              <Users className="w-4 h-4 text-[#1A7A6A]" />
              <span>Participants: <strong>{activity.participants_count || 0}</strong></span>
            </div>
            {activity.resource_person && (
              <div className="flex items-center space-x-2 text-slate-700">
                <User className="w-4 h-4 text-[#1A7A6A]" />
                <span>Resource: <strong>{activity.resource_person}</strong></span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-slate-700">
              <MapPin className="w-4 h-4 text-[#1A7A6A]" />
              <span>Venue: <strong>{activity.venue}</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* Media Gallery Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#1F3864]">Photo & Video Documentation ({mediaItems.length})</h3>
        {mediaItems.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No media uploaded for this activity.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {mediaItems.map((m) => (
              <div key={m.id} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video relative group">
                {m.media_type === 'image' ? (
                  <img src={m.cloudinary_url} alt="Media" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <video src={m.cloudinary_url} controls className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        activity={activity}
      />

    </div>
  );
};
