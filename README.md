# STUGUIDE X

AI-inspired student success, career guidance, placement preparation, and placement-cell intelligence platform built with the MERN stack.

## Tech Stack

- Frontend: React, React Router, Tailwind CSS, Framer Motion, Recharts, Axios, Lucide icons
- Backend: Node.js, Express.js, JWT, bcrypt, Helmet, rate limiting
- Database: MongoDB with Mongoose, plus a HybridDB JSON fallback in `.db/fallback_db.json`
- Architecture: MVC backend, modular React pages/components, reusable services for data structures

## Main Modules

- JWT authentication, role-based access, logout, forgot/reset password, email verification token flow
- Student profile management with completion score and placement readiness score
- Resume Analyzer with ATS score, extracted skills, missing keywords, and profile score sync
- Career guidance engine with rule-based roadmaps and skill recommendations
- Student dashboard with KPIs, charts, active drives, and leaderboard summary
- Placement drive management and applications
- Mock test platform and leaderboard
- Smart planner, reminders, notification center, and habit tracker
- Resource Hub with searchable notes/videos/links/PDF records and bookmarks
- Discussion forum
- Admin analytics and Report Center with CSV/HTML exports
- Data structure services: HashMap, Queue, PriorityQueue, Trie, Graph, Heap

## Demo Credentials

All demo accounts use:

```text
password123
```

```text
kalyan@stuguide.edu      Student
ramesh@stuguide.edu      PlacementOfficer
admin@stuguide.edu       Admin
```

Run the seeder first if these accounts are not available.

## Run Locally

This workspace includes a portable Node binary under `.node`.

```powershell
$env:Path = "$PWD\.node\node-v20.11.1-win-x64;$env:Path"
.\.node\node-v20.11.1-win-x64\npm.cmd run seed
.\.node\node-v20.11.1-win-x64\npm.cmd run dev
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:5000`

If MongoDB is not running locally, the backend automatically falls back to `.db/fallback_db.json`.

## Build

```powershell
$env:Path = "$PWD\.node\node-v20.11.1-win-x64;$env:Path"
.\.node\node-v20.11.1-win-x64\npm.cmd run build --prefix frontend
```

## Notes

- Email delivery is implemented as a local demo token flow. Registration and forgot-password endpoints return development tokens that can be opened in the frontend routes.
- Report export supports CSV and printable HTML. The HTML export can be saved as PDF from the browser print dialog.
- Resume PDF/DOCX upload on the frontend reads file text where possible; pasting resume content gives the most reliable analyzer result without adding extra parser dependencies.
