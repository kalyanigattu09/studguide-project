import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../utils/apiClient';
import {
  Trophy, Flame, GraduationCap, Medal, Star, Shield, Filter, Search, Award
} from 'lucide-react';

export default function Leaderboard() {
  const [rankings, setRankings] = useState([]);
  const [branchFilter, setBranchFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/mocktest/leaderboard');
      if (data.success) setRankings(data.data);
    } catch (err) {
      console.warn("Failed loading MaxHeap leaderboard ranks.", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRankings = rankings.filter(r => 
    branchFilter === 'All' ? true : r.branch === branchFilter
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 skeleton w-1/4" />
        <div className="space-y-3">
          <div className="h-16 skeleton rounded-xl" />
          <div className="h-16 skeleton rounded-xl" />
          <div className="h-16 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  // Top 3 winners variables
  const goldUser = filteredRankings[0];
  const silverUser = filteredRankings[1];
  const bronzeUser = filteredRankings[2];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            System <span className="gradient-text">Hall of Fame</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Student ranking and benchmark rankings calculated dynamically using our background MaxHeap service.
          </p>
        </div>

        {/* Branch Filter tabs */}
        <div className="flex gap-1.5 glass p-1 rounded-xl">
          {['All', 'CSE', 'ECE', 'ME'].map(br => (
            <button
              key={br}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${branchFilter === br ? 'bg-indigo-500 text-white' : 'text-secondary hover:text-white'}`}
              onClick={() => setBranchFilter(br)}
            >
              {br}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Renders (Visual Highlight for Top 3) */}
      {filteredRankings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6 items-end">
          
          {/* Silver Podium - 2nd place */}
          {silverUser && (
            <motion.div
              className="glass rounded-2xl p-6 text-center border-t-2 border-gray-300 relative flex flex-col justify-between h-[220px] order-2 md:order-1"
              whileHover={{ y: -4 }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-black font-extrabold text-xs shadow-glow">
                2
              </div>
              <div className="mt-2">
                <Medal className="mx-auto text-gray-300 mb-2" size={24} />
                <h3 className="font-extrabold text-white text-base truncate">{silverUser.name}</h3>
                <span className="text-xxs text-indigo-400 font-semibold">{silverUser.rollNo} · {silverUser.branch}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-around text-xs">
                <div><span className="text-muted block">Avg Score</span> <span className="font-bold text-white">{silverUser.avgMockScore}%</span></div>
                <div><span className="text-muted block">CGPA</span> <span className="font-bold text-cyan-400">{silverUser.cgpa}</span></div>
              </div>
            </motion.div>
          )}

          {/* Gold Podium - 1st place */}
          {goldUser && (
            <motion.div
              className="glass rounded-2xl p-8 text-center border-t-2 border-yellow-400 relative flex flex-col justify-between h-[250px] shadow-glow glow-indigo order-1 md:order-2"
              whileHover={{ y: -4 }}
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-black text-sm shadow-glow glow-indigo">
                1
              </div>
              <div className="mt-2">
                <Trophy className="mx-auto text-yellow-400 mb-2" size={32} />
                <h3 className="font-black text-white text-lg truncate">{goldUser.name}</h3>
                <span className="text-xxs text-indigo-400 font-semibold">{goldUser.rollNo} · {goldUser.branch}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-around text-xs">
                <div><span className="text-muted block font-semibold">Avg Score</span> <span className="font-bold text-indigo-400 text-sm">{goldUser.avgMockScore}%</span></div>
                <div><span className="text-muted block font-semibold">CGPA</span> <span className="font-bold text-cyan-400 text-sm">{goldUser.cgpa}</span></div>
              </div>
            </motion.div>
          )}

          {/* Bronze Podium - 3rd place */}
          {bronzeUser && (
            <motion.div
              className="glass rounded-2xl p-6 text-center border-t-2 border-amber-600 relative flex flex-col justify-between h-[200px] order-3"
              whileHover={{ y: -4 }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-extrabold text-xs shadow-glow">
                3
              </div>
              <div className="mt-2">
                <Star className="mx-auto text-amber-600 mb-2" size={24} />
                <h3 className="font-extrabold text-white text-base truncate">{bronzeUser.name}</h3>
                <span className="text-xxs text-indigo-400 font-semibold">{bronzeUser.rollNo} · {bronzeUser.branch}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-around text-xs">
                <div><span className="text-muted block">Avg Score</span> <span className="font-bold text-white">{bronzeUser.avgMockScore}%</span></div>
                <div><span className="text-muted block">CGPA</span> <span className="font-bold text-cyan-400">{bronzeUser.cgpa}</span></div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Ranks scoreboard list */}
      <div className="card glass">
        <h2 className="text-lg font-bold text-white mb-4">Complete Student Standings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-muted px-4">Rank</th>
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-muted">Student Details</th>
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-muted text-center">CGPA</th>
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-muted text-center">Mock Average</th>
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-muted text-center">Coding Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredRankings.map((item, idx) => (
                <tr key={item.userId} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-bold text-sm" style={{ color: idx < 3 ? 'var(--accent-indigo)' : 'var(--text-muted)' }}>
                    #{idx + 1}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{item.name}</div>
                        <div className="text-xxs text-muted" style={{ fontSize: '10px' }}>Roll: {item.rollNo} · Branch: {item.branch}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-center font-bold text-sm text-cyan-400">
                    {(item.cgpa ?? 0).toFixed(2)}
                  </td>
                  <td className="py-4 text-center">
                    <span className="badge badge-indigo text-xs">{item.avgMockScore}%</span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="inline-flex items-center gap-1 font-semibold text-sm text-rose-400">
                      <Flame size={14} className="animate-pulse" /> {item.codingStreak} Days
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
