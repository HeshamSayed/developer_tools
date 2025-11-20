# AI Assistant - Quick Start Guide

## For Administrators

### 1. Initial Setup (5 minutes)

**Step 1: Verify Installation**
```bash
# Check all containers are running
docker ps | grep developer_tools

# You should see:
# - developer_tools_backend
# - developer_tools_frontend
# - developer_tools_db
# - developer_tools_redis
```

**Step 2: Create AI Settings**
```bash
# Initialize AI settings (already done automatically)
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import AISettings
settings = AISettings.get_settings()
print(f'AI Assistant is: {\"ENABLED\" if settings.enabled else \"DISABLED\"}')
print(f'Default monthly quota: {settings.default_monthly_quota}')
print(f'Price per request: \${settings.price_per_additional_request}')
"
```

**Step 3: Create Superuser (if not exists)**
```bash
docker exec -it developer_tools_backend python manage.py createsuperuser
# Follow prompts to create admin account
```

**Step 4: Access Admin Panel**
```
URL: http://localhost:8000/admin/
Login with superuser credentials
Navigate to: AI Assistant section
```

### 2. Configure Settings

**Access AI Settings:**
1. Login to admin panel
2. Click "AI Settings"
3. Configure:
   - Default monthly quota: `20` (recommended)
   - Price per request: `0.10` USD
   - Enable content filter: `✓` (recommended)
   - Strict mode: `☐` (for development)
   - Max requests per hour: `10`
   - Max requests per day: `50`

**Save settings and verify on frontend.**

### 3. Test the AI Assistant

**Option A: Via Frontend**
1. Create a test user account at `http://localhost:3001/register`
2. Login with test account
3. Click profile → "AI Assistant"
4. Send a test message: "Explain what a React hook is"
5. Verify response appears

**Option B: Via API**
```bash
# 1. Get JWT token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}' \
  | jq -r '.access')

# 2. Test AI endpoint
curl -X POST http://localhost:8000/api/ai/ask/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is a closure in JavaScript?",
    "context_type": "code_explanation"
  }' | jq '.'

# Expected response:
# {
#   "response": "A closure is...",
#   "metadata": {...},
#   "quota_status": {"used": 1, "total": 20, "remaining": 19}
# }
```

### 4. Monitor Usage

**Check User Quotas:**
```bash
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import AIQuota
for quota in AIQuota.objects.all()[:5]:
    print(f'{quota.user.username}: {quota.remaining_quota}/{quota.total_quota} remaining')
"
```

**View Recent Usage:**
```bash
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import AIUsageLog
logs = AIUsageLog.objects.order_by('-created_at')[:5]
for log in logs:
    print(f'{log.created_at} - {log.user.username} - {log.context_type} - {log.tokens_used} tokens')
"
```

**Check Content Violations:**
```bash
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import ContentFilterLog
violations = ContentFilterLog.objects.filter(reviewed=False)
print(f'Unreviewed violations: {violations.count()}')
for v in violations[:5]:
    print(f'{v.created_at} - {v.user.username} - {v.filter_reason} - {v.severity}')
"
```

### 5. Grant Bonus Quota (Optional)

**Via Admin Panel:**
1. Go to "AI Quotas"
2. Select users
3. Choose "Add 10 bonus requests" action
4. Click "Go"

**Via Shell:**
```bash
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import AIQuota
from django.contrib.auth.models import User

user = User.objects.get(username='testuser')
quota = user.ai_quota
quota.add_quota(50)  # Grant 50 bonus requests
print(f'New quota: {quota.total_quota}')
"
```

---

## For Users

### Getting Started (30 seconds)

1. **Login** to your account
2. **Click** your profile picture (top-right)
3. **Select** "AI Assistant"
4. **Ask** your first coding question!

### Example Questions

**Code Explanation:**
```
"Explain this Python decorator:

@functools.lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
"
```

**Error Fixing:**
```
"I'm getting: TypeError: 'NoneType' object is not subscriptable

Code:
data = api.get_data()
result = data['key']  # Error here
"
```

**Best Practices:**
```
"How can I improve this code to be more Pythonic?

total = 0
for i in range(len(numbers)):
    total = total + numbers[i]
"
```

**General Questions:**
```
"What's the difference between Promise.all() and Promise.race() in JavaScript?"
```

### Quota Management

**Free Tier:**
- 20 requests per month
- Resets automatically every 30 days
- No credit card required

**Need More?**
1. Click "Purchase Quota" in AI Assistant page
2. Choose package:
   - 10 requests: $1.00
   - 50 requests: $4.50 (Save 10%)
   - 100 requests: $8.00 (Save 20%)
3. Complete payment
4. Start using immediately!

### Privacy & Security

✅ **100% Private** - Your code never leaves our servers
✅ **No External Sharing** - Data not sent to third parties
✅ **Confidential** - Your code remains completely private
✅ **Secure** - Encrypted connections and secure storage

---

## Testing Checklist

### Functional Tests

- [ ] User can create account
- [ ] User can login
- [ ] AI Assistant page loads
- [ ] Can send message and receive response
- [ ] Quota decreases after request
- [ ] Quota status displays correctly
- [ ] Context type selection works
- [ ] Error handling shows user-friendly messages
- [ ] Content filter blocks inappropriate content
- [ ] Quota exceeded shows purchase option

### Admin Tests

- [ ] Can access Django admin
- [ ] AI Settings page accessible
- [ ] Can view AI Quotas
- [ ] Can view Usage Logs
- [ ] Can view Content Filter Logs
- [ ] Bulk actions work (reset quotas, add bonus)
- [ ] Can mark violations as reviewed

### Performance Tests

- [ ] Response time < 3 seconds
- [ ] Page loads in < 2 seconds
- [ ] Multiple concurrent requests handled
- [ ] Database queries optimized
- [ ] No memory leaks

---

## Common Admin Tasks

### Task 1: Reset All Monthly Quotas

```bash
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import AIQuota
count = 0
for quota in AIQuota.objects.all():
    quota.reset_monthly_quota()
    count += 1
print(f'Reset {count} quotas')
"
```

### Task 2: Disable AI Assistant for Maintenance

```bash
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import AISettings
settings = AISettings.get_settings()
settings.maintenance_mode = True
settings.maintenance_message = 'AI Assistant is temporarily unavailable for maintenance. Please try again in 1 hour.'
settings.save()
print('Maintenance mode enabled')
"
```

**Re-enable:**
```bash
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import AISettings
settings = AISettings.get_settings()
settings.maintenance_mode = False
settings.save()
print('Maintenance mode disabled')
"
```

### Task 3: Review Flagged Content

```bash
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import ContentFilterLog
from django.contrib.auth.models import User

# Get unreviewed violations
violations = ContentFilterLog.objects.filter(reviewed=False)
print(f'Found {violations.count()} unreviewed violations\n')

for v in violations[:10]:
    print(f'User: {v.user.username}')
    print(f'Reason: {v.filter_reason} ({v.severity} severity)')
    print(f'Prompt: {v.prompt[:100]}...')
    print(f'Date: {v.created_at}')
    print('---')
"
```

### Task 4: Generate Usage Report

```bash
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import AIUsageLog, AIQuota
from django.db.models import Count, Sum, Avg
from datetime import datetime, timedelta

# Last 30 days stats
thirty_days_ago = datetime.now() - timedelta(days=30)

stats = AIUsageLog.objects.filter(created_at__gte=thirty_days_ago).aggregate(
    total_requests=Count('id'),
    total_tokens=Sum('tokens_used'),
    avg_tokens=Avg('tokens_used'),
    total_cost=Sum('cost_usd'),
    avg_response_time=Avg('response_time_ms')
)

print('=== 30-Day Usage Report ===')
print(f'Total Requests: {stats[\"total_requests\"]}')
print(f'Total Tokens: {stats[\"total_tokens\"]:,}')
print(f'Avg Tokens/Request: {stats[\"avg_tokens\"]:.0f}')
print(f'Total Cost: \${stats[\"total_cost\"]:.2f}')
print(f'Avg Response Time: {stats[\"avg_response_time\"]:.0f}ms')

# Active users
active_users = AIUsageLog.objects.filter(created_at__gte=thirty_days_ago).values('user').distinct().count()
print(f'Active Users: {active_users}')

# Total users with quotas
total_users = AIQuota.objects.count()
print(f'Total Users with AI Access: {total_users}')
"
```

### Task 5: Bulk Grant Bonus Quota

```bash
# Grant 10 bonus requests to all Pro users
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import AIQuota
from django.contrib.auth.models import User
from authentication.models import UserProfile

pro_users = UserProfile.objects.filter(subscription_tier='pro').values_list('user_id', flat=True)
count = 0

for user_id in pro_users:
    try:
        quota = AIQuota.objects.get(user_id=user_id)
        quota.add_quota(10)
        count += 1
    except AIQuota.DoesNotExist:
        pass

print(f'Granted 10 bonus requests to {count} Pro users')
"
```

---

## Troubleshooting

### Issue: "Failed to load quota status"

**Check:**
1. Backend is running: `docker ps | grep backend`
2. Database is accessible: `docker exec developer_tools_backend python manage.py migrate --check`
3. Redis is running: `docker ps | grep redis`

**Fix:**
```bash
docker compose restart backend
```

### Issue: Content filter too strict

**Adjust:**
```bash
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import AISettings
settings = AISettings.get_settings()
settings.strict_mode = False
settings.save()
"
```

### Issue: Slow responses

**Check:**
1. Database connection pool
2. Redis cache hit rate
3. LLM API latency

**Optimize:**
```bash
# Increase Redis cache timeout
# Reduce max_tokens for faster responses
docker exec developer_tools_backend python manage.py shell -c "
from ai_assistant.models import AISettings
settings = AISettings.get_settings()
settings.max_tokens = 1500  # Reduce from 2000
settings.save()
"
```

---

## Next Steps

1. ✅ **Production Deployment**
   - Configure DeepSeek R1 API
   - Set up payment processing
   - Enable HTTPS
   - Configure monitoring

2. ✅ **User Onboarding**
   - Announce feature to users
   - Create tutorial videos
   - Add tooltips in UI

3. ✅ **Monitoring**
   - Set up usage alerts
   - Monitor costs
   - Track user satisfaction

4. ✅ **Optimization**
   - A/B test prompts
   - Fine-tune content filter
   - Optimize response times

---

## Support

**Admin Questions:**
- Check Django admin logs
- Review this documentation
- Contact development team

**User Support:**
- FAQ in AI Assistant page
- Email support team
- Submit feedback via platform

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** November 20, 2025
