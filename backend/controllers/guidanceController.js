// STUGUIDE X - Career Guidance Controller
const { careerGraph } = require('../services/graph');
const Profile = require('../models/Profile');
const hybridDb = require('../config/hybridDb');

// @desc    Get Available Career Roles
// @route   GET /api/guidance/roles
// @access  Private
exports.getCareerRoles = async (req, res, next) => {
  try {
    const roles = [
      { id: "Full Stack Developer", name: "Full Stack Developer", desc: "Design client-side and server-side web applications", duration: "6 Months" },
      { id: "AI Engineer", name: "AI Engineer", desc: "Develop advanced neural network models and machine learning pipelines", duration: "8 Months" },
      { id: "DevOps Engineer", name: "DevOps Engineer", desc: "Manage software operations, server architectures, and release cycles", duration: "5 Months" }
    ];
    res.status(200).json({ success: true, data: roles });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Sequential Career Roadmap path (utilizes custom Graph traversal)
// @route   GET /api/guidance/roadmap/:role
// @access  Private
exports.getRoadmap = async (req, res, next) => {
  try {
    const { role } = req.params;
    
    // Traverses our Adjacency Directed Graph structure (Graph Service)
    const roadmap = careerGraph.getRoadmap(role);

    if (roadmap.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Career pathway for '${role}' not found in the Roadmap Graph.`
      });
    }

    res.status(200).json({
      success: true,
      role,
      roadmap
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Analyze Skill Gaps relative to career path (utilizes custom Graph findGaps)
// @route   POST /api/guidance/gaps
// @access  Private
exports.analyzeGaps = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, error: 'Please specify target career role' });
    }

    let profile;
    if (hybridDb.isActive) {
      profile = hybridDb.findOne('profiles', { user: req.user._id });
    } else {
      profile = await Profile.findOne({ user: req.user._id });
    }

    const studentSkills = profile ? profile.skills : [];
    
    // Graph calculation of missing nodes/prerequisites
    const missingSkills = careerGraph.findSkillGaps(role, studentSkills);
    const totalRoadmapNodes = careerGraph.getRoadmap(role).length - 1; // Subtract root
    
    const acquiredCount = Math.max(0, totalRoadmapNodes - missingSkills.length);
    const matchPercentage = totalRoadmapNodes > 0 
      ? Math.round((acquiredCount / totalRoadmapNodes) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      role,
      matchPercentage,
      acquiredSkills: studentSkills,
      missingSkills,
      totalSteps: totalRoadmapNodes
    });
  } catch (err) {
    next(err);
  }
};
