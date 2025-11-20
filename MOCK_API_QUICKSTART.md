# Mock API Service - Quick Start Guide

## 🎉 Service is Live and Fully Operational!

All issues have been resolved. The Mock API service is ready to use.

## 🚀 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3001 | Main application |
| **Mock API Workspace** | http://localhost:3001/mock-api | Postman-like interface |
| **Backend API** | http://localhost:8003/api | REST API endpoints |
| **Admin Panel** | http://localhost:8003/admin | Django admin |

## 🔑 Test Account

Use this account for testing:
- **Username:** mocktest@example.com
- **Password:** TestPass123

## ⚡ Quick Test (30 seconds)

1. **Open Browser:** http://localhost:3001/mock-api
2. **Login** with test credentials
3. **Create App:**
   - Click "App" dropdown → "Create New App"
   - Name: "My Test App"
   - Click "Create"

4. **Create Collection:**
   - Click "New Collection" in sidebar
   - Name: "Users API"
   - Click "Create"

5. **Create Endpoint:**
   - Click "New Endpoint" in collection
   - Name: "Get User"
   - Path: `/api/user`
   - Method: GET
   - Response Body:
     ```json
     {
       "id": "{{random_uuid}}",
       "name": "{{faker.name}}",
       "email": "{{faker.email}}"
     }
     ```
   - Click "Save"

6. **Test It:**
   - Click "Test" tab
   - Click "Send Request"
   - See dynamic response!

7. **Copy Mock URL** and test in terminal:
   ```bash
   curl http://localhost:8003/api/mock-api/execute/{your-endpoint-id}/api/user/
   ```

## 📊 What Was Fixed

### Issue: "Nothing happens when creating app"

**Root Causes Found:**
1. ❌ Wrong authentication token key in frontend
2. ❌ Missing axios interceptors
3. ❌ Incorrect mock URL generation

**Fixes Applied:**
1. ✅ Updated `mockAPIService.ts` with proper authentication
2. ✅ Added axios interceptors for JWT tokens
3. ✅ Fixed mock URL generation in backend models
4. ✅ Rebuilt and restarted all services

### Test Results: 100% Success Rate

```
✅ Login successful
✅ Create App successful
✅ Create Collection successful
✅ Create Endpoint successful
✅ Mock execution successful
✅ Dashboard stats successful
```

## 🛠️ Features Available Now

- ✅ Create unlimited apps, collections, endpoints
- ✅ REST/JSON, GraphQL, SOAP, YAML, TOML support
- ✅ Dynamic Faker data (names, emails, addresses, etc.)
- ✅ Latency simulation (0-5000ms)
- ✅ Error rate testing (0-100%)
- ✅ Request logging and analytics
- ✅ Built-in request tester
- ✅ Export as OpenAPI 3.0
- ✅ Export as Postman Collection
- ✅ Copy as cURL command
- ✅ Environment variables
- ✅ Multiple response scenarios

## 📝 Template Variables

Use these in your mock responses:

```json
{
  "user": {
    "id": "{{random_uuid}}",
    "name": "{{faker.name}}",
    "email": "{{faker.email}}",
    "phone": "{{faker.phone}}",
    "address": "{{faker.address}}",
    "company": "{{faker.company}}",
    "job": "{{faker.job}}",
    "created_at": "{{current_timestamp}}",
    "age": "{{random_int}}"
  }
}
```

## 🔍 Troubleshooting

### If frontend doesn't load:
```bash
docker compose restart frontend
```

### If backend API returns errors:
```bash
docker compose restart backend
docker logs developer_tools_backend --tail 50
```

### If mock endpoints return 404:
- Ensure the endpoint is "Active" (toggle in General tab)
- Check that the mock URL starts with `/api/mock-api/execute/`
- Verify backend is running: `docker ps | grep backend`

### Full service restart:
```bash
docker compose down
docker compose up -d
```

## 📚 API Documentation

### Create Mock App
```bash
curl -X POST http://localhost:8003/api/mock-api/apps/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My App", "description": "Testing"}'
```

### Create Collection
```bash
curl -X POST http://localhost:8003/api/mock-api/collections/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "API v1", "app": "APP_ID"}'
```

### Create Endpoint
```bash
curl -X POST http://localhost:8003/api/mock-api/endpoints/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Get User",
    "collection": "COLLECTION_ID",
    "path": "/api/user",
    "method": "GET",
    "status_code": 200,
    "response_body": "{\"id\": \"{{random_uuid}}\"}"
  }'
```

### Execute Mock (No Auth Required!)
```bash
curl http://localhost:8003/api/mock-api/execute/ENDPOINT_ID/api/user/
```

## 🎯 Use Cases

1. **Frontend Development:** Mock backend APIs before they're built
2. **Testing:** Simulate slow responses, errors, edge cases
3. **Demos:** Show working features without real backend
4. **Documentation:** Auto-generate OpenAPI specs
5. **Integration Testing:** Test API integrations offline
6. **Load Testing:** Test how your app handles delays/errors

## 📊 Dashboard Stats

View your mock API usage at:
```bash
curl http://localhost:8003/api/mock-api/stats/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "total_endpoints": 2,
  "active_endpoints": 2,
  "total_requests": 15,
  "requests_today": 8,
  "avg_response_time": 245.5,
  "error_rate": 0.0
}
```

## 🚀 Advanced Features

### Latency Simulation
Set in "Advanced" tab:
- Min: 100ms
- Max: 500ms
- Each request will have random delay between 100-500ms

### Error Rate Testing
Set in "Advanced" tab:
- Error Rate: 20%
- 20% of requests will return errors
- Test how your app handles failures

### Multiple Scenarios
1. Create endpoint
2. Add multiple responses in "Response" tab
3. Create scenarios with different conditions
4. Test various states (success, error, empty, loading)

## 📱 Integration Examples

### JavaScript/Fetch
```javascript
const mockUrl = 'http://localhost:8003/api/mock-api/execute/ENDPOINT_ID/api/user/';
const response = await fetch(mockUrl);
const data = await response.json();
console.log(data);
```

### React/Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8003/api/mock-api/execute/ENDPOINT_ID'
});

const getUser = async () => {
  const { data } = await api.get('/api/user/');
  return data;
};
```

### cURL
```bash
curl -X GET http://localhost:8003/api/mock-api/execute/ENDPOINT_ID/api/user/ \
  -H "Content-Type: application/json"
```

## 🎉 Summary

Everything is working! You can now:
- ✅ Create mock APIs in seconds
- ✅ Test your frontend without a backend
- ✅ Simulate network conditions
- ✅ Export to OpenAPI/Postman
- ✅ Share mock URLs with your team

**Start building at:** http://localhost:3001/mock-api

---

## Need Help?

- **Full Documentation:** See `MOCK_API_STATUS.md`
- **Run Test Script:** `/tmp/test_mock_api.sh`
- **Check Logs:** `docker logs developer_tools_backend`
- **Restart Services:** `docker compose restart`

Enjoy your new Mock API Service! 🚀
