# EduAtlas

EduAtlas is a full-stack multimedia educational content platform with:

- Reader side: browse categories, open subjects, read article content, and interact with multimedia-linked annotations.
- Admin side: manage categories, subcategories, subjects, content blocks, expandable sections, inline annotations, and media assets.


## Tech Stack

- Backend: Django, Django REST Framework, SimpleJWT, django-filter, django-cors-headers
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Axios, TipTap
- Database: PostgreSQL (target) with SQLite fallback for local development
- Auth: JWT (`access` + `refresh`)

## Project Structure

```text
.
├── backend/      # Django API + Admin + media handling
├── frontend/     # Next.js reader/admin UI
├── requirements.md
└── readme.md
```

## Local Setup

### 1. Clone

```bash
git clone https://github.com/thabir303/EduAtlas.git
cd EduAtlas
```

### 2. Backend Setup

```bash
cd backend
python -m venv ../.venv
source ../.venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Default local development currently uses SQLite via:

```env
DB_ENGINE=sqlite
SQLITE_NAME=db.sqlite3
```

Then run migrations:

```bash
python manage.py migrate
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Run the Project

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

Open:

- Reader UI: http://localhost:3000
- Admin UI: http://localhost:3000/admin/login
- API root: http://127.0.0.1:8000/api/

## Admin Login (Development)

- Username: `admin`
- Password: `admin@password`

If needed, reset/create the dev admin user:

```bash
cd backend
source ../.venv/bin/activate
python manage.py shell -c "from django.contrib.auth import get_user_model; User=get_user_model(); u,_=User.objects.get_or_create(username='admin', defaults={'is_staff':True,'is_superuser':True,'email':'admin@eduatlas.local'}); u.is_staff=True; u.is_superuser=True; u.set_password('admin12345'); u.save(); print('admin ready')"
```

## Project Approach

### 1. Domain-first data model

- `subjects` app: Category -> Subcategory -> Subject hierarchy
- `content` app: ContentBlock, ExpandableSection, InlineAnnotation
- `media_assets` app: text/image/audio/video/youtube resources

This keeps educational structure and content management clearly separated.

### 2. API-first architecture

- DRF ViewSets expose CRUD endpoints under `/api/`
- Public read access for reader pages
- Admin-only write operations via `IsAdminUser`
- JWT token endpoints:
	- `POST /api/auth/token/`
	- `POST /api/auth/token/refresh/`

### 3. Rich content editing workflow

- Admin uses TipTap-based editor
- Body content is persisted in structured JSON nodes
- Inline annotations map terms to media assets using UUID links
- Reader side resolves and displays multimedia context in modal interactions

### 4. Practical local development strategy

- PostgreSQL-ready configuration for deployment
- SQLite fallback for fast local run/debug
- Separation of backend/frontend enables independent iteration and scaling

## Quality Checks

Backend:

```bash
cd backend
source ../.venv/bin/activate
python manage.py check
```

Frontend:

```bash
cd frontend
npm run lint
```

## Notes for Production

- Change `SECRET_KEY`, disable `DEBUG`, configure strict `ALLOWED_HOSTS`
- Use PostgreSQL and strong admin credentials
- Configure proper CORS and HTTPS
- Store media with production-ready storage (local media is for development)
