// STUGUIDE X - Student Profile Controller
const Profile = require('../models/Profile');
const User = require('../models/User');
const hybridDb = require('../config/hybridDb');
const { skillTrie } = require('../services/trie');

// Profile Completion calculator
const calculateCompletion = (profile) => {
  let score = 0;
  if (profile.rollNo) score += 10;
  if (profile.branch) score += 10;
  if (profile.semester) score += 10;
  if (profile.cgpa) score += 10;
  if (profile.skills && profile.skills.length > 0) score += 15;
  if (profile.interests && profile.interests.length > 0) score += 10;
  if (profile.projects && profile.projects.length > 0) score += 15;
  if (profile.certifications && profile.certifications.length > 0) score += 10;
  if (profile.resume || profile.linkedIn) score += 10;
  return score;
};

// Placement Readiness Calculator
const calculateReadiness = (profile) => {
  // Weights: CGPA: 30%, Coding Streak: 20%, Avg Mock Test: 30%, Skills List: 20%
  const cgpaScore = ((profile.cgpa || 0) / 10) * 30;
  const streakScore = Math.min((profile.codingStreak || 0) / 30, 1) * 20; // Max contribution at 30 days
  const mockScore = ((profile.avgMockScore || 0) / 100) * 30;
  const skillsScore = Math.min((profile.skills ? profile.skills.length : 0) / 6, 1) * 20; // Max contrib at 6 skills
  return Math.round(cgpaScore + streakScore + mockScore + skillsScore);
};

// @desc    Get or Create User Profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    let profile;
    if (hybridDb.isActive) {
      profile = hybridDb.findOne('profiles', { user: req.user._id });
      if (!profile) {
        profile = hybridDb.insert('profiles', {
          user: req.user._id,
          rollNo: 'NOT_SET_' + Math.random().toString(36).substring(7).toUpperCase(),
          branch: 'CSE',
          semester: 1,
          year: 1,
          cgpa: 7.0,
          skills: [],
          interests: [],
          projects: [],
          certifications: [],
          achievements: [],
          resume: '',
          gitHub: '',
          linkedIn: '',
          portfolio: ''
        });
      }
    } else {
      profile = await Profile.findOne({ user: req.user._id });
      if (!profile) {
        profile = await Profile.create({
          user: req.user._id,
          rollNo: 'NOT_SET_' + Math.random().toString(36).substring(7).toUpperCase(),
          branch: 'CSE',
          semester: 1,
          year: 1,
          cgpa: 7.0
        });
      }
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Student Profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    let profile;

    if (hybridDb.isActive) {
      profile = hybridDb.findOne('profiles', { user: req.user._id });
      if (!profile) {
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }

      const updates = { ...req.body };
      
      // Calculate scores dynamically
      const merged = { ...profile, ...updates };
      updates.profileCompletionScore = calculateCompletion(merged);
      updates.placementReadinessScore = calculateReadiness(merged);

      hybridDb.update('profiles', { user: req.user._id }, updates);
      profile = hybridDb.findOne('profiles', { user: req.user._id });
    } else {
      profile = await Profile.findOne({ user: req.user._id });
      if (!profile) {
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }

      // Update fields
      Object.assign(profile, req.body);
      profile.profileCompletionScore = calculateCompletion(profile);
      profile.placementReadinessScore = calculateReadiness(profile);
      profile.updatedAt = Date.now();
      await profile.save();
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// @desc    Mock Resume Analyzer (ATS Score & Skill Extraction via Trie)
// @route   POST /api/profile/analyze-resume
// @access  Private
exports.analyzeResume = async (req, res, next) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ success: false, error: 'Please provide resume text contents to analyze' });
    }

    // Use our custom Trie service to scan and match skills in the resume text
    const matchedSkills = [];
    const tokens = resumeText.toLowerCase().split(/[\s,()./\\]+/);
    
    // Look up words or bigrams in skillTrie
    const scannedSet = new Set();
    for (let i = 0; i < tokens.length; i++) {
      const singleWord = tokens[i];
      const match = skillTrie.searchPrefix(singleWord);
      // Verify exact or prefix matches
      match.forEach(m => {
        if (m.term === singleWord && !scannedSet.has(m.data.name)) {
          matchedSkills.push(m.data.name);
          scannedSet.add(m.data.name);
        }
      });

      // Try bigram lookup
      if (i < tokens.length - 1) {
        const doubleWord = `${tokens[i]} ${tokens[i+1]}`;
        const match2 = skillTrie.searchPrefix(doubleWord);
        match2.forEach(m => {
          if (m.term === doubleWord && !scannedSet.has(m.data.name)) {
            matchedSkills.push(m.data.name);
            scannedSet.add(m.data.name);
          }
        });
      }
    }

    // Standard core requirements keywords for validation
    const coreKeywords = ['project', 'experience', 'education', 'skills', 'github', 'linkedin'];
    const foundCore = coreKeywords.filter(keyword => resumeText.toLowerCase().includes(keyword));

    // Calculate dynamic ATS Score
    const skillCountContrib = Math.min(matchedSkills.length * 8, 40); // Max 40% from skills
    const coreStructureContrib = (foundCore.length / coreKeywords.length) * 40; // Max 40% from structure
    const formatContrib = resumeText.length > 500 ? 20 : 10; // Max 20% length criteria
    const atsScore = Math.round(skillCountContrib + coreStructureContrib + formatContrib);

    // Identify Missing Key Skills
    const standardJobSkills = ['JavaScript', 'React.js', 'Node.js', 'SQL', 'Git', 'System Design'];
    const missingSkills = standardJobSkills.filter(skill => 
      !matchedSkills.some(matched => matched.toLowerCase() === skill.toLowerCase())
    );

    // Build improvement suggestions
    const suggestions = [];
    if (!resumeText.toLowerCase().includes('github')) suggestions.push("Add a GitHub profile link to showcase repositories.");
    if (!resumeText.toLowerCase().includes('project')) suggestions.push("Ensure a structured 'Projects' section is present detailing tech stacks.");
    if (matchedSkills.length < 5) suggestions.push("Increase density of technical skills/keywords relative to job profiles.");
    if (missingSkills.length > 0) suggestions.push(`Consider adding skills like ${missingSkills.slice(0, 3).join(', ')} to boost target match.`);

    // Cache ATS score in user's profile
    let profile;
    if (hybridDb.isActive) {
      profile = hybridDb.findOne('profiles', { user: req.user._id });
      if (profile) {
        hybridDb.update('profiles', { user: req.user._id }, { 
          resumeScore: atsScore,
          skills: [...new Set([...profile.skills, ...matchedSkills])] // merge extracted skills
        });
        profile = hybridDb.findOne('profiles', { user: req.user._id });
      }
    } else {
      profile = await Profile.findOne({ user: req.user._id });
      if (profile) {
        profile.resumeScore = atsScore;
        // Merge extracted skills
        profile.skills = [...new Set([...profile.skills, ...matchedSkills])];
        profile.profileCompletionScore = calculateCompletion(profile);
        profile.placementReadinessScore = calculateReadiness(profile);
        await profile.save();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        atsScore,
        extractedSkills: matchedSkills,
        missingSkills,
        suggestions,
        profile
      }
    });
  } catch (err) {
    next(err);
  }
};
