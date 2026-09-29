# API Integration Documentation

## Overview

This document describes the service-to-service API integration between the **Care Home Shift Platform** and the **Keris Nurses Data UK** system.

### Architecture

- **Care Home Shift Platform** (Port 5002): Manages shifts and vacancies for care homes
- **Keris Nurses Data UK** (Port 5001): Manages staff/worker data and availability

The Care Home platform calls the Keris API to fetch available staff when matching workers to shifts.

---

## Authentication

All external API endpoints are protected with **API Key Authentication**.

### Headers Required

```
X-API-Key: <shared-secret-key>
X-Service-Name: <your-service-name>
```

### Configuration

Both services must use the **same API key** in their `.env` files:

**Keris Backend** (`/Keris Nurses Data UK/backend/.env`):
```env
SERVICE_API_KEY="keris-carehome-integration-2024-secure-key"
```

**Care Home Backend** (`/Care-Home-Shift-Platform/backend/.env`):
```env
SERVICE_API_KEY="keris-carehome-integration-2024-secure-key"
KERIS_API_URL="http://localhost:5001/api"
```

---

## Keris API Endpoints

Base URL: `http://localhost:5001/api`

### 1. GET /external/staff

Fetch available staff with filtering options.

**Query Parameters:**
- `role` (string): Job title filter (e.g., "Registered Nurse", "Care Assistant")
- `location` (string): Location filter (e.g., "London", "Manchester")
- `availability` (string): Availability status (default: "Available")
- `skills` (string): Comma-separated skills (e.g., "dementia care,medication administration")
- `minExperience` (number): Minimum years of experience
- `workPermitStatus` (string): Work permit status (e.g., "Valid", "Pending")
- `limit` (number): Maximum results (default: 50, max: 100)

**Example Request:**
```bash
curl -X GET "http://localhost:5001/api/external/staff?role=Registered%20Nurse&location=London&availability=Available&skills=dementia%20care&limit=20" \
  -H "X-API-Key: keris-carehome-integration-2024-secure-key" \
  -H "X-Service-Name: care-home-shift-platform"
```

**Example Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": 123,
      "fullName": "Sarah Johnson",
      "jobTitle": "Registered Nurse",
      "yearsOfExperience": 8,
      "location": "London",
      "availability": "Available",
      "workPermitStatus": "Valid",
      "skills": [
        { "id": 1, "name": "dementia care", "category": "Care" },
        { "id": 5, "name": "medication administration", "category": "Clinical" }
      ],
      "qualifications": [
        { "id": 10, "name": "RN - Registered Nurse", "issuingBody": "NMC" }
      ],
      "certifications": [
        { "id": 3, "name": "Basic Life Support", "expiryDate": "2025-06-30" }
      ]
    }
  ]
}
```

### 2. GET /external/staff/:id

Get detailed information about a specific staff member.

**Example Request:**
```bash
curl -X GET "http://localhost:5001/api/external/staff/123" \
  -H "X-API-Key: keris-carehome-integration-2024-secure-key" \
  -H "X-Service-Name: care-home-shift-platform"
```

### 3. GET /external/skills

Get all available skills in the system.

**Example Request:**
```bash
curl -X GET "http://localhost:5001/api/external/skills" \
  -H "X-API-Key: keris-carehome-integration-2024-secure-key" \
  -H "X-Service-Name: care-home-shift-platform"
```

---

## Care Home API Endpoints

Base URL: `http://localhost:5002/api`

### 1. GET /external/shifts

Fetch shifts with filtering options.

**Query Parameters:**
- `status` (string): Shift status (default: "OPEN" or "PARTIALLY_FILLED")
- `priority` (string): Priority level (e.g., "URGENT", "HIGH", "NORMAL")
- `location` (string): Location filter
- `jobTitle` (string): Job title filter
- `date` (string): Shift date (YYYY-MM-DD)
- `limit` (number): Maximum results (default: 50, max: 100)

**Example Request:**
```bash
curl -X GET "http://localhost:5002/api/external/shifts?status=OPEN&priority=URGENT&location=London&limit=10" \
  -H "X-API-Key: keris-carehome-integration-2024-secure-key" \
  -H "X-Service-Name: keris-nurses-data-uk"
```

**Example Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 42,
      "careHome": {
        "id": 7,
        "name": "Sunrise Care Home",
        "address": "123 High Street",
        "town": "London",
        "postcode": "SW1A 1AA",
        "county": "Greater London",
        "careType": "Residential Care, Dementia Care",
        "contactPerson": "Jane Smith",
        "phone": "020 1234 5678"
      },
      "jobTitle": "Registered Nurse",
      "shiftDate": "2024-01-15",
      "startTime": "07:00",
      "endTime": "19:00",
      "requiredStaff": 2,
      "filledStaff": 0,
      "location": "London",
      "department": "General Ward",
      "careType": "Residential Care",
      "requiredSkills": ["dementia care", "medication administration"],
      "experienceRequired": "2+ years",
      "payRate": "£18.50/hour",
      "notes": "Experience with dementia patients preferred",
      "status": "OPEN",
      "priority": "URGENT"
    }
  ]
}
```

### 2. GET /external/shifts/:id

Get detailed information about a specific shift including assigned staff.

### 3. GET /external/care-homes

Get all care homes in the system.

---

## Integration Flow

### Staff Matching Process

When the Care Home platform needs to find staff for a shift:

1. **Shift Requirements**: Care home creates a shift with requirements (role, skills, location, date)

2. **API Call to Keris**: The `staffMatchingService` calls the Keris API:
   ```typescript
   const response = await fetch(
     `${KERIS_API_URL}/external/staff?role=${role}&location=${location}&skills=${skills}`,
     {
       headers: {
         'X-API-Key': SERVICE_API_KEY,
         'X-Service-Name': 'care-home-shift-platform',
       }
     }
   );
   ```

3. **Match Scoring**: Staff are scored based on:
   - Role match (30 points for exact match)
   - Skill overlap (up to 20 points)
   - Location match (10 points)
   - Base score: 50 points

4. **Fallback**: If the external API is unavailable, the system falls back to internal demo staff

5. **Results**: Staff are sorted by match score (highest first) and returned to the frontend

---

## Setup Instructions

### 1. Install Dependencies

**Keris Backend:**
```bash
cd "Keris Nurses Data UK/backend"
npm install
```

**Care Home Backend:**
```bash
cd "Care-Home-Shift-Platform/backend"
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` in both backends and configure:

**Keris Backend** (`.env`):
```env
DATABASE_URL="file:./dev.db"
PORT=5001
SERVICE_API_KEY="keris-carehome-integration-2024-secure-key"
CARE_HOME_SHIFT_API_URL="http://localhost:5002/api"
```

**Care Home Backend** (`.env`):
```env
DATABASE_URL="file:./dev.db"
PORT=5002
SERVICE_API_KEY="keris-carehome-integration-2024-secure-key"
KERIS_API_URL="http://localhost:5001/api"
```

### 3. Initialize Databases

**Keris Backend:**
```bash
cd "Keris Nurses Data UK/backend"
npx prisma generate
npx prisma db push
npx prisma db seed
```

**Care Home Backend:**
```bash
cd "Care-Home-Shift-Platform/backend"
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Start Services

**Terminal 1 - Keris Backend:**
```bash
cd "Keris Nurses Data UK/backend"
npm run dev
```

**Terminal 2 - Care Home Backend:**
```bash
cd "Care-Home-Shift-Platform/backend"
npm run dev
```

**Terminal 3 - Keris Frontend:**
```bash
cd "Keris Nurses Data UK/frontend"
npm run dev
```

**Terminal 4 - Care Home Frontend:**
```bash
cd "Care-Home-Shift-Platform/frontend"
npm run dev
```

### 5. Verify Integration

1. Open Care Home platform: http://localhost:3001
2. Navigate to a shift that needs staff
3. Click "Find Suitable Staff" or similar button
4. System should call Keris API and display matched staff
5. Check backend logs for API call confirmation

---

## Testing the Integration

### Manual Testing with cURL

**Test 1: Fetch Available Staff from Keris**
```bash
curl -X GET "http://localhost:5001/api/external/staff?availability=Available&limit=10" \
  -H "X-API-Key: keris-carehome-integration-2024-secure-key" \
  -H "X-Service-Name: care-home-shift-platform" \
  | jq
```

**Test 2: Test Authentication (should fail with 401)**
```bash
curl -X GET "http://localhost:5001/api/external/staff" \
  | jq
```

**Test 3: Test Invalid API Key (should fail with 403)**
```bash
curl -X GET "http://localhost:5001/api/external/staff" \
  -H "X-API-Key: invalid-key" \
  | jq
```

**Test 4: Fetch Open Shifts from Care Home**
```bash
curl -X GET "http://localhost:5002/api/external/shifts?status=OPEN" \
  -H "X-API-Key: keris-carehome-integration-2024-secure-key" \
  -H "X-Service-Name: keris-nurses-data-uk" \
  | jq
```

### Integration Test Scenarios

1. **Happy Path**: Care Home requests staff, Keris API returns results
2. **Filtered Search**: Request staff with specific skills and location
3. **Empty Results**: Request staff with impossible criteria
4. **API Failure**: Stop Keris backend, verify Care Home falls back to internal data
5. **Authentication**: Verify API key validation works correctly

---

## Error Handling

### Common Errors

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Missing API key. Include X-API-Key header."
}
```
**Solution:** Add `X-API-Key` header to the request

**403 Forbidden**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```
**Solution:** Verify the API key matches in both `.env` files

**500 Server Error**
```json
{
  "success": false,
  "error": "External API error: 500 Internal Server Error"
}
```
**Solution:** Check Keris backend logs, verify database connection

**Fallback Activated**
```
[Staff Matching] External API failed, using internal fallback
```
**Solution:** This is expected behavior when Keris API is unavailable

---

## Security Considerations

1. **API Keys**: Change default API key in production
2. **CORS**: Update allowed origins for production domains
3. **Rate Limiting**: Consider adding rate limiting middleware
4. **HTTPS**: Use HTTPS in production (not HTTP)
5. **Environment Variables**: Never commit `.env` files to version control
6. **Logging**: Sensitive data should not be logged

---

## Future Enhancements

- [ ] Add webhook notifications for shift updates
- [ ] Implement staff booking/assignment via API
- [ ] Add analytics endpoint for integration metrics
- [ ] Implement OAuth 2.0 for more robust authentication
- [ ] Add request/response caching
- [ ] Implement API versioning (v1, v2)
- [ ] Add GraphQL endpoint for flexible queries

---

## Support

For issues or questions:
- Check backend logs for detailed error messages
- Verify environment variables are configured correctly
- Ensure both services are running on correct ports
- Test API endpoints directly with cURL before debugging integration

## Changelog

### Version 1.0.0 (2024-01-14)
- Initial API integration
- API key authentication
- Staff matching service integration
- CORS configuration
- External API endpoints for both services
