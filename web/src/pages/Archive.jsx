import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { Search, Filter, Calendar, FolderArchive, ArrowUpRight, FileText, Sparkles } from 'lucide-react';

const CATEGORIES = ["All", "Workshop", "Seminar", "Guest Lecture", "FDP", "Industrial Visit", "Cultural", "Technical Competition", "Other"];

export const Archive = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'All') params.append('category', category);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await client.get(`/activities?${params.toString()}`);
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [category, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchActivities();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#1F3864]">Departmental Activity Archive</h1>
          <p className="text-xs text-slate-500">School of Computer Applications — Union Christian College, Aluva</p>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keyword (e.g. AI, PyTorch)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
            />
          </div>

          {/* Start Date */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1A7A6A]"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[#1A7A6A] hover:bg-[#0F5548] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                category === cat
                  ? 'bg-[#1A7A6A] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Searching archive...</div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Archive Records Match Your Search</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your keyword search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((act) => (
            <div key={act.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 bg-[#E8F5F2] text-[#0F5548] text-[10px] font-bold rounded">
                    {act.category}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">{act.activity_date}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-2">{act.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{act.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">📍 {act.venue}</span>
                <Link
                  to={`/activities/${act.id}`}
                  className="px-3 py-1.5 bg-[#1F3864] hover:bg-[#152646] text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                >
                  <span>Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
