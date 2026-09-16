import React, { useState } from 'react';
import client from '../api/client';
import { UploadCloud, Image as ImageIcon, Film, Trash2, Loader2, CheckCircle } from 'lucide-react';

export const MediaUploader = ({ activityId, mediaList = [], onUploadSuccess, onDeleteSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('activity_id', activityId);
    formData.append('file', file);

    try {
      const res = await client.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (onUploadSuccess) onUploadSuccess(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Media upload failed. Max 10MB for images, 100MB for MP4 videos.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId) => {
    try {
      await client.delete(`/media/${mediaId}`);
      if (onDeleteSuccess) onDeleteSuccess(mediaId);
    } catch (err) {
      alert("Failed to delete media item.");
    }
  };

  return (
    <div className="space-y-4">
      {/* File Dropzone */}
      <div className="border-2 border-dashed border-slate-300 hover:border-[#1A7A6A] bg-slate-50 hover:bg-[#E8F5F2]/40 rounded-xl p-6 text-center transition-all cursor-pointer relative group">
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp, video/mp4"
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <Loader2 className="w-10 h-10 text-[#1A7A6A] animate-spin" />
          ) : (
            <UploadCloud className="w-10 h-10 text-[#1A7A6A] group-hover:scale-110 transition-transform" />
          )}
          <div className="text-sm font-semibold text-slate-700">
            {uploading ? 'Uploading to Cloudinary...' : 'Click or Drag & Drop Photos / Videos'}
          </div>
          <p className="text-xs text-slate-500">
            Images (JPG, PNG, WEBP - Max 10MB) • Videos (MP4 - Max 100MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
          {error}
        </div>
      )}

      {/* Uploaded Media Gallery */}
      {mediaList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {mediaList.map((m) => (
            <div key={m.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video">
              {m.media_type === 'image' ? (
                <img
                  src={m.cloudinary_url}
                  alt="Documentation"
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <video
                  src={m.cloudinary_url}
                  className="w-full h-full object-cover"
                  controls
                />
              )}
              
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] text-white font-medium flex items-center space-x-1">
                {m.media_type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                <span className="capitalize">{m.media_type}</span>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(m.id)}
                className="absolute top-2 right-2 p-1.5 bg-rose-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700"
                title="Delete Media"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
