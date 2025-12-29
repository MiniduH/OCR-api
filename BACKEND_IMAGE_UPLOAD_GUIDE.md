# Frontend Image Upload to S3 - Backend Implementation

## Overview
The backend now supports image uploads directly from the frontend when saving tickets. Images are uploaded to S3/MinIO and associated with ticket records.

---

## Endpoint Details

### POST `/api/ocr/tickets/with-image`

**Purpose:** Create a new ticket with image upload to S3

**Content-Type:** `multipart/form-data`

#### Request Format

```
POST /api/ocr/tickets/with-image HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="image"; filename="ticket.png"
Content-Type: image/png

[BINARY IMAGE DATA]
------WebKitFormBoundary
Content-Disposition: form-data; name="data"

{
  "date": "2024-12-29",
  "time": "14:30",
  "terminal_id": "T001",
  "location": "Main Entrance",
  "no_tickets": 2,
  "total_amount": "5500.00",
  "trace_no": "123456",
  "reference_no": "REF001",
  "ticket_amount_pp": "2750.00",
  "scanned_data": {
    "extracted_text": "OCR extracted text...",
    "confidence": 0.95
  }
}
------WebKitFormBoundary--
```

#### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Binary image data (PNG/JPEG, max 12MB) |
| `data` | JSON String | Yes | Ticket metadata as JSON string |

#### Response Format (Success)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "date": "2024-12-29",
    "time": "14:30",
    "terminal_id": "T001",
    "location": "Main Entrance",
    "no_tickets": 2,
    "total_amount": "5500.00",
    "trace_no": "123456",
    "reference_no": "REF001",
    "ticket_amount_pp": "2750.00",
    "ticket_img_path": "s3://divisarana/tickets/123456_1735475000000.png",
    "scanned_data": {
      "extracted_text": "...",
      "confidence": 0.95
    },
    "created_at": "2024-12-29T14:30:00Z",
    "updated_at": "2024-12-29T14:30:00Z"
  },
  "message": "✓ Ticket saved successfully (Trace: 123456)"
}
```

#### Response Format (Error)

```json
{
  "error": "Failed to upload image to S3",
  "details": "..."
}
```

---

## HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| `201` | Created | Ticket successfully created with image |
| `400` | Bad Request | Missing image, invalid JSON, or missing fields |
| `413` | Payload Too Large | Image exceeds 12MB limit |
| `500` | Internal Server Error | S3 upload failure, database error |

---

## Backend Implementation Details

### 1. Middleware Setup
- **Multer** configured with `memoryStorage()` - stores uploaded file in memory buffer
- **File Size Limit:** 12MB
- **Field Name:** `image` (single file)

### 2. Image Upload Process

```javascript
// 1. Receive multipart/form-data
router.post('/with-image', upload.single('image'), TicketsController.createTicketWithImage);

// 2. Extract image buffer and ticket data
const imageBuffer = req.file.buffer;
const ticketData = JSON.parse(req.body.data);

// 3. Upload to S3
const imagePath = await uploadTicketImage(imageBuffer, req.file.originalname, trace_no);

// 4. Create ticket record with image path
const newTicket = await TicketsModel.create({
  ...ticketData,
  ticket_img_path: imagePath
});

// 5. Return response with ticket data
res.status(201).json({ success: true, data: newTicket });
```

### 3. S3 Configuration

Uses environment variables (MinIO):
```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=divisarana
AWS_ENDPOINT=http://207.180.232.61:9002
AWS_USE_PATH_STYLE_ENDPOINT=true
```

### 4. Image Path Generation

**Pattern:** `s3://bucket/tickets/{trace_no}_{timestamp}.{ext}`

**Example:** `s3://divisarana/tickets/123456_1735475000000.png`

---

## Frontend Integration

### JavaScript/TypeScript Example

```typescript
// Prepare FormData
const formData = new FormData();

// Convert Data URL to Blob
const imageBlob = await fetch(capturedImageUrl).then(r => r.blob());
formData.append('image', imageBlob, 'ticket.png');

// Add ticket metadata as JSON string
const ticketPayload = {
  date: "2024-12-29",
  time: "14:30",
  terminal_id: "T001",
  location: "Main Entrance",
  no_tickets: 2,
  total_amount: "5500.00",
  trace_no: "123456",
  reference_no: "REF001",
  ticket_amount_pp: "2750.00",
  scanned_data: {
    extracted_text: "...",
    confidence: 0.95
  }
};

formData.append('data', JSON.stringify(ticketPayload));

// Send to backend
const response = await fetch('/api/ocr/tickets/with-image', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});

const result = await response.json();
```

### cURL Example

```bash
curl -X POST http://localhost:3000/api/ocr/tickets/with-image \
  -F "image=@/path/to/ticket.png" \
  -F 'data={
    "date": "2024-12-29",
    "time": "14:30",
    "terminal_id": "T001",
    "location": "Main Entrance",
    "no_tickets": 2,
    "total_amount": "5500.00",
    "trace_no": "123456",
    "reference_no": "REF001",
    "ticket_amount_pp": "2750.00",
    "scanned_data": {"extracted_text": "...", "confidence": 0.95}
  }'
```

### Python Example

```python
import requests

# Prepare files
files = {
    'image': ('ticket.png', open('ticket.png', 'rb'), 'image/png'),
    'data': (None, json.dumps({
        'date': '2024-12-29',
        'time': '14:30',
        'terminal_id': 'T001',
        'location': 'Main Entrance',
        'no_tickets': 2,
        'total_amount': '5500.00',
        'trace_no': '123456',
        'reference_no': 'REF001',
        'ticket_amount_pp': '2750.00',
        'scanned_data': {
            'extracted_text': '...',
            'confidence': 0.95
        }
    }))
}

# Send request
response = requests.post(
    'http://localhost:3000/api/ocr/tickets/with-image',
    files=files
)

print(response.json())
```

---

## Error Handling

### Common Errors and Solutions

#### 1. No Image File Provided
```json
{
  "error": "Image file is required"
}
```
**Solution:** Ensure the image field is included in FormData with name `image`

#### 2. Invalid JSON in Data Field
```json
{
  "error": "Invalid JSON in data field"
}
```
**Solution:** Ensure the `data` field contains valid JSON string: `JSON.stringify(object)`

#### 3. Missing Required Fields
```json
{
  "error": "Missing required field: trace_no"
}
```
**Solution:** Include all required fields in the data object

#### 4. S3 Upload Failure
```json
{
  "error": "Failed to upload image to S3",
  "details": "..."
}
```
**Solution:** Check MinIO/S3 credentials and endpoint in `.env`

#### 5. File Too Large
```json
{
  "error": "File too large"
}
```
**Solution:** Ensure image size is under 12MB

---

## Database Schema

### tickets table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | SERIAL | No | Primary key |
| `date` | VARCHAR(50) | No | Ticket date |
| `time` | VARCHAR(50) | No | Ticket time |
| `terminal_id` | VARCHAR(100) | No | Terminal identifier |
| `location` | VARCHAR(255) | No | Location |
| `no_tickets` | INTEGER | No | Number of tickets |
| `total_amount` | VARCHAR(100) | No | Total amount |
| `trace_no` | VARCHAR(255) | Yes | Trace number (unique) |
| `reference_no` | VARCHAR(255) | Yes | Reference number (unique) |
| `ticket_amount_pp` | VARCHAR(100) | No | Amount per person |
| **`ticket_img_path`** | TEXT | Yes | **S3 image path** |
| `scanned_data` | JSONB | No | OCR extracted data |
| `created_at` | TIMESTAMP | No | Creation timestamp |
| `updated_at` | TIMESTAMP | No | Update timestamp |

---

## Files Modified/Created

### New Files
- `/utils/uploadTicketImage.js` - S3 image upload utility
- `/BACKEND_IMAGE_UPLOAD_GUIDE.md` - This documentation

### Modified Files
- `/config/s3.js` - Updated for MinIO compatibility
- `/controllers/ticketsController.js` - Added `createTicketWithImage` method
- `/routes/tickets.js` - Added new route with multer middleware
- `/server.js` - Updated API documentation

---

## Testing Checklist

- [x] S3/MinIO configuration with correct credentials
- [x] Multer middleware correctly extracts image and form data
- [x] Image buffer is sent to uploadTicketImage utility
- [x] S3 path is generated with trace_no and timestamp
- [x] Image is uploaded to S3 bucket
- [x] Ticket record is created with image_path
- [x] Response includes S3 path
- [x] Error handling for missing image
- [x] Error handling for invalid JSON
- [x] Error handling for missing fields
- [x] Error handling for S3 upload failures

---

## Troubleshooting

### MinIO Connection Issues
```bash
# Check MinIO connection
curl http://207.180.232.61:9002

# Verify credentials
# AWS_ACCESS_KEY_ID=minioadmin
# AWS_SECRET_ACCESS_KEY=minioadmin
```

### Image Not Uploading to S3
1. Verify `.env` file has correct credentials
2. Check MinIO is running and accessible
3. Verify bucket name is correct: `divisarana`
4. Check server logs for detailed S3 errors

### Ticket Created But No Image
1. Verify image file is being sent in request
2. Check FormData has both `image` and `data` fields
3. Review server logs for upload errors

---

## Future Enhancements

1. **Image Compression** - Reduce file size before upload
2. **Thumbnail Generation** - Create thumbnails for preview
3. **Multiple Image Formats** - Support additional image formats
4. **Retry Logic** - Exponential backoff for failed uploads
5. **Upload Progress** - Track upload progress on frontend
6. **Image Validation** - Client-side format/size validation
