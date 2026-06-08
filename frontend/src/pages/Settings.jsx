import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
  Settings as SetIcon, Moon, Sun, Shield, Lock, Bell, HelpCircle, GraduationCap, Cpu
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          System <span className="gradient-text">Configuration</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Configure STUGUIDE X telemetry, theme layers, and role based access parameters.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Theme Settings */}
        <div className="card glass">
          <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-400" />} 
            Visual Mode Settings
          </h2>
          <p className="text-xs text-muted mb-4">Toggle between dark high-contrast mode (recommended for developers) and light high-contrast mode.</p>
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
            <span className="text-sm font-semibold text-white">Active theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            <button className="btn btn-secondary py-2" onClick={toggleTheme}>
              {isDark ? 'Activate Light Mode' : 'Activate Dark Mode'}
            </button>
          </div>
        </div>

        {/* User Account Info */}
        <div className="card glass">
          <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <GraduationCap size={18} className="text-indigo-400" /> Account Security Credentials
          </h2>
          <p className="text-xs text-muted mb-4">Review system authentication tokens and role based authority limits.</p>
          
          <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5 text-sm">
            <div className="flex justify-between"><span className="text-secondary">Username Name:</span> <span className="text-white font-semibold">{user?.name}</span></div>
            <div className="flex justify-between"><span className="text-secondary">Login Email:</span> <span className="text-white font-semibold">{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-secondary">User Authority:</span> <span className="badge badge-indigo text-xxs font-bold uppercase" style={{ fontSize: '9px' }}>{user?.role}</span></div>
          </div>
        </div>

        {/* Telemetry Architecture details */}
        <div className="card glass text-center space-y-4">
          <Cpu size={32} className="text-indigo-400 mx-auto animate-float" />
          <h3 className="text-base font-bold text-white">STUGUIDE X Core v2.0 Engine</h3>
          <p className="text-xs text-secondary leading-relaxed px-4">
            STUGUIDE X is built with a dual database integration pipeline (MongoDB Mongoose + in-memory HybridDB file caching). Data structures (directed graph roadmaps, priority queues, and max heap scoreboards) run seamlessly client and server side.
          </p>
          <div className="text-xxs text-muted" style={{ fontSize: '10px' }}>Built by DeepMind Advanced Agentic Coding for the Next Generation</div>
        </div>

      </div>
    </div>
  );
}
