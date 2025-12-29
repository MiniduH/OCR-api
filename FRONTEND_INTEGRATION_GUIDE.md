# OCR API - Frontend Integration Guide

## Overview

This is a **RESTful API** for managing OCR (Optical Character Recognition) ticket data. The backend is built with **Node.js/Express** and uses **PostgreSQL** for data storage.

---

## Getting Started

### API Base URL
```
http://localhost:5001/api/ocr/tickets
```

### Environment Setup
- The backend server runs on **port 5001**
- Make sure the server is running before making API requests
- All requests should include `Content-Type: application/json` header

---

## Authentication
Currently, the API has **no authentication**. All endpoints are publicly accessible.

---

## API Endpoints

### 1. Create a New Ticket
**Request:**
```http
POST /api/ocr/tickets
Content-Type: application/json

{
  "date": "2024-12-29",
  "time": "14:30",
  "terminal_id": "T001",
  "location": "Terminal A",
  "no_tickets": 5,
  "total_amount": "150.00",
  "trace_no": "TRACE123",
  "reference_no": "REF456",
  "ticket_amount_pp": "30.00",
  "ticket_img_path": "/path/to/image.jpg",  // optional
  "scanned_data": {
    "extracted_text": "sample",
    "confidence": 0.95
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2024-12-29",
    "time": "14:30",
    "terminal_id": "T001",
    "location": "Terminal A",
    "no_tickets": 5,
    "total_amount": "150.00",
    "trace_no": "TRACE123",
    "reference_no": "REF456",
    "ticket_amount_pp": "30.00",
    "ticket_img_path": "/path/to/image.jpg",
    "scanned_data": {
      "extracted_text": "sample",
      "confidence": 0.95
    },
    "created_at": "2024-12-29T14:30:00.000Z",
    "updated_at": "2024-12-29T14:30:00.000Z"
  }
}
```

**Required Fields:**
- `date` (string) - YYYY-MM-DD format
- `time` (string) - HH:MM format
- `terminal_id` (string)
- `location` (string)
- `no_tickets` (integer)
- `total_amount` (string)
- `trace_no` (string) - Must be unique
- `reference_no` (string) - Must be unique
- `ticket_amount_pp` (string)
- `scanned_data` (object) - JSON data from OCR scan

**Error Response (400):**
```json
{
  "error": "Missing required field: date"
}
```

---

### 2. Get All Tickets (with Pagination)
**Request:**
```http
GET /api/ocr/tickets?limit=10&offset=0
```

**Query Parameters:**
- `limit` (optional, default: 10) - Number of records to return
- `offset` (optional, default: 0) - Starting position

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2024-12-29",
      "time": "14:30",
      "terminal_id": "T001",
      "location": "Terminal A",
      "no_tickets": 5,
      "total_amount": "150.00",
      "trace_no": "TRACE123",
      "reference_no": "REF456",
      "ticket_amount_pp": "30.00",
      "ticket_img_path": null,
      "scanned_data": {},
      "created_at": "2024-12-29T14:30:00.000Z",
      "updated_at": "2024-12-29T14:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

---

### 3. Get Ticket by ID
**Request:**
```http
GET /api/ocr/tickets/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2024-12-29",
    "time": "14:30",
    "terminal_id": "T001",
    "location": "Terminal A",
    "no_tickets": 5,
    "total_amount": "150.00",
    "trace_no": "TRACE123",
    "reference_no": "REF456",
    "ticket_amount_pp": "30.00",
    "ticket_img_path": null,
    "scanned_data": {},
    "created_at": "2024-12-29T14:30:00.000Z",
    "updated_at": "2024-12-29T14:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Ticket not found"
}
```

---

### 4. Get Ticket by Trace Number
**Request:**
```http
GET /api/ocr/tickets/trace/TRACE123
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2024-12-29",
    "time": "14:30",
    "terminal_id": "T001",
    "location": "Terminal A",
    "no_tickets": 5,
    "total_amount": "150.00",
    "trace_no": "TRACE123",
    "reference_no": "REF456",
    "ticket_amount_pp": "30.00",
    "ticket_img_path": null,
    "scanned_data": {},
    "created_at": "2024-12-29T14:30:00.000Z",
    "updated_at": "2024-12-29T14:30:00.000Z"
  }
}
```

---

### 5. Get Ticket Count
**Request:**
```http
GET /api/ocr/tickets/count
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "count": 42
  }
}
```

---

### 6. Search by Date Range
**Request:**
```http
GET /api/ocr/tickets/search/date-range?startDate=2024-12-01&endDate=2024-12-31
```

**Query Parameters:**
- `startDate` (required) - YYYY-MM-DD format
- `endDate` (required) - YYYY-MM-DD format

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2024-12-29",
      "time": "14:30",
      "terminal_id": "T001",
      "location": "Terminal A",
      "no_tickets": 5,
      "total_amount": "150.00",
      "trace_no": "TRACE123",
      "reference_no": "REF456",
      "ticket_amount_pp": "30.00",
      "ticket_img_path": null,
      "scanned_data": {},
      "created_at": "2024-12-29T14:30:00.000Z",
      "updated_at": "2024-12-29T14:30:00.000Z"
    }
  ]
}
```

---

### 7. Update a Ticket
**Request:**
```http
PUT /api/ocr/tickets/1
Content-Type: application/json

{
  "date": "2024-12-30",
  "total_amount": "200.00",
  "scanned_data": {
    "extracted_text": "updated",
    "confidence": 0.98
  }
}
```

**Notes:**
- You can update any field except `id` and `created_at`
- The `updated_at` field is automatically set to current timestamp
- Send only the fields you want to update

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2024-12-30",
    "time": "14:30",
    "terminal_id": "T001",
    "location": "Terminal A",
    "no_tickets": 5,
    "total_amount": "200.00",
    "trace_no": "TRACE123",
    "reference_no": "REF456",
    "ticket_amount_pp": "30.00",
    "ticket_img_path": null,
    "scanned_data": {
      "extracted_text": "updated",
      "confidence": 0.98
    },
    "created_at": "2024-12-29T14:30:00.000Z",
    "updated_at": "2024-12-30T10:45:00.000Z"
  }
}
```

---

### 8. Delete a Ticket
**Request:**
```http
DELETE /api/ocr/tickets/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Ticket deleted successfully"
}
```

**Error Response (404):**
```json
{
  "error": "Ticket not found"
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message here"
}
```

### Common HTTP Status Codes:
- **200 OK** - Request succeeded
- **201 Created** - Resource created successfully
- **400 Bad Request** - Missing required fields or invalid data
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Server error

---

## Frontend Implementation Examples

### Using Fetch API (JavaScript)

#### Create a Ticket
```javascript
async function createTicket(ticketData) {
  try {
    const response = await fetch('http://localhost:5001/api/ocr/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error);
    }
    
    console.log('Ticket created:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error creating ticket:', error);
  }
}

// Usage
const ticket = await createTicket({
  date: '2024-12-29',
  time: '14:30',
  terminal_id: 'T001',
  location: 'Terminal A',
  no_tickets: 5,
  total_amount: '150.00',
  trace_no: 'TRACE123',
  reference_no: 'REF456',
  ticket_amount_pp: '30.00',
  scanned_data: {},
});
```

#### Get All Tickets
```javascript
async function getAllTickets(limit = 10, offset = 0) {
  try {
    const response = await fetch(
      `http://localhost:5001/api/ocr/tickets?limit=${limit}&offset=${offset}`
    );
    const data = await response.json();
    console.log('Tickets:', data.data);
    console.log('Pagination:', data.pagination);
    return data;
  } catch (error) {
    console.error('Error fetching tickets:', error);
  }
}

// Usage
const result = await getAllTickets(20, 0);
```

#### Get Ticket by ID
```javascript
async function getTicketById(id) {
  try {
    const response = await fetch(`http://localhost:5001/api/ocr/tickets/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error);
    }
    
    console.log('Ticket:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error fetching ticket:', error);
  }
}

// Usage
const ticket = await getTicketById(1);
```

#### Search by Date Range
```javascript
async function searchByDateRange(startDate, endDate) {
  try {
    const response = await fetch(
      `http://localhost:5001/api/ocr/tickets/search/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    const data = await response.json();
    console.log('Search results:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error searching tickets:', error);
  }
}

// Usage
const results = await searchByDateRange('2024-12-01', '2024-12-31');
```

#### Update a Ticket
```javascript
async function updateTicket(id, updates) {
  try {
    const response = await fetch(`http://localhost:5001/api/ocr/tickets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error);
    }
    
    console.log('Ticket updated:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error updating ticket:', error);
  }
}

// Usage
const updated = await updateTicket(1, {
  total_amount: '200.00',
  scanned_data: { confidence: 0.98 },
});
```

#### Delete a Ticket
```javascript
async function deleteTicket(id) {
  try {
    const response = await fetch(`http://localhost:5001/api/ocr/tickets/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error);
    }
    
    console.log(data.message);
  } catch (error) {
    console.error('Error deleting ticket:', error);
  }
}

// Usage
await deleteTicket(1);
```

### Using Axios (JavaScript)

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/ocr/tickets';

// Create
axios.post(API_URL, ticketData)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

// Read
axios.get(`${API_URL}/1`)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

// Update
axios.put(`${API_URL}/1`, { total_amount: '200.00' })
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

// Delete
axios.delete(`${API_URL}/1`)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

---

## Testing the API

### Using cURL (Command Line)

```bash
# Create a ticket
curl -X POST http://localhost:5001/api/ocr/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-12-29",
    "time": "14:30",
    "terminal_id": "T001",
    "location": "Terminal A",
    "no_tickets": 5,
    "total_amount": "150.00",
    "trace_no": "TRACE123",
    "reference_no": "REF456",
    "ticket_amount_pp": "30.00",
    "scanned_data": {}
  }'

# Get all tickets
curl http://localhost:5001/api/ocr/tickets

# Get ticket by ID
curl http://localhost:5001/api/ocr/tickets/1

# Get ticket by trace number
curl http://localhost:5001/api/ocr/tickets/trace/TRACE123

# Search by date range
curl "http://localhost:5001/api/ocr/tickets/search/date-range?startDate=2024-12-01&endDate=2024-12-31"

# Update a ticket
curl -X PUT http://localhost:5001/api/ocr/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{"total_amount": "200.00"}'

# Delete a ticket
curl -X DELETE http://localhost:5001/api/ocr/tickets/1
```

### Using Postman

1. Import the API endpoints into Postman
2. Create requests for each endpoint
3. Test with sample data
4. Save collections for team use

---

## Data Types Reference

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Auto-generated ticket ID |
| date | string | Date in YYYY-MM-DD format |
| time | string | Time in HH:MM format |
| terminal_id | string | Terminal identifier |
| location | string | Physical location |
| no_tickets | integer | Number of tickets |
| total_amount | string | Total amount as string |
| trace_no | string | Unique trace number |
| reference_no | string | Unique reference number |
| ticket_amount_pp | string | Amount per ticket |
| ticket_img_path | string \| null | Optional image path |
| scanned_data | object | JSON data from OCR |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |

---

## Common Issues & Solutions

### Issue: CORS Error
**Solution:** The backend is configured to accept requests from any origin. If you still get CORS errors, ensure the API base URL matches exactly.

### Issue: Connection Refused
**Solution:** Make sure the backend server is running on port 5001. Check the terminal where you started the server.

### Issue: Duplicate trace_no or reference_no
**Solution:** Each ticket must have a unique `trace_no` and `reference_no`. Use timestamps or UUIDs to ensure uniqueness.

### Issue: Database Connection Error
**Solution:** The backend must be connected to a PostgreSQL database. Check the `.env` file configuration.

---

## Frontend Checklist

- [ ] Understand REST API concepts
- [ ] Set up proper error handling
- [ ] Implement loading states for API calls
- [ ] Validate form inputs before sending
- [ ] Handle pagination correctly
- [ ] Implement proper date/time formatting
- [ ] Test all CRUD operations
- [ ] Add user feedback (success/error messages)
- [ ] Implement search functionality
- [ ] Test with various data scenarios

---

## Support

For questions or issues:
1. Check the API documentation above
2. Review example code in this guide
3. Test endpoints with cURL or Postman first
4. Contact the backend team with specific error messages

---

## Backend Status

✅ API is running on `http://localhost:5001`
✅ PostgreSQL database is connected
✅ All endpoints are functional
✅ Ready for frontend integration
