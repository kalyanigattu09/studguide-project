import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Topbar({ onMenuToggle, onCommandOpen }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('/api/productivity/notifications');
      if (data.success) {
        setNotifications(data.data.slice(0, 8));
        setUnreadCount(data.data.filter(n => !n.isRead).length);
      }
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await axios.put(`/api/productivity/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  return (
    <header
      className="glass sticky top-0 z-30 flex items-center justify-between px-6 py-3"
      style={{ borderBottom: '1px solid var(--border)', borderRadius: 0 }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          className="btn btn-ghost p-2"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Search trigger */}
        <motion.button
          className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl text-sm"
          style={{ background: 'var(--surface-high)', border: '1px solid var(--border)', color: 'var(--text-muted)', minWidth: 220 }}
          onClick={onCommandOpen}
          whileHover={{ borderColor: 'var(--accent-indigo)' }}
        >
          <Search size={15} />
          <span>Search anything...</span>
          <kbd className="ml-auto flex items-center gap-1 text-xs glass px-1.5 py-0.5 rounded">
            <Command size={10} /> K
          </kbd>
        </motion.button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Mobile search */}
        <button className="btn btn-ghost p-2 md:hidden" onClick={onCommandOpen}>
          <Search size={18} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <motion.button
            className="btn btn-ghost p-2 relative"
            onClick={() => setNotifOpen(o => !o)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <motion.span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ fontSize: '9px' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div
                  className="absolute right-0 top-12 w-[340px] glass-high rounded-2xl overflow-hidden z-50"
                  style={{ boxShadow: 'var(--shadow-elevated)' }}
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                >
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="badge badge-rose">{unreadCount} new</span>
                    )}
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
                    {notifications.length === 0 ? (
                      <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                        <Bell size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <motion.div
                          key={n._id}
                          className="px-4 py-3 border-b cursor-pointer hover:bg-white/5 transition-colors"
                          style={{ borderColor: 'var(--border)', opacity: n.isRead ? 0.6 : 1 }}
                          onClick={() => markRead(n._id)}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex gap-3">
                            <div
                              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                              style={{ background: n.isRead ? 'var(--text-muted)' : 'var(--accent-indigo)' }}
                            />
                            <div>
                              <div className="text-sm font-medium">{n.title}</div>
                              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.message}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 text-center">
                    <Link to="/notifications" className="text-xs" style={{ color: 'var(--accent-indigo)' }} onClick={() => setNotifOpen(false)}>
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <Link to="/profile">
          <motion.div
            className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm cursor-pointer"
            whileHover={{ scale: 1.08 }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </motion.div>
        </Link>
      </div>
    </header>
  );
}
