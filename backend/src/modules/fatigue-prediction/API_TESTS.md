# Fatigue Prediction API Tests

This document describes the API-level tests for the fatigue prediction module. These tests require a running backend server with a test database.

## Test Setup

1. Start the backend server: `npm run dev`
2. Ensure PostgreSQL is running via Docker Compose
3. Have a valid JWT token for authentication

## Test Scenarios

### 1. POST /api/v1/fatigue/calculate - Calculate Fatigue

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/fatigue/calculate \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"force": false}'
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Fatigue assessment calculated successfully",
  "data": {
    "id": "string",
    "userId": "string",
    "score": 0-100,
    "level": "LOW|MODERATE|HIGH|CRITICAL",
    "confidence": 0-1,
    "explanation": "string",
    "recommendedAction": "string",
    "factors": [...],
    "calculatedAt": "ISO8601"
  }
}
```

**Test Cases:**
- ✅ Valid request with authentication
- ❌ Missing authentication (401 Unauthorized)
- ✅ Force recalculation with force=true
- ✅ Duplicate calculation prevention (returns cached result within 5 minutes)

### 2. GET /api/v1/fatigue/current - Get Current Fatigue

**Request:**
```bash
curl -X GET http://localhost:3000/api/v1/fatigue/current \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "score": 0-100,
    "level": "LOW|MODERATE|HIGH|CRITICAL",
    "confidence": 0-1,
    "explanation": "string",
    "recommendedAction": "string",
    "factors": [...],
    "calculatedAt": "ISO8601"
  }
}
```

**Test Cases:**
- ✅ Valid request with authentication and existing assessment
- ✅ Valid request with no existing assessment (returns null)
- ❌ Missing authentication (401 Unauthorized)

### 3. GET /api/v1/fatigue/history - Get Fatigue History

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/fatigue/history?limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "score": 0-100,
      "level": "LOW|MODERATE|HIGH|CRITICAL",
      "confidence": 0-1,
      "explanation": "string",
      "recommendedAction": "string",
      "factors": [...],
      "calculatedAt": "ISO8601"
    }
  ]
}
```

**Test Cases:**
- ✅ Valid request with authentication
- ✅ Request with custom limit parameter
- ✅ Request without limit parameter (default 30)
- ❌ Missing authentication (401 Unauthorized)

### 4. GET /api/v1/fatigue/:id - Get Fatigue by ID

**Request:**
```bash
curl -X GET http://localhost:3000/api/v1/fatigue/<ASSESSMENT_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "score": 0-100,
    "level": "LOW|MODERATE|HIGH|CRITICAL",
    "confidence": 0-1,
    "explanation": "string",
    "recommendedAction": "string",
    "factors": [...],
    "calculatedAt": "ISO8601"
  }
}
```

**Test Cases:**
- ✅ Valid request with authentication and valid ID
- ❌ Invalid assessment ID (404 Not Found)
- ❌ Assessment ID belonging to different user (404 Not Found - user ownership isolation)
- ❌ Missing authentication (401 Unauthorized)

## User Ownership Isolation Tests

All fatigue endpoints must ensure that users can only access their own fatigue assessments:

1. User A creates a fatigue assessment
2. User B tries to access User A's assessment by ID
3. Expected: 404 Not Found (not 403, to prevent ID enumeration)

## Integration with Dashboard

The dashboard endpoint `/api/v1/dashboard` should include fatigue summary:

**Request:**
```bash
curl -X GET http://localhost:3000/api/v1/dashboard \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Expected Response includes fatigueSummary:**
```json
{
  "success": true,
  "data": {
    ...
    "fatigueSummary": {
      "score": 0-100,
      "level": "LOW|MODERATE|HIGH|CRITICAL",
      "confidence": 0-1,
      "recommendedAction": "string",
      "calculatedAt": "ISO8601"
    } | null,
    ...
  }
}
```

## Manual Testing Checklist

- [ ] Well-rested user returns LOW fatigue
- [ ] User with moderate training load returns MODERATE fatigue
- [ ] User with consecutive heavy training returns HIGH fatigue
- [ ] User with poor sleep and high soreness returns elevated fatigue
- [ ] User with critical conditions returns HIGH/CRITICAL fatigue
- [ ] User with missing recovery data has lower confidence
- [ ] Unauthorized requests return 401
- [ ] Cross-user access attempts return 404
- [ ] Dashboard includes fatigue summary when available
- [ ] Dashboard returns null fatigue summary when no assessment exists
