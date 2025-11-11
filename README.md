# Developer Tools Platform

A comprehensive free developer tools website built with Django/DRF backend and React/TypeScript frontend, featuring strategic AdSense integration for revenue generation.

## Features

### Phase 1 - Core Tools (Implemented)

**Text & Code Tools:**
- JSON Formatter - Pretty print JSON with customizable indentation
- JSON Validator - Validate JSON with detailed error information
- JSON Minifier - Minify JSON by removing whitespace

**Encoding & Decoding:**
- Base64 Encoder - Encode text to Base64
- Base64 Decoder - Decode Base64 to text

**Security & Cryptography:**
- Hash Generator - Generate MD5, SHA1, SHA256, SHA512 hashes
- Password Generator - Create secure random passwords with customizable options
- Password Strength Checker - Analyze password strength with suggestions

**Time & Date:**
- Timestamp Converter - Convert between timestamps and human-readable dates

## Technology Stack

### Backend
- **Framework:** Django 5.0.1 + Django REST Framework 3.14.0
- **Database:** PostgreSQL
- **Features:**
  - RESTful API endpoints
  - CORS support for frontend integration
  - Rate limiting (100 requests/minute per IP)
  - Input validation and error handling
  - Analytics tracking for tool usage
  - Response caching

### Frontend
- **Framework:** React 18.3 + TypeScript
- **Build Tool:** Vite 5.4
- **Styling:** Tailwind CSS 3.4
- **Features:**
  - Responsive design (mobile-first)
  - Dark/Light mode
  - Strategic AdSense ad placements
  - SEO optimized
  - Fast client-side processing

## Project Structure

```
developer_tools/
├── backend/
│   ├── core/                 # Django settings and configuration
│   ├── tools/                # Tool implementation logic
│   ├── analytics/            # Usage tracking and analytics models
│   ├── api/                  # DRF views and endpoints
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Layout/      # Header, Footer
│   │   │   ├── Tools/       # Individual tool components
│   │   │   ├── Ads/         # Ad placement components
│   │   │   └── Common/      # Shared components
│   │   ├── pages/           # Home and ToolPage
│   │   ├── services/        # API service layer
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd developer_tools
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and configure your database and other settings
   ```

5. **Create PostgreSQL database:**
   ```bash
   createdb developer_tools
   # Or using psql:
   # psql -U postgres
   # CREATE DATABASE developer_tools;
   ```

6. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

8. **Run development server:**
   ```bash
   python manage.py runserver
   # Backend will be available at http://localhost:8000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Default API URL is http://localhost:8000/api
   ```

4. **Run development server:**
   ```bash
   npm run dev
   # Frontend will be available at http://localhost:3000
   ```

## API Endpoints

### JSON Tools
- `POST /api/tools/json/format` - Format JSON
- `POST /api/tools/json/validate` - Validate JSON
- `POST /api/tools/json/minify` - Minify JSON

### Base64 Tools
- `POST /api/tools/base64/encode` - Encode to Base64
- `POST /api/tools/base64/decode` - Decode from Base64

### Hash Tools
- `POST /api/tools/hash/generate` - Generate hashes

### Password Tools
- `POST /api/tools/password/generate` - Generate passwords
- `POST /api/tools/password/strength` - Check password strength

### Timestamp Tools
- `POST /api/tools/timestamp/convert` - Convert timestamps

## AdSense Integration

The platform includes strategic ad placements optimized for revenue:

### Homepage:
- Top banner (728x90)
- Between category sections (native ads)
- Bottom banner

### Tool Pages:
- Below header (responsive banner)
- Sidebar (sticky 160x600 or 300x600)
- In-content (native ad)
- Below results (matched content)

**Important:** Replace placeholder ad codes in the Ad components with your actual AdSense ad unit codes:
- `frontend/src/components/Ads/AdBanner.tsx`
- `frontend/src/components/Ads/AdSidebar.tsx`

## Development Roadmap

### Phase 1 ✅ (Completed)
- Basic Django setup with PostgreSQL
- 5 core tools (JSON, Base64, Hash, Password, Timestamp)
- React frontend with routing
- Initial AdSense integration

### Phase 2 (Weeks 3-4)
- Additional 20+ tools
- Search functionality
- Advanced ad placements
- Mobile optimization
- More conversion tools (CSV↔JSON, YAML↔JSON, XML↔JSON)
- Color picker, QR generator
- JWT decoder, Regex tester
- Cron expression builder

### Phase 3 (Weeks 5-6)
- Performance optimization
- SEO implementation
- Analytics dashboard
- A/B testing framework
- Server-side rendering for SEO

### Phase 4 (Weeks 7-8)
- Bug fixes and polish
- Load testing
- Comprehensive documentation
- Launch preparation

## Performance Targets

- Page load time: < 2 seconds
- Tool processing time: < 500ms
- Mobile responsive score: > 90
- SEO optimization for all tool pages

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## Security

- All input is validated on both frontend and backend
- Rate limiting prevents abuse
- CORS properly configured
- No data is stored (privacy-first)
- All processing happens securely

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API endpoint documentation

## Deployment

### Backend (Production)
```bash
# Set environment variables
export DEBUG=False
export SECRET_KEY=your-production-secret-key
export ALLOWED_HOSTS=your-domain.com

# Collect static files
python manage.py collectstatic --noinput

# Run with gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:8000
```

### Frontend (Production)
```bash
# Build for production
npm run build

# Serve the dist folder with your preferred static server
# (nginx, Apache, Vercel, Netlify, etc.)
```

## Analytics & Monitoring

The platform tracks:
- Tool usage statistics
- Processing times
- Error rates
- User sessions
- Ad performance (via AdSense dashboard)

Access analytics through Django admin at `/admin/`

## Future Enhancements

- User accounts and saved preferences
- API rate limiting per user
- Premium tier without ads
- Batch processing for multiple conversions
- File upload support for larger datasets
- Export/download results
- Keyboard shortcuts
- PWA support for offline use
- More themes and customization options

---

**Built with ❤️ for developers, by developers**
