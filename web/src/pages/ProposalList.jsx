import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  MessageSquare, 
  Sparkles,
  Search
} from 'lucide-react';

export const ProposalList = () => {
  const { user, isAdmin } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject'
  const [processing, setProcessing] = useState(false);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await client.get('/proposals');
      setProposals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleAdminAction = async () => {
    if (!selectedProposal) return;
    setProcessing(true);

    try {
      if (modalType === 'approve') {
        await client.put(`/proposals/${selectedProposal.id}/approve`, {
          admin_remarks: adminRemarks || 'Approved'
        });
      } else if (modalType === 'reject') {
        if (!adminRemarks.trim()) {
          alert('Remarks are required when rejecting a proposal.');
          setProcessing(false);
          return;
        }
        await client.put(`/proposals/${selectedProposal.id}/reject`, {
          admin_remarks: adminRemarks
        });
      }
      setSelectedProposal(null);
      setAdminRemarks('');
      setModalType(null);
      fetchProposals();
    } catch (err) {
      alert(err.response?.data?.detail || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pending proposal?')) return;
    try {
      await client.delete(`/proposals/${id}`);
      fetchProposals();
    } catch (err) {
      alert(err.response?.data?.detail || 'Deletion failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-[#1F3864]">Activity Proposals</h1>
          <p className="text-xs text-slate-500">
            {isAdmin ? 'Review and manage departmental proposal submissions' : 'Track status of your submitted activity proposals'}
          </p>
        </div>
        <Link
          to="/proposals/new"
          className="px-4 py-2.5 bg-[#1A7A6A] hover:bg-[#0F5548] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#1A7A6A]/20 transition-all flex items-center space-x-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Proposal</span>
        </Link>
      </div>

      {/* Proposals Grid / List */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading proposals...</div>
      ) : proposals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Proposals Found</h3>
          <p className="text-xs text-slate-500 mt-1">Submit your first activity proposal to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposals.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-[#E8F5F2] text-[#0F5548] text-[10px] font-bold rounded-lg border border-[#B4E3D8]">
                    {p.category}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                    p.status === 'Approved' ? 'badge-approved' :
                    p.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'
                  }`}>
                    {p.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {p.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                    {p.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                    <span>{p.status}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div>📅 Proposed Date: <strong>{p.proposed_date}</strong></div>
                  <div>📍 Venue: <strong>{p.venue}</strong></div>
                  <div>👤 Proposed by: <strong>{p.faculty_name}</strong></div>
                  {p.resource_person && <div>🎤 Resource Person: <strong>{p.resource_person}</strong></div>}
                </div>

                {p.admin_remarks && (
                  <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    <span className="font-bold text-[#1F3864]">Admin Remarks: </span>
                    <span>{p.admin_remarks}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {p.status === 'Approved' ? (
                  <Link
                    to={`/activities/new?proposal_id=${p.id}`}
                    className="px-3 py-1.5 bg-[#1A7A6A] hover:bg-[#0F5548] text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create Activity Document</span>
                  </Link>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium italic">
                    {p.status === 'Pending' ? 'Awaiting HOD approval' : 'Proposal rejected'}
                  </span>
                )}

                <div className="flex items-center space-x-2">
                  {isAdmin && p.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => { setSelectedProposal(p); setModalType('approve'); setAdminRemarks(''); }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => { setSelectedProposal(p); setModalType('reject'); setAdminRemarks(''); }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {(!isAdmin && p.status === 'Pending') && (
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                      title="Delete Pending Proposal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Admin Action Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#1F3864]">
              {modalType === 'approve' ? 'Approve Activity Proposal' : 'Reject Activity Proposal'}
            </h3>
            <p className="text-xs text-slate-600">
              Proposal: <strong>{selectedProposal.title}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Remarks {modalType === 'reject' && '*'}
              </label>
              <textarea
                rows={3}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder={modalType === 'approve' ? 'Approved by HOD...' : 'Reason for rejection...'}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedProposal(null)}
                className="px-3 py-1.5 text-slate-600 text-xs font-bold hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminAction}
                disabled={processing}
                className={`px-4 py-1.5 text-white text-xs font-bold rounded-lg ${
                  modalType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {processing ? 'Processing...' : modalType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
