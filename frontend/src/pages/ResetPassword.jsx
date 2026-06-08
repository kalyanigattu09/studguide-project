import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { GraduationCap, Loader2, Lock, ShieldCheck } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.put(`/api/auth/reset-password/${token}`, { password });
      localStorage.setItem('sg_token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed.');
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
        <h1 className="text-2xl font-bold">Choose a new password</h1>
        <p className="text-sm mt-2 mb-6" style={{ color: 'var(--text-secondary)' }}>Use at least 6 characters.</p>
        {error && <div className="mb-4 badge badge-rose w-full justify-start normal-case">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input pl-10" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" minLength={6} required />
          </div>
          <button className="btn btn-primary w-full justify-center py-3" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><ShieldCheck size={16} /> Reset and sign in</>}
          </button>
        </form>
        <Link to="/login" className="block text-center text-sm mt-5" style={{ color: 'var(--accent-indigo)' }}>Back to login</Link>
      </motion.div>
    </div>
  );
}
