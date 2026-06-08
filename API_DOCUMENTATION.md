# STUGUIDE X API Documentation

Base URL: `http://localhost:5000/api`

Protected endpoints require:

```http
Authorization: Bearer <jwt>
```

## Auth

`POST /auth/register`

Body:

```json
{ "name": "Kalyan Kumar", "email": "kalyan@stuguide.edu", "password": "password123", "role": "Student" }
```

`POST /auth/login`

```json
{ "email": "kalyan@stuguide.edu", "password": "password123" }
```

`GET /auth/me`

Returns the current authenticated user.

`GET /auth/logout`

Clears auth cookie and cached session.

`POST /auth/forgot-password`

```json
{ "email": "kalyan@stuguide.edu" }
```

Returns a local `devResetToken` for demo reset flow.

`PUT /auth/reset-password/:token`

```json
{ "password": "newpass123" }
```

`PUT /auth/verify-email/:token`

Marks a demo account email as verified.

## Profile

`GET /profile` or `GET /profile/me`

Gets or creates the current user profile.

`POST /profile` or `PUT /profile`

Updates profile fields and recalculates completion/readiness scores.

`POST /profile/analyze-resume`

```json
{ "resumeText": "Education... Skills: React.js Node.js Git..." }
```

Returns ATS score, extracted skills, missing skills, and suggestions.

## Career Guidance

`GET /guidance/roles`

Lists supported career roles.

`GET /guidance/roadmap/:role`

Returns a visual career roadmap for a role.

`POST /guidance/gaps`

Runs skill-gap analysis for the current student.

## Placement

`GET /placement/drive` or `GET /placement/drives`

Lists placement drives sorted by priority/deadline.

`POST /placement/drive` or `POST /placement/drives`

Admin/Placement Officer creates a drive.

`POST /placement/drive/:id/apply` or `POST /placement/drives/:id/apply`

Student applies to a drive.

`GET /placement/company` or `GET /placement/companies`

Lists companies.

`POST /placement/company` or `POST /placement/companies`

Admin/Placement Officer creates a company.

`GET /placement/applications/my`

Current student applications.

`GET /placement/drives/:id/applicants`

Admin/Placement Officer applicant list for a drive.

`PUT /placement/applications/:id/status`

Admin/Placement Officer updates application status.

## Mock Tests

`GET /mocktest`

Lists tests.

`GET /mocktest/:id`

Gets a test and question bank.

`POST /mocktest/:id/submit`

Submits answers and generates a result.

`GET /mocktest/leaderboard`

Returns ranking data.

## Productivity

`GET /productivity/tasks?date=YYYY-MM-DD`

`POST /productivity/tasks`

`PUT /productivity/tasks/:id/status`

`GET /productivity/habits`

`POST /productivity/habits`

`PUT /productivity/habits/:id/complete`

`POST /productivity/reminder`

`GET /productivity/notifications`

`PUT /productivity/notifications/:id/read`

## Resources

`GET /resources?q=react&category=All&type=All&bookmarked=false`

Searches resources and returns Trie suggestions.

`POST /resources`

Faculty, Placement Officer, or Admin creates a resource.

`PUT /resources/:id/bookmark`

Toggles bookmark for the current user.

## Forum

`GET /forum`

`POST /forum`

`GET /forum/:id`

`POST /forum/:id/comment`

`PUT /forum/:id/like`

## Admin And Reports

`GET /admin/stats`

Admin/Placement Officer analytics summary.

`GET /admin/reports/excel`

Downloads CSV placement report.

`GET /admin/reports/pdf`

Downloads printable HTML placement report.
