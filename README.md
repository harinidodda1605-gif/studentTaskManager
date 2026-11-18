# Daybook — Student Task Manager

A responsive student planner with a React dashboard and a MongoDB-backed Express REST API. Each account can only read and change its own tasks.

## Requirements

- Node.js 18+
- MongoDB 6+ (local or hosted)

## Run locally

1. Start MongoDB and create `backend/.env` from `backend/.env.example`. Set `MONGODB_URI` and a long, random `JWT_SECRET`.
2. In `backend`, run `npm install` and `npm run dev` (API on port 5000).
3. In `frontend`, run `npm install` and `npm run dev` (Vite on port 5173).
4. Open `http://localhost:5173`, create an account, and add a task.

Set `VITE_API_URL` when the API is hosted at a different origin. Set `CLIENT_ORIGIN` on the API to the frontend's origin.

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/dashboard/stats`
- `GET /api/tasks` (supports `search`, `status`, `category`, `priority`, `sort`, and `order`)
- `POST /api/tasks`, `GET /api/tasks/:id`, `PUT /api/tasks/:id`, `PATCH /api/tasks/:id/status`, `DELETE /api/tasks/:id`
- `GET /api/health`

All task and dashboard routes require `Authorization: Bearer <token>`. Passwords are hashed with bcrypt; tokens expire after seven days. Request validation, ownership scoping, rate limiting on auth routes, Helmet, CORS, and centralized API errors are included.

## Task fields

Title, description, category (Assignment, Exam, Project, Personal, Reading, Other), priority, due date, status (Pending, In Progress, Completed), and course/class.
