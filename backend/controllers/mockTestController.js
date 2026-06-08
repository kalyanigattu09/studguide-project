// STUGUIDE X - Mock Test & Leaderboard Scoreboard Controller
const { MockTest } = require('../models/MockTest');
const Result = require('../models/Result');
const Profile = require('../models/Profile');
const User = require('../models/User');
const hybridDb = require('../config/hybridDb');
const { MaxHeap } = require('../services/heap');

// @desc    Get All Available Mock Tests
// @route   GET /api/mocktest
// @access  Private
exports.getMockTests = async (req, res, next) => {
  try {
    let tests;
    if (hybridDb.isActive) {
      tests = hybridDb.find('mocktests');
    } else {
      tests = await MockTest.find().select('-questions'); // exclude questions in lists
    }
    res.status(200).json({ success: true, count: tests.length, data: tests });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Mock Test by ID (Including Questions)
// @route   GET /api/mocktest/:id
// @access  Private
exports.getMockTestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let test;
    if (hybridDb.isActive) {
      test = hybridDb.findOne('mocktests', { _id: id });
    } else {
      test = await MockTest.findById(id);
    }

    if (!test) {
      return res.status(404).json({ success: false, error: 'Mock test not found' });
    }

    res.status(200).json({ success: true, data: test });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit Test Answers & Calculate Scores
// @route   POST /api/mocktest/:id/submit
// @access  Private
exports.submitMockTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers, timeSpentSeconds } = req.body; // array of indexes: [0, 1, null, 2]

    let test;
    if (hybridDb.isActive) {
      test = hybridDb.findOne('mocktests', { _id: id });
    } else {
      test = await MockTest.findById(id);
    }

    if (!test) {
      return res.status(404).json({ success: false, error: 'Mock test not found' });
    }

    let correctCount = 0;
    const topicTracker = {}; // e.g. { Aptitude: { correct: 0, total: 0 } }

    test.questions.forEach((q, idx) => {
      const topic = q.category;
      if (!topicTracker[topic]) {
        topicTracker[topic] = { correct: 0, total: 0 };
      }
      topicTracker[topic].total++;

      const studentAns = answers[idx];
      if (studentAns !== undefined && studentAns !== null && parseInt(studentAns) === q.correctIndex) {
        correctCount++;
        topicTracker[topic].correct++;
      }
    });

    // Score Calculations
    const totalMarks = test.questions.length * 10; // 10 marks per question
    const marksObtained = correctCount * 10;
    const scorePercent = Math.round((marksObtained / totalMarks) * 100);

    // Topic breakdowns and detecting weak topics
    const topicBreakdown = [];
    const weakTopics = [];
    for (let topic in topicTracker) {
      const { correct, total } = topicTracker[topic];
      const percent = Math.round((correct / total) * 100);
      topicBreakdown.push({
        topicName: topic,
        correctCount: correct,
        totalCount: total
      });
      if (percent < 60) {
        weakTopics.push(topic); // Weak topic if score < 60%
      }
    }

    // Save Result
    let result;
    const resultPayload = {
      student: req.user._id,
      mockTest: test._id,
      testTitle: test.title,
      category: test.category,
      marksObtained,
      totalMarks,
      scorePercent,
      timeSpentSeconds,
      topicBreakdown,
      weakTopics
    };

    if (hybridDb.isActive) {
      result = hybridDb.insert('results', resultPayload);
      
      // Update average test score cache in profile
      const allResults = hybridDb.find('results', { student: req.user._id });
      const avg = allResults.reduce((acc, r) => acc + r.scorePercent, 0) / allResults.length;
      
      const profile = hybridDb.findOne('profiles', { user: req.user._id });
      if (profile) {
        hybridDb.update('profiles', { user: req.user._id }, { 
          avgMockScore: parseFloat(avg.toFixed(1))
        });
      }
    } else {
      result = await Result.create(resultPayload);
      
      // Update average test score cache in mongoose profile
      const allResults = await Result.find({ student: req.user._id });
      const avg = allResults.reduce((acc, r) => acc + r.scorePercent, 0) / allResults.length;
      
      const profile = await Profile.findOne({ user: req.user._id });
      if (profile) {
        profile.avgMockScore = parseFloat(avg.toFixed(1));
        await profile.save();
      }
    }

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Global Student rankings Leaderboard (utilizes custom MaxHeap data structure)
// @route   GET /api/mocktest/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res, next) => {
  try {
    let studentProfiles;
    let studentsMap = {};

    if (hybridDb.isActive) {
      studentProfiles = hybridDb.find('profiles');
      const users = hybridDb.find('users');
      users.forEach(u => { studentsMap[u._id] = u.name; });
    } else {
      studentProfiles = await Profile.find().populate('user', 'name').lean();

      if (studentProfiles.length === 0) {
        studentProfiles = hybridDb.find('profiles');
        const users = hybridDb.find('users');
        users.forEach(u => { studentsMap[u._id] = u.name; });
      }
    }

    // Adapt to list with name injecting
    const adaptiveList = studentProfiles.map(p => {
      const rawUser = p.user;
      const userId = rawUser && rawUser._id
        ? rawUser._id.toString()
        : rawUser
          ? rawUser.toString()
          : p._id.toString();
      const name = (rawUser && rawUser.name) || studentsMap[userId] || 'Student';
      return {
        userId,
        name,
        rollNo: p.rollNo,
        branch: p.branch,
        cgpa: p.cgpa,
        codingStreak: p.codingStreak || 0,
        avgMockScore: p.avgMockScore || 0
      };
    });

    // Heap Service construction
    const rankingHeap = new MaxHeap();
    rankingHeap.buildHeap(adaptiveList);

    // Fetch Top 10 rankings dynamically in log time
    const topRankings = rankingHeap.getTopRankings(10).map(rank => ({
      ...rank,
      userId: rank.studentId
    }));

    res.status(200).json({
      success: true,
      count: topRankings.length,
      data: topRankings
    });
  } catch (err) {
    next(err);
  }
};
