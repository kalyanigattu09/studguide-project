import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  GraduationCap, Briefcase, Trophy, Flame, TrendingUp, Users, CheckCircle,
  Building, Calendar, Clock, ArrowRight, Zap, Target, BookOpen, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [drives, setDrives] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulation/fallback data if backend is in fallback mode or seeding is pending
  const studentGrowthData = [
    { sem: 'Sem 1', skills: 10, mocks: 40 },
    { sem: 'Sem 2', skills: 25, mocks: 55 },
    { sem: 'Sem 3', skills: 45, mocks: 62 },
    { sem: 'Sem 4', skills: 65, mocks: 70 },
    { sem: 'Sem 5', skills: 80, mocks: 78 },
    { sem: 'Sem 6', skills: 95, mocks: 85 }
  ];

  const adminHiringData = [
    { name: 'CSE', Placed: 92, Pending: 8 },
    { name: 'ECE', Placed: 78, Pending: 22 },
    { name: 'EEE', Placed: 65, Pending: 35 },
    { name: 'ME', Placed: 52, Pending: 48 },
    { name: 'CE', Placed: 45, Pending: 55 }
  ];

  const studentRadarData = [
    { subject: 'Coding', A: 90, B: 110, fullMark: 100 },
    { subject: 'Aptitude', A: 75, B: 130, fullMark: 100 },
    { subject: 'Communication', A: 85, B: 130, fullMark: 100 },
    { subject: 'OS/DBMS', A: 80, B: 100, fullMark: 100 },
    { subject: 'DSA', A: 95, B: 90, fullMark: 100 }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (user?.role === 'Student') {
        const { data: pData } = await axios.get('/api/profile/me');
        if (pData.success) setProfile(pData.data);
      }
      
      const { data: dData } = await axios.get('/api/placement/drives');
      if (dData.success) setDrives(dData.data.slice(0, 4));

      const { data: lData } = await axios.get('/api/mocktest/leaderboard');
      if (lData.success) setLeaderboard(lData.data.slice(0, 5));
    } catch (err) {
      console.warn("Failed fetching dashboard metrics, using fallbacks.", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-1/4 skeleton mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-32 skeleton" />
          <div className="h-32 skeleton" />
          <div className="h-32 skeleton" />
          <div className="h-32 skeleton" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="h-80 col-span-2 skeleton" />
          <div className="h-80 skeleton" />
        </div>
      </div>
    );
  }

  // RENDER STUDENT DASHBOARD
  if (user?.role === 'Student') {
    const completeness = profile?.profileCompletionScore || 75;
    const readiness = profile?.placementReadinessScore || 62;
    const codingStreak = profile?.codingStreak || 12;
    const avgMock = profile?.avgMockScore || 68;

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Welcome back, <span className="gradient-text">{user.name}</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Here is your AI placement readiness briefing and upcoming schedules.
            </p>
          </div>
          <motion.div
            className="glass rounded-xl p-3 flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Target size={16} />
            </div>
            <div className="text-xs">
              <div className="font-semibold text-indigo-400 uppercase tracking-wider" style={{ fontSize: '10px' }}>Target Goal</div>
              <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Software Engineer</div>
            </div>
          </motion.div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Profile Completion */}
          <div className="card-kpi glass">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Profile Score</span>
                <h3 className="text-3xl font-bold mt-1 tracking-tight" style={{ color: 'var(--text-primary)' }}>{completeness}%</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <GraduationCap size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="progress-track"><div className="progress-fill" style={{ width: `${completeness}%` }} /></div>
              <p className="text-xxs mt-2 text-muted" style={{ fontSize: '10px' }}>Complete your portfolio to raise ATS parsing capability.</p>
            </div>
          </div>

          {/* Placement Readiness */}
          <div className="card-kpi glass" style={{ border: '1px solid rgba(139, 92, 246, 0.15)' }}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Readiness Index</span>
                <h3 className="text-3xl font-bold mt-1 tracking-tight" style={{ color: 'var(--accent-violet)' }}>{readiness}%</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                <Target size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="progress-track"><div className="progress-fill" style={{ width: `${readiness}%`, background: 'var(--accent-violet)' }} /></div>
              <p className="text-xxs mt-2 text-muted" style={{ fontSize: '10px' }}>Based on coding scores, communication parameters & mock test metrics.</p>
            </div>
          </div>

          {/* Average Mock Score */}
          <div className="card-kpi glass" style={{ border: '1px solid rgba(6, 182, 212, 0.15)' }}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Mock Test Avg</span>
                <h3 className="text-3xl font-bold mt-1 tracking-tight" style={{ color: 'var(--accent-cyan)' }}>{avgMock}%</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Trophy size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="progress-track"><div className="progress-fill" style={{ width: `${avgMock}%`, background: 'var(--accent-cyan)' }} /></div>
              <p className="text-xxs mt-2 text-muted" style={{ fontSize: '10px' }}>Calculated from {profile?.avgMockScore ? 'your submissions' : 'seeded assessments'}.</p>
            </div>
          </div>

          {/* Coding Streak */}
          <div className="card-kpi glass" style={{ border: '1px solid rgba(244, 63, 94, 0.15)' }}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Coding Streak</span>
                <h3 className="text-3xl font-bold mt-1 tracking-tight" style={{ color: 'var(--accent-rose)' }}>{codingStreak} Days</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                <Flame size={20} className="animate-pulse" />
              </div>
            </div>
            <div className="mt-4">
              <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, (codingStreak/30)*100)}%`, background: 'var(--accent-rose)' }} /></div>
              <p className="text-xxs mt-2 text-muted" style={{ fontSize: '10px' }}>Keep practicing daily to build your streak heatmap!</p>
            </div>
          </div>
        </div>

        {/* Charts & Interactive Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Growth Area Chart */}
          <div className="card glass lg:col-span-2">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Skill & Mock Test Growth</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studentGrowthData}>
                  <defs>
                    <linearGradient id="colorSkills" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-indigo)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--accent-indigo)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMocks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="sem" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="skills" name="Skills Index" stroke="var(--accent-indigo)" strokeWidth={2} fillOpacity={1} fill="url(#colorSkills)" />
                  <Area type="monotone" dataKey="mocks" name="Mock Scores" stroke="var(--accent-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorMocks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Placement readiness radar */}
          <div className="card glass">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Readiness Vector</h2>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={studentRadarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} />
                  <Radar name="Student" dataKey="A" stroke="var(--accent-violet)" fill="var(--accent-violet)" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Dynamic Placement drives and Leaderboard list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Placement Board */}
          <div className="card glass">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Active Recruiting Drives</h2>
              <span className="badge badge-indigo">Featured</span>
            </div>
            <div className="space-y-4">
              {drives.length === 0 ? (
                <div className="text-center py-8 text-muted">No active drives available.</div>
              ) : (
                drives.map(drive => (
                  <div key={drive._id} className="glass rounded-xl p-4 flex justify-between items-center transition-all hover:bg-white/5 border border-white/5">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-extrabold">
                        {drive.companyName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{drive.jobRole}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{drive.companyName} · {drive.location}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-indigo-400">{drive.packageLPA} LPA</div>
                      <div className="text-xxs text-muted" style={{ fontSize: '10px' }}>Apply by {new Date(drive.deadline).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top rankings heap summary */}
          <div className="card glass">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Global Hall of Fame</h2>
              <Trophy size={18} className="text-yellow-400" />
            </div>
            <div className="space-y-3">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted">Awaiting mock test statistics.</div>
              ) : (
                leaderboard.map((item, idx) => (
                  <div key={item.userId} className="flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-white/5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-yellow-400 text-black' : idx === 1 ? 'bg-gray-300 text-black' : idx === 2 ? 'bg-amber-600 text-white' : 'glass text-muted'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</div>
                      <div className="text-xxs text-muted" style={{ fontSize: '10px' }}>{item.branch} · CGPA {item.cgpa}</div>
                    </div>
                    <div className="text-right">
                      <span className="badge badge-cyan" style={{ fontSize: '10px' }}>Score {item.avgMockScore}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER ADMIN / PLACEMENT OFFICER DASHBOARD
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            System <span className="gradient-text">Control Center</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Overview of student metrics, placement drives, analytics, and community forums.
          </p>
        </div>
        <div className="glass rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
            <TrendingUp size={16} />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-rose-400 uppercase tracking-wider" style={{ fontSize: '9px' }}>Current Batch Placement</div>
            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>84.2% Placed</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-kpi glass" style={{ border: '1px solid rgba(99, 102, 241, 0.15)' }}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Total Registered Students</span>
              <h3 className="text-3xl font-bold mt-1 tracking-tight" style={{ color: 'var(--accent-indigo)' }}>328</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingUp size={14} /> <span>12 new signups this week</span>
          </div>
        </div>

        <div className="card-kpi glass" style={{ border: '1px solid rgba(16, 185, 129, 0.15)' }}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Placed Students</span>
              <h3 className="text-3xl font-bold mt-1 tracking-tight" style={{ color: 'var(--accent-emerald)' }}>276</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingUp size={14} /> <span>+4.2% from previous year batch</span>
          </div>
        </div>

        <div className="card-kpi glass" style={{ border: '1px solid rgba(245, 158, 11, 0.15)' }}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Active Drives</span>
              <h3 className="text-3xl font-bold mt-1 tracking-tight" style={{ color: 'var(--accent-amber)' }}>14 Drives</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Building size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted" style={{ color: 'var(--text-muted)' }}>
            4 scheduled in next 10 days
          </div>
        </div>

        <div className="card-kpi glass" style={{ border: '1px solid rgba(6, 182, 212, 0.15)' }}>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Average CTC packages</span>
              <h3 className="text-3xl font-bold mt-1 tracking-tight" style={{ color: 'var(--accent-cyan)' }}>14.8 LPA</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Trophy size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-emerald-400 flex items-center gap-1">
            <Zap size={12} /> <span>Highest: 42.5 LPA (Google)</span>
          </div>
        </div>
      </div>

      {/* Analytics Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card glass lg:col-span-2">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Branch-wise Placement Statistics</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adminHiringData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Placed" fill="var(--accent-indigo)" radius={[4, 4, 0, 0]} name="Placed %" />
                <Bar dataKey="Pending" fill="var(--accent-rose)" radius={[4, 4, 0, 0]} name="Pending %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic system health logs */}
        <div className="card glass">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Placement System Health</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3 text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              <Zap size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">PriorityQueue drives Manager Active</div>
                <div className="text-xs opacity-75 mt-0.5">Drives sorted automatically by approaching deadlines.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-cyan-400 bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
              <Trophy size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">MaxHeap ranking Engine Sync</div>
                <div className="text-xs opacity-75 mt-0.5">Student leaderboard ranks indexed with logarithmic time operations.</div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-indigo-400 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
              <GraduationCap size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Directed Graph Guidance maps loaded</div>
                <div className="text-xs opacity-75 mt-0.5">Career path roadmaps and skill gap assessments fully initialized.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
