# Developer Tools Platform

A comprehensive free developer tools website built with Django/DRF backend and React/TypeScript frontend, featuring strategic AdSense integration for revenue generation. **29 tools and counting!**

## ✨ Features

### 🚀 All Phases + Advanced Features Implemented (29 Tools)

**📝 Text & Code Tools:**
- JSON Formatter - Pretty print JSON with customizable indentation
- JSON Validator - Validate JSON with detailed error information
- JSON Minifier - Minify JSON by removing whitespace
- **SQL Formatter** 🆕 - Format SQL queries with syntax highlighting and keyword case options
- **XML Formatter** 🆕 - Pretty print XML documents with configurable indentation
- **XML Validator** 🆕 - Validate XML structure with detailed error messages
- **YAML Formatter** 🆕 - Format and validate YAML configuration files
- **Markdown Preview** 🆕 - Live markdown editor with side-by-side HTML preview
- Text Diff - Compare two texts side-by-side with similarity percentage
- Regex Tester - Test regex patterns with live matching and capture groups
- JWT Decoder - Decode and inspect JWT tokens (header, payload, signature)

**🔤 Encoding & Decoding:**
- Base64 Encoder - Encode text to Base64
- Base64 Decoder - Decode Base64 to text
- URL Encoder - Encode text for URLs
- URL Decoder - Decode URL-encoded text
- HTML Encoder - Encode HTML entities
- HTML Decoder - Decode HTML entities

**🔄 Data Conversion:**
- CSV to JSON - Convert CSV data to JSON format
- JSON to CSV - Convert JSON arrays to CSV

**🔐 Security & Cryptography:**
- Hash Generator - Generate MD5, SHA1, SHA256, SHA512 hashes
- Password Generator - Create secure random passwords with customizable options
- Password Strength Checker - Analyze password strength with suggestions

**🎲 Generators:**
- UUID Generator - Generate unique identifiers (v1, v4)
- QR Code Generator - Generate QR codes with ASCII preview
- Color Picker - Pick colors and get HEX, RGB, HSL values
- Cron Expression Builder - Visual cron expression builder

**⏰ Time & Date:**
- Timestamp Converter - Convert between timestamps and human-readable dates with timezone support

## 🎯 Advanced Features

### Syntax Highlighting & Code Display
- **Prism-based syntax highlighting** with dark/light theme support
- **Line numbers** and **copy-to-clipboard** on all code outputs
- Support for SQL, XML, YAML, JSON, Markdown, and more

### File Operations
- **File upload** for .sql, .xml, .yaml, .md, .txt files
- **File download** with proper MIME types
- Drag-and-drop support (coming soon)

### Enhanced User Experience
- **Keyboard shortcuts** (Ctrl+Enter to format/validate)
- **Tool history** tracking (last 20 tools used)
- **Favorites/Bookmarks** for frequently used tools
- **localStorage persistence** for user preferences
- Real-time search on homepage
- Dark/Light mode toggle

## Technology Stack

### Backend
- **Framework:** Django 5.0.1 + Django REST Framework 3.14.0
- **Database:** PostgreSQL
- **Libraries:**
  - qrcode, Pillow, pytz (base tools)
  - sqlparse (SQL formatting)
  - PyYAML (YAML processing)
  - Markdown (markdown rendering)
  - Pygments (syntax highlighting)
- **Features:**
  - RESTful API endpoints (29 tool endpoints + 2 system endpoints)
  - CORS support for frontend integration
  - Rate limiting (100 requests/minute per IP)
  - Input validation and error handling
  - Analytics tracking for tool usage
  - Response caching
  - Automatic sitemap generation
  - Analytics dashboard API
  - Health check endpoints

### Frontend
- **Framework:** React 18.3 + TypeScript
- **Build Tool:** Vite 5.4
- **Styling:** Tailwind CSS 3.4
- **Libraries:**
  - react-router-dom (routing)
  - axios (HTTP client)
  - react-helmet-async (SEO)
  - prism-react-renderer (syntax highlighting) 🆕
  - react-markdown (markdown rendering) 🆕
  - file-saver (file downloads) 🆕
- **Features:**
  - Responsive design (mobile-first)
  - Dark/Light mode with persistence
  - Strategic AdSense ad placements
  - SEO optimized with meta tags and structured data
  - Real-time search functionality
  - Fast client-side processing
  - Copy-to-clipboard on all outputs
  - Processing time metrics
  - Error handling with user-friendly messages
  - Custom React hooks for history, favorites, keyboard shortcuts 🆕

### Advanced Enhancements ✅
- **Code Formatting:** SQL, XML, YAML formatters with syntax highlighting
- **File Operations:** Upload/download capabilities for all advanced tools
- **Keyboard Shortcuts:** Ctrl+Enter to format/validate
- **Tool History:** Track last 20 tools used with localStorage
- **Favorites:** Bookmark frequently used tools
- **Syntax Highlighting:** Beautiful code display with line numbers

## Project Structure

```
developer_tools/
├── backend/
│   ├── core/                 # Django settings and configuration
│   ├── tools/                # Tool implementation logic
│   ├── analytics/            # Usage tracking and analytics models
│   ├── api/                  # DRF views and endpoints
│   │   └── views/
│   │       ├── advanced_tools.py  # 🆕 SQL, XML, YAML, Markdown
│   │       └── ...
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Layout/      # Header, Footer
│   │   │   ├── Tools/       # Individual tool components (29)
│   │   │   ├── Common/      # Shared components + CodeBlock 🆕
│   │   │   └── Ads/         # Ad placement components
│   │   ├── hooks/           # 🆕 Custom hooks (history, favorites, shortcuts)
│   │   ├── pages/           # Home and ToolPage
│   │   ├── services/        # API service layer
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── README.md
├── DEPLOYMENT.md
└── PROJECT_STATUS.md
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

### JWT Tools
- `POST /api/tools/jwt/decode` - Decode JWT tokens

### Text Tools
- `POST /api/tools/text/diff` - Compare texts
- `POST /api/tools/text/regex` - Test regex patterns

### Conversion Tools
- `POST /api/tools/convert/csv-to-json` - Convert CSV to JSON
- `POST /api/tools/convert/json-to-csv` - Convert JSON to CSV

### Encoding Tools
- `POST /api/tools/encode/url` - URL encode
- `POST /api/tools/decode/url` - URL decode
- `POST /api/tools/encode/html` - HTML encode
- `POST /api/tools/decode/html` - HTML decode

### Generator Tools
- `POST /api/tools/generate/uuid` - Generate UUIDs
- `POST /api/tools/generate/qrcode` - Generate QR codes

### 🆕 Advanced Tools
- `POST /api/tools/sql/format` - Format SQL queries
- `POST /api/tools/xml/format` - Format XML documents
- `POST /api/tools/xml/validate` - Validate XML
- `POST /api/tools/yaml/format` - Format YAML files
- `POST /api/tools/markdown/preview` - Preview markdown as HTML

### System Endpoints
- `GET /api/sitemap.xml` - Automatic sitemap
- `GET /api/analytics/dashboard` - Analytics dashboard

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
- 9 core tools (JSON, Base64, Hash, Password, Timestamp, JWT, Text Diff, Regex, Conversions)
- React frontend with routing
- Initial AdSense integration

### Phase 2 ✅ (Completed)
- Additional 15 tools
- URL/HTML encoders/decoders
- UUID Generator, QR Generator
- Color Picker, Cron Builder
- Mobile optimization

### Phase 3 ✅ (Completed)
- Search functionality
- Performance optimization
- SEO implementation
- Analytics dashboard
- Server-side sitemap generation

### Phase 4 ✅ (Completed)
- Comprehensive documentation
- DEPLOYMENT.md guide
- Bug fixes and polish
- Production readiness

### Advanced Features ✅ (Completed)
- SQL, XML, YAML, Markdown tools
- Syntax highlighting
- File upload/download
- Keyboard shortcuts
- Tool history & favorites
- Custom React hooks

## Performance Targets

- Page load time: < 2 seconds
- Tool processing time: < 500ms
- Mobile responsive score: > 90
- SEO optimization for all tool pages
- Lighthouse score: 90+

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
- File upload validation for advanced tools

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

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

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
- More file format support
- PWA support for offline use
- More themes and customization options
- Additional code formatters (Python, JavaScript, CSS)
- Image optimization tools
- API documentation generator

---

## 📊 Project Statistics

```
Total Tools:         29
API Endpoints:       31
Backend Files:       60
Frontend Files:      37
Components:          32
Custom Hooks:        3
Lines of Code:       ~12,350
Version:             2.0.0
Status:              Production Ready ✅
```

---

**Built with ❤️ for developers, by developers**

For complete project status and implementation details, see [PROJECT_STATUS.md](PROJECT_STATUS.md)
