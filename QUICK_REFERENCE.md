# OCR API - Quick Reference Card

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/ocr/tickets` | Create new ticket |
| `GET` | `/api/ocr/tickets` | Get all tickets (paginated) |
| `GET` | `/api/ocr/tickets/:id` | Get ticket by ID |
| `GET` | `/api/ocr/tickets/trace/:traceNo` | Get ticket by trace number |
| `GET` | `/api/ocr/tickets/count` | Get total ticket count |
| `GET` | `/api/ocr/tickets/search/date-range` | Search by date range |
| `PUT` | `/api/ocr/tickets/:id` | Update ticket |
| `DELETE` | `/api/ocr/tickets/:id` | Delete ticket |

---

## Base URL
```
http://localhost:5001/api/ocr/tickets
```

---

## Required Headers
```
Content-Type: application/json
```

---

## Ticket Object Structure

```javascript
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
```

---

## Quick API Examples

### Create Ticket
```javascript
fetch('http://localhost:5001/api/ocr/tickets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: '2024-12-29',
    time: '14:30',
    terminal_id: 'T001',
    location: 'Terminal A',
    no_tickets: 5,
    total_amount: '150.00',
    trace_no: 'TRACE123',
    reference_no: 'REF456',
    ticket_amount_pp: '30.00',
    scanned_data: {}
  })
})
```

### Get All Tickets
```javascript
fetch('http://localhost:5001/api/ocr/tickets?limit=10&offset=0')
```

### Get Single Ticket
```javascript
fetch('http://localhost:5001/api/ocr/tickets/1')
```

### Update Ticket
```javascript
fetch('http://localhost:5001/api/ocr/tickets/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ total_amount: '200.00' })
})
```

### Delete Ticket
```javascript
fetch('http://localhost:5001/api/ocr/tickets/1', {
  method: 'DELETE'
})
```

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "error": "Error message here"
}
```

---

## Status Codes
- `200` OK
- `201` Created
- `400` Bad Request
- `404` Not Found
- `500` Server Error

---

## Required Fields for Create
- date (YYYY-MM-DD)
- time (HH:MM)
- terminal_id
- location
- no_tickets (integer)
- total_amount
- trace_no (unique)
- reference_no (unique)
- ticket_amount_pp
- scanned_data (object)

---

## Query Parameters
- `limit` - Number of records (default: 10)
- `offset` - Starting position (default: 0)
- `startDate` - For date range search (YYYY-MM-DD)
- `endDate` - For date range search (YYYY-MM-DD)

---

## Common Errors

| Error | Solution |
|-------|----------|
| Connection refused | Server not running on port 5001 |
| Missing required field | Check all fields are provided |
| Duplicate trace_no | Use unique trace numbers |
| Duplicate reference_no | Use unique reference numbers |
| Not found (404) | Check ticket ID exists |

---

## Testing Tools
- **Postman** - Full API testing
- **cURL** - Command line testing
- **Fetch API** - Browser testing
- **Axios** - JavaScript library

---

## Server Status Check
```
GET http://localhost:5001/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-29T14:30:00.000Z"
}
```
