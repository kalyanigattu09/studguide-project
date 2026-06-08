// STUGUIDE X - Admin Panel & Report Generator Controller
const User = require('../models/User');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');
const Profile = require('../models/Profile');
const Result = require('../models/Result');
const hybridDb = require('../config/hybridDb');

// @desc    Get Overall Dashboard Analytics
// @route   GET /api/admin/stats
// @access  Private (PlacementOfficer/Admin)
exports.getStats = async (req, res, next) => {
  try {
    let usersCount = 0;
    let studentsCount = 0;
    let companiesCount = 0;
    let drivesCount = 0;
    let applicationsCount = 0;
    let placedCount = 0;

    if (hybridDb.isActive) {
      const users = hybridDb.find('users');
      usersCount = users.length;
      studentsCount = users.filter(u => u.role === 'Student').length;
      companiesCount = hybridDb.find('companies').length;
      drivesCount = hybridDb.find('placementdrives').length;
      
      const apps = hybridDb.find('applications');
      applicationsCount = apps.length;
      placedCount = apps.filter(a => a.status === 'Selected').length;
    } else {
      usersCount = await User.countDocuments();
      studentsCount = await User.countDocuments({ role: 'Student' });
      companiesCount = await Company.countDocuments();
      drivesCount = await PlacementDrive.countDocuments();
      applicationsCount = await Application.countDocuments();
      placedCount = await Application.countDocuments({ status: 'Selected' });
    }

    const placementRatio = studentsCount > 0 
      ? Math.round((placedCount / studentsCount) * 100) 
      : 0;

    // Hardcode activity logs mockup
    const activityLogs = [
      { user: "Officer Ramesh", action: "Created placement drive for Google SDE-1", time: "10 mins ago" },
      { user: "Student Kalyan", action: "Submitted mock test JavaScript Basics", time: "25 mins ago" },
      { user: "Student Adarsh", action: "Applied to Amazon recruitment drive", time: "1 hr ago" },
      { user: "Faculty Sharma", action: "Recommended Career path DevOps to Student Kalyan", time: "2 hrs ago" }
    ];

    res.status(200).json({
      success: true,
      data: {
        usersCount,
        studentsCount,
        companiesCount,
        drivesCount,
        applicationsCount,
        placedCount,
        placementRatio,
        activityLogs
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export Placement Reports (PDF mockup or Excel CSV)
// @route   GET /api/admin/reports/:type
// @access  Private (PlacementOfficer/Admin)
exports.exportReport = async (req, res, next) => {
  try {
    const { type } = req.params; // 'excel' or 'pdf'
    
    let students;
    if (hybridDb.isActive) {
      const profiles = hybridDb.find('profiles');
      const users = hybridDb.find('users');
      students = profiles.map(p => {
        const u = users.find(user => user._id === p.user) || {};
        return { name: u.name, email: u.email, rollNo: p.rollNo, branch: p.branch, cgpa: p.cgpa, readiness: p.placementReadinessScore };
      });
    } else {
      const profiles = await Profile.find().populate('user', 'name email');
      students = profiles.map(p => ({
        name: p.user ? p.user.name : 'Unknown',
        email: p.user ? p.user.email : '',
        rollNo: p.rollNo,
        branch: p.branch,
        cgpa: p.cgpa,
        readiness: p.placementReadinessScore
      }));
    }

    if (type === 'excel') {
      // Generate a CSV report
      let csv = 'Name,Email,Roll Number,Branch,CGPA,Placement Readiness Score%\n';
      students.forEach(s => {
        csv += `"${s.name}","${s.email}","${s.rollNo}","${s.branch}",${s.cgpa},${s.readiness}%\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=placement_success_report.csv');
      return res.status(200).send(csv);
    } else {
      // Generate a structured HTML print version acting as a mock PDF report
      let html = `
        <html>
          <head>
            <style>
              body { font-family: sans-serif; padding: 30px; color: #1f2937; }
              h1 { font-size: 24px; border-bottom: 2px solid #6366f1; padding-bottom: 10px; color: #4338ca; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
              th { background-color: #f3f4f6; font-weight: bold; }
              .header { margin-bottom: 30px; }
              .footer { margin-top: 40px; font-size: 12px; color: #9ca3af; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>STUGUIDE X - PLACEMENT CELL PERFORMANCE ANALYSIS</h1>
              <p>Generated on: ${new Date().toLocaleString()}</p>
              <p>Total Registered Students: ${students.length}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll Number</th>
                  <th>Branch</th>
                  <th>CGPA</th>
                  <th>Readiness Score</th>
                </tr>
              </thead>
              <tbody>
                ${students.map(s => `
                  <tr>
                    <td>${s.name}</td>
                    <td>${s.rollNo}</td>
                    <td>${s.branch}</td>
                    <td>${s.cgpa}</td>
                    <td>${s.readiness}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">
              <p>© 2026 STUGUIDE X Placement Intelligence Ecosystem. All Rights Reserved.</p>
            </div>
          </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', 'attachment; filename=placement_performance_report.html');
      return res.status(200).send(html);
    }
  } catch (err) {
    next(err);
  }
};
