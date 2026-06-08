import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { GraduationCap, Loader2, Mail, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not generate reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="bg-mesh" />
      <motion.div className="w-full max-w-md glass-high rounded-2xl p-8 relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mb-5">
          <GraduationCap size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-sm mt-2 mb-6" style={{ color: 'var(--text-secondary)' }}>
          Enter your account email. In this local demo, the API returns a reset token you can open directly.
        </p>

        {error && <div className="mb-4 badge badge-rose w-full justify-start normal-case">{error}</div>}
        {result && (
          <div className="mb-4 rounded-xl p-4 border" style={{ borderColor: 'rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.08)' }}>
            <p className="text-sm text-emerald-400 font-semibold">{result.message}</p>
            {result.devResetToken && (
              <Link className="btn btn-primary mt-3 py-2 w-full justify-center" to={`/reset-password/${result.devResetToken}`}>
                Continue to reset
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input pl-10" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@university.edu" required />
          </div>
          <button className="btn btn-primary w-full justify-center py-3" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Generate reset link</>}
          </button>
        </form>
        <Link to="/login" className="block text-center text-sm mt-5" style={{ color: 'var(--accent-indigo)' }}>Back to login</Link>
      </motion.div>
    </div>
  );
}
