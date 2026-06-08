import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/apiClient';
import {
  Building2, Briefcase, DollarSign, Calendar, MapPin, Award, CheckCircle,
  Plus, X, Filter, User, Search, Loader2, Info, ArrowUpRight, ShieldCheck
} from 'lucide-react';

export default function Placement() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Slideovers
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [createDriveOpen, setCreateDriveOpen] = useState(false);
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false);
  const [viewApplicantsDrive, setViewApplicantsDrive] = useState(null);

  // Form states for creating company
  const [compName, setCompName] = useState('');
  const [compWeb, setCompWeb] = useState('');
  const [compInd, setCompInd] = useState('');
  const [compDesc, setCompDesc] = useState('');

  // Form states for creating drive
  const [driveCompany, setDriveCompany] = useState('');
  const [driveRole, setDriveRole] = useState('');
  const [drivePackage, setDrivePackage] = useState('');
  const [driveCgpa, setDriveCgpa] = useState('');
  const [driveLocation, setDriveLocation] = useState('');
  const [driveDeadline, setDriveDeadline] = useState('');
  const [driveSkills, setDriveSkills] = useState('');

  // Status mapping colors
  const statusBadges = {
    'Applied': 'badge-indigo',
    'Shortlisted': 'badge-cyan',
    'Interview Scheduled': 'badge-amber',
    'Selected': 'badge-green',
    'Rejected': 'badge-rose'
  };

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const fetchPlacementData = async () => {
    try {
      setLoading(true);
      const { data: dData } = await apiClient.get('/api/placement/drives');
      if (dData.success) setDrives(dData.data);

      if (user?.role === 'Admin' || user?.role === 'PlacementOfficer') {
        const { data: cData } = await apiClient.get('/api/placement/companies');
        if (cData.success) setCompanies(cData.data);
      } else {
        // Fetch current student applications
        const { data: aData } = await apiClient.get('/api/placement/applications/my');
        if (aData.success) setApplications(aData.data);
      }
    } catch (err) {
      console.warn("Failed fetching placement telemetry.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDrive = async (driveId) => {
    try {
      const { data } = await apiClient.post(`/api/placement/drives/${driveId}/apply`);
      if (data.success) {
        setSelectedDrive(null);
        fetchPlacementData();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Application submission failed.");
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiClient.post('/api/placement/companies', {
        name: compName,
        website: compWeb,
        industry: compInd,
        description: compDesc
      });
      if (data.success) {
        setCreateCompanyOpen(false);
        setCompName('');
        setCompWeb('');
        setCompInd('');
        setCompDesc('');
        fetchPlacementData();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create company registry.");
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiClient.post('/api/placement/drives', {
        companyId: driveCompany,
        jobRole: driveRole,
        packageLPA: parseFloat(drivePackage),
        eligibilityCGPA: parseFloat(driveCgpa),
        eligibleBranches: ['All'],
        location: driveLocation,
        deadline: driveDeadline,
        requiredSkills: driveSkills.split(',').map(s => s.trim()).filter(Boolean)
      });
      if (data.success) {
        setCreateDriveOpen(false);
        setDriveCompany('');
        setDriveRole('');
        setDrivePackage('');
        setDriveCgpa('');
        setDriveLocation('');
        setDriveDeadline('');
        setDriveSkills('');
        fetchPlacementData();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed scheduling placement drive.");
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const { data } = await apiClient.put(`/api/placement/applications/${appId}/status`, { status: newStatus });
      if (data.success) {
        // Refresh applicants viewer details
        const updated = viewApplicantsDrive.applicants.map(a => a._id === appId ? { ...a, status: newStatus } : a);
        setViewApplicantsDrive({ ...viewApplicantsDrive, applicants: updated });
        fetchPlacementData();
      }
    } catch (err) {
      alert("Failed updating student application status.");
    }
  };

  const handleViewApplicants = async (drive) => {
    try {
      const { data } = await apiClient.get(`/api/placement/drives/${drive._id}/applicants`);
      if (data.success) {
        setViewApplicantsDrive({ ...drive, applicants: data.data });
      }
    } catch {
      alert("Failed loading applicants telemetry.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 skeleton w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-56 skeleton" />
          <div className="h-56 skeleton" />
          <div className="h-56 skeleton" />
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
            Placement <span className="gradient-text">Board & Drives</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Explore packages, eligibility criteria, required skills, and apply to active company recruitments.
          </p>
        </div>

        {/* Admin/Officer Control Buttons */}
        {(user?.role === 'Admin' || user?.role === 'PlacementOfficer') && (
          <div className="flex gap-2">
            <button className="btn btn-secondary py-2" onClick={() => setCreateCompanyOpen(true)}>
              <Plus size={16} /> Add Company
            </button>
            <button className="btn btn-primary py-2" onClick={() => setCreateDriveOpen(true)}>
              <Plus size={16} /> Schedule Drive
            </button>
          </div>
        )}
      </div>

      {/* Recruiting Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drives.map(drive => {
          const matchingApp = applications.find(a => (a.drive?._id || a.drive || a.placementDrive) === drive._id);
          const hasApplied = !!matchingApp;
          
          return (
            <motion.div
              key={drive._id}
              className="card glass relative flex flex-col justify-between"
              whileHover={{ y: -4 }}
            >
              {/* Top Meta info */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-bg text-white font-black flex items-center justify-center text-xl shadow-glow">
                    {drive.companyName.charAt(0)}
                  </div>
                  {hasApplied ? (
                    <span className={`badge ${statusBadges[matchingApp.status] || 'badge-indigo'}`}>{matchingApp.status}</span>
                  ) : (
                    <span className="badge badge-indigo">Active</span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">{drive.jobRole}</h3>
                <span className="text-xs text-indigo-400 font-semibold">{drive.companyName}</span>

                {/* KPI details */}
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-1.5"><DollarSign size={14} className="text-emerald-400" /> <span className="font-bold text-white">{drive.packageLPA} LPA</span></div>
                  <div className="flex items-center gap-1.5"><Award size={14} className="text-cyan-400" /> <span>Min {drive.eligibilityCGPA} CGPA</span></div>
                  <div className="flex items-center gap-1.5 col-span-2"><MapPin size={14} className="text-rose-400" /> <span>{drive.location}</span></div>
                </div>

                {/* Required Skills tags */}
                <div className="flex flex-wrap gap-1 mt-4">
                  {drive.requiredSkills?.map(s => (
                    <span key={s} className="badge bg-white/5 text-secondary border-0" style={{ fontSize: '9px' }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Apply / Action Trigger */}
              <div className="mt-6 border-t border-white/5 pt-4">
                {(user?.role === 'Admin' || user?.role === 'PlacementOfficer') ? (
                  <button className="btn btn-secondary w-full justify-center text-xs py-2" onClick={() => handleViewApplicants(drive)}>
                    View Applicants ({drive.registeredStudents?.length || 0})
                  </button>
                ) : (
                  <button
                    className={`btn w-full justify-center py-2 ${hasApplied ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => setSelectedDrive({ ...drive, matchingApp })}
                  >
                    {hasApplied ? 'Manage Application' : 'Apply Now'} <ArrowUpRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Slide-over details apply panel */}
      <AnimatePresence>
        {selectedDrive && (
          <>
            <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDrive(null)} />
            <motion.div
              className="fixed top-0 right-0 h-full w-full max-w-md bg-tertiary z-50 p-8 shadow-elevated border-l overflow-y-auto"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Info size={18} className="text-indigo-400" /> Drive Details</h2>
                <button className="btn-ghost p-1 rounded-lg" onClick={() => setSelectedDrive(null)}><X size={20} /></button>
              </div>

              <div className="space-y-6">
                {/* Details Card */}
                <div className="glass rounded-2xl p-5 border border-white/5 text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-glow mb-4">
                    {selectedDrive.companyName.charAt(0)}
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedDrive.jobRole}</h3>
                  <p className="text-sm text-indigo-400 font-semibold">{selectedDrive.companyName}</p>
                </div>

                {/* Drive Telemetry */}
                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5 text-sm">
                  <div className="flex justify-between"><span className="text-secondary">Job Location:</span> <span className="text-white font-semibold">{selectedDrive.location}</span></div>
                  <div className="flex justify-between"><span className="text-secondary">Salary packages:</span> <span className="text-emerald-400 font-bold">{selectedDrive.packageLPA} LPA</span></div>
                  <div className="flex justify-between"><span className="text-secondary">CGPA Cutoff:</span> <span className="text-cyan-400 font-bold">{selectedDrive.eligibilityCGPA} CGPA</span></div>
                  <div className="flex justify-between"><span className="text-secondary">Deadline Date:</span> <span className="text-white font-semibold">{new Date(selectedDrive.deadline).toLocaleDateString()}</span></div>
                </div>

                {/* Skills Gap Checklist */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Drive Eligibility & Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDrive.requiredSkills?.map(s => (
                      <span key={s} className="badge badge-indigo text-xxs" style={{ fontSize: '9px' }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Status Indicator */}
                {selectedDrive.matchingApp && (
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2 text-sm">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Application Status Tracker</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`badge ${statusBadges[selectedDrive.matchingApp.status] || 'badge-indigo'}`}>{selectedDrive.matchingApp.status}</span>
                      <span className="text-xxs text-muted" style={{ fontSize: '10px' }}>Last updated {new Date(selectedDrive.matchingApp.updatedAt || selectedDrive.matchingApp.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {/* Submit Application */}
                {!selectedDrive.matchingApp && (
                  <button
                    className="btn btn-primary py-3 justify-center w-full"
                    onClick={() => handleApplyDrive(selectedDrive._id)}
                  >
                    Submit Application Registry
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin Modal: Create Company */}
      <AnimatePresence>
        {createCompanyOpen && (
          <div className="modal-backdrop">
            <motion.div className="modal-content" initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Building2 size={18} className="text-indigo-400" /> Create Company Registry</h2>
                <button className="btn-ghost p-1 rounded-lg" onClick={() => setCreateCompanyOpen(false)}><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div>
                  <label className="label">Company Name</label>
                  <input type="text" className="input" placeholder="Google Inc." value={compName} onChange={e => setCompName(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Website Link</label>
                  <input type="url" className="input" placeholder="https://careers.google.com" value={compWeb} onChange={e => setCompWeb(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Industry Domain</label>
                  <input type="text" className="input" placeholder="Technology / SaaS / FinTech" value={compInd} onChange={e => setCompInd(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Description / Bio</label>
                  <textarea className="input h-20" placeholder="Describe the company operations..." value={compDesc} onChange={e => setCompDesc(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-full justify-center py-2.5">Create Registry</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Modal: Create Drive */}
      <AnimatePresence>
        {createDriveOpen && (
          <div className="modal-backdrop">
            <motion.div className="modal-content" initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Briefcase size={18} className="text-indigo-400" /> Schedule Recruitment Drive</h2>
                <button className="btn-ghost p-1 rounded-lg" onClick={() => setCreateDriveOpen(false)}><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateDrive} className="space-y-4">
                <div>
                  <label className="label">Select Company</label>
                  <select className="input" value={driveCompany} onChange={e => setDriveCompany(e.target.value)} required>
                    <option value="">Choose Company...</option>
                    {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Job Role Title</label>
                  <input type="text" className="input" placeholder="Full Stack Developer SDE 1" value={driveRole} onChange={e => setDriveRole(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Salary packages (LPA)</label>
                    <input type="number" step="0.1" className="input" placeholder="18.5" value={drivePackage} onChange={e => setDrivePackage(e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">CGPA Cutoff</label>
                    <input type="number" step="0.01" className="input" placeholder="8.0" value={driveCgpa} onChange={e => setDriveCgpa(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="label">Job Location</label>
                  <input type="text" className="input" placeholder="Bangalore, India (Remote options)" value={driveLocation} onChange={e => setDriveLocation(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Application Deadline</label>
                  <input type="date" className="input" value={driveDeadline} onChange={e => setDriveDeadline(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Required Skill tags (comma separated)</label>
                  <input type="text" className="input" placeholder="React, Node.js, Express, MongoDB" value={driveSkills} onChange={e => setDriveSkills(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-full justify-center py-2.5">Schedule Recruitment Drive</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Modal: View Applicants */}
      <AnimatePresence>
        {viewApplicantsDrive && (
          <div className="modal-backdrop">
            <motion.div className="modal-content max-w-2xl" initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Drive Registrants</h2>
                  <p className="text-xs text-muted mt-0.5">{viewApplicantsDrive.companyName} · {viewApplicantsDrive.jobRole}</p>
                </div>
                <button className="btn-ghost p-1 rounded-lg" onClick={() => setViewApplicantsDrive(null)}><X size={16} /></button>
              </div>

              <div className="space-y-4">
                {viewApplicantsDrive.applicants?.length === 0 ? (
                  <div className="text-center py-8 text-muted">No student applications submitted yet.</div>
                ) : (
                  viewApplicantsDrive.applicants?.map(app => (
                    <div key={app._id} className="p-4 rounded-xl glass border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
                          {app.studentName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{app.studentName}</div>
                          <div className="text-xxs text-muted" style={{ fontSize: '10px' }}>CGPA: {app.studentCgpa || '9.0'} · Branch: {app.studentBranch || 'CSE'}</div>
                        </div>
                      </div>

                      {/* Dropdown status update for admins */}
                      <div className="flex gap-2 items-center">
                        <span className={`badge ${statusBadges[app.status] || 'badge-indigo'} text-xxs`}>{app.status}</span>
                        <select
                          className="input py-1 px-2 text-xs w-28"
                          value={app.status}
                          onChange={e => handleUpdateStatus(app._id, e.target.value)}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview Scheduled">Interview</option>
                          <option value="Selected">Select</option>
                          <option value="Rejected">Reject</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
