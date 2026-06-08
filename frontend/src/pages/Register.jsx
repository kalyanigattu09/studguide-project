import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Loader2, Zap, Shield, Briefcase, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student'); // Default
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { name: 'Student', icon: GraduationCap, desc: 'Placement prep, mock tests, and roadmaps.', color: '#6366f1' },
    { name: 'PlacementOfficer', icon: Briefcase, desc: 'Manage recruitment drives and analytics.', color: '#f59e0b' },
    { name: 'Faculty', icon: BookOpen, desc: 'Monitor academics and give guidance.', color: '#10b981' }
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      <div className="bg-mesh" />

      {/* Left Panel – Hero */}
      <motion.div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12 relative overflow-hidden"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ background: 'linear-gradient(160deg, #0f0f11 0%, #1a1a2e 100%)', borderRight: '1px solid var(--border)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20 animate-float"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-20 right-0 w-48 h-48 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', filter: 'blur(30px)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <div className="text-xl font-bold gradient-text">STUGUIDE X</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Intelligence Platform v2.0</div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10">
          <motion.h1
            className="text-4xl font-bold leading-tight mb-4"
            style={{ color: 'var(--text-primary)' }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Empowering the <br />
            <span className="gradient-text">Next Generation.</span>
          </motion.h1>
          <motion.p
            className="text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Create an account to access deep career analytics, custom academic schedules, professional ATS checkers, and mock coding sheets.
          </motion.p>
        </div>

        <div className="text-xs relative z-10" style={{ color: 'var(--text-muted)' }}>
          © 2026 STUGUIDE X · Built for the Next Generation
        </div>
      </motion.div>

      {/* Right Panel – Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div
          className="w-full max-w-xl py-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div className="text-lg font-bold gradient-text">STUGUIDE X</div>
          </div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Create your account</h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Join the platform today · Already have an account? <Link to="/login" className="font-medium" style={{ color: 'var(--accent-indigo)' }}>Sign in</Link>
          </p>

          {error && (
            <motion.div
              className="mb-6 px-4 py-3 rounded-xl text-sm badge-rose"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input pl-10"
                  placeholder="Kalyan Kumar"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="kalyan@stuguide.edu"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="register-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => setShowPw(s => !s)}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Role Cards Selector */}
            <div>
              <label className="label mb-3">Select System Role</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {roles.map(r => {
                  const isSelected = role === r.name;
                  const Icon = r.icon;
                  return (
                    <motion.div
                      key={r.name}
                      onClick={() => setRole(r.name)}
                      className="glass rounded-xl p-4 cursor-pointer flex flex-col items-center text-center transition-all"
                      style={{
                        borderColor: isSelected ? r.color : 'var(--border)',
                        background: isSelected ? `${r.color}15` : 'var(--surface)'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: isSelected ? r.color : 'var(--surface-high)', color: isSelected ? 'white' : r.color }}>
                        <Icon size={18} />
                      </div>
                      <div className="text-sm font-bold" style={{ color: isSelected ? r.color : 'var(--text-primary)' }}>
                        {r.name === 'PlacementOfficer' ? 'Placement Officer' : r.name}
                      </div>
                      <div className="text-xxs mt-1 opacity-70" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {r.desc}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary w-full justify-center py-3 text-base"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Zap size={16} /> Register Now</>}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
