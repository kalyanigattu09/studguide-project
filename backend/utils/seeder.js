// STUGUIDE X - Database Data Seeder
// Seeds both MongoDB (if online) and HybridDB fallback JSON file.

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const DEFAULT_MONGO_URI = 'mongodb://localhost:27017';
const DEFAULT_MONGO_DB_NAME = 'stuguide';

// Load configurations
const hybridDb = require('../config/hybridDb');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const { MockTest } = require('../models/MockTest');
const ForumPost = require('../models/ForumPost');
const Result = require('../models/Result');

const seedData = async () => {
  console.log("[Seeder] Starting data population...");

  // Generate Hashed Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 1. Core Users List
  const users = [
    { _id: 'u_student_kalyan', name: 'Kalyan Kumar', email: 'kalyan@stuguide.edu', password: hashedPassword, role: 'Student' },
    { _id: 'u_student_adarsh', name: 'Adarsh Sen', email: 'adarsh@stuguide.edu', password: hashedPassword, role: 'Student' },
    { _id: 'u_student_priya', name: 'Priya Sharma', email: 'priya@stuguide.edu', password: hashedPassword, role: 'Student' },
    { _id: 'u_officer_ramesh', name: 'Ramesh Shastri', email: 'ramesh@stuguide.edu', password: hashedPassword, role: 'PlacementOfficer' },
    { _id: 'u_faculty_sharma', name: 'Prof. Sharma', email: 'sharma@stuguide.edu', password: hashedPassword, role: 'Faculty' },
    { _id: 'u_admin_system', name: 'System Admin', email: 'admin@stuguide.edu', password: hashedPassword, role: 'Admin' }
  ];

  // 2. Student Profiles
  const studentProfiles = [
    {
      _id: 'p_profile_kalyan',
      user: 'u_student_kalyan',
      rollNo: '2023CSE001',
      branch: 'CSE',
      semester: 6,
      year: 3,
      cgpa: 9.2,
      skills: ['JavaScript', 'HTML5', 'CSS3', 'React.js', 'Git', 'Data Structures'],
      interests: ['Full Stack Development', 'Software Architecture'],
      projects: [
        { title: 'E-Commerce Platform', description: 'Built MERN stack web app', technologies: ['React', 'Node', 'Express', 'MongoDB'], link: 'https://github.com' }
      ],
      certifications: [
        { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: new Date('2025-10-15'), link: 'https://aws.amazon.com' }
      ],
      achievements: ['Won Local Hackathon 2025', 'Coding Streak: 45 Days'],
      resume: 'https://stuguide.edu/resumes/kalyan.pdf',
      gitHub: 'https://github.com/kalyan',
      linkedIn: 'https://linkedin.com/in/kalyan',
      profileCompletionScore: 90,
      placementReadinessScore: 85,
      resumeScore: 78,
      avgMockScore: 82,
      codingStreak: 45
    },
    {
      _id: 'p_profile_adarsh',
      user: 'u_student_adarsh',
      rollNo: '2023ECE012',
      branch: 'ECE',
      semester: 6,
      year: 3,
      cgpa: 7.8,
      skills: ['C++', 'Python', 'Git', 'Operating Systems'],
      interests: ['AI Engineer', 'Embedded Systems'],
      projects: [
        { title: 'IoT Weather Tracker', description: 'Microcontroller temperature sensor logging', technologies: ['C++', 'Arduino', 'Python'], link: 'https://github.com' }
      ],
      certifications: [],
      achievements: [],
      resume: '',
      gitHub: 'https://github.com/adarsh',
      linkedIn: 'https://linkedin.com/in/adarsh',
      profileCompletionScore: 60,
      placementReadinessScore: 54,
      resumeScore: 40,
      avgMockScore: 65,
      codingStreak: 8
    }
  ];

  // 3. Companies List
  const companies = [
    { _id: 'c_comp_google', name: 'Google', website: 'https://google.com', industry: 'Technology', description: 'Search, Cloud, AI, and Android services.' },
    { _id: 'c_comp_amazon', name: 'Amazon', website: 'https://amazon.jobs', industry: 'E-commerce & Cloud', description: 'Global online retail and AWS cloud technologies.' },
    { _id: 'c_comp_stripe', name: 'Stripe', website: 'https://stripe.com', industry: 'Fintech', description: 'Financial infrastructures for the internet economy.' }
  ];

  // 4. Placement Drives
  const placementDrives = [
    {
      _id: 'd_drive_google',
      company: 'c_comp_google',
      companyName: 'Google',
      jobRole: 'Software Engineer - SDE 1',
      packageLPA: 35.5,
      eligibilityCGPA: 8.5,
      eligibleBranches: ['CSE', 'ECE'],
      location: 'Bangalore, India',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      requiredSkills: ['C++', 'Java', 'DSA', 'System Design'],
      status: 'Open',
      registeredStudents: []
    },
    {
      _id: 'd_drive_stripe',
      company: 'c_comp_stripe',
      companyName: 'Stripe',
      jobRole: 'Full Stack Engineer',
      packageLPA: 28.0,
      eligibilityCGPA: 8.0,
      eligibleBranches: ['All'],
      location: 'Remote, India',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      requiredSkills: ['JavaScript', 'React.js', 'Node.js', 'REST API'],
      status: 'Open',
      registeredStudents: []
    }
  ];

  // 5. Mock Tests with Core Question Bank
  const mockTests = [
    {
      _id: 't_test_js',
      title: 'JavaScript & Web Dev Fundamentals',
      category: 'JavaScript',
      durationMinutes: 10,
      totalMarks: 30,
      questions: [
        {
          questionText: 'Which keyword defines a block-scope variable in ES6?',
          options: ['var', 'let', 'const', 'Both let and const'],
          correctIndex: 3,
          explanation: 'Both "let" and "const" feature block scoping, unlike "var" which is function scoped.',
          category: 'JavaScript'
        },
        {
          questionText: 'What is the correct way to write an arrow function returning an object?',
          options: ['() => { value: 1 }', '() => ({ value: 1 })', '() => return { value: 1 }', '() => value: 1'],
          correctIndex: 1,
          explanation: 'To return an object literal from an arrow function implicitly, wrap the object in parentheses.',
          category: 'JavaScript'
        },
        {
          questionText: 'Which method adds one or more elements to the end of an array and returns its new length?',
          options: ['push()', 'pop()', 'shift()', 'unshift()'],
          correctIndex: 0,
          explanation: 'push() adds items to the tail, unshift() adds to the head.',
          category: 'JavaScript'
        }
      ]
    },
    {
      _id: 't_test_aptitude',
      title: 'Quantitative & Logical Reasoning Mock',
      category: 'Aptitude',
      durationMinutes: 15,
      totalMarks: 30,
      questions: [
        {
          questionText: 'A train 120m long passes a post in 12 seconds. Find the speed of the train in km/hr.',
          options: ['30 km/hr', '36 km/hr', '40 km/hr', '45 km/hr'],
          correctIndex: 1,
          explanation: 'Speed = Distance / Time = 120 / 12 = 10 m/s. Convert to km/hr: 10 * (18 / 5) = 36 km/hr.',
          category: 'Aptitude'
        },
        {
          questionText: 'If 3x + 5 = 20, what is the value of 6x + 2?',
          options: ['28', '30', '32', '34'],
          correctIndex: 2,
          explanation: '3x = 15 => x = 5. Therefore, 6x + 2 = 6(5) + 2 = 32.',
          category: 'Aptitude'
        },
        {
          questionText: 'Which number completes the pattern: 2, 6, 12, 20, 30, ?',
          options: ['40', '42', '44', '46'],
          correctIndex: 1,
          explanation: 'Differences are: +4, +6, +8, +10, +12. Next is 30 + 12 = 42.',
          category: 'Aptitude'
        }
      ]
    }
  ];

  // 6. Discussion Forum Threads
  const forumPosts = [
    {
      _id: 'f_post_ats',
      author: 'u_student_kalyan',
      authorName: 'Kalyan Kumar',
      title: 'Tips on beating the ATS Resume Checker?',
      content: 'I noticed my resume score jump from 40% to 78% after adding exact skill keywords in bullet points. Avoid graphic symbols and sidebars as text parsers tend to skip them!',
      tags: ['Placement', 'Resume', 'SaaS'],
      likes: ['u_student_adarsh'],
      commentsCount: 1
    }
  ];

  // Seed into HybridDB (Always write local file as fallback)
  console.log("[Seeder] Writing to HybridDB local JSON storage...");
  hybridDb.data = {
    users,
    profiles: studentProfiles,
    companies,
    placementdrives: placementDrives,
    applications: [],
    mocktests: mockTests,
    questions: [],
    results: [],
    resources: [
      { _id: 'r_res_dsa', title: 'Striver SDE Sheet Notes', type: 'PDF', category: 'DSA', url: 'https://takeuforward.org', tags: ['DSA', 'Placement'], bookmarkedBy: [] },
      { _id: 'r_res_react', title: 'React Hooks Deep Dive', type: 'Video', category: 'React', url: 'https://youtube.com', tags: ['React', 'Frontend'], bookmarkedBy: [] }
    ],
    reminders: [],
    notifications: [],
    forumposts: forumPosts,
    comments: [
      { _id: 'f_comm_ats_1', post: 'f_post_ats', author: 'u_student_adarsh', authorName: 'Adarsh Sen', content: 'Super helpful kalyan! I will remove the tables in my resume and test again.', likes: [] }
    ],
    habits: [
      { _id: 'h_habit_coding_kalyan', student: 'u_student_kalyan', name: 'Daily LeetCode Coding', streakCount: 45, history: [] },
      { _id: 'h_habit_coding_adarsh', student: 'u_student_adarsh', name: 'Daily LeetCode Coding', streakCount: 8, history: [] }
    ],
    tasks: []
  };
  hybridDb._save();

  // Seed into MongoDB if reachable
  const connStr = process.env.MONGO_URI || DEFAULT_MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME || DEFAULT_MONGO_DB_NAME;
  try {
    const conn = await mongoose.connect(connStr, {
      dbName,
      serverSelectionTimeoutMS: 2000
    });
    console.log("[Seeder] MongoDB connected! Clearing existing database collections...");
    
    await User.deleteMany();
    await Profile.deleteMany();
    await Company.deleteMany();
    await PlacementDrive.deleteMany();
    await MockTest.deleteMany();
    await ForumPost.deleteMany();
    await Result.deleteMany();
    
    // Seed MongoDB schemas
    await User.insertMany(users);
    await Profile.insertMany(studentProfiles);
    await Company.insertMany(companies);
    await PlacementDrive.insertMany(placementDrives);
    await MockTest.insertMany(mockTests);
    await ForumPost.insertMany(forumPosts);

    console.log("[✓] Seeding MongoDB successfully finished!");
    await mongoose.connection.close();
  } catch (err) {
    console.warn(`[Seeder] MongoDB seeding bypassed: ${err.message}. (Local HybridDB files are successfully populated instead).`);
  }
  
  console.log("[✓] Seeder complete!");
  process.exit(0);
};

seedData();
