import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { GraduationCap, Loader2, MailCheck } from 'lucide-react';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verify = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.put(`/api/auth/verify-email/${token}`);
      localStorage.setItem('sg_token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Email verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="bg-mesh" />
      <motion.div className="w-full max-w-md glass-high rounded-2xl p-8 relative z-10 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mb-5 mx-auto">
          <GraduationCap size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold">Verify email</h1>
        <p className="text-sm mt-2 mb-6" style={{ color: 'var(--text-secondary)' }}>Confirm this account so the placement cell can trust communication status.</p>
        {error && <div className="mb-4 badge badge-rose w-full justify-center normal-case">{error}</div>}
        <button className="btn btn-primary w-full justify-center py-3" onClick={verify} disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><MailCheck size={16} /> Verify and continue</>}
        </button>
        <Link to="/login" className="block text-center text-sm mt-5" style={{ color: 'var(--accent-indigo)' }}>Back to login</Link>
      </motion.div>
    </div>
  );
}
