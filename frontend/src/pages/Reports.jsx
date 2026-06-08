import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart2, Download, FileSpreadsheet, FileText, Loader2, ShieldCheck, Users } from 'lucide-react';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/stats');
      if (data.success) setStats(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Reports are available to Admin and Placement Officer roles.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type) => {
    setExporting(type);
    setError('');
    try {
      const { data } = await axios.get(`/api/admin/reports/${type}`, { responseType: 'blob' });
      const href = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = href;
      link.download = type === 'excel' ? 'placement_success_report.csv' : 'placement_performance_report.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not export this report.');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 skeleton" />
          <div className="h-28 skeleton" />
          <div className="h-28 skeleton" />
          <div className="h-28 skeleton" />
        </div>
        <div className="h-80 skeleton" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Report <span className="gradient-text">Center</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Generate student, placement, and performance reports for placement-cell review.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-secondary py-2" onClick={() => downloadReport('excel')} disabled={!!exporting}>
            {exporting === 'excel' ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            Export CSV
          </button>
          <button className="btn btn-primary py-2" onClick={() => downloadReport('pdf')} disabled={!!exporting}>
            {exporting === 'pdf' ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            Export HTML Report
          </button>
        </div>
      </div>

      {error && <div className="badge badge-rose normal-case justify-start w-full">{error}</div>}

      {stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Students', value: stats.studentsCount, icon: Users, color: 'text-indigo-400' },
              { label: 'Companies', value: stats.companiesCount, icon: ShieldCheck, color: 'text-emerald-400' },
              { label: 'Applications', value: stats.applicationsCount, icon: FileText, color: 'text-cyan-400' },
              { label: 'Placement Ratio', value: `${stats.placementRatio}%`, icon: BarChart2, color: 'text-amber-400' }
            ].map(({ label, value, icon: Icon, color }) => (
              <div className="card-kpi glass" key={label}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <div className="text-3xl font-bold mt-1">{value}</div>
                  </div>
                  <Icon size={24} className={color} />
                </div>
              </div>
            ))}
          </div>

          <div className="card glass">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Download size={18} className="text-indigo-400" />
              Activity Audit
            </h2>
            <div className="space-y-3">
              {stats.activityLogs.map((log, index) => (
                <motion.div
                  key={`${log.user}-${log.time}`}
                  className="p-4 rounded-xl"
                  style={{ background: 'var(--surface-high)' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="font-semibold">{log.user}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{log.action}</div>
                  <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{log.time}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card glass py-20 text-center" style={{ color: 'var(--text-muted)' }}>
          Report data is not available for this role.
        </div>
      )}
    </div>
  );
}
