# OCR API - FAQ & Troubleshooting Guide

## Frequently Asked Questions

### General Questions

**Q: What is this API?**
A: This is a REST API for managing OCR (Optical Character Recognition) ticket data. It allows you to create, read, update, and delete tickets with OCR scanned information.

**Q: What database does it use?**
A: PostgreSQL. The API connects to a local PostgreSQL instance running on port 5432.

**Q: Do I need authentication?**
A: No, the API is currently open without authentication. All endpoints are publicly accessible.

**Q: What's the base URL?**
A: `http://localhost:5001/api/ocr/tickets`

**Q: Can I deploy this to production?**
A: Yes, but you should add authentication and security measures before doing so.

---

### API Usage Questions

**Q: What format should dates be in?**
A: Dates should be in `YYYY-MM-DD` format (e.g., `2024-12-29`).

**Q: What format should times be in?**
A: Times should be in `HH:MM` format (e.g., `14:30`).

**Q: What is `scanned_data`?**
A: This is a JSON object that contains any data extracted from the OCR scan. For example:
```json
{
  "extracted_text": "sample text",
  "confidence": 0.95,
  "language": "en"
}
```

**Q: What fields are optional?**
A: Only `ticket_img_path` is optional. All other fields are required.

**Q: Can I update a ticket?**
A: Yes, send a PUT request with only the fields you want to update.

**Q: How many records can I get per request?**
A: By default 10, but you can set the `limit` parameter to get up to 1000 records.

**Q: How do I search for tickets?**
A: Use the date range search endpoint:
```
GET /api/ocr/tickets/search/date-range?startDate=2024-12-01&endDate=2024-12-31
```

---

## Troubleshooting

### Connection Issues

**Problem: "Cannot connect to server"**
- [ ] Check if the backend server is running
- [ ] Verify the port is 5001
- [ ] Check your firewall settings
- [ ] Try accessing http://localhost:5001/api/health

**Problem: "Connection refused"**
- [ ] Start the server: `npm run dev`
- [ ] Check if port 5001 is already in use: `lsof -i :5001`
- [ ] Kill conflicting process if needed: `kill -9 <PID>`

**Problem: CORS error in browser**
- [ ] The backend should allow CORS by default
- [ ] Check the browser console for the exact error
- [ ] Make sure you're using `http://` not `https://`

---

### Data Issues

**Problem: "Missing required field: date"**
- [ ] Add the `date` field to your request
- [ ] Use `YYYY-MM-DD` format
- [ ] Don't use null or undefined values

**Problem: "Duplicate trace_no" or "Duplicate reference_no"**
- [ ] Each ticket must have unique identifiers
- [ ] Generate unique values (timestamps, UUIDs, etc.)
- [ ] Example: `TRACE_${Date.now()}`

**Problem: Field values not updating**
- [ ] Check your PUT request method is correct
- [ ] Include `Content-Type: application/json` header
- [ ] Verify the ticket ID exists
- [ ] Only send the fields you want to update

---

### Response Issues

**Problem: Getting "error 404 - Not Found"**
- [ ] Check if the ticket ID exists
- [ ] Verify you're using the correct endpoint
- [ ] Check the URL format matches exactly

**Problem: Getting empty results from search**
- [ ] Check if tickets exist in that date range
- [ ] Use correct `YYYY-MM-DD` format for dates
- [ ] Verify `startDate` is before `endDate`

**Problem: "Ticket not found" on delete/update**
- [ ] Verify the ticket was created successfully
- [ ] Use correct ticket ID
- [ ] Check database has the record

---

### Database Issues

**Problem: Database connection error**
- [ ] Ensure PostgreSQL is running
- [ ] Check credentials in `.env` file
- [ ] Verify database exists: `psql -U postgres -l`
- [ ] Try creating the database manually

**Problem: "Database does not exist"**
- [ ] Create it: `psql -U postgres -c "CREATE DATABASE ocr;"`
- [ ] Or run migrations: `npm run migrate`

---

### Testing Issues

**Problem: cURL request not working**
- [ ] Check quotes and escaping in JSON
- [ ] Use proper headers: `-H "Content-Type: application/json"`
- [ ] Verify method: `-X POST`, `-X GET`, etc.

**Problem: Postman request returning 500**
- [ ] Check the backend server logs
- [ ] Verify all required fields are present
- [ ] Check data types (integers vs strings)

---

## Performance Tips

1. **Use pagination** for large datasets
   ```
   GET /api/ocr/tickets?limit=50&offset=0
   ```

2. **Use date range search** instead of getting all tickets
   ```
   GET /api/ocr/tickets/search/date-range?startDate=2024-12-01&endDate=2024-12-31
   ```

3. **Get count before loading** to know total records
   ```
   GET /api/ocr/tickets/count
   ```

4. **Cache responses** when possible to reduce requests

5. **Use query parameters** to filter data server-side

---

## Security Notes

⚠️ **Current Security Status:** No authentication

Before production deployment:
1. [ ] Add JWT authentication
2. [ ] Add HTTPS/SSL
3. [ ] Implement rate limiting
4. [ ] Add input validation
5. [ ] Use environment variables for sensitive data
6. [ ] Add CORS restrictions
7. [ ] Enable request logging
8. [ ] Regular security audits

---

## Common Code Patterns

### Error Handling
```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    console.error('API Error:', data.error);
    // Handle error
  } else {
    console.log('Success:', data.data);
    // Handle success
  }
} catch (error) {
  console.error('Network Error:', error);
  // Handle network error
}
```

### Pagination Loop
```javascript
let offset = 0;
const limit = 50;
let hasMore = true;

while (hasMore) {
  const response = await fetch(
    `http://localhost:5001/api/ocr/tickets?limit=${limit}&offset=${offset}`
  );
  const data = await response.json();
  
  // Process data
  processTickets(data.data);
  
  // Check if more data available
  hasMore = offset + limit < data.pagination.total;
  offset += limit;
}
```

### Batch Create
```javascript
const tickets = [
  { date: '2024-12-29', time: '14:30', ... },
  { date: '2024-12-29', time: '15:00', ... },
];

for (const ticket of tickets) {
  try {
    const response = await fetch(
      'http://localhost:5001/api/ocr/tickets',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
      }
    );
    const data = await response.json();
    console.log('Created:', data.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## Testing Checklist

- [ ] Can create a ticket
- [ ] Created ticket has all fields
- [ ] Can retrieve ticket by ID
- [ ] Can retrieve all tickets
- [ ] Pagination works correctly
- [ ] Can search by date range
- [ ] Can get ticket by trace number
- [ ] Can update a ticket
- [ ] Updated fields are saved
- [ ] Can delete a ticket
- [ ] Deleted ticket cannot be retrieved
- [ ] Error handling works
- [ ] Invalid data is rejected
- [ ] Duplicate trace_no is rejected
- [ ] Duplicate reference_no is rejected

---

## Getting Help

1. **Check this document first**
2. **Review the Frontend Integration Guide** - More detailed examples
3. **Check the Quick Reference** - For endpoint summary
4. **Run tests** - Use Postman or cURL
5. **Check backend logs** - See exact error messages
6. **Contact backend team** - With specific error messages

---

## Additional Resources

- REST API Concepts: https://restfulapi.net/
- JSON Format: https://www.json.org/
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- Postman: https://www.postman.com/
- Date/Time Formatting: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-29 | Initial release |

---

## Support Contacts

- **Backend Team:** [Contact info]
- **API Issues:** Check logs and this guide
- **General Questions:** FAQ section above

---

Last Updated: 2024-12-29
