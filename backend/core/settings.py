"""
Django settings for developer_tools project.
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Trust proxy headers for getting the correct host/IP
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party apps
    'rest_framework',
    'corsheaders',
    # Local apps
    'tools',
    'analytics',
    'api',
    # New Python-powered tool apps
    'image_tools',
    'pdf_tools',
    'data_tools',
    'code_tools',
    'ml_tools',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS middleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'api.middleware.security.SecurityMiddleware',  # Custom security middleware
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'developer_tools'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# Password validation
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
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/minute',  # 100 requests per minute per IP
        'user': '1000/hour',   # 1000 requests per hour for authenticated users
        'burst': '10/second',  # Burst protection
    },
    'EXCEPTION_HANDLER': 'api.exceptions.custom_exception_handler',
    'MAX_PAGINATE_BY': 100,
}

# CORS settings - Restrict API access to frontend only
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://localhost:5173,https://devtools-co.com,https://www.devtools-co.com'
).split(',')

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Trusted referers for API requests (used by security middleware)
TRUSTED_REFERERS = [
    'localhost:3000',
    'localhost:5173',
    'devtools-co.com',
    'www.devtools-co.com',
    'backend.devtools-co.com',
]
# Only allow credentials from specific origins in production
if not DEBUG:
    CORS_ORIGIN_WHITELIST = CORS_ALLOWED_ORIGINS
    CORS_ALLOW_ALL_ORIGINS = False

# Trusted referer domains (for additional security layer)
TRUSTED_REFERERS = os.environ.get(
    'TRUSTED_REFERERS',
    'localhost:3000,localhost:5173,127.0.0.1:3000,127.0.0.1:5173,devtools-co.com,www.devtools-co.com'
).split(',')

# Cache settings (using Redis in production)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

# ==============================================================================
# CELERY CONFIGURATION
# ==============================================================================
# Celery Configuration Options
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'amqp://guest:guest@localhost:5672//')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

# Task serialization
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TIMEZONE = TIME_ZONE
CELERY_ENABLE_UTC = True

# Task result settings
CELERY_RESULT_EXPIRES = 3600  # Results expire after 1 hour
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # Hard time limit: 30 minutes
CELERY_TASK_SOFT_TIME_LIMIT = 25 * 60  # Soft time limit: 25 minutes

# Worker settings
CELERY_WORKER_PREFETCH_MULTIPLIER = 1  # Workers will grab one task at a time
CELERY_WORKER_MAX_TASKS_PER_CHILD = 100  # Restart worker after 100 tasks (memory leak prevention)

# Task retry settings
CELERY_TASK_ACKS_LATE = True  # Acknowledge task after completion
CELERY_TASK_REJECT_ON_WORKER_LOST = True
CELERY_TASK_DEFAULT_RETRY_DELAY = 60  # Retry after 60 seconds
CELERY_TASK_MAX_RETRIES = 3

# Beat schedule (for periodic tasks)
CELERY_BEAT_SCHEDULE = {
    'cleanup-old-task-results': {
        'task': 'pdf_tools.tasks.cleanup_old_results',
        'schedule': 3600.0,  # Run every hour
    },
}

# Task routes (route heavy tasks to specific queues)
CELERY_TASK_ROUTES = {
    'pdf_tools.tasks.*': {'queue': 'pdf_processing'},
    'image_tools.tasks.*': {'queue': 'image_processing'},
    'data_tools.tasks.*': {'queue': 'data_processing'},
}

# Queue configuration
CELERY_TASK_DEFAULT_QUEUE = 'default'
CELERY_TASK_QUEUES = {
    'default': {
        'exchange': 'default',
        'routing_key': 'default',
    },
    'pdf_processing': {
        'exchange': 'pdf',
        'routing_key': 'pdf.processing',
    },
    'image_processing': {
        'exchange': 'image',
        'routing_key': 'image.processing',
    },
    'data_processing': {
        'exchange': 'data',
        'routing_key': 'data.processing',
    },
}

# Monitoring
CELERY_SEND_TASK_SENT_EVENT = True
CELERY_SEND_TASK_ERROR_EMAILS = not DEBUG

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django.security': {
            'handlers': ['console', 'file'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}

# Security Settings
if not DEBUG:
    # HTTPS/SSL Settings
    SECURE_SSL_REDIRECT = True
    # Trust X-Forwarded-Proto header from nginx reverse proxy
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    # Security Headers
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'DENY'

    # Cookie Security
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Strict'
    CSRF_COOKIE_SAMESITE = 'Strict'
else:
    # Development settings
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False

# Always enforce these security settings
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'SAMEORIGIN'

# File Upload Security
FILE_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600  # 100MB
FILE_UPLOAD_PERMISSIONS = 0o644
ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
MAX_UPLOAD_SIZE = 104857600  # 100MB

# Input Validation
MAX_JSON_SIZE = 104857600  # 100MB for JSON payloads (includes base64 PDFs)
MAX_TEXT_LENGTH = 1000000  # 1 million characters for text inputs

# Environment Variable Validation
def validate_environment_variables():
    """
    Validate that required environment variables are set
    """
    import sys

    # Required variables for production
    if not DEBUG:
        required_vars = {
            'SECRET_KEY': 'Django secret key for cryptographic signing',
            'ALLOWED_HOSTS': 'Comma-separated list of allowed hostnames',
            'DB_PASSWORD': 'Database password',
        }

        missing_vars = []
        weak_vars = []

        for var, description in required_vars.items():
            value = os.environ.get(var)
            if not value:
                missing_vars.append(f"  - {var}: {description}")
            elif var == 'SECRET_KEY' and (value == 'django-insecure-dev-key-change-in-production' or len(value) < 50):
                weak_vars.append(f"  - {var}: Must be at least 50 characters and not use default value")

        if missing_vars or weak_vars:
            error_msg = "\n" + "="*80 + "\n"
            error_msg += "ENVIRONMENT VARIABLE VALIDATION FAILED\n"
            error_msg += "="*80 + "\n"

            if missing_vars:
                error_msg += "\nMissing required environment variables:\n"
                error_msg += "\n".join(missing_vars)

            if weak_vars:
                error_msg += "\n\nWeak or insecure environment variables:\n"
                error_msg += "\n".join(weak_vars)

            error_msg += "\n\nPlease set these in your environment or .env file before running in production."
            error_msg += "\nSee .env.example for reference.\n"
            error_msg += "="*80 + "\n"

            print(error_msg, file=sys.stderr)
            sys.exit(1)

    # Optional: Warn about recommended variables
    recommended_vars = ['CORS_ALLOWED_ORIGINS']
    for var in recommended_vars:
        if not os.environ.get(var):
            print(f"Warning: {var} not set. Using default configuration.", file=sys.stderr)

# Run validation when settings module is loaded
validate_environment_variables()
