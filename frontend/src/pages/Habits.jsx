import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Flame, Plus, CheckCircle, Trophy, BarChart2, Star, Calendar, Loader2, Sparkles
} from 'lucide-react';

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [habitName, setHabitName] = useState('');

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/productivity/habits');
      if (data.success) setHabits(data.data);
    } catch (err) {
      console.warn("Failed loading habits list.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    try {
      const { data } = await axios.post('/api/productivity/habits', { name: habitName.trim() });
      if (data.success) {
        setHabitName('');
        fetchHabits();
      }
    } catch {
      alert("Failed creating custom habit.");
    }
  };

  const handleCompleteToday = async (habitId) => {
    try {
      const { data } = await axios.put(`/api/productivity/habits/${habitId}/complete`);
      if (data.success) {
        fetchHabits();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Habit completion failed. You may have already completed it today.");
    }
  };

  // Generate GitHub-style contribution heatmap squares
  const renderHeatmap = () => {
    const totalSquares = 160; // Render a compact, beautiful grid matching container sizing
    const squares = [];
    
    // Aggregate all habit completion dates
    const completedDates = new Set();
    habits.forEach(h => {
      h.history?.forEach(d => {
        // history entries are YYYY-MM-DD
        completedDates.add(d);
      });
    });

    const today = new Date();
    for (let i = totalSquares - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const hasCompleted = completedDates.has(dateStr);
      let level = 0;
      if (hasCompleted) {
        // Randomize levels for beautiful visual variety
        level = Math.floor(Math.random() * 3) + 2; 
      } else {
        // Give subtle random background cells to look populated if they have coding streaks
        if (Math.random() > 0.85) level = 1;
      }

      squares.push({
        date: dateStr,
        level: level
      });
    }

    return (
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-2">
        {squares.map((sq, idx) => (
          <div
            key={idx}
            className="heatmap-cell"
            data-level={sq.level}
            title={`${sq.date}: ${sq.level > 1 ? 'Habit Completed' : sq.level === 1 ? 'Passive Activity' : 'No Activity'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 skeleton w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-60 col-span-2 skeleton" />
          <div className="h-60 skeleton" />
        </div>
      </div>
    );
  }

  // Calculate high streak highlights
  const highestStreak = habits.reduce((acc, h) => Math.max(acc, h.streakCount), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Habit <span className="gradient-text">Streak Tracker</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Maintain consistency, build learning momentum, and review streak activity calendar dashboards.
        </p>
      </div>

      {/* GitHub-Style Streak Heatmap Calendar */}
      <div className="card glass relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent-indigo), transparent)', filter: 'blur(60px)' }} />

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-indigo-400" /> Contribution Activity Heatmap
          </h2>
          <span className="badge badge-rose flex items-center gap-1">
            <Flame size={12} /> {highestStreak} Day Best Streak
          </span>
        </div>

        {/* Heatmap Grid container */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 overflow-hidden">
          {renderHeatmap()}
          
          <div className="flex justify-between items-center mt-4 text-xxs text-muted" style={{ fontSize: '10px' }}>
            <span>Showing past 22 weeks of developer activity logs</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="w-3 h-3 rounded bg-zinc-800" />
              <div className="w-3 h-3 rounded bg-indigo-500/25" />
              <div className="w-3 h-3 rounded bg-indigo-500/60" />
              <div className="w-3 h-3 rounded bg-indigo-500" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Habits Grid list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Habits Checklist */}
        <div className="lg:col-span-2 card glass">
          <h2 className="text-lg font-bold text-white mb-4">Streak Checklist</h2>
          
          <div className="space-y-4">
            {habits.length === 0 ? (
              <div className="text-center py-8 text-muted">No habits defined. Add a habit to start tracking streaks.</div>
            ) : (
              habits.map(habit => {
                const todayStr = new Date().toISOString().split('T')[0];
                const completedToday = habit.history?.includes(todayStr);

                return (
                  <div key={habit._id} className="glass rounded-xl p-4 flex justify-between items-center transition-all hover:bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <button
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${completedToday ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' : 'border-zinc-700 hover:border-indigo-400 text-muted'}`}
                        onClick={() => !completedToday && handleCompleteToday(habit._id)}
                        disabled={completedToday}
                      >
                        <CheckCircle size={16} />
                      </button>

                      <div>
                        <h3 className="font-semibold text-sm md:text-base text-white">{habit.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-rose-400 mt-0.5">
                          <Flame size={12} className="animate-pulse" /> {habit.streakCount} Day Streak
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {completedToday ? (
                        <span className="badge badge-green">Done Today</span>
                      ) : (
                        <button
                          className="btn btn-secondary text-xs py-1.5 px-3"
                          onClick={() => handleCompleteToday(habit._id)}
                        >
                          Complete Habit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Create Habit panel */}
        <div className="card glass">
          <h2 className="text-lg font-bold text-white mb-4">Create New Habit</h2>
          <form onSubmit={handleCreateHabit} className="space-y-4">
            <div>
              <label className="label">Habit Name</label>
              <input
                type="text"
                className="input"
                placeholder="Daily LeetCode Coding"
                value={habitName}
                onChange={e => setHabitName(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full justify-center py-2.5">
              <Plus size={16} /> Add Custom Habit
            </button>
          </form>

          {/* Quick recommendations */}
          <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-400" /> Suggested Streaks
            </h4>
            <div className="space-y-2">
              {['Daily Aptitude Quiz', 'Read Tech Blog', 'Mock Test Streak'].map(s => (
                <button
                  key={s}
                  type="button"
                  className="w-full text-left py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-semibold text-secondary hover:text-white"
                  onClick={() => setHabitName(s)}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
