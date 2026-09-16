import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { VoiceInput } from '../components/VoiceInput';
import { FilePlus, Calendar, MapPin, Users, User, ArrowLeft, Send } from 'lucide-react';

const CATEGORIES = [
  "Workshop", "Seminar", "Guest Lecture", "FDP", 
  "Industrial Visit", "Cultural", "Technical Competition", "Other"
];

export const ProposalForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Workshop',
    description: '',
    proposed_date: '',
    venue: '',
    expected_participants: 50,
    resource_person: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVoiceTranscript = (text) => {
    setFormData((prev) => ({
      ...prev,
      description: prev.description ? `${prev.description} ${text}` : text
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await client.post('/proposals', formData);
      navigate('/proposals');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit proposal. Please check required fields.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Proposals</span>
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-100">
          <div className="p-3 bg-[#E8F5F2] text-[#0F5548] rounded-2xl">
            <FilePlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#1F3864]">Submit Activity Proposal</h1>
            <p className="text-xs text-slate-500">Propose departmental activity for HOD/Admin review and approval</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Proposal Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. National Workshop on Cloud Native & Microservices"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
            />
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Date *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  name="proposed_date"
                  required
                  value={formData.proposed_date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
                />
              </div>
            </div>
          </div>

          {/* Venue & Participants Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Venue *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="venue"
                  required
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g. MCA Computer Lab / Seminar Hall"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Participants</label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  name="expected_participants"
                  value={formData.expected_participants}
                  onChange={handleChange}
                  placeholder="50"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
                />
              </div>
            </div>
          </div>

          {/* Resource Person */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Resource Person / Key Speaker</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="resource_person"
                value={formData.resource_person}
                onChange={handleChange}
                placeholder="e.g. Dr. Jane Doe, Senior Software Architect at TechCorp"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
              />
            </div>
          </div>

          {/* Description & Voice Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">Detailed Activity Description *</label>
              <VoiceInput onTranscript={handleVoiceTranscript} fieldName="Proposal Description" />
            </div>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Outline objectives, methodology, targeted audience, schedule structure, and relevance to MCA curriculum..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#1A7A6A] hover:bg-[#0F5548] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#1A7A6A]/30 transition-all flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Proposal for Approval'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
