# EduAtlas

EduAtlas is a full-stack multimedia educational content platform.

- Reader side: browse categories, open subjects, read lessons, and interact with multimedia-linked annotations.
- Admin side: manage categories, subcategories, subjects, content blocks, expandable sections, inline annotations, and media assets.

This README documents the complete implementation approach for the repository, including architecture decisions, setup instructions, and implementation details. It is written so a new contributor can quickly understand how the project is structured and why specific technical choices were made.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture and Approach](#architecture-and-approach)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Implementation Highlights](#implementation-highlights)
- [Quality Checks](#quality-checks)
- [Production Checklist](#production-checklist)

## Features

- Hierarchical content model: category -> subcategory -> subject.
- Rich lesson content with expandable sections and inline term annotations.
- Multimedia support for text, image, audio, video, and YouTube references.
- Reader and admin experiences in separate frontend routes.
- JWT-based admin authentication.
- Server-side pagination and latest-first sorting for major listing pages.

## Tech Stack

- Backend: Django, Django REST Framework, SimpleJWT, django-filter, django-cors-headers.
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Axios, TipTap.
- Database: PostgreSQL (target) with SQLite fallback for local development.
- Auth: JWT access and refresh token flow.

## Architecture and Approach

### Domain-first modeling

- `subjects` app: category, subcategory, subject hierarchy.
- `content` app: content blocks, expandable sections, inline annotations.
- `media_assets` app: reusable multimedia records.

### API-first backend design

- DRF ViewSets expose CRUD APIs under `/api/`.
- Read operations are public where needed for reader pages.
- Write operations are restricted to admin users.
- JWT endpoints:
  - `POST /api/auth/token/`
  - `POST /api/auth/token/refresh/`

### Rich editing and reading workflow

- TipTap-based content editing in admin.
- Structured JSON storage for lesson body blocks.
- UUID-linked inline annotations mapped to media assets.
- Reader experience resolves annotation context in multimedia popups.

### Practical deployment strategy

- Production-ready PostgreSQL configuration.
- SQLite fallback for quick local development.
- Clear backend/frontend separation for independent scaling.

## Project Structure

```text
.
├── backend/      # Django API + admin backend + media handling
├── frontend/     # Next.js reader/admin UI
├── requirements.md
└── readme.md
```

## Getting Started

### 1. Clone

```bash
git clone https://github.com/thabir303/EduAtlas.git
cd EduAtlas
```

### 2. Backend setup

```bash
cd backend
python -m venv ../.venv
source ../.venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Default local database:

```env
DB_ENGINE=sqlite
SQLITE_NAME=db.sqlite3
```

Run migrations:

```bash
python manage.py migrate
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

### 4. Run the project

Backend:

```bash
cd backend
source ../.venv/bin/activate
python manage.py runserver
```

Frontend:

```bash
cd frontend
npm run dev
```

Application URLs:

- Reader UI: http://localhost:3000
- Admin UI: http://localhost:3000/admin/login
- API root: http://127.0.0.1:8000/api/

## Authentication

Development admin credentials:

- Username: `admin`
- Password: `admin@password`

If needed, recreate a development admin user:

```bash
cd backend
source ../.venv/bin/activate
python manage.py shell -c "from django.contrib.auth import get_user_model; User=get_user_model(); u,_=User.objects.get_or_create(username='admin', defaults={'is_staff':True,'is_superuser':True,'email':'admin@eduatlas.local'}); u.is_staff=True; u.is_superuser=True; u.set_password('admin12345'); u.save(); print('admin ready')"
```

## Implementation Highlights

- Pagination strategy: server-side pagination in list endpoints, with visible page controls in listing UIs.
- Ordering strategy: latest-updated records are prioritized in core lists (categories, subjects, media assets).
- Content modeling: article body, expandable sections, and annotation references use structured data models.
- Security model: JWT auth for admin actions, with read-public and write-admin permission boundaries.
- Deployment readiness: env-driven settings, runtime checks, and clear production configuration guidance.

## Quality Checks

Backend validation:

```bash
cd backend
source ../.venv/bin/activate
python manage.py check
```

Frontend validation:

```bash
cd frontend
npm run lint
```

## Production Checklist

- Change `SECRET_KEY` and set `DEBUG=False`.
- Configure strict `ALLOWED_HOSTS`, CORS, and HTTPS.
- Use PostgreSQL with secure credentials.
- Use production-ready media storage.
- Rotate admin credentials and review permission boundaries.
