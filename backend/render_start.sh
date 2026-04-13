#!/usr/bin/env bash
set -euo pipefail

is_truthy() {
  [[ "${1:-}" =~ ^([Tt][Rr][Uu][Ee]|1|yes|on)$ ]]
}

if is_truthy "${RUN_MIGRATIONS_ON_START:-False}"; then
  python manage.py migrate --noinput
fi

if is_truthy "${AUTO_CREATE_ADMIN:-False}" && ! is_truthy "${RUN_MIGRATIONS_ON_START:-False}"; then
  echo "AUTO_CREATE_ADMIN is enabled, running migrations first to ensure auth tables exist."
  python manage.py migrate --noinput
fi

if is_truthy "${AUTO_CREATE_ADMIN:-False}"; then
  python manage.py shell <<'PY'
import os
from django.contrib.auth import get_user_model

username = os.getenv("DJANGO_SUPERUSER_USERNAME", "").strip()
password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "")
email = os.getenv("DJANGO_SUPERUSER_EMAIL", "").strip()

if not username or not password:
  print("AUTO_CREATE_ADMIN is enabled but DJANGO_SUPERUSER_USERNAME or DJANGO_SUPERUSER_PASSWORD is missing. Skipping admin bootstrap.")
  raise SystemExit(0)

User = get_user_model()
defaults = {
  "email": email,
  "is_staff": True,
  "is_superuser": True,
}

user, created = User.objects.get_or_create(username=username, defaults=defaults)

if email and user.email != email:
  user.email = email

user.is_staff = True
user.is_superuser = True
user.set_password(password)
user.save()

action = "created" if created else "updated"
print(f"Admin user {action}: {username}")
PY
fi

exec gunicorn config.wsgi:application
