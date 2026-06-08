import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role) => {
    const creds = {
      Student: { email: 'kalyan@stuguide.edu', password: 'password123' },
      PlacementOfficer: { email: 'ramesh@stuguide.edu', password: 'password123' },
      Admin: { email: 'admin@stuguide.edu', password: 'password123' },
    };
    const { email: e, password: p } = creds[role];
    setEmail(e);
    setPassword(p);
    setLoading(true);
    try {
      await login(e, p);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

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
            Your Career Journey <br />
            <span className="gradient-text">Starts Here.</span>
          </motion.h1>
          <motion.p
            className="text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Access AI-powered career guidance, placement readiness tracking, mock tests, and a vibrant community — all in one futuristic platform.
          </motion.p>

          {/* Stats */}
          <motion.div
            className="mt-10 grid grid-cols-3 gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[
              { val: '95%', label: 'Placement Rate' },
              { val: '20+', label: 'Career Modules' },
              { val: '500+', label: 'Mock Questions' },
            ].map(s => (
              <div key={s.label} className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold gradient-text">{s.val}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="text-xs relative z-10" style={{ color: 'var(--text-muted)' }}>
          © 2026 STUGUIDE X · Built for the Next Generation
        </div>
      </motion.div>

      {/* Right Panel – Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div className="text-lg font-bold gradient-text">STUGUIDE X</div>
          </div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
          <p className="mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in to continue your journey · <Link to="/register" className="font-medium" style={{ color: 'var(--accent-indigo)' }}>Create account</Link>
          </p>

          {error && (
            <motion.div
              className="mb-4 px-4 py-3 rounded-xl text-sm badge-rose"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@university.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
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

            <div className="flex justify-end -mt-2">
              <Link to="/forgot-password" className="text-xs font-medium" style={{ color: 'var(--accent-indigo)' }}>
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary w-full justify-center py-3 text-base"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Zap size={16} /> Sign In</>}
            </motion.button>
          </form>

          {/* Demo Login */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Quick Demo Access</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'Student', color: '#6366f1' },
                { role: 'PlacementOfficer', color: '#f59e0b' },
                { role: 'Admin', color: '#f43f5e' },
              ].map(({ role, color }) => (
                <motion.button
                  key={role}
                  className="btn btn-secondary text-xs py-2 justify-center"
                  style={{ borderColor: color + '40', color }}
                  onClick={() => demoLogin(role)}
                  disabled={loading}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {role === 'PlacementOfficer' ? 'Officer' : role}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
