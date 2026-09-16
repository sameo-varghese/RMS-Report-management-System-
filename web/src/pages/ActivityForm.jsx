import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import client from '../api/client';
import { VoiceInput } from '../components/VoiceInput';
import { MediaUploader } from '../components/MediaUploader';
import { Sparkles, Calendar, MapPin, Users, User, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ActivityForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get('proposal_id');

  const [proposal, setProposal] = useState(null);
  const [activityId, setActivityId] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Workshop',
    description: '',
    activity_date: '',
    venue: '',
    participants_count: 0,
    resource_person: '',
    outcomes: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!proposalId) {
      setError('An approved proposal is required to document an activity.');
      setLoading(false);
      return;
    }

    client.get(`/proposals/${proposalId}`)
      .then((res) => {
        const prop = res.data;
        if (prop.status !== 'Approved') {
          setError('This proposal has not been approved by Admin yet.');
        } else {
          setProposal(prop);
          setFormData({
            title: prop.title,
            category: prop.category,
            description: prop.description,
            activity_date: prop.proposed_date,
            venue: prop.venue,
            participants_count: prop.expected_participants || 0,
            resource_person: prop.resource_person || '',
            outcomes: ''
          });
        }
      })
      .catch((err) => setError('Failed to fetch linked proposal details.'))
      .finally(() => setLoading(false));
  }, [proposalId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVoiceDescription = (text) => {
    setFormData(prev => ({ ...prev, description: prev.description ? `${prev.description} ${text}` : text }));
  };

  const handleVoiceOutcomes = (text) => {
    setFormData(prev => ({ ...prev, outcomes: prev.outcomes ? `${prev.outcomes} ${text}` : text }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = { ...formData, proposal_id: proposalId };
      const res = await client.post('/activities', payload);
      setActivityId(res.data.id);
      alert('Activity record saved! You can now attach media documentation below or click Finish.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save activity record.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-xs text-slate-400">Loading form data...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Proposals</span>
      </button>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          
          <div className="flex items-center space-x-3 pb-6 border-b border-slate-100">
            <div className="p-3 bg-[#E8F5F2] text-[#0F5548] rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1F3864]">Document Activity Record</h1>
              <p className="text-xs text-slate-500">Linked to Approved Proposal: <strong>{proposal?.title}</strong></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Activity Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Actual Date *</label>
                <input
                  type="date"
                  name="activity_date"
                  required
                  value={formData.activity_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Actual Participants Count *</label>
                <input
                  type="number"
                  name="participants_count"
                  value={formData.participants_count}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">Detailed Event Summary *</label>
                <VoiceInput onTranscript={handleVoiceDescription} fieldName="Event Summary" />
              </div>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">Key Outcomes & Student Learning</label>
                <VoiceInput onTranscript={handleVoiceOutcomes} fieldName="Outcomes" />
              </div>
              <textarea
                name="outcomes"
                rows={3}
                value={formData.outcomes}
                onChange={handleChange}
                placeholder="Highlight student skill acquisitions, feedback metrics, and project deliverables..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
              />
            </div>

            {!activityId ? (
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#1A7A6A] hover:bg-[#0F5548] text-white font-bold rounded-xl text-sm shadow-lg transition-all"
              >
                {submitting ? 'Saving Activity...' : 'Save Activity Details & Enable Media Upload'}
              </button>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Activity record saved! Upload media documentation below:</span>
              </div>
            )}
          </form>

          {/* Media Upload Section */}
          {activityId && (
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Media Documentation Upload (Cloudinary)</h3>
              <MediaUploader
                activityId={activityId}
                mediaList={mediaList}
                onUploadSuccess={(newItem) => setMediaList(prev => [...prev, newItem])}
                onDeleteSuccess={(deletedId) => setMediaList(prev => prev.filter(m => m.id !== deletedId))}
              />

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/activities/${activityId}`)}
                  className="px-6 py-2.5 bg-[#1F3864] text-white font-bold rounded-xl text-xs hover:bg-[#152646] transition-all"
                >
                  Finish & View Activity Detail
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
