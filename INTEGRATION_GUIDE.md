# Developer Tools - Full Stack Integration Guide

Complete guide for integrating the React frontend with the Python-powered Django backend.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │
│  │  UI Tools  │  │  Services  │  │  Google AdSense    │    │
│  │ Components │  │  API Layer │  │  Monetization      │    │
│  └────────────┘  └────────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Django Backend (Python)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Image Tools  │  │  PDF Tools   │  │  Data Tools  │     │
│  │  PIL/OpenCV  │  │  PyPDF2      │  │ pandas/numpy │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Code Tools  │  │   ML Tools   │                        │
│  │ black/radon  │  │ sklearn/tf   │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │  PostgreSQL  │
                      └──────────────┘
```

## Quick Start (Docker)

The fastest way to get everything running:

```bash
# Clone the repository
git clone <repository-url>
cd developer_tools

# Create environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# Wait for services to be ready
docker-compose logs -f backend

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Django Admin: http://localhost:8000/admin
```

## Manual Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 15+ (or use SQLite for dev)

### Backend Setup

1. **Navigate to backend**:
```bash
cd backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment** (`.env`):
```bash
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=developer_tools
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

5. **Run migrations**:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create superuser** (optional):
```bash
python manage.py createsuperuser
```

7. **Start backend server**:
```bash
python manage.py runserver 0.0.0.0:8000
```

### Frontend Setup

1. **Navigate to frontend**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment** (`.env`):
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_TEST_MODE=true
VITE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
```

4. **Start dev server**:
```bash
npm run dev
```

5. **Access application**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs (if enabled)

## Frontend-Backend Integration

### Using Backend APIs in Frontend

The frontend includes a comprehensive API service layer in `frontend/src/services/backendApi.ts`.

#### Example 1: Image Enhancement

```typescript
import { imageTools, fileToBase64 } from '@/services/backendApi'

// In your React component
const handleImageEnhance = async (file: File) => {
  try {
    // Convert file to base64
    const imageBase64 = await fileToBase64(file)

    // Call backend API
    const result = await imageTools.enhance({
      image: imageBase64,
      brightness: 1.2,
      contrast: 1.1,
      auto_enhance: false
    })

    // Use the enhanced image
    setEnhancedImage(`data:image/png;base64,${result.image}`)
  } catch (error) {
    console.error('Enhancement failed:', error)
  }
}
```

#### Example 2: CSV Data Analysis

```typescript
import { dataTools } from '@/services/backendApi'

const analyzeData = async (csvContent: string) => {
  try {
    const analysis = await dataTools.analyzeCSV({
      csv: csvContent
    })

    console.log('Rows:', analysis.rows)
    console.log('Columns:', analysis.columns)
    console.log('Statistics:', analysis.numeric_summary)
    console.log('Missing values:', analysis.missing_values)
  } catch (error) {
    console.error('Analysis failed:', error)
  }
}
```

#### Example 3: Python Code Formatting

```typescript
import { codeTools } from '@/services/backendApi'

const formatCode = async (code: string) => {
  try {
    const result = await codeTools.formatPython({
      code: code,
      formatter: 'black'
    })

    setFormattedCode(result.formatted_code)
  } catch (error) {
    console.error('Formatting failed:', error)
  }
}
```

### Creating New Tool Components

When creating a new tool that uses backend APIs:

1. **Create the component** in `frontend/src/components/Tools/`:

```typescript
import { useState } from 'react'
import { imageTools, fileToBase64 } from '@/services/backendApi'

export default function BackgroundRemover() {
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRemoveBackground = async (file: File) => {
    setLoading(true)
    try {
      const base64 = await fileToBase64(file)
      const response = await imageTools.removeBackground({
        image: base64
      })
      setResult(`data:image/png;base64,${response.image}`)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to remove background')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2>Background Remover</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleRemoveBackground(file)
          }}
        />
        {loading && <p>Processing...</p>}
        {result && <img src={result} alt="Result" />}
      </div>
    </div>
  )
}
```

2. **Register the tool** in `frontend/src/utils/toolsData.ts`:

```typescript
{
  slug: 'background-remover',
  name: 'Background Remover',
  description: 'Remove image backgrounds using AI',
  category: 'image-tools',
  icon: '🎨'
}
```

3. **Add routing** in `frontend/src/pages/ToolPage/ToolPage.tsx`:

```typescript
import BackgroundRemover from '@/components/Tools/BackgroundRemover'

const toolComponents: Record<string, React.ComponentType> = {
  // ... existing tools
  'background-remover': BackgroundRemover,
}
```

## Available Backend APIs

### Image Tools
- **Resize**: `POST /api/image-tools/resize/`
- **Compress**: `POST /api/image-tools/compress/`
- **Enhance**: `POST /api/image-tools/enhance/`
- **Filters**: `POST /api/image-tools/filter/`
- **Background Removal**: `POST /api/image-tools/remove-background/`
- **Face Detection**: `POST /api/image-tools/detect-faces/`
- **Sketch**: `POST /api/image-tools/sketch/`
- **Watermark**: `POST /api/image-tools/watermark/`

### PDF Tools
- **Merge**: `POST /api/pdf-tools/merge/`
- **Split**: `POST /api/pdf-tools/split/`
- **Extract Text**: `POST /api/pdf-tools/extract-text/`
- **Extract Tables**: `POST /api/pdf-tools/extract-tables/`
- **Compress**: `POST /api/pdf-tools/compress/`
- **Watermark**: `POST /api/pdf-tools/watermark/`

### Data Tools
- **CSV Analysis**: `POST /api/data-tools/analyze-csv/`
- **CSV to JSON**: `POST /api/data-tools/csv-to-json/`
- **JSON to CSV**: `POST /api/data-tools/json-to-csv/`
- **Statistics**: `POST /api/data-tools/statistics/`
- **Correlation**: `POST /api/data-tools/correlation/`
- **Outliers**: `POST /api/data-tools/detect-outliers/`
- **Normalize**: `POST /api/data-tools/normalize/`
- **Clean**: `POST /api/data-tools/clean/`

### Code Tools
- **Format Python**: `POST /api/code-tools/format-python/`
- **Complexity**: `POST /api/code-tools/analyze-complexity/`
- **LOC Count**: `POST /api/code-tools/count-loc/`
- **Security Scan**: `POST /api/code-tools/security-scan/`
- **Minify**: `POST /api/code-tools/minify/`
- **Beautify**: `POST /api/code-tools/beautify/`

## Testing

### Backend Tests
```bash
cd backend
python manage.py test

# Run specific app tests
python manage.py test image_tools
python manage.py test pdf_tools
```

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:coverage
```

### Integration Tests
```bash
# Start both services
docker-compose up -d

# Run integration tests
npm run test:integration
```

## Deployment

### Production Checklist

**Backend**:
- [ ] Set `DEBUG=False`
- [ ] Configure proper `SECRET_KEY`
- [ ] Set up production database
- [ ] Configure static files serving
- [ ] Set up HTTPS
- [ ] Configure CORS properly
- [ ] Enable logging
- [ ] Set up monitoring

**Frontend**:
- [ ] Build for production: `npm run build`
- [ ] Configure production API URL
- [ ] Set up Google AdSense
- [ ] Enable analytics
- [ ] Configure CDN
- [ ] Set up error tracking

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Scale backend workers
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Check `CORS_ALLOWED_ORIGINS` in backend `.env`
2. Ensure frontend URL is included
3. Restart backend server

### Backend Module Errors
If you see `ModuleNotFoundError`:
```bash
cd backend
pip install -r requirements.txt
```

### Large File Processing
Some operations may timeout with large files. Increase timeout in:
- Gunicorn: `--timeout 300`
- Nginx: `proxy_read_timeout 300s`

### Memory Issues
For ML/image processing, increase Docker memory:
```yaml
backend:
  deploy:
    resources:
      limits:
        memory: 4G
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT License
