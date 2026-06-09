import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Zap, FileText, BarChart2, Trophy, Flame, LibraryBig, Bell, FileScan, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STATIC_COMMANDS = [
  { id: 'dash', label: 'Go to Dashboard', route: '/dashboard', icon: BarChart2, category: 'Navigation' },
  { id: 'profile', label: 'View My Profile', route: '/profile', icon: FileText, category: 'Navigation' },
  { id: 'resume', label: 'Analyze Resume ATS Score', route: '/resume', icon: FileScan, category: 'Navigation' },
  { id: 'career', label: 'Open Career Guidance', route: '/career', icon: Zap, category: 'Navigation' },
  { id: 'placement', label: 'Browse Placement Drives', route: '/placement', icon: ArrowRight, category: 'Navigation' },
  { id: 'mocktest', label: 'Take a Mock Test', route: '/mocktest', icon: FileText, category: 'Navigation' },
  { id: 'leaderboard', label: 'View Leaderboard', route: '/leaderboard', icon: Trophy, category: 'Navigation' },
  { id: 'planner', label: 'Open Study Planner', route: '/planner', icon: Zap, category: 'Navigation' },
  { id: 'habits', label: 'Habit Tracker', route: '/habits', icon: Flame, category: 'Navigation' },
  { id: 'resources', label: 'Open Resource Hub', route: '/resources', icon: LibraryBig, category: 'Navigation' },
  { id: 'notifications', label: 'Notification Center', route: '/notifications', icon: Bell, category: 'Navigation' },
  { id: 'reports', label: 'Generate Placement Reports', route: '/reports', icon: FileDown, category: 'Navigation' },
  { id: 'forum', label: 'Community Forum', route: '/forum', icon: FileText, category: 'Navigation' },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [skillResults, setSkillResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSkillResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Trie-backed skill search via backend
  useEffect(() => {
    if (!query || query.length < 2) {
      setSkillResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await apiClient.get(`/api/guidance/roles`);
        // Filter static results by query for roles
        if (data.success) {
          const filtered = data.data.filter(r =>
            r.name.toLowerCase().includes(query.toLowerCase())
          ).map(r => ({ id: r.id, label: `Explore: ${r.name} Roadmap`, route: `/career`, icon: Zap, category: 'Career Paths' }));
          setSkillResults(filtered);
        }
      } catch {}
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredStatic = STATIC_COMMANDS.filter(c =>
    !query || c.label.toLowerCase().includes(query.toLowerCase())
  );

  const allResults = [...skillResults, ...filteredStatic];

  const handleSelect = (item) => {
    navigate(item.route);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      handleSelect(allResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const groupedResults = allResults.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  let flatIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onKeyDown={handleKeyDown}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <Search size={18} style={{ color: 'var(--accent-indigo)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                placeholder="Search anything... (skills, pages, drives)"
                className="flex-1 bg-transparent outline-none text-base"
                style={{ color: 'var(--text-primary)', fontSize: '15px' }}
              />
              {query && (
                <button onClick={() => setQuery('')}>
                  <X size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
              <kbd className="text-xs px-2 py-1 rounded glass" style={{ color: 'var(--text-muted)' }}>ESC</kbd>
            </div>

            {/* Results */}
            <div className="overflow-y-auto" style={{ maxHeight: '400px', padding: '8px' }}>
              {allResults.length === 0 && (
                <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                  <Search size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No results found for "{query}"</p>
                </div>
              )}
              {Object.entries(groupedResults).map(([category, items]) => (
                <div key={category} className="mb-2">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {category}
                  </div>
                  {items.map((item) => {
                    const isSelected = flatIndex === selectedIndex;
                    const currentIndex = flatIndex++;
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.id}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                        style={{
                          background: isSelected ? 'rgba(99,102,241,0.12)' : 'transparent',
                          color: isSelected ? '#818cf8' : 'var(--text-primary)',
                          border: isSelected ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                        }}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        whileHover={{ x: 4 }}
                      >
                        <Icon size={16} style={{ color: isSelected ? '#818cf8' : 'var(--text-muted)', flexShrink: 0 }} />
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        {isSelected && <ArrowRight size={14} />}
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t flex items-center gap-4 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <span><kbd className="glass px-1.5 py-0.5 rounded">↑↓</kbd> Navigate</span>
              <span><kbd className="glass px-1.5 py-0.5 rounded">↵</kbd> Select</span>
              <span><kbd className="glass px-1.5 py-0.5 rounded">ESC</kbd> Close</span>
              <span className="ml-auto flex items-center gap-1">
                <Zap size={12} className="text-indigo-400" /> Powered by Trie Search
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
