# MinIO Configuration Guide

## Issue Resolved
**Error:** `AccessDenied` - `/tickets/tickets/TRACE_...` (double path)

**Fix:** Removed duplicate "tickets/" prefix from file path. Bucket is already named "tickets", so keys should not include it.

## Environment Variables (.env)

```bash
# MinIO Configuration
AWS_ENDPOINT=http://207.180.232.61:9002
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET=tickets
AWS_DEFAULT_REGION=us-east-1
AWS_USE_PATH_STYLE_ENDPOINT=true
MINIO_URL=https://minio.divisarana.org
```

## Configuration Details

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_ENDPOINT` | MinIO server endpoint (internal) | `http://207.180.232.61:9002` |
| `AWS_ACCESS_KEY_ID` | MinIO access key | `minioadmin` |
| `AWS_SECRET_ACCESS_KEY` | MinIO secret key | `minioadmin` |
| `AWS_BUCKET` | Bucket name for tickets | `tickets` |
| `AWS_DEFAULT_REGION` | AWS region (can be any for MinIO) | `us-east-1` |
| `AWS_USE_PATH_STYLE_ENDPOINT` | Use path-style URLs (required for MinIO) | `true` |
| `MINIO_URL` | MinIO public URL for accessing files | `https://minio.divisarana.org` |

## File Path Structure

### Before (Incorrect - Causing Error)
```
Bucket: tickets
Key: tickets/TRACE_1767962581191_1767962581192.jpg
Full Path: /tickets/tickets/TRACE_1767962581191_1767962581192.jpg
URL: https://minio.divisarana.org/tickets/tickets/TRACE_...
❌ Result: 403 Access Denied (path mismatch)
```

### After (Correct)
```
Bucket: tickets
Key: TRACE_1767962581191_1767962581192.jpg
Full Path: /tickets/TRACE_1767962581191_1767962581192.jpg
URL: https://minio.divisarana.org/tickets/TRACE_...
✅ Result: 200 OK
```

## Troubleshooting

### 1. Access Denied Error
```json
{
  "error": "MinIO Access Denied - Check credentials and bucket permissions",
  "details": "Access Denied.",
  "suggestion": "Check MinIO configuration in .env file"
}
```

**Solutions:**
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- Check bucket exists: `mc ls local/tickets`
- Verify bucket permissions in MinIO console
- Ensure `AWS_USE_PATH_STYLE_ENDPOINT=true`

### 2. Connection Refused
```json
{
  "error": "Cannot connect to MinIO server - Check AWS_ENDPOINT",
  "details": "ECONNREFUSED",
  "suggestion": "Check MinIO configuration in .env file"
}
```

**Solutions:**
- Verify `AWS_ENDPOINT` is reachable: `curl http://207.180.232.61:9002`
- Check MinIO service is running
- Verify firewall/network access to MinIO server

### 3. Bucket Not Found
```json
{
  "error": "MinIO bucket does not exist",
  "details": "NoSuchBucket",
  "suggestion": "Check MinIO configuration in .env file"
}
```

**Solutions:**
- Create bucket: `mc mb local/tickets`
- Verify bucket name in `AWS_BUCKET` matches exactly

## MinIO CLI Commands

### Setup MinIO Alias
```bash
mc alias set minio http://207.180.232.61:9002 minioadmin minioadmin
```

### Create Bucket
```bash
mc mb minio/tickets
```

### List Buckets
```bash
mc ls minio
```

### List Files in Bucket
```bash
mc ls minio/tickets
```

### Set Bucket Policy (Public Read)
```bash
mc policy set public minio/tickets
```

### View File
```bash
mc cat minio/tickets/TRACE_1767962581191_1767962581192.jpg
```

## Testing Upload

### cURL Test
```bash
curl -X POST http://localhost:5000/api/ocr/tickets/with-image \
  -F "image=@test.jpg" \
  -F 'data={"trace_no":"TEST_001"}'
```

### Expected Success Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ticket_img_path": "https://minio.divisarana.org/tickets/TEST_001_1234567890.jpg",
    "created_at": "2026-01-09T14:00:00Z"
  },
  "message": "✓ Ticket saved successfully (Trace: TEST_001)"
}
```

### Expected Error Response
```json
{
  "error": "MinIO Access Denied - Check credentials and bucket permissions",
  "details": "Access Denied.",
  "suggestion": "Check MinIO configuration in .env file"
}
```

## URL Format

### Image Accessible at
```
https://minio.divisarana.org/tickets/TRACE_1767962581191_1767962581192.jpg
```

### Parts
- `https://minio.divisarana.org/` - MINIO_URL
- `tickets/` - AWS_BUCKET
- `TRACE_1767962581191_1767962581192.jpg` - fileName (Key)

## Key Points

✅ Bucket name: `tickets`
✅ File location: Directly in bucket root (no subfolder)
✅ URL is public and accessible via HTTPS
✅ Access denied means path or credentials issue
✅ All uploads now use consistent naming: `TRACE_TIMESTAMP.ext`

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 403 Access Denied | Wrong path format | Removed duplicate "tickets/" prefix |
| Double path in URL | Key includes bucket name | Key should not include bucket name |
| Files not accessible | Bucket not public | Set bucket policy to public |
| Connection refused | Wrong endpoint | Verify AWS_ENDPOINT URL |
| File not found after upload | Wrong MINIO_URL | Verify MINIO_URL matches domain |
