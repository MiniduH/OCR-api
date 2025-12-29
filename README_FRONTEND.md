# 📚 OCR API Documentation - Complete Package

## Available Documentation

This package includes **4 comprehensive guides** for frontend integration:

### 1. 📖 **FRONTEND_INTEGRATION_GUIDE.md** (Main Guide)
**For:** Complete API understanding and implementation examples

**Contains:**
- Full API endpoint documentation
- Request/Response examples for every endpoint
- JavaScript examples (Fetch & Axios)
- Testing with cURL
- Data types reference
- Frontend implementation checklist
- Common issues & solutions

**Start here:** If you're new to the API

---

### 2. ⚡ **QUICK_REFERENCE.md** (Quick Lookup)
**For:** Fast endpoint lookup while coding

**Contains:**
- Endpoint summary table
- Quick API examples
- Response format reference
- Status codes
- Required fields
- Query parameters
- Server status check

**Use this:** When you need quick answers

---

### 3. ❓ **FAQ_TROUBLESHOOTING.md** (Help & Support)
**For:** Problem solving and common questions

**Contains:**
- Frequently asked questions
- Troubleshooting for all common issues
- Performance tips
- Security notes
- Common code patterns
- Testing checklist
- Additional resources

**Use this:** When something doesn't work

---

### 4. 📋 **RUNNING_GUIDE.md** (Backend Setup)
**For:** Understanding how to run the backend

**Contains:**
- Prerequisites
- Step-by-step setup
- Database creation
- Migration running
- Server startup
- Testing the API
- Troubleshooting

**Use this:** To understand the backend setup

---

## Quick Start for Frontend Developers

### Step 1: Understand the API
Read: **FRONTEND_INTEGRATION_GUIDE.md** (sections 1-3)

### Step 2: Know the Endpoints
Reference: **QUICK_REFERENCE.md**

### Step 3: Implement
Use the code examples from **FRONTEND_INTEGRATION_GUIDE.md**

### Step 4: Test
Use cURL commands from **QUICK_REFERENCE.md** or Postman

### Step 5: Debug
Check **FAQ_TROUBLESHOOTING.md** for solutions

---

## API Overview

### Base URL
```
http://localhost:5001/api/ocr/tickets
```

### Main Endpoints
```
POST   /                    Create ticket
GET    /                    Get all tickets
GET    /:id                 Get by ID
GET    /trace/:traceNo      Get by trace number
GET    /count               Get total count
GET    /search/date-range   Search by dates
PUT    /:id                 Update ticket
DELETE /:id                 Delete ticket
```

### No Authentication Required ✅
All endpoints are publicly accessible

---

## Essential Information

### Content-Type Header
```
Content-Type: application/json
```

### Date Format
```
YYYY-MM-DD (e.g., 2024-12-29)
```

### Time Format
```
HH:MM (e.g., 14:30)
```

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

---

## Key Concepts

### Ticket Fields
| Field | Required | Type | Notes |
|-------|----------|------|-------|
| date | Yes | string | YYYY-MM-DD |
| time | Yes | string | HH:MM |
| terminal_id | Yes | string | Terminal identifier |
| location | Yes | string | Physical location |
| no_tickets | Yes | integer | Number of tickets |
| total_amount | Yes | string | Total amount |
| trace_no | Yes | string | Must be unique |
| reference_no | Yes | string | Must be unique |
| ticket_amount_pp | Yes | string | Amount per ticket |
| ticket_img_path | No | string | Optional image path |
| scanned_data | Yes | object | OCR extracted data |

### Pagination
- Default limit: 10
- Default offset: 0
- Max records: 1000 per request

### Search
- Date range format: YYYY-MM-DD
- Both startDate and endDate required
- Returns all matching tickets

---

## Testing Tools

### Browser (Fetch)
```javascript
fetch('http://localhost:5001/api/ocr/tickets')
  .then(r => r.json())
  .then(d => console.log(d))
```

### cURL (Terminal)
```bash
curl http://localhost:5001/api/ocr/tickets
```

### Postman (Desktop)
1. Create new request
2. Set method (GET, POST, etc.)
3. Enter URL
4. Add headers
5. Add body (for POST/PUT)
6. Send

### Axios (Node.js)
```javascript
const axios = require('axios');
axios.get('http://localhost:5001/api/ocr/tickets')
  .then(r => console.log(r.data))
```

---

## Common Patterns

### Create with Error Handling
```javascript
async function createTicket(data) {
  try {
    const res = await fetch('http://localhost:5001/api/ocr/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error);
    return result.data;
  } catch (err) {
    console.error('Failed:', err);
    throw err;
  }
}
```

### Get with Pagination
```javascript
async function getTickets(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  const res = await fetch(
    `http://localhost:5001/api/ocr/tickets?limit=${pageSize}&offset=${offset}`
  );
  return await res.json();
}
```

### Search by Date
```javascript
async function searchTickets(startDate, endDate) {
  const res = await fetch(
    `http://localhost:5001/api/ocr/tickets/search/date-range?` +
    `startDate=${startDate}&endDate=${endDate}`
  );
  return await res.json();
}
```

### Update Partially
```javascript
async function updateTicket(id, updates) {
  const res = await fetch(
    `http://localhost:5001/api/ocr/tickets/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }
  );
  return await res.json();
}
```

---

## Validation Rules

### Required on Create
- [ ] date (YYYY-MM-DD)
- [ ] time (HH:MM)
- [ ] terminal_id (non-empty)
- [ ] location (non-empty)
- [ ] no_tickets (positive integer)
- [ ] total_amount (string)
- [ ] trace_no (unique string)
- [ ] reference_no (unique string)
- [ ] ticket_amount_pp (string)
- [ ] scanned_data (object)

### Uniqueness Rules
- trace_no must be unique per ticket
- reference_no must be unique per ticket
- If duplicate: HTTP 400 error

---

## Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Use the data |
| 201 | Created | Use the created data |
| 400 | Bad Request | Check your data |
| 404 | Not Found | Check the ID exists |
| 500 | Server Error | Wait & retry |

---

## Debugging Tips

1. **Log responses:** Always console.log the full response
2. **Check headers:** Ensure Content-Type is set
3. **Validate data:** Make sure all required fields exist
4. **Test with cURL first:** Before writing JavaScript
5. **Check backend logs:** Run with `npm run dev` to see logs
6. **Use Postman:** Test endpoints one-by-one
7. **Network tab:** Check actual request/response in DevTools

---

## Before You Start

- [ ] Backend is running: `npm run dev`
- [ ] PostgreSQL is running
- [ ] Database 'ocr' exists
- [ ] Port 5001 is accessible
- [ ] You can access: http://localhost:5001/api/health

---

## File Reference

```
/ocr-api
├── FRONTEND_INTEGRATION_GUIDE.md   ← START HERE
├── QUICK_REFERENCE.md              ← For lookups
├── FAQ_TROUBLESHOOTING.md          ← For help
├── RUNNING_GUIDE.md                ← Backend info
├── server.js                       ← Entry point
├── package.json                    ← Dependencies
├── config/database.js              ← DB config
├── controllers/ticketsController.js ← Logic
├── models/Tickets.js               ← Data model
├── routes/tickets.js               ← Endpoints
└── database/migrations/            ← Schema
```

---

## Learning Path

### For Complete Beginners:
1. Read: Overview section above
2. Read: "Getting Started" in FRONTEND_INTEGRATION_GUIDE.md
3. Try: Basic create example
4. Read: Error Handling section
5. Try: All CRUD operations

### For Experienced Developers:
1. Check: QUICK_REFERENCE.md
2. Review: Code examples in FRONTEND_INTEGRATION_GUIDE.md
3. Test: With Postman or cURL
4. Reference: FAQ_TROUBLESHOOTING.md as needed

---

## Support

### Stuck? Try these steps:
1. ✅ Check QUICK_REFERENCE.md for correct endpoint
2. ✅ Check FAQ_TROUBLESHOOTING.md for your error
3. ✅ Try the cURL example first
4. ✅ Check backend logs
5. ✅ Review FRONTEND_INTEGRATION_GUIDE.md examples
6. ✅ Contact backend team with error message

---

## API Features

✅ Create tickets
✅ Read/retrieve tickets
✅ Update tickets
✅ Delete tickets
✅ Search by date range
✅ Get by trace number
✅ Pagination support
✅ Get total count
✅ JSON responses
✅ Error handling

---

## Next Steps

1. Open **FRONTEND_INTEGRATION_GUIDE.md**
2. Review the endpoint documentation
3. Try a cURL request
4. Implement in your frontend
5. Reference QUICK_REFERENCE.md while coding
6. Use FAQ_TROUBLESHOOTING.md if stuck

---

## Version
**API Version:** 1.0.0  
**Documentation:** December 29, 2024  
**Status:** ✅ Production Ready (for testing)

---

## Questions?

All answers are in the documentation files. Use Ctrl+F to search!

Common searches:
- Search "error" for troubleshooting
- Search "example" for code samples
- Search "required" for field info
- Search "format" for data formats

---

**Good luck! 🚀**

Start with FRONTEND_INTEGRATION_GUIDE.md →
