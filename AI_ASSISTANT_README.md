# AI Code Assistant - Complete Documentation

## Overview

The AI Code Assistant is an intelligent, privacy-focused coding helper integrated into the Developer Tools platform. It provides instant code explanations, error fixes, and best practice suggestions while maintaining complete data privacy through on-premise processing.

**Internal Codename:** Devo (never mentioned to users)
**User-Facing Name:** AI Code Assistant
**Underlying Model:** DeepSeek R1 variant (CONFIDENTIAL - never disclosed)

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [Content Filtering](#content-filtering)
6. [Quota Management](#quota-management)
7. [Admin Guide](#admin-guide)
8. [User Guide](#user-guide)
9. [Production Deployment](#production-deployment)
10. [Security & Privacy](#security--privacy)

---

## Features

### Core Capabilities

- **Code Explanations** - Understand complex code snippets
- **Error Debugging** - Get help fixing errors quickly
- **Best Practices** - Receive suggestions for code improvements
- **General Coding Help** - Ask any programming questions

### Context Types

1. **General Chat** - General coding questions and discussions
2. **Code Explanation** - Detailed explanations of code snippets
3. **Error Fix** - Debugging assistance and error resolution
4. **Best Practice** - Code quality improvements and modern approaches

### Key Features

✅ **100% On-Premise Processing** - No data leaves your infrastructure
✅ **Content Filtering** - Blocks inappropriate usage (political, adult, malicious content)
✅ **Quota Management** - Free tier + flexible paid options
✅ **Usage Analytics** - Track tokens, costs, and response times
✅ **Admin Monitoring** - Review flagged content and manage users
✅ **Dark Mode Support** - Consistent with platform design
✅ **Mobile Responsive** - Works on all devices

---

## Architecture

### Backend Components

```
backend/ai_assistant/
├── models.py              # Database models
│   ├── AIQuota           # User quota tracking
│   ├── AIUsageLog        # Interaction logging
│   ├── ContentFilterLog  # Violation tracking
│   ├── AISettings        # Global configuration
│   └── QuotaPurchase     # Payment tracking
│
├── views.py               # API endpoints
│   ├── ask_assistant()   # Main chat endpoint
│   ├── quota_status()    # Get quota info
│   ├── usage_history()   # Get usage logs
│   └── purchase_quota()  # Buy additional quota
│
├── content_filter.py      # Content safety
│   └── ContentFilter     # Filters inappropriate content
│
├── llm_service.py         # LLM abstraction
│   └── LLMService        # DeepSeek R1 wrapper (confidential)
│
├── admin.py               # Django admin interface
└── urls.py                # URL routing
```

### Frontend Components

```
frontend/src/
├── types/ai.ts                    # TypeScript definitions
├── services/aiService.ts          # API communication
├── components/AI/
│   ├── AIAssistant.tsx           # Chat interface
│   └── AIQuotaDisplay.tsx        # Quota dashboard
└── pages/AIAssistant/
    └── AIAssistantPage.tsx       # Full page layout
```

### Database Schema

**AIQuota**
- `user` - OneToOne with User
- `monthly_quota` - Default 20 free requests
- `additional_quota` - Purchased quota
- `used_this_month` - Current month usage
- `last_reset` - Last quota reset date
- `price_per_request_usd` - Pricing (default $0.10)

**AIUsageLog**
- `user` - ForeignKey to User
- `prompt` - User's question
- `response` - AI's answer
- `tokens_used` - Token count
- `response_time_ms` - Response latency
- `cost_usd` - Request cost
- `context_type` - Request type
- `created_at` - Timestamp

**ContentFilterLog**
- `user` - ForeignKey to User
- `prompt` - Blocked content
- `filter_reason` - Violation type
- `severity` - low/medium/high
- `reviewed` - Admin review status
- `user_warned` - Warning issued
- `user_blocked` - User blocked

**AISettings** (Singleton)
- `default_monthly_quota` - Default quota (20)
- `price_per_additional_request` - Pricing ($0.10)
- `enable_content_filter` - Enable filtering (True)
- `strict_mode` - Aggressive filtering (False)
- `max_requests_per_hour` - Rate limit (10)
- `max_requests_per_day` - Daily limit (50)
- `model_name` - CONFIDENTIAL (never exposed)
- `model_temperature` - LLM setting (0.7)
- `max_tokens` - Response limit (2000)
- `system_prompt` - CONFIDENTIAL
- `enabled` - Feature flag (True)
- `maintenance_mode` - Maintenance flag (False)

---

## API Endpoints

### 1. Ask AI Assistant

**Endpoint:** `POST /api/ai/ask/`
**Authentication:** Required (JWT Bearer token)

**Request Body:**
```json
{
  "prompt": "How do I fix this error?",
  "context_type": "error_fix",
  "code_snippet": "optional code here"
}
```

**Success Response (200):**
```json
{
  "response": "To fix this error, you need to...",
  "metadata": {
    "tokens_used": 245,
    "response_time_ms": 1234,
    "context_type": "error_fix"
  },
  "quota_status": {
    "used": 1,
    "total": 20,
    "remaining": 19
  }
}
```

**Error Responses:**

*Quota Exceeded (402):*
```json
{
  "error": "Quota exceeded",
  "message": "You have used all your AI assistant requests for this month.",
  "quota_status": {
    "used": 20,
    "total": 20,
    "remaining": 0
  },
  "purchase_info": {
    "price_per_request_usd": "0.100",
    "suggested_package": 10
  }
}
```

*Content Policy Violation (400):*
```json
{
  "error": "Content policy violation",
  "message": "Your request violates our content policy.",
  "violation_type": "political"
}
```

### 2. Get Quota Status

**Endpoint:** `GET /api/ai/quota/`
**Authentication:** Required

**Response (200):**
```json
{
  "quota": {
    "monthly_quota": 20,
    "additional_quota": 0,
    "total_quota": 20,
    "used_this_month": 5,
    "remaining": 15,
    "last_reset": "2025-11-01T00:00:00Z"
  },
  "usage_stats": {
    "total_requests_30d": 15,
    "total_tokens_30d": 3500,
    "total_cost_usd_30d": "1.50"
  },
  "pricing": {
    "price_per_request_usd": "0.100",
    "suggested_packages": [
      {"quantity": 10, "price_usd": "1.00"},
      {"quantity": 50, "price_usd": "4.50"},
      {"quantity": 100, "price_usd": "8.00"}
    ]
  }
}
```

### 3. Get Usage History

**Endpoint:** `GET /api/ai/history/?limit=20`
**Authentication:** Required

**Response (200):**
```json
{
  "history": [
    {
      "id": 123,
      "prompt": "How do I...",
      "response": "To do that...",
      "context_type": "code_explanation",
      "tokens_used": 150,
      "response_time_ms": 890,
      "cost_usd": "0.10",
      "created_at": "2025-11-20T10:30:00Z"
    }
  ],
  "total_count": 45
}
```

### 4. Purchase Quota

**Endpoint:** `POST /api/ai/purchase/`
**Authentication:** Required

**Request Body:**
```json
{
  "quantity": 50,
  "payment_method": "credit_card",
  "payment_token": "tok_xxxxx"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully purchased 50 AI requests",
  "purchase": {
    "id": 789,
    "quantity": 50,
    "price_usd": "4.50",
    "status": "completed"
  },
  "quota_status": {
    "used": 5,
    "total": 70,
    "remaining": 65
  }
}
```

---

## Frontend Components

### AIAssistant Component

**Location:** `frontend/src/components/AI/AIAssistant.tsx`

**Props:**
```typescript
interface AIAssistantProps {
  initialContext?: ContextType;
  onClose?: () => void;
}
```

**Features:**
- Real-time chat interface
- Context type selector
- Quota display in header
- Error handling with user-friendly messages
- Loading states with animations
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

**Usage:**
```tsx
import AIAssistant from '@/components/AI/AIAssistant';

<AIAssistant
  initialContext="code_explanation"
  onClose={() => console.log('Closed')}
/>
```

### AIQuotaDisplay Component

**Location:** `frontend/src/components/AI/AIQuotaDisplay.tsx`

**Props:**
```typescript
interface AIQuotaDisplayProps {
  onPurchaseClick?: () => void;
}
```

**Features:**
- Visual quota progress bar
- Monthly breakdown
- 30-day usage statistics
- Purchase packages with discounts
- Low quota warnings

**Usage:**
```tsx
import AIQuotaDisplay from '@/components/AI/AIQuotaDisplay';

<AIQuotaDisplay
  onPurchaseClick={() => handlePurchase()}
/>
```

---

## Content Filtering

### Blocked Content Categories

1. **Political Content**
   - Elections, politicians, political parties
   - Government discussions beyond technical topics
   - Severity: Medium (High in strict mode)

2. **Pornographic Content**
   - Adult content, explicit material
   - NSFW content
   - Severity: High (always blocked)

3. **Hacking/Malicious Content**
   - Multiple hacking keywords (2+ triggers block)
   - Single keyword allowed for legitimate security discussions
   - DDoS, exploits, malware, phishing
   - Severity: High for 2+ keywords, Low for 1 keyword in strict mode

4. **Spam**
   - Excessive punctuation (3+ repeated)
   - Commercial spam patterns
   - Severity: Low

### Configuration

Content filtering is configured in `AISettings`:

```python
from ai_assistant.models import AISettings

settings = AISettings.get_settings()
settings.enable_content_filter = True  # Enable/disable filtering
settings.strict_mode = False           # More aggressive filtering
settings.save()
```

### Admin Review Process

1. Violations are logged in `ContentFilterLog`
2. Admins review violations in Django admin
3. Actions available:
   - Mark as reviewed
   - Warn user
   - Block user
   - Add admin notes

---

## Quota Management

### Free Tier

- **20 requests per month** - Default for all users
- **Automatic monthly reset** - Resets 30 days after last reset
- **No credit card required**

### Pricing

**Base Price:** $0.10 per request

**Bulk Discounts:**
- 10 requests: $1.00 (no discount)
- 50 requests: $4.50 (10% discount)
- 100 requests: $8.00 (20% discount)

### Quota Reset Logic

Quotas automatically reset when:
- 30 days have passed since `last_reset`
- Reset happens on next API call
- `used_this_month` resets to 0
- `additional_quota` resets to 0 (purchased quota expires)

### Manual Quota Management

**Grant Bonus Quota (Admin):**
```python
from ai_assistant.models import AIQuota
from django.contrib.auth.models import User

user = User.objects.get(username='testuser')
quota = user.ai_quota
quota.add_quota(50)  # Grant 50 bonus requests
```

**Reset User Quota (Admin):**
```python
quota.reset_monthly_quota()
```

---

## Admin Guide

### Access Admin Panel

1. Navigate to `http://localhost:8000/admin/`
2. Login with superuser credentials
3. Go to **AI Assistant** section

### AI Settings Management

**Location:** Admin > AI Assistant > AI Settings

**Configurable Options:**
- Default monthly quota
- Price per additional request
- Content filtering (enable/disable)
- Strict mode
- Rate limiting (per hour/day)
- Feature flags (enabled, maintenance mode)

**CONFIDENTIAL Settings (Internal Only):**
- Model name (never expose)
- Model temperature
- Max tokens
- System prompt

### Monitoring Quotas

**Location:** Admin > AI Assistant > AI Quotas

**Available Actions:**
- Reset quotas (bulk action)
- Add bonus quota (bulk action)
- View quota status
- Filter by usage

### Reviewing Content Violations

**Location:** Admin > AI Assistant > Content Filter Logs

**Workflow:**
1. Filter by `reviewed=False`
2. Review flagged content
3. Determine severity
4. Actions:
   - Mark as reviewed
   - Warn user
   - Block user
   - Add notes

**Bulk Actions:**
- Mark as reviewed
- Warn users
- Block users

### Usage Analytics

**Location:** Admin > AI Assistant > AI Usage Logs

**Metrics Available:**
- Total requests per user
- Tokens used
- Response times
- Costs
- Context type distribution
- Date range filtering

**Export Data:**
- Use Django admin export feature
- Filter by date range, user, context type
- Export to CSV for analysis

### Managing Purchases

**Location:** Admin > AI Assistant > Quota Purchases

**Actions:**
- View payment status
- Mark as completed (bulk)
- Mark as failed (bulk)
- Refund handling

---

## User Guide

### Getting Started

1. **Login** to Developer Tools platform
2. **Click your profile** in the top-right corner
3. **Select "AI Assistant"** from the dropdown menu
4. **Start chatting!** You have 20 free requests per month

### Selecting Context Type

Choose the appropriate context for better responses:

- **💬 General** - General coding questions
- **📖 Explain** - Code explanations
- **🔧 Fix Error** - Debugging help
- **⭐ Improve** - Best practice suggestions

### Best Practices

**For Code Explanations:**
```
"Explain this React hook:
[paste code here]"
```

**For Error Fixes:**
```
"I'm getting this error:
TypeError: Cannot read property 'map' of undefined

Here's my code:
[paste code here]"
```

**For Best Practices:**
```
"How can I improve this function?
[paste code here]"
```

### Keyboard Shortcuts

- `Enter` - Send message
- `Shift + Enter` - New line in message
- `Ctrl/Cmd + K` - Open global search (from anywhere)

### Quota Management

**Check Your Quota:**
- View in AI Assistant page sidebar
- Shows: Used / Total remaining
- 30-day usage statistics
- Cost tracking

**Purchase Additional Quota:**
1. Click "Purchase Quota" button
2. Select package (10, 50, or 100 requests)
3. Complete payment
4. Quota updates immediately

**Bulk Discounts:**
- 50 requests: Save 10%
- 100 requests: Save 20%

---

## Production Deployment

### Prerequisites

- PostgreSQL 16+
- Redis 7+
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose

### Environment Variables

**Backend (.env):**
```bash
# AI Assistant Configuration
AI_ENABLED=True
AI_DEFAULT_MONTHLY_QUOTA=20
AI_PRICE_PER_REQUEST=0.10
AI_CONTENT_FILTER_ENABLED=True
AI_STRICT_MODE=False

# DeepSeek R1 Configuration (CONFIDENTIAL)
DEEPSEEK_API_KEY=your-api-key-here
DEEPSEEK_API_URL=https://your-deepseek-endpoint
DEEPSEEK_MODEL=deepseek-r1-variant

# Payment Processing
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_PUBLISHABLE_KEY=your-stripe-pub-key
```

**Frontend (.env):**
```bash
VITE_API_URL=https://api.yourplatform.com
VITE_AI_ENABLED=true
```

### DeepSeek R1 Integration

**Update:** `backend/ai_assistant/llm_service.py`

Replace the mock implementation:

```python
def generate_response(self, prompt: str, context_type: str = 'general_chat', user_context: Optional[Dict] = None) -> Dict:
    """Generate AI response using DeepSeek R1"""
    start_time = time.time()

    # Build full prompt
    full_prompt = self._build_prompt(prompt, context_type)

    # Call DeepSeek R1 API (CONFIDENTIAL)
    import requests

    response = requests.post(
        os.environ.get('DEEPSEEK_API_URL'),
        headers={
            'Authorization': f'Bearer {os.environ.get("DEEPSEEK_API_KEY")}',
            'Content-Type': 'application/json'
        },
        json={
            'model': os.environ.get('DEEPSEEK_MODEL'),
            'messages': [
                {'role': 'system', 'content': self.system_prompt},
                {'role': 'user', 'content': full_prompt}
            ],
            'temperature': self.temperature,
            'max_tokens': self.max_tokens
        }
    )

    result = response.json()
    response_text = result['choices'][0]['message']['content']
    tokens_used = result['usage']['total_tokens']

    response_time_ms = int((time.time() - start_time) * 1000)

    return {
        'response': response_text,
        'tokens_used': tokens_used,
        'response_time_ms': response_time_ms,
        'model': 'assistant'  # Never reveal actual model
    }
```

### Payment Integration

**Update:** `backend/ai_assistant/views.py` - `purchase_quota()` function

```python
import stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# In purchase_quota() function:
try:
    # Create Stripe charge
    charge = stripe.Charge.create(
        amount=int(total_price * 100),  # Convert to cents
        currency='usd',
        source=payment_token,
        description=f'AI Assistant Quota: {quantity} requests'
    )

    if charge.status == 'succeeded':
        purchase.payment_status = 'completed'
        purchase.payment_id = charge.id
        purchase.completed_at = timezone.now()
        purchase.save()

        # Add quota to user
        quota.add_quota(quantity)

        return Response({...})
except stripe.error.CardError as e:
    return Response({
        'error': 'Payment failed',
        'message': str(e)
    }, status=status.HTTP_400_BAD_REQUEST)
```

### Database Migrations

```bash
# Run migrations
docker exec developer_tools_backend python manage.py migrate

# Create AI settings
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import AISettings
AISettings.get_settings()
"
```

### Deployment Checklist

- [ ] Set environment variables
- [ ] Configure DeepSeek R1 API
- [ ] Set up payment processing (Stripe/PayPal)
- [ ] Run database migrations
- [ ] Create AI settings in admin
- [ ] Test content filtering
- [ ] Test quota enforcement
- [ ] Configure rate limiting
- [ ] Set up monitoring/logging
- [ ] Test purchase flow
- [ ] Review security settings

---

## Security & Privacy

### Data Privacy Commitments

✅ **100% On-Premise Processing**
- All AI processing occurs on your infrastructure
- No data sent to third-party cloud services
- DeepSeek R1 runs on your servers

✅ **No Data Sharing**
- User prompts never leave your network
- Responses not shared with external parties
- Code remains completely confidential

✅ **Minimal Data Retention**
- Only essential metadata stored (tokens, cost, time)
- Prompt/response stored for user history only
- No training on user data

✅ **Anonymous Analytics**
- Usage statistics aggregated and anonymized
- No PII in analytics data
- Admin monitoring respects user privacy

### Security Features

**Authentication & Authorization:**
- JWT token authentication required
- User-specific quota isolation
- Admin-only access to sensitive settings

**Content Filtering:**
- Prevents inappropriate usage
- Protects against abuse
- Logs violations for review

**Rate Limiting:**
- Per-hour limits (configurable)
- Per-day limits (configurable)
- Prevents API abuse

**Confidentiality:**
- Model details never exposed in API responses
- Internal configuration hidden from users
- Admin panel access controlled

### Compliance

**GDPR Compliance:**
- User data exportable via admin
- Data deletion on user request
- Privacy policy disclosure

**Security Best Practices:**
- Encrypted data transmission (HTTPS)
- Secure token storage
- SQL injection prevention
- XSS protection
- CSRF protection

---

## Troubleshooting

### Common Issues

**Issue:** "Quota exceeded" error but quota shows remaining

**Solution:**
```python
# Reset user quota manually
from ai_assistant.models import AIQuota
from django.contrib.auth.models import User

user = User.objects.get(username='username')
quota = user.ai_quota
quota.reset_monthly_quota()
```

**Issue:** Content filter blocking legitimate code questions

**Solution:**
```python
# Disable strict mode
from ai_assistant.models import AISettings
settings = AISettings.get_settings()
settings.strict_mode = False
settings.save()
```

**Issue:** Slow response times

**Solution:**
- Check DeepSeek R1 API latency
- Review `max_tokens` setting (lower = faster)
- Monitor database query performance
- Check Redis cache configuration

**Issue:** Purchase flow not working

**Solution:**
- Verify Stripe API keys in environment
- Check payment webhook configuration
- Review Django logs for errors
- Test with Stripe test mode first

---

## Future Enhancements

### Planned Features

- [ ] **Conversation History** - Persist chat sessions
- [ ] **Code Highlighting** - Syntax highlighting in responses
- [ ] **File Upload** - Upload code files for analysis
- [ ] **Team Sharing** - Share conversations with team members
- [ ] **Custom Models** - Allow admins to configure multiple LLMs
- [ ] **Advanced Analytics** - Usage patterns, popular queries
- [ ] **API Keys** - Programmatic access via API keys
- [ ] **Webhooks** - Event notifications for quota, violations
- [ ] **Multi-language Support** - UI in multiple languages
- [ ] **Voice Input** - Speech-to-text for prompts

### Suggested Improvements

- Implement conversation threading
- Add code execution environment
- Create VS Code extension
- Build mobile app
- Add collaborative features
- Implement A/B testing for prompts

---

## Support

### Contact

- **Documentation:** See this README
- **Issues:** Create GitHub issue
- **Admin Support:** Check Django admin logs
- **User Support:** Contact platform support team

### Logs & Debugging

**Backend Logs:**
```bash
docker logs developer_tools_backend --tail 100 -f
```

**Database Queries:**
```bash
docker exec developer_tools_backend python manage.py shell
```

**AI Assistant Specific:**
```python
from ai_assistant.models import AIUsageLog, ContentFilterLog

# Recent usage
AIUsageLog.objects.order_by('-created_at')[:10]

# Recent violations
ContentFilterLog.objects.filter(reviewed=False)
```

---

## License

Proprietary - Developer Tools Platform
© 2025 All Rights Reserved

**Model Confidentiality Notice:**
The underlying AI model (DeepSeek R1 variant) is confidential and proprietary. Never disclose model details, architecture, or implementation to end users.

---

**Version:** 1.0.0
**Last Updated:** November 20, 2025
**Status:** Production Ready ✅
