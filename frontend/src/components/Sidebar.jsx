import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, Briefcase, BookOpen, Target, Trophy, FileScan, FileDown,
  MessageSquare, Bell, Settings, LogOut, ChevronRight, Zap,
  BarChart2, ClipboardList, Flame, GraduationCap, Building2,
  LibraryBig, Moon, Sun, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const studentLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'My Profile' },
  { to: '/resume', icon: FileScan, label: 'Resume Analyzer' },
  { to: '/career', icon: Target, label: 'Career Guidance' },
  { to: '/placement', icon: Briefcase, label: 'Placement Board' },
  { to: '/mocktest', icon: ClipboardList, label: 'Mock Tests' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/planner', icon: BookOpen, label: 'Study Planner' },
  { to: '/habits', icon: Flame, label: 'Habit Tracker' },
  { to: '/resources', icon: LibraryBig, label: 'Resource Hub' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/forum', icon: MessageSquare, label: 'Community' },
];

const officerLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin', icon: BarChart2, label: 'Analytics' },
  { to: '/placement', icon: Briefcase, label: 'Drives Manager' },
  { to: '/reports', icon: FileDown, label: 'Reports' },
  { to: '/resources', icon: LibraryBig, label: 'Resources' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/forum', icon: MessageSquare, label: 'Community' },
];

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Control Center' },
  { to: '/admin', icon: BarChart2, label: 'System Analytics' },
  { to: '/reports', icon: FileDown, label: 'Reports' },
  { to: '/resume', icon: FileScan, label: 'Resume Analyzer' },
  { to: '/placement', icon: Building2, label: 'Placement Mgmt' },
  { to: '/mocktest', icon: ClipboardList, label: 'Test Bank' },
  { to: '/resources', icon: LibraryBig, label: 'Resource Hub' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/forum', icon: MessageSquare, label: 'Community' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const links = user?.role === 'Admin' ? adminLinks
    : (user?.role === 'PlacementOfficer' || user?.role === 'Faculty') ? officerLinks
    : studentLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleColor = user?.role === 'Admin' ? '#f43f5e'
    : user?.role === 'PlacementOfficer' ? '#f59e0b'
    : user?.role === 'Faculty' ? '#10b981'
    : '#6366f1';

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCollapsed(true)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="sidebar"
        initial={false}
        animate={{ x: collapsed ? -260 : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ zIndex: 50 }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-base gradient-text">STUGUIDE X</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>v2.0 Intelligence</div>
            </div>
            <button
              className="ml-auto p-1.5 rounded-lg btn-ghost"
              onClick={() => setCollapsed(true)}
              style={{ display: 'none' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4">
          <div className="glass rounded-xl p-3 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: roleColor }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.name || 'User'}
              </div>
              <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                <span className="badge badge-indigo" style={{ fontSize: '9px', padding: '2px 6px' }}>
                  {user?.role || 'Student'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Navigation
          </div>
          {links.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`sidebar-nav-item mb-1 ${isActive ? 'active' : ''}`}
                onClick={() => window.innerWidth < 768 && setCollapsed(true)}
              >
                <Icon size={18} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}

          <div className="mt-4 mb-2 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Account
          </div>
          <Link to="/settings" className="sidebar-nav-item mb-1">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          <button
            className="sidebar-nav-item w-full text-left mb-1"
            style={{ color: '#f43f5e' }}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <button
              className="btn btn-ghost text-xs gap-2 py-2 px-3"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Online</span>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
