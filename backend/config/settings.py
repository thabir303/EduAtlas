import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from dj_database_url import UnknownSchemeError
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = os.getenv("SECRET_KEY", "unsafe-dev-secret-key")
DEBUG = os.getenv("DEBUG", "False") == "True"


def env_list(key: str, default: str = "") -> list[str]:
    raw = os.getenv(key, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


def env_bool(key: str, default: bool = False) -> bool:
    value = os.getenv(key)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'django_filters',
    'storages',
    'subjects',
    'content',
    'media_assets',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

database_url = os.getenv('DATABASE_URL', '').strip()
db_engine = os.getenv('DB_ENGINE', 'sqlite').lower()

# Ignore common placeholder mistakes from hosting dashboards.
if database_url in {'://', 'postgres://', 'postgresql://'}:
    database_url = ''

if database_url:
    try:
        DATABASES = {
            'default': dj_database_url.parse(
                database_url,
                conn_max_age=600,
                ssl_require=not DEBUG,
            )
        }
    except (UnknownSchemeError, ValueError):
        database_url = ''

if not database_url and db_engine == 'sqlite':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / os.getenv('SQLITE_NAME', 'db.sqlite3'),
        }
    }
elif not database_url:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'multimedia_edu'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }


# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000',
)
CORS_ALLOWED_ORIGINS = env_list('CORS_ALLOWED_ORIGINS', CORS_ALLOWED_ORIGINS)
CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000')

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

USE_CLOUDFLARE_R2 = env_bool('USE_CLOUDFLARE_R2', default=False)

if USE_CLOUDFLARE_R2:
    r2_account_id = os.getenv('CLOUDFLARE_R2_ACCOUNT_ID', '').strip()
    r2_access_key_id = os.getenv('CLOUDFLARE_R2_ACCESS_KEY_ID', '').strip()
    r2_secret_access_key = os.getenv('CLOUDFLARE_R2_SECRET_ACCESS_KEY', '').strip()
    r2_bucket_name = os.getenv('CLOUDFLARE_R2_BUCKET_NAME', '').strip()
    r2_public_base_url = os.getenv('CLOUDFLARE_R2_PUBLIC_BASE_URL', '').strip()

    missing = [
        key for key, value in {
            'CLOUDFLARE_R2_ACCOUNT_ID': r2_account_id,
            'CLOUDFLARE_R2_ACCESS_KEY_ID': r2_access_key_id,
            'CLOUDFLARE_R2_SECRET_ACCESS_KEY': r2_secret_access_key,
            'CLOUDFLARE_R2_BUCKET_NAME': r2_bucket_name,
            'CLOUDFLARE_R2_PUBLIC_BASE_URL': r2_public_base_url,
        }.items() if not value
    ]
    if missing:
        raise ImproperlyConfigured(
            'USE_CLOUDFLARE_R2 is enabled but missing env vars: ' + ', '.join(missing)
        )

    AWS_ACCESS_KEY_ID = r2_access_key_id
    AWS_SECRET_ACCESS_KEY = r2_secret_access_key
    AWS_STORAGE_BUCKET_NAME = r2_bucket_name
    AWS_S3_ENDPOINT_URL = f'https://{r2_account_id}.r2.cloudflarestorage.com'
    AWS_S3_REGION_NAME = 'auto'
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = False
    AWS_S3_FILE_OVERWRITE = False

    STORAGES = {
        'default': {
            'BACKEND': 'storages.backends.s3.S3Storage',
        },
        'staticfiles': {
            'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
        },
    }

    MEDIA_URL = r2_public_base_url.rstrip('/') + '/'

FORCE_HTTPS = env_bool('FORCE_HTTPS', default=not DEBUG)
if FORCE_HTTPS:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# Temporary production media serving from local disk.
# Keep this True only when not using S3/Cloudinary.
SERVE_MEDIA_FILES = env_bool('SERVE_MEDIA_FILES', default=not USE_CLOUDFLARE_R2)

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
