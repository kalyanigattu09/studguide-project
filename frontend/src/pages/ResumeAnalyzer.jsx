import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AlertTriangle, CheckCircle2, FileText, Loader2, Sparkles, UploadCloud } from 'lucide-react';

const demoResume = `Kalyan Kumar
Software Engineering Student
Education: B.Tech CSE, CGPA 9.2
Skills: JavaScript, React.js, Node.js, Express.js, MongoDB, Git, REST API, Data Structures
Projects: Built a MERN placement dashboard with JWT authentication and analytics.
GitHub: https://github.com/kalyan
LinkedIn: https://linkedin.com/in/kalyan`;

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!resumeText.trim()) {
      setError('Paste resume text or load the demo resume first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.post('/api/profile/analyze-resume', { resumeText });
      if (data.success) setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Resume analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setResumeText(String(reader.result || ''));
    reader.readAsText(file);
  };

  const score = result?.atsScore || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Resume <span className="gradient-text">Analyzer</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Extract skills, calculate ATS score, identify missing keywords, and sync the score back to your profile.
          </p>
        </div>
        <button className="btn btn-secondary py-2" onClick={() => setResumeText(demoResume)}>
          <Sparkles size={15} />
          Load demo resume
        </button>
      </div>

      {error && <div className="badge badge-rose normal-case justify-start w-full">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card glass">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText size={18} className="text-indigo-400" />
              Resume Text Input
            </h2>
            <label className="btn btn-secondary py-2 cursor-pointer">
              <UploadCloud size={15} />
              Upload text/PDF/DOCX
              <input className="hidden" type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFile} />
            </label>
          </div>
          <textarea
            className="input min-h-[420px] resize-y leading-relaxed"
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            placeholder="Paste resume content here: education, projects, skills, links, certifications..."
          />
          <button className="btn btn-primary mt-4 py-3 w-full justify-center" onClick={analyze} disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Sparkles size={16} /> Analyze resume</>}
          </button>
        </div>

        <div className="space-y-6">
          <div className="card glass">
            <h2 className="text-lg font-bold mb-4">ATS Score</h2>
            {result ? (
              <div className="space-y-5">
                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="72" cy="72" r="58" stroke="var(--surface-high)" strokeWidth="12" fill="none" />
                    <circle
                      cx="72"
                      cy="72"
                      r="58"
                      stroke="var(--accent-indigo)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 58}
                      strokeDashoffset={2 * Math.PI * 58 * (1 - score / 100)}
                    />
                  </svg>
                  <span className="absolute text-4xl font-extrabold gradient-text">{score}</span>
                </div>
                <div className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {score >= 75 ? 'Strong recruiter-ready profile.' : 'Needs more targeted keywords and structure.'}
                </div>
              </div>
            ) : (
              <div className="py-14 text-center" style={{ color: 'var(--text-muted)' }}>
                <FileText size={34} className="mx-auto mb-3 opacity-40" />
                Analysis will appear here.
              </div>
            )}
          </div>

          {result && (
            <>
              <div className="card glass">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  Extracted Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.extractedSkills.length === 0 ? (
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>No known skills detected.</span>
                  ) : result.extractedSkills.map((skill) => (
                    <span className="badge badge-green" key={skill}>{skill}</span>
                  ))}
                </div>
              </div>

              <div className="card glass">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-400" />
                  Missing Keywords
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.missingSkills.map((skill) => (
                    <span className="badge badge-amber" key={skill}>{skill}</span>
                  ))}
                </div>
                <div className="space-y-2">
                  {result.suggestions.map((suggestion) => (
                    <motion.div key={suggestion} className="text-sm p-3 rounded-xl" style={{ background: 'var(--surface-high)', color: 'var(--text-secondary)' }}>
                      {suggestion}
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
