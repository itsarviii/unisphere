<div align="center">
  <img src="frontend/public/logo.png" width="72" height="72" alt="UniSphere" />
  <h1>UniSphere</h1>
  <p>The campus social platform — follow societies, discover events, and get a feed personalised to your interests.</p>

  <p>
    <a href="https://unisphere-aru.vercel.app"><strong>unisphere-aru.vercel.app</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Django-5-092e20?logo=django&logoColor=white" alt="Django" />
    <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-pgvector-3ecf8e?logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Gemini-AI-4285f4?logo=google&logoColor=white" alt="Gemini" />
    <img src="https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel" alt="Vercel" />
  </p>
</div>

---

## Features

- **AI-personalised feed** — Posts and events are embedded with Gemini and ranked by cosine similarity to your interest profile, with a recency and follow bonus
- **Societies** — Create and manage university societies, post updates, and keep members in the loop
- **Events** — Societies host events with date, location, and RSVP; upcoming events surface in the feed
- **AI writing assist** — One-click draft generation for post and event descriptions powered by Gemini 2.5 Flash
- **Interest onboarding** — Pick interests on sign-up across 20 categories; they drive your feed from day one
- **Engagement** — Like and comment on posts, RSVP to events, all directly from the feed
- **Auth** — Email/password registration with JWT and automatic token refresh

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 5, Django REST Framework, SimpleJWT |
| Database | PostgreSQL (Supabase) + pgvector (3072-dim embeddings) |
| AI | Gemini API — `gemini-embedding-001` for feed ranking, `gemini-2.5-flash` for writing assist |
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion |
| Deployment | Render (Docker backend), Vercel (frontend) |

## Getting Started

**Prerequisites:** Python 3.11+, Node.js 18+, a PostgreSQL database, a Google AI Studio API key

```bash
git clone https://github.com/itsarviii/unisphere.git
cd unisphere
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://...
SECRET_KEY=any-secret-string
GEMINI_API_KEY=your-key-from-aistudio.google.com
DEBUG=True
```

```bash
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api/
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## How the Feed Works

When a user registers they pick interests (e.g. Artificial Intelligence, Photography). Each post and event is embedded on creation using `gemini-embedding-001` and stored as a 3072-dimension vector in pgvector. On each feed request, the user's interests are embedded into a query vector, cosine similarity is computed against all recent posts and upcoming events, and a score is calculated combining similarity, recency, and a follow bonus. Top 50 items are returned. If the Gemini API is unavailable the feed falls back to keyword matching.

## Project Structure

```
backend/
├── users/          # Custom user model, registration, JWT auth
├── societies/      # Society CRUD, follow/unfollow, membership
├── posts/          # Post CRUD, likes, comments
├── events/         # Event CRUD, RSVP
├── feed/           # AI-ranked feed endpoint
└── utils/          # Gemini embeddings, AI writing assist, health check
frontend/
└── src/
    ├── pages/      # Home, Feed, Explore, Society, Profile, SignIn, SignUp
    ├── components/ # Navbar, cards, modals
    ├── context/    # AuthContext, ToastContext, ModalContext
    └── api/        # Axios client with JWT refresh interceptor
```

## Academic Context

Developed as a final year project for **MOD002691** at **Anglia Ruskin University**, supervised by **Dr Razvan Dinita**.
