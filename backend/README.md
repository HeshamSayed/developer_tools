# Developer Tools Backend - Django

Python-powered backend providing advanced processing capabilities for developer tools using powerful Python libraries.

## Features

### 🖼️ Image Tools
- **Libraries**: PIL, OpenCV, scikit-image
- **Capabilities**: Resize, compress, enhance, filters, background removal, face detection, sketching, watermarking

### 📄 PDF Tools
- **Libraries**: PyPDF2, reportlab, pdfplumber
- **Capabilities**: Merge, split, text extraction, table extraction, rotation, compression, watermarking

### 📊 Data Tools
- **Libraries**: pandas, numpy, scipy
- **Capabilities**: CSV analysis, format conversion, statistics, correlation, outlier detection, normalization, data cleaning

### 💻 Code Tools
- **Libraries**: autopep8, black, radon, bandit
- **Capabilities**: Python formatting, complexity analysis, LOC counting, security scanning, JS/CSS minification

### 🤖 ML Tools (Future)
- **Libraries**: scikit-learn, tensorflow, torch
- **Capabilities**: To be implemented

## Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL (or use SQLite for development)

### Installation

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment** (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

**Note**: Some packages like OpenCV and Torch are large and may take time to install.

### Configuration

1. **Environment Variables** (optional, create `.env` file):
```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=developer_tools
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

2. **For Development** (use SQLite instead of PostgreSQL):
Edit `core/settings.py` to use SQLite:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Database Setup

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

### Run Development Server

```bash
python manage.py runserver 0.0.0.0:8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Image Tools
- `POST /api/image-tools/resize/` - Resize images
- `POST /api/image-tools/compress/` - Compress images
- `POST /api/image-tools/enhance/` - Enhance images
- `POST /api/image-tools/filter/` - Apply filters
- `POST /api/image-tools/remove-background/` - Remove background
- `POST /api/image-tools/detect-faces/` - Detect faces
- `POST /api/image-tools/sketch/` - Convert to sketch
- `POST /api/image-tools/rotate/` - Rotate image
- `POST /api/image-tools/watermark/` - Add watermark

### PDF Tools
- `POST /api/pdf-tools/merge/` - Merge PDFs
- `POST /api/pdf-tools/split/` - Split PDFs
- `POST /api/pdf-tools/extract-text/` - Extract text
- `POST /api/pdf-tools/extract-tables/` - Extract tables
- `POST /api/pdf-tools/rotate/` - Rotate PDF
- `POST /api/pdf-tools/compress/` - Compress PDF
- `POST /api/pdf-tools/watermark/` - Add watermark
- `POST /api/pdf-tools/info/` - Get PDF info
- `POST /api/pdf-tools/create-from-text/` - Create PDF from text

### Data Tools
- `POST /api/data-tools/analyze-csv/` - Analyze CSV
- `POST /api/data-tools/csv-to-json/` - Convert CSV to JSON
- `POST /api/data-tools/json-to-csv/` - Convert JSON to CSV
- `POST /api/data-tools/statistics/` - Calculate statistics
- `POST /api/data-tools/correlation/` - Correlation analysis
- `POST /api/data-tools/detect-outliers/` - Detect outliers
- `POST /api/data-tools/normalize/` - Normalize data
- `POST /api/data-tools/clean/` - Clean data
- `POST /api/data-tools/group-aggregate/` - Group and aggregate
- `POST /api/data-tools/pivot/` - Create pivot table

### Code Tools
- `POST /api/code-tools/format-python/` - Format Python code
- `POST /api/code-tools/analyze-complexity/` - Analyze complexity
- `POST /api/code-tools/count-loc/` - Count lines of code
- `POST /api/code-tools/security-scan/` - Security scan
- `POST /api/code-tools/minify/` - Minify JS/CSS
- `POST /api/code-tools/beautify/` - Beautify code
- `POST /api/code-tools/syntax-check/` - Check Python syntax

## API Usage Examples

### Image Resize Example
```bash
curl -X POST http://localhost:8000/api/image-tools/resize/ \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KG...",
    "width": 800,
    "height": 600,
    "algorithm": "LANCZOS",
    "maintain_aspect": true
  }'
```

### CSV Analysis Example
```bash
curl -X POST http://localhost:8000/api/data-tools/analyze-csv/ \
  -H "Content-Type: application/json" \
  -d '{
    "csv": "name,age,salary\nJohn,30,50000\nJane,25,60000"
  }'
```

### Python Code Format Example
```bash
curl -X POST http://localhost:8000/api/code-tools/format-python/ \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def hello():print(\"hello\")",
    "formatter": "black"
  }'
```

## Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test image_tools
python manage.py test pdf_tools
python manage.py test data_tools
python manage.py test code_tools
```

## Development

### Code Style
- Follow PEP 8
- Use type hints
- Add docstrings to functions

### Adding New Tools
1. Create views in the appropriate app
2. Add URL patterns to `urls.py`
3. Update this README with new endpoints

## Deployment

### Using Docker
```bash
# Build image
docker build -t developer-tools-backend .

# Run container
docker run -p 8000:8000 developer-tools-backend
```

### Using Gunicorn
```bash
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

## Troubleshooting

### ModuleNotFoundError
Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### Large Package Installations
Some packages (OpenCV, TensorFlow, PyTorch) are large:
- opencv-python: ~60MB
- tensorflow: ~500MB
- torch: ~700MB

For production, consider using CPU-only versions to reduce size.

### Memory Issues
Some operations (ML, large image/PDF processing) may require significant memory. Adjust worker count and memory limits accordingly.

## License

MIT License
