# Backend Image Upload - Testing Guide

## Quick Test with cURL

### Prerequisites
- Backend server running: `npm run dev`
- MinIO/S3 accessible at `http://207.180.232.61:9002`
- Bucket `divisarana` exists

### Test 1: Upload with PNG Image

```bash
# Create a simple test image (1x1 PNG)
# Option A: Use a real image file, or
# Option B: Use the base64-encoded PNG below

# Save this base64 as test.png (or use your own image)
# Then run:

curl -X POST http://localhost:3000/api/ocr/tickets/with-image \
  -F "image=@test.png" \
  -F 'data={
    "date": "2024-12-29",
    "time": "14:30",
    "terminal_id": "T001",
    "location": "Main Entrance",
    "no_tickets": 2,
    "total_amount": "5500.00",
    "trace_no": "TEST_123456",
    "reference_no": "REF001",
    "ticket_amount_pp": "2750.00",
    "scanned_data": {
      "extracted_text": "Test OCR data",
      "confidence": 0.95
    }
  }' \
  -H "Content-Type: multipart/form-data"
```

### Expected Response (Success)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "date": "2024-12-29",
    "time": "14:30",
    "terminal_id": "T001",
    "location": "Main Entrance",
    "no_tickets": 2,
    "total_amount": "5500.00",
    "trace_no": "TEST_123456",
    "reference_no": "REF001",
    "ticket_amount_pp": "2750.00",
    "ticket_img_path": "s3://divisarana/tickets/TEST_123456_1735475000000.png",
    "scanned_data": {
      "extracted_text": "Test OCR data",
      "confidence": 0.95
    },
    "created_at": "2024-12-29T14:30:00.000Z",
    "updated_at": "2024-12-29T14:30:00.000Z"
  },
  "message": "✓ Ticket saved successfully (Trace: TEST_123456)"
}
```

---

## Test 2: Verify Image in MinIO

After uploading, check if the image is in MinIO:

```bash
# List objects in bucket (using MinIO CLI or API)
mc ls minio/divisarana/tickets/

# Or access via HTTP (if public):
curl http://207.180.232.61:9002/divisarana/tickets/TEST_123456_1735475000000.png
```

---

## Test 3: Error Cases

### 3a. Missing Image File

```bash
curl -X POST http://localhost:3000/api/ocr/tickets/with-image \
  -F 'data={
    "date": "2024-12-29",
    "time": "14:30",
    "terminal_id": "T001",
    "location": "Main Entrance",
    "no_tickets": 2,
    "total_amount": "5500.00",
    "trace_no": "TEST_123456",
    "reference_no": "REF001",
    "ticket_amount_pp": "2750.00",
    "scanned_data": {"extracted_text": "test", "confidence": 0.95}
  }'
```

**Expected Response:**
```json
{
  "error": "Image file is required"
}
```

### 3b. Invalid JSON in Data Field

```bash
curl -X POST http://localhost:3000/api/ocr/tickets/with-image \
  -F "image=@test.png" \
  -F 'data=INVALID_JSON'
```

**Expected Response:**
```json
{
  "error": "Invalid JSON in data field"
}
```

### 3c. Missing Required Field

```bash
curl -X POST http://localhost:3000/api/ocr/tickets/with-image \
  -F "image=@test.png" \
  -F 'data={
    "date": "2024-12-29",
    "time": "14:30",
    "terminal_id": "T001"
    // Missing required fields
  }'
```

**Expected Response:**
```json
{
  "error": "Missing required field: location"
}
```

---

## Test 4: Verify Database Record

After successful upload, query the database:

```bash
# Connect to PostgreSQL
psql -U postgres -d ocr_api

# Query the ticket
SELECT id, date, terminal_id, trace_no, ticket_img_path FROM tickets WHERE trace_no = 'TEST_123456';
```

**Expected Output:**
```
 id |    date    | terminal_id |   trace_no   |                           ticket_img_path
----+------------+-------------+--------------+-------------------------------------------------------
  1 | 2024-12-29 | T001        | TEST_123456  | s3://divisarana/tickets/TEST_123456_1735475000000.png
```

---

## Test 5: Integration Test (Frontend Simulation)

### Using Node.js/JavaScript

```javascript
// Simulate frontend upload
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  const formData = new FormData();
  
  // Add image
  formData.append('image', fs.createReadStream('test.png'), 'ticket.png');
  
  // Add data as JSON string
  const ticketData = {
    date: '2024-12-29',
    time: '14:30',
    terminal_id: 'T001',
    location: 'Main Entrance',
    no_tickets: 2,
    total_amount: '5500.00',
    trace_no: 'TEST_123456',
    reference_no: 'REF001',
    ticket_amount_pp: '2750.00',
    scanned_data: {
      extracted_text: 'Test OCR',
      confidence: 0.95
    }
  };
  
  formData.append('data', JSON.stringify(ticketData));
  
  try {
    const response = await fetch('http://localhost:3000/api/ocr/tickets/with-image', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    console.log('✓ Upload successful:', result);
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }
}

testUpload();
```

---

## Checklist for Verification

- [ ] Backend starts without errors: `npm run dev`
- [ ] Health check works: `curl http://localhost:3000/api/health`
- [ ] MinIO is accessible and credentials are correct
- [ ] Image is successfully uploaded to S3
- [ ] Ticket record is created in database
- [ ] Response includes S3 path
- [ ] Error handling works for missing image
- [ ] Error handling works for invalid JSON
- [ ] Error handling works for missing fields
- [ ] Image can be retrieved from S3
- [ ] Multiple uploads create different files (timestamp in filename)

---

## Server Logs to Monitor

When testing, watch for these log messages:

### Successful Upload
```
📥 createTicketWithImage request received
✓ Ticket data parsed: { trace_no: 'TEST_123456', terminal_id: 'T001' }
🔄 Uploading image to S3...
✓ Ticket image uploaded successfully: tickets/TEST_123456_1735475000000.png
✓ Ticket created with ID: 1
```

### Upload Failure
```
📥 createTicketWithImage request received
⚠️ No image file provided
```

---

## Troubleshooting

### Issue: "Failed to upload image to S3"
**Solution:**
1. Check MinIO is running: `curl http://207.180.232.61:9002`
2. Verify `.env` credentials match MinIO admin user
3. Ensure bucket `divisarana` exists in MinIO

### Issue: "Image file is required"
**Solution:**
1. Ensure form field name is exactly `image`
2. Verify file is being added: `-F "image=@test.png"`

### Issue: "Invalid JSON in data field"
**Solution:**
1. Ensure data is valid JSON
2. Use `JSON.stringify()` in JavaScript
3. Escape quotes properly in cURL

### Issue: Timeout or slow upload
**Solution:**
1. Check network connectivity to MinIO
2. Verify file size is under 12MB
3. Check MinIO is not overloaded

---

## Next Steps

1. ✓ Backend implementation complete
2. → Frontend integration (use spec provided)
3. → Monitor uploads in production
4. → Implement image compression (optional)
5. → Add thumbnail generation (optional)
