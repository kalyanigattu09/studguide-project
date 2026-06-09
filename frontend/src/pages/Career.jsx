import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Target, Zap, ArrowRight, CheckCircle2, AlertTriangle, BookOpen,
  Compass, Map, Loader2, Sparkles, BrainCircuit, ExternalLink, HelpCircle
} from 'lucide-react';
import apiClient from '../utils/apiClient';

export default function Career() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [roadmap, setRoadmap] = useState([]);
  const [gaps, setGaps] = useState(null);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const { data } = await apiClient.get('/api/guidance/roles');
      if (data.success) {
        setRoles(data.data);
        if (data.data.length > 0) {
          // Select first role by default
          setSelectedRole(data.data[0].id);
          fetchRoadmapAndGaps(data.data[0].id);
        }
      }
    } catch (err) {
      console.warn("Failed fetching career roles. Backend may be seeding.", err);
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchRoadmapAndGaps = async (roleId) => {
    try {
      setLoadingRoadmap(true);
      const { data: rData } = await apiClient.get(`/api/guidance/roadmap/${encodeURIComponent(roleId)}`);
      const { data: gData } = await apiClient.post('/api/guidance/gaps', { role: roleId });
      
      if (rData.success) setRoadmap(rData.roadmap);
      if (gData.success) setGaps(gData);
    } catch (err) {
      console.error("Failed fetching roadmap data.", err);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    fetchRoadmapAndGaps(roleId);
  };

  if (loadingRoles) {
    return (
      <div className="space-y-6">
        <div className="h-12 skeleton w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 skeleton" />
          <div className="h-40 skeleton" />
          <div className="h-40 skeleton" />
        </div>
      </div>
    );
  }

  const matchPercent = gaps?.matchPercentage || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          AI Career <span className="gradient-text">Guidance & Roadmaps</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Utilizes automated Directed Graph traversal to analyze skill prerequisites and map step-by-step career path success.
        </p>
      </div>

      {/* Role Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map(r => {
          const isSelected = selectedRole === r.id;
          return (
            <motion.div
              key={r.id}
              className={`card glass cursor-pointer flex flex-col justify-between p-6 border transition-all ${isSelected ? 'glow-indigo' : ''}`}
              style={{
                borderColor: isSelected ? 'var(--accent-indigo)' : 'var(--border)',
                background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--surface)'
              }}
              onClick={() => handleRoleChange(r.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="badge badge-indigo">{r.duration} Plan</span>
                  <Compass size={20} className={isSelected ? "text-indigo-400" : "text-muted"} />
                </div>
                <h3 className="text-lg font-bold text-white mt-3">{r.name}</h3>
                <p className="text-xs text-secondary mt-1.5 leading-relaxed">{r.desc}</p>
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-indigo-400">
                <span>View roadmap graph</span>
                <ArrowRight size={14} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Roadmap Graph & Gaps Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Interactive Node Map */}
        <div className="lg:col-span-2 card glass relative overflow-hidden min-h-[500px]">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--accent-indigo), transparent)', filter: 'blur(60px)' }} />

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Map size={18} className="text-indigo-400" /> Interactive Directed Node Graph
            </h2>
            <div className="flex gap-4 text-xxs font-medium" style={{ fontSize: '10px' }}>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-400" /> Acquired</span>
              <span className="flex items-center gap-1.5"><Zap size={12} className="text-indigo-400" /> Milestone / Next</span>
            </div>
          </div>

          {loadingRoadmap ? (
            <div className="h-[400px] flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-indigo-400" />
              <p className="text-sm text-muted">Analyzing Directed Graph pathways...</p>
            </div>
          ) : (
            <div className="relative pl-8 md:pl-16 py-4 space-y-8">
              {/* Connecting line */}
              <div className="absolute left-[47px] md:left-[79px] top-6 bottom-6 w-0.5" style={{ background: 'linear-gradient(to bottom, #10b981 30%, #6366f1 70%, var(--border) 100%)' }} />

              {roadmap.map((node, index) => {
                // node is an object: { name, info, connections } from CareerGraph.getRoadmap()
                const nodeName = node.name || String(node);
                const isAcquired = gaps?.acquiredSkills?.some(
                  s => s.toLowerCase().trim().includes(nodeName.toLowerCase().trim())
                );
                const nodeColor = isAcquired ? 'var(--accent-emerald)' : 'var(--accent-indigo)';
                const badgeStyle = isAcquired ? 'badge-green' : 'badge-indigo';
                
                return (
                  <motion.div
                    key={index}
                    className="relative flex items-start gap-4 md:gap-8 group"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    {/* Node Circle */}
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm z-10 transition-all group-hover:scale-110 shadow-glow relative bg-secondary"
                      style={{
                        borderColor: nodeColor,
                        color: nodeColor,
                        boxShadow: `0 0 16px ${nodeColor}25`
                      }}
                    >
                      {isAcquired ? <CheckCircle2 size={16} /> : index + 1}
                    </div>

                    {/* Node details */}
                    <div className="glass rounded-2xl p-4 flex-1 border border-white/5 transition-all group-hover:border-white/10 max-w-lg">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-white text-sm md:text-base">{nodeName}</h4>
                        <span className={`badge ${badgeStyle} text-xxs`} style={{ fontSize: '9px' }}>
                          {isAcquired ? 'Acquired' : 'Target Module'}
                        </span>
                      </div>
                      <p className="text-xs text-secondary mt-1 leading-relaxed">
                        {node.info?.desc || `Master the structural foundations of ${nodeName}. Key paradigms include algorithmic efficiencies and standard industry frameworks.`}
                      </p>
                      
                      {/* Recommendations Links */}
                      {!isAcquired && (
                        <div className="mt-3 pt-3 border-t border-white/5 flex gap-3 text-xxs font-semibold uppercase tracking-wider" style={{ fontSize: '9px' }}>
                          <a href="https://takeuforward.org" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                            <BookOpen size={10} /> Practice Sheet <ExternalLink size={8} />
                          </a>
                          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                            <Sparkles size={10} /> Lecture Video <ExternalLink size={8} />
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Skill Gap Dashboard */}
        <div className="space-y-6">
          {/* Match Percentage circular widget */}
          <div className="card glass text-center space-y-4">
            <h2 className="text-lg font-bold text-white">Skill Compatibility Index</h2>
            
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              {/* SVG Radial Gauge */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="60" className="stroke-current opacity-10 text-white" strokeWidth="8" fill="transparent" />
                <circle cx="72" cy="72" r="60" className="stroke-current text-indigo-500" strokeWidth="8" fill="transparent"
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - matchPercent / 100)}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white">{matchPercent}%</span>
                <span className="text-xxs text-muted uppercase tracking-wider" style={{ fontSize: '8px' }}>Matched</span>
              </div>
            </div>
            
            <p className="text-xs text-secondary mt-2 px-2">
              Based on the {gaps?.totalSteps || 0} sequential graph dependencies mapped for <span className="font-semibold text-indigo-400">{selectedRole}</span>.
            </p>
          </div>

          {/* Gap breakdown list */}
          <div className="card glass space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BrainCircuit size={18} className="text-indigo-400" /> Skill Gaps Breakdown
            </h2>

            {/* Acquired Skills */}
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <CheckCircle2 size={12} /> Mapped Strengths
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(!gaps?.acquiredSkills || gaps.acquiredSkills.length === 0) ? (
                  <span className="text-xs text-muted">No matching skills found in your profile.</span>
                ) : (
                  gaps.acquiredSkills.map((s, i) => (
                    // acquiredSkills are raw strings from student profile
                    <span key={i} className="badge badge-green text-xxs" style={{ fontSize: '9px' }}>{s}</span>
                  ))
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle size={12} /> Target Growth Areas
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(!gaps?.missingSkills || gaps.missingSkills.length === 0) ? (
                  <span className="text-xs text-muted">You have 100% technology alignment for this career pathway!</span>
                ) : (
                  gaps.missingSkills.map((s, i) => (
                    // missingSkills are objects: { name, info } from careerGraph.findSkillGaps()
                    <span key={i} className="badge badge-amber text-xxs" style={{ fontSize: '9px' }}>{s.name || s}</span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
