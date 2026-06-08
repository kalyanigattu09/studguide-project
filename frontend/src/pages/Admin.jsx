import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  BarChart2, FileText, Download, TrendingUp, Award, Users, Filter,
  Search, ShieldAlert, Cpu, Sparkles, Building, GraduationCap, CheckCircle, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from 'recharts';

export default function Admin() {
  const [students, setStudents] = useState([]);
  const [cgpaCutoff, setCgpaCutoff] = useState(6.0);
  const [exportingType, setExportingType] = useState(null); // 'PDF' | 'Excel'
  const [loading, setLoading] = useState(true);

  // Recruitment Trends statistics
  const packageDistribution = [
    { range: '5-8 LPA', count: 120 },
    { range: '8-12 LPA', count: 85 },
    { range: '12-18 LPA', count: 42 },
    { range: '18-25 LPA', count: 18 },
    { range: '25+ LPA', count: 11 }
  ];

  const branchConversions = [
    { branch: 'CSE', Placed: 92, Max: 42.5, Avg: 18.5 },
    { branch: 'ECE', Placed: 78, Max: 28.0, Avg: 12.2 },
    { branch: 'EEE', Placed: 65, Max: 18.0, Avg: 9.8 },
    { branch: 'ME', Placed: 52, Max: 12.0, Avg: 7.5 },
    { branch: 'CE', Placed: 45, Max: 10.5, Avg: 6.8 }
  ];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/mocktest/leaderboard');
      if (data.success) {
        setStudents(data.data);
      }
    } catch (err) {
      console.warn("Failed loading analytics datasets, using seeds.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type) => {
    setExportingType(type);
    setTimeout(() => {
      setExportingType(null);
      // Trigger a direct simulated browser download
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(students, null, 2)], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `STUGUIDE_X_${type === 'PDF' ? 'Placement_Report.pdf' : 'Rankings_Ledger.xlsx'}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 2000);
  };

  // Filter students based on interactive CGPA slider
  const eligibleStudents = students.filter(s => s.cgpa >= cgpaCutoff);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 skeleton w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-72 skeleton" />
          <div className="h-72 skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            System <span className="gradient-text">Analytics & Intelligence</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Monitor recruiter salary package distributions, branch placement percentages, and generate professional PDF/Excel reports.
          </p>
        </div>

        {/* Exporters buttons */}
        <div className="flex gap-2">
          <button className="btn btn-secondary py-2" onClick={() => handleExport('Excel')} disabled={!!exportingType}>
            {exportingType === 'Excel' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
            Export Excel Rankings
          </button>
          <button className="btn btn-primary py-2" onClick={() => handleExport('PDF')} disabled={!!exportingType}>
            {exportingType === 'PDF' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
            Export PDF Placement Report
          </button>
        </div>
      </div>

      {/* Dynamic Exporters notification loaders popup */}
      <AnimatePresence>
        {exportingType && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 glass-high p-4 rounded-xl flex items-center gap-3 border border-indigo-500/30"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Loader2 size={18} className="animate-spin text-indigo-400" />
            <div className="text-xs font-semibold text-white">
              Generating STUGUIDE X {exportingType} Ledger...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Salary packages bar graph */}
        <div className="card glass">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-400" /> Recruitment packages Distributions</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={packageDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} name="Recruiters Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch conversion conversions graph */}
        <div className="card glass">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2"><BarChart2 size={16} className="text-indigo-400" /> Branch Wise packages Comparisons</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={branchConversions}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-indigo)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--accent-indigo)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="branch" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Avg" stroke="var(--accent-indigo)" fillOpacity={1} fill="url(#colorAvg)" name="Average packages (LPA)" />
                <Area type="monotone" dataKey="Max" stroke="var(--accent-rose)" fill="transparent" name="Highest packages (LPA)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recruiter Placement Eligibilities Checker */}
      <div className="card glass">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Student Eligibility Filter Panel</h2>
            <p className="text-xs text-muted mt-0.5">Filter students by cumulative CGPA to preview elegible batches.</p>
          </div>
          
          {/* CGPA Slider cutoff */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-3 rounded-2xl w-full md:w-80">
            <span className="text-xs font-bold text-white whitespace-nowrap">Cutoff: {cgpaCutoff.toFixed(1)} CGPA</span>
            <input
              type="range"
              min="5.0"
              max="10.0"
              step="0.1"
              className="w-full accent-indigo-500"
              value={cgpaCutoff}
              onChange={e => setCgpaCutoff(parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-0">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-muted px-4">Student</th>
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-muted text-center">CGPA</th>
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-muted text-center">Average Mock</th>
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-muted text-center">Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {eligibleStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-muted italic">No students satisfy this CGPA criteria.</td>
                </tr>
              ) : (
                eligibleStudents.map(student => (
                  <tr key={student.userId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-xs">{student.name}</div>
                          <div className="text-xxs text-muted" style={{ fontSize: '10px' }}>Roll: {student.rollNo} · Branch: {student.branch}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center font-bold text-xs text-cyan-400">
                     {(student.cgpa ?? 0).toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-indigo" style={{ fontSize: '9px' }}>{student.avgMockScore}%</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="badge badge-green text-xxs flex items-center gap-1 mx-auto w-max" style={{ fontSize: '9px' }}>
                        <CheckCircle size={10} /> Eligible
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
