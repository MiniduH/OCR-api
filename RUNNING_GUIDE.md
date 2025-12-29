# OCR API Setup & Running Guide

## Prerequisites
- Node.js installed
- PostgreSQL installed and running
- npm or yarn package manager

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Verify Database Configuration
Make sure your `.env` file has the correct PostgreSQL credentials:
```
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ocr
DB_USERNAME=miniduhimal
DB_PASSWORD=12345678
DATABASE_URL="postgresql://miniduhimal:12345678@127.0.0.1:5432/ocr"
```

## Step 3: Create the Database (if not exists)
```bash
psql -U postgres -c "CREATE DATABASE ocr;"
```

## Step 4: Run Migrations
Create the tickets table:
```bash
npm run migrate
```

## Step 5: Start the Server
### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5001` (as configured in .env)

## Available Endpoints

### Health Check
```
GET http://localhost:5001/api/health
```

### API Documentation
```
GET http://localhost:5001/api
```

### Tickets API

**Create Ticket**
```
POST /api/ocr/tickets
Content-Type: application/json

{
  "date": "2024-12-29",
  "time": "14:30",
  "terminal_id": "T001",
  "location": "Terminal Building A",
  "no_tickets": 5,
  "total_amount": "150.00",
  "trace_no": "TRACE123",
  "reference_no": "REF456",
  "ticket_amount_pp": "30.00",
  "ticket_img_path": "/path/to/image.jpg",
  "scanned_data": {"key": "value"}
}
```

**Get All Tickets**
```
GET /api/ocr/tickets?limit=10&offset=0
```

**Get Ticket by ID**
```
GET /api/ocr/tickets/:id
```

**Get Ticket by Trace Number**
```
GET /api/ocr/tickets/trace/:traceNo
```

**Get Ticket Count**
```
GET /api/ocr/tickets/count
```

**Search by Date Range**
```
GET /api/ocr/tickets/search/date-range?startDate=2024-12-01&endDate=2024-12-31
```

**Update Ticket**
```
PUT /api/ocr/tickets/:id
Content-Type: application/json

{
  "date": "2024-12-29",
  "total_amount": "200.00"
}
```

**Delete Ticket**
```
DELETE /api/ocr/tickets/:id
```

## Troubleshooting

### Database Connection Error
1. Ensure PostgreSQL is running: `brew services start postgresql`
2. Verify credentials in `.env` file
3. Check if database exists: `psql -U postgres -l | grep ocr`

### Migration Failed
1. Check if the database exists and is accessible
2. Verify the database user has proper permissions
3. Review migration logs for specific errors

### Server Won't Start
1. Check if port 5001 is in use: `lsof -i :5001`
2. Verify `.env` file exists and is properly formatted
3. Ensure all dependencies are installed: `npm install`

## NPM Scripts

```bash
npm start          # Run production server
npm run dev        # Run development server with nodemon
npm run migrate    # Run database migrations
```
