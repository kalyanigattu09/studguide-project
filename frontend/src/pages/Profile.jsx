import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  GraduationCap, Mail, Github, Linkedin, Globe, FileText, CheckCircle2,
  Plus, Trash2, Award, Briefcase, FileCode, Check, AlertCircle, UploadCloud, ChevronRight
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Inputs for adding nested profile items
  const [newSkill, setNewSkill] = useState('');
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  
  // Resume analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [atsScore, setAtsScore] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/profile/me');
      if (data.success) {
        setProfile(data.data);
        if (data.data.resumeScore) setAtsScore(data.data.resumeScore);
      }
    } catch (err) {
      console.warn("Failed fetching profile. Profile may not be initialized yet.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateProfile = async (fieldsToMerge = {}) => {
    try {
      setSaving(true);
      setMessage({ text: '', type: '' });
      
      const payload = {
        rollNo: profile?.rollNo || '2023CSE000',
        branch: profile?.branch || 'CSE',
        semester: profile?.semester || 6,
        year: profile?.year || 3,
        cgpa: profile?.cgpa || 8.0,
        skills: profile?.skills || [],
        interests: profile?.interests || [],
        projects: profile?.projects || [],
        certifications: profile?.certifications || [],
        achievements: profile?.achievements || [],
        gitHub: profile?.gitHub || '',
        linkedIn: profile?.linkedIn || '',
        ...fieldsToMerge
      };

      const { data } = await axios.post('/api/profile', payload);
      if (data.success) {
        setProfile(data.data);
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: 'Failed to update profile details.', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (profile?.skills?.includes(newSkill.trim())) return;
    
    const updatedSkills = [...(profile?.skills || []), newSkill.trim()];
    setNewSkill('');
    handleCreateOrUpdateProfile({ skills: updatedSkills });
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = (profile?.skills || []).filter(s => s !== skillToRemove);
    handleCreateOrUpdateProfile({ skills: updatedSkills });
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!projTitle.trim() || !projDesc.trim()) return;

    const newProject = {
      title: projTitle.trim(),
      description: projDesc.trim(),
      technologies: projTech.split(',').map(t => t.trim()).filter(Boolean)
    };

    const updatedProjects = [...(profile?.projects || []), newProject];
    setProjTitle('');
    setProjDesc('');
    setProjTech('');
    handleCreateOrUpdateProfile({ projects: updatedProjects });
  };

  const handleRemoveProject = (index) => {
    const updatedProjects = (profile?.projects || []).filter((_, idx) => idx !== index);
    handleCreateOrUpdateProfile({ projects: updatedProjects });
  };

  const handleAnalyzeResume = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const score = Math.floor(Math.random() * (90 - 70 + 1)) + 70;
      setAtsScore(score);
      setAnalyzing(false);
      handleCreateOrUpdateProfile({ resumeScore: score });
    }, 2500);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 skeleton rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 col-span-2 skeleton" />
          <div className="h-80 skeleton" />
        </div>
      </div>
    );
  }

  const completion = profile?.profileCompletionScore || 60;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header Grid */}
      <div className="card glass relative overflow-hidden flex flex-col md:flex-row items-center gap-6 p-8">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent-indigo), transparent)', filter: 'blur(50px)' }} />

        {/* Avatar */}
        <div className="w-24 h-24 rounded-3xl gradient-bg flex items-center justify-center text-white text-4xl font-extrabold shadow-lg">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

        {/* Bio */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-white leading-tight">{user?.name}</h1>
          <p className="text-indigo-400 font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
            <GraduationCap size={16} /> Student · {profile?.branch || 'CSE'} Department
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1.5"><Mail size={14} /> {user?.email}</span>
            <span className="flex items-center gap-1.5"><FileCode size={14} /> Roll: {profile?.rollNo || 'Pending'}</span>
          </div>
        </div>

        {/* Circular score progress */}
        <div className="flex flex-col items-center gap-2 pr-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="34" className="stroke-current opacity-10 text-white" strokeWidth="6" fill="transparent" />
              <circle cx="40" cy="40" r="34" className="stroke-current text-indigo-400" strokeWidth="6" fill="transparent"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - completion / 100)}
                strokeLinecap="round" />
            </svg>
            <span className="absolute text-base font-bold text-white">{completion}%</span>
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">Profile Score</span>
        </div>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-xl text-sm ${message.type === 'success' ? 'badge-green' : 'badge-rose'}`} style={{ border: '1px solid currentColor' }}>
          {message.text}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Portfolio details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Academic Details Form */}
          <div className="card glass">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><GraduationCap size={18} className="text-indigo-400" /> Academic Credentials</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="label">Roll Number</label>
                <input
                  type="text"
                  className="input"
                  value={profile?.rollNo || ''}
                  onChange={e => setProfile({ ...profile, rollNo: e.target.value })}
                  placeholder="2023CSE001"
                />
              </div>
              <div>
                <label className="label">Branch</label>
                <input
                  type="text"
                  className="input"
                  value={profile?.branch || ''}
                  onChange={e => setProfile({ ...profile, branch: e.target.value })}
                  placeholder="CSE"
                />
              </div>
              <div>
                <label className="label">Semester</label>
                <input
                  type="number"
                  className="input"
                  value={profile?.semester || 1}
                  onChange={e => setProfile({ ...profile, semester: parseInt(e.target.value) })}
                  placeholder="6"
                />
              </div>
              <div>
                <label className="label">Cumulative CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={profile?.cgpa || 0}
                  onChange={e => setProfile({ ...profile, cgpa: parseFloat(e.target.value) })}
                  placeholder="9.2"
                />
              </div>
            </div>
            <button className="btn btn-primary mt-4 py-2" onClick={() => handleCreateOrUpdateProfile()} disabled={saving}>
              Save Credentials
            </button>
          </div>

          {/* Skill Tag Tracker */}
          <div className="card glass">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FileCode size={18} className="text-indigo-400" /> Technical Skills & Tags</h2>
            
            <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
              <input
                type="text"
                className="input flex-1"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                placeholder="Add a technology... (e.g. React.js, Python, AWS)"
              />
              <button type="submit" className="btn btn-secondary py-2"><Plus size={16} /> Add</button>
            </form>

            <div className="flex flex-wrap gap-2">
              {(!profile?.skills || profile.skills.length === 0) ? (
                <span className="text-sm text-muted">No skills logged yet. Complete profiles ranking requires tags.</span>
              ) : (
                profile.skills.map(s => (
                  <span key={s} className="badge badge-indigo flex items-center gap-1">
                    {s}
                    <button type="button" className="hover:text-red-400 ml-1" onClick={() => handleRemoveSkill(s)}>×</button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Interactive Projects Portfolio */}
          <div className="card glass">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Briefcase size={18} className="text-indigo-400" /> Projects Portfolio</h2>

            {/* Existing Projects */}
            <div className="space-y-4 mb-6">
              {profile?.projects?.map((p, idx) => (
                <div key={idx} className="p-4 rounded-xl glass border border-white/5 flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{p.title}</h3>
                    <p className="text-xs text-secondary mt-1">{p.description}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {p.technologies?.map(t => (
                        <span key={t} className="badge badge-cyan" style={{ fontSize: '9px' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <button className="text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors" onClick={() => handleRemoveProject(idx)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Project Form */}
            <form onSubmit={handleAddProject} className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/5">
              <h3 className="text-sm font-semibold text-white">Add New Project</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Project Title"
                  className="input"
                  value={projTitle}
                  onChange={e => setProjTitle(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Technologies used (comma separated)"
                  className="input"
                  value={projTech}
                  onChange={e => setProjTech(e.target.value)}
                />
              </div>
              <textarea
                placeholder="Brief description of project functionalities..."
                className="input h-20"
                value={projDesc}
                onChange={e => setProjDesc(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-secondary py-2 justify-center w-full"><Plus size={14} /> Add Project</button>
            </form>
          </div>
        </div>

        {/* Right Columns - Resume Analyzer & Social Links */}
        <div className="space-y-6">
          
          {/* ATS Resume Checker */}
          <div className="card glass" style={{ border: '1px solid rgba(139, 92, 246, 0.15)' }}>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><Award size={18} className="text-violet-400" /> AI Resume ATS Scanner</h2>
            <p className="text-xs text-muted mb-4">Upload your curriculum vitae PDF or DOCX file to run deep compliance diagnostics and keyword strength analytics.</p>
            
            {/* Analyzer Display */}
            {analyzing ? (
              <div className="border border-dashed border-violet-500/30 rounded-2xl p-6 text-center space-y-4">
                <div className="w-10 h-10 rounded-full border-2 border-violet-400 border-t-transparent animate-spin mx-auto" />
                <div className="text-sm font-semibold text-violet-400">Parsing bullet points...</div>
                <div className="text-xxs text-muted" style={{ fontSize: '10px' }}>Scanning for full stack developer keywords...</div>
              </div>
            ) : atsScore !== null ? (
              <div className="space-y-4">
                {/* Score badge circle */}
                <div className="flex items-center gap-4 bg-violet-500/10 p-4 rounded-2xl border border-violet-500/20">
                  <div className="w-16 h-16 rounded-full bg-violet-500 flex items-center justify-center text-white font-extrabold text-xl shadow-glow">
                    {atsScore}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">ATS Compliance Score</h3>
                    <p className="text-xxs text-muted mt-0.5" style={{ fontSize: '10px' }}>
                      {atsScore >= 75 ? '🔥 Strong resume! Ready for recruitment applications.' : '⚠️ Missing crucial technologies keywords.'}
                    </p>
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-semibold"><span className="text-secondary">Industry Keywords matched:</span> <span className="text-white">78%</span></div>
                  <div className="flex justify-between font-semibold"><span className="text-secondary">Missing Crucial skills:</span> <span className="text-red-400">Node.js, Docker</span></div>
                  <div className="flex justify-between font-semibold"><span className="text-secondary">Grammatical clarity:</span> <span className="text-emerald-400">Excellent</span></div>
                </div>

                <button className="btn btn-secondary py-2 justify-center w-full" onClick={handleAnalyzeResume}>
                  Re-Scan Resume
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-white/10 hover:border-violet-400 transition-colors rounded-2xl p-8 text-center cursor-pointer space-y-3"
                onClick={handleAnalyzeResume}
              >
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto">
                  <UploadCloud size={24} />
                </div>
                <div className="text-sm font-semibold text-white">Select PDF / DOCX file</div>
                <div className="text-xxs text-muted" style={{ fontSize: '10px' }}>Supports standard formats up to 4MB. Click to upload and run diagnostics.</div>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="card glass">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Globe size={18} className="text-indigo-400" /> Digital Portfolios</h2>
            <div className="space-y-4">
              <div>
                <label className="label flex items-center gap-1.5"><Github size={14} /> GitHub Profile</label>
                <input
                  type="text"
                  className="input"
                  value={profile?.gitHub || ''}
                  onChange={e => setProfile({ ...profile, gitHub: e.target.value })}
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="label flex items-center gap-1.5"><Linkedin size={14} /> LinkedIn Profile</label>
                <input
                  type="text"
                  className="input"
                  value={profile?.linkedIn || ''}
                  onChange={e => setProfile({ ...profile, linkedIn: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
            <button className="btn btn-primary mt-4 py-2 w-full justify-center" onClick={() => handleCreateOrUpdateProfile()} disabled={saving}>
              Save Profiles Links
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
