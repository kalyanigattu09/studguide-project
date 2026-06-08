import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Bookmark, BookmarkCheck, ExternalLink, FileText, Filter, Link as LinkIcon, PlayCircle, Search, StickyNote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const typeIcons = {
  Note: StickyNote,
  PDF: FileText,
  Video: PlayCircle,
  Link: LinkIcon
};

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [types, setTypes] = useState(['All']);
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(fetchResources, 180);
    return () => clearTimeout(timer);
  }, [query, category, type, bookmarkedOnly]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/resources', {
        params: { q: query, category, type, bookmarked: bookmarkedOnly }
      });
      if (data.success) {
        setResources(data.data);
        setCategories(data.meta?.categories || ['All']);
        setTypes(data.meta?.types || ['All']);
        setSuggestions(data.meta?.suggestions || []);
      }
    } catch (err) {
      console.warn('Failed loading resources.', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (resourceId) => {
    try {
      const { data } = await axios.put(`/api/resources/${resourceId}/bookmark`);
      if (data.success) {
        setResources((items) => items.map((item) => item._id === resourceId ? data.data : item));
      }
    } catch (err) {
      console.warn('Failed updating bookmark.', err);
    }
  };

  const stats = useMemo(() => ({
    total: resources.length,
    videos: resources.filter((item) => item.type === 'Video').length,
    bookmarked: resources.filter((item) => (item.bookmarkedBy || []).map(String).includes(String(user?._id))).length
  }), [resources, user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Resource <span className="gradient-text">Hub</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Notes, PDFs, courses, videos, and placement links with fast Trie-assisted discovery.
          </p>
        </div>

        <div className="glass rounded-xl p-2 flex flex-col sm:flex-row gap-2">
          <div className="relative min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              className="input pl-9 py-2"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search skills, topics, resources..."
            />
          </div>
          <select className="input py-2" value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="input py-2" value={type} onChange={(event) => setType(event.target.value)}>
            {types.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button
            className={`btn ${bookmarkedOnly ? 'btn-primary' : 'btn-secondary'} py-2 px-3`}
            onClick={() => setBookmarkedOnly((value) => !value)}
          >
            <Filter size={15} />
            Saved
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-kpi glass">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Visible Resources</span>
          <div className="text-3xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="card-kpi glass" style={{ borderColor: 'rgba(6, 182, 212, 0.2)' }}>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Video Lessons</span>
          <div className="text-3xl font-bold mt-1 text-cyan-400">{stats.videos}</div>
        </div>
        <div className="card-kpi glass" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Saved Here</span>
          <div className="text-3xl font-bold mt-1 text-amber-400">{stats.bookmarked}</div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Suggestions</span>
          {suggestions.map((item) => (
            <button key={item} className="badge badge-indigo" onClick={() => setQuery(item)}>
              {item}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div className="h-52 skeleton" />
          <div className="h-52 skeleton" />
          <div className="h-52 skeleton" />
        </div>
      ) : resources.length === 0 ? (
        <div className="card glass py-20 text-center">
          <Search size={36} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold">No resources match your filters</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Try a broader category or clear saved-only mode.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {resources.map((resource, index) => {
            const Icon = typeIcons[resource.type] || LinkIcon;
            const bookmarked = (resource.bookmarkedBy || []).map(String).includes(String(user?._id));
            return (
              <motion.article
                key={resource._id}
                className="card glass flex flex-col gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white flex-shrink-0">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="badge badge-cyan">{resource.type}</span>
                      <span className="badge badge-indigo">{resource.category}</span>
                    </div>
                    <h2 className="font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>{resource.title}</h2>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[28px]">
                  {(resource.tags || []).map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-lg text-xs" style={{ background: 'var(--surface-high)', color: 'var(--text-secondary)' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <button className="btn btn-secondary py-2 px-3" onClick={() => toggleBookmark(resource._id)}>
                    {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                    {bookmarked ? 'Saved' : 'Save'}
                  </button>
                  <a className="btn btn-primary py-2 px-3" href={resource.url} target="_blank" rel="noreferrer">
                    <ExternalLink size={15} />
                    Open
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
