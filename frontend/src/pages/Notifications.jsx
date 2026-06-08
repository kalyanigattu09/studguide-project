import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Bell, CheckCheck, Clock, Filter, Megaphone, ShieldCheck, Sparkles } from 'lucide-react';

const typeStyles = {
  Placement: { icon: Megaphone, badge: 'badge-cyan' },
  Alert: { icon: Bell, badge: 'badge-amber' },
  System: { icon: ShieldCheck, badge: 'badge-indigo' }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/productivity/notifications');
      if (data.success) setNotifications(data.data);
    } catch (err) {
      console.warn('Failed loading notifications.', err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`/api/productivity/notifications/${id}/read`);
      setNotifications((items) => items.map((item) => item._id === id ? { ...item, isRead: true } : item));
    } catch (err) {
      console.warn('Failed marking notification as read.', err);
    }
  };

  const filtered = useMemo(() => notifications.filter((item) => {
    if (filter === 'Unread') return !item.isRead;
    if (filter === 'Read') return item.isRead;
    return true;
  }), [filter, notifications]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 skeleton" />
          <div className="h-28 skeleton" />
          <div className="h-28 skeleton" />
        </div>
        <div className="h-96 skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Notification <span className="gradient-text">Center</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Placement updates, reminders, and system signals in one focused command stream.
          </p>
        </div>

        <div className="glass rounded-xl p-2 flex items-center gap-2">
          {['All', 'Unread', 'Read'].map((item) => (
            <button
              key={item}
              className={`btn ${filter === item ? 'btn-primary' : 'btn-ghost'} py-2 px-3`}
              onClick={() => setFilter(item)}
            >
              <Filter size={14} />
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-kpi glass">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Total Signals</span>
              <div className="text-3xl font-bold mt-1">{notifications.length}</div>
            </div>
            <Bell className="text-indigo-400" size={24} />
          </div>
        </div>
        <div className="card-kpi glass" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Unread</span>
              <div className="text-3xl font-bold mt-1 text-amber-400">{unreadCount}</div>
            </div>
            <Sparkles className="text-amber-400" size={24} />
          </div>
        </div>
        <div className="card-kpi glass" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Cleared</span>
              <div className="text-3xl font-bold mt-1 text-emerald-400">{notifications.length - unreadCount}</div>
            </div>
            <CheckCheck className="text-emerald-400" size={24} />
          </div>
        </div>
      </div>

      <div className="card glass p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>
            <Bell size={36} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No notifications in this view</p>
            <p className="text-sm mt-1">Planner reminders and placement activity will appear here.</p>
          </div>
        ) : (
          filtered.map((notification, index) => {
            const style = typeStyles[notification.type] || typeStyles.System;
            const Icon = style.icon;
            return (
              <motion.button
                key={notification._id}
                className="w-full text-left px-5 py-4 border-b transition-colors hover:bg-white/5"
                style={{ borderColor: 'var(--border)', opacity: notification.isRead ? 0.68 : 1 }}
                onClick={() => markRead(notification._id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400 flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{notification.title}</span>
                      <span className={`badge ${style.badge}`}>{notification.type || 'System'}</span>
                      {!notification.isRead && <span className="badge badge-rose">New</span>}
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{notification.message}</p>
                    <div className="flex items-center gap-1.5 text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={12} />
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
