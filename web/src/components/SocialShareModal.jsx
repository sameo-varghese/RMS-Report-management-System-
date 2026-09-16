import React, { useState } from 'react';
import { Share2, Linkedin, Instagram, Copy, Check, X } from 'lucide-react';

export const SocialShareModal = ({ isOpen, onClose, activity }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !activity) return null;

  const linkedInPost = `🚀 Thrilled to share that the School of Computer Applications, Union Christian College, Aluva (Autonomous) successfully organized a ${activity.category} on "${activity.title}"!

📍 Venue: ${activity.venue}
📅 Date: ${activity.activity_date}
👥 Participants: ${activity.participants_count || '100+'}
👤 Speaker: ${activity.resource_person || 'Industry Experts'}

💡 Key Takeaway: ${activity.outcomes || activity.description?.slice(0, 150)}...

#UCCAluva #ComputerApplications #MCA #HigherEducation #TechEvents #${activity.category?.replace(/\s+/g, '')}`;

  const instagramPost = `✨ Event Spotlight! ✨
School of Computer Applications, UCC Aluva hosted "${activity.title}" (${activity.category})!

🗓 ${activity.activity_date} | 📍 ${activity.venue}
🎯 ${activity.participants_count}+ Participants Empowered!

#UCC #UCCAluva #MCADepartment #TechWorkshop #StudentLife #FutureTech`;

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-[#1A7A6A] font-bold mb-4">
          <Share2 className="w-5 h-5" />
          <h2 className="text-lg">Social Media Post Generator</h2>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Copy structured content tailored for Union Christian College social channels:
        </p>

        {/* LinkedIn Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="flex items-center space-x-1.5 font-bold text-xs text-[#0A66C2]">
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn Format</span>
            </span>
            <button
              onClick={() => copyText(linkedInPost)}
              className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 bg-[#0A66C2] text-white rounded-md hover:bg-[#084e96] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-700 whitespace-pre-line font-mono bg-white p-3 rounded-lg border border-slate-200 max-h-36 overflow-y-auto">
            {linkedInPost}
          </p>
        </div>

        {/* Instagram Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="flex items-center space-x-1.5 font-bold text-xs text-[#E4405F]">
              <Instagram className="w-4 h-4" />
              <span>Instagram Caption</span>
            </span>
            <button
              onClick={() => copyText(instagramPost)}
              className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 bg-[#E4405F] text-white rounded-md hover:bg-[#c9324e] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Caption'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-700 whitespace-pre-line font-mono bg-white p-3 rounded-lg border border-slate-200 max-h-32 overflow-y-auto">
            {instagramPost}
          </p>
        </div>
      </div>
    </div>
  );
};
