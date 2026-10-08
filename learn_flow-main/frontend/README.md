# LearnFlow MERN

LearnFlow is a private course-library app built with MongoDB, Express, React, Node.js, Tailwind CSS v4 and Framer Motion. It imports the supplied video and PDF catalogs, provides authenticated study access, and stores real progress instead of displaying invented activity.

## Included features

- JWT authentication using an HTTP-only cookie
- Responsive Overview, All Courses, Course Details, Search, Continue Learning and Bookmarks pages
- HLS video playback with MP4 fallback
- Playback position saved to MongoDB every 10 seconds and on pause
- Completed-lesson tracking
- Course curriculum grouped from the CSV `section` field
- PDF resource library and in-app PDF viewer
- PDF URL proxy so token-bearing source URLs never reach the browser
- PDF last-page tracking
- Lesson and PDF bookmarks
- Auto-saving lesson notes
- Framer Motion page/card/sidebar transitions
- Tailwind CSS v4 responsive styling
- Render deployment blueprint and local MongoDB Docker Compose file

## Project structure

```text
learnflow-mern/
├── backend/
│   ├── data/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── scripts/
│       └── utils/
├── frontend/
│   ├── public/
│   └── src/
├── docker-compose.yml
├── render.yaml
└── package.json
```

## Local setup

### 1. Start MongoDB

Use an installed MongoDB instance or Docker:

```bash
docker compose up -d
```

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Set the two CSV paths in `backend/.env`. Paths are resolved relative to the `backend` folder:

```env
VIDEOS_CSV=/absolute/path/to/videos_final.csv
PDFS_CSV=/absolute/path/to/pdfs_final.csv
```

Use a long random value for `JWT_SECRET`.

### 3. Install packages

```bash
npm install
npm run install:all
```

### 4. Import the course catalog

```bash
npm run import:data
```

Expected catalog size for the supplied files:

- 8 courses
- 2,411 videos
- 212 PDFs

The importer is idempotent. It updates records by `video_id` and `object_id` instead of creating duplicates.

### 5. Run the app

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api`

Create an account from the Register page. There is no hardcoded demo user.

## Production deployment

### Render + MongoDB Atlas

1. Push this project to a private Git repository.
2. Create a MongoDB Atlas database and allow the Render service to connect.
3. Create a Render Blueprint from `render.yaml`.
4. Set `MONGODB_URI` and `CLIENT_URL` in Render.
5. Run the import command locally against Atlas, or temporarily use a private one-off job with the CSV paths available.

The Express server serves `frontend/dist` in production, so only one web service is required.

## Important security notes

- Do not commit `pdfs_final.csv`. Its source URLs include access tokens.
- Do not send `pdfUrl` in catalog JSON. The schema uses `select: false`, and PDFs are streamed through the authenticated backend route.
- Keep the repository private unless you remove all licensed course URLs and content references.
- Source access tokens can expire. Re-import a refreshed PDF CSV when the provider rotates them.
- Before public deployment, verify that you have permission to host or proxy every course asset.

## Main API routes

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/catalog/summary
GET    /api/catalog/courses
GET    /api/catalog/courses/:slug
GET    /api/catalog/lessons?q=
GET    /api/catalog/lessons/:id
GET    /api/catalog/pdfs/:id
GET    /api/catalog/pdfs/:id/file

GET    /api/progress/continue
GET    /api/progress/lessons/:lessonId
PUT    /api/progress/lessons/:lessonId
DELETE /api/progress/lessons/:lessonId
GET    /api/progress/pdfs/:pdfId
PUT    /api/progress/pdfs/:pdfId

GET    /api/bookmarks
GET    /api/bookmarks/status
POST   /api/bookmarks/toggle

GET    /api/notes/lessons/:lessonId
PUT    /api/notes/lessons/:lessonId
```

## Data behavior

- Course/video/PDF totals come from imported catalog records.
- Continue Learning appears only after a real playback position is saved.
- Completed lessons appear only after the video reaches 95% or the user marks it complete.
- Empty states are shown when no progress or bookmarks exist.
- PDFs are course-level resources because the PDF CSV has no section or lesson mapping.
