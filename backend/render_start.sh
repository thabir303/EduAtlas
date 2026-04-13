#!/usr/bin/env bash
set -euo pipefail

if [[ "${RUN_MIGRATIONS_ON_START:-False}" =~ ^([Tt][Rr][Uu][Ee]|1|yes|on)$ ]]; then
  python manage.py migrate --noinput
fi

exec gunicorn config.wsgi:application
