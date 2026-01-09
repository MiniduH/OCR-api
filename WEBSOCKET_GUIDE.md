# WebSocket Guide - Tickets Real-Time Updates

## Overview
The TMS API now supports real-time ticket operations via WebSocket using Socket.IO. This enables real-time bidirectional communication between clients and the server.

## Installation

The WebSocket server is already configured in `server.js` and Socket.IO is installed. Just start the server:

```bash
npm start
```

The WebSocket server will be available at `ws://localhost:5000`

## Client Connection

### JavaScript (Node.js/Browser)
```javascript
const io = require('socket.io-client');

// Connect to WebSocket server
const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

## Available Events

### 1. Get All Tickets (with pagination) - Sorted Latest First
```javascript
// Request
socket.emit('get-tickets', {
  limit: 10,
  offset: 0
}, (response) => {
  console.log(response);
  // Response: { success: true, data: [...], pagination: {...} }
  // Note: Tickets are sorted by latest first (descending by created_at/date)
});
```

### 2. Get Ticket By ID
```javascript
// Request
socket.emit('get-ticket-by-id', {
  id: 1
}, (response) => {
  console.log(response);
  // Response: { success: true, data: {...} }
});
```

### 3. Get Ticket By Trace Number
```javascript
// Request
socket.emit('get-ticket-by-trace', {
  traceNo: 'TRACE_123456'
}, (response) => {
  console.log(response);
  // Response: { success: true, data: {...} }
});
```

### 4. Get Ticket Count
```javascript
// Request
socket.emit('get-ticket-count', {}, (response) => {
  console.log(response);
  // Response: { success: true, data: { count: 50 } }
});
```

### 5. Search Tickets By Date Range - Sorted Latest First
```javascript
// Request
socket.emit('search-tickets-by-date', {
  startDate: '2026-01-01',
  endDate: '2026-01-31'
}, (response) => {
  console.log(response);
  // Response: { success: true, data: [...] }
  // Note: Results are sorted by latest first
});
```

### 6. Watch Tickets (Subscribe to Real-Time Updates) - Sorted Latest First
```javascript
// Subscribe to ticket updates
socket.emit('watch-tickets', {
  limit: 10,
  offset: 0
}, (response) => {
  console.log('Watching tickets:', response);
  // Tickets in response are sorted by latest first
});

// Listen for real-time updates
socket.on('ticket-created', (data) => {
  console.log('New ticket created:', data);
});

socket.on('ticket-updated', (data) => {
  console.log('Ticket updated:', data);
});

socket.on('ticket-deleted', (data) => {
  console.log('Ticket deleted:', data);
});
```

### 7. Stop Watching Tickets (Unsubscribe)
```javascript
// Request
socket.emit('unwatch-tickets', {}, (response) => {
  console.log(response);
  // Response: { success: true, message: 'Unsubscribed from ticket updates' }
});
```

## Complete Example

### Node.js Client
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected:', socket.id);

  // Get all tickets
  socket.emit('get-tickets', { limit: 10, offset: 0 }, (response) => {
    console.log('Tickets:', response.data);
  });

  // Watch for updates
  socket.emit('watch-tickets', { limit: 10 }, (response) => {
    console.log('Watching tickets');
  });

  // Listen for real-time updates
  socket.on('ticket-created', (data) => {
    console.log('New ticket:', data.data);
  });

  socket.on('ticket-updated', (data) => {
    console.log('Updated ticket:', data.data);
  });

  socket.on('ticket-deleted', (data) => {
    console.log('Deleted ticket ID:', data.data.id);
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

### Browser (HTML + JavaScript)
```html
<!DOCTYPE html>
<html>
<head>
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
    <div id="tickets"></div>

    <script>
        const socket = io('http://localhost:5000');

        socket.on('connect', () => {
            console.log('Connected to server');

            // Get tickets
            socket.emit('get-tickets', { limit: 10 }, (response) => {
                const ticketsDiv = document.getElementById('tickets');
                ticketsDiv.innerHTML = JSON.stringify(response.data, null, 2);
            });

            // Watch for updates
            socket.emit('watch-tickets', { limit: 10 });
        });

        socket.on('ticket-created', (data) => {
            console.log('New ticket:', data.data);
            // Update UI with new ticket
        });

        socket.on('ticket-updated', (data) => {
            console.log('Updated ticket:', data.data);
            // Update UI with updated ticket
        });

        socket.on('ticket-deleted', (data) => {
            console.log('Deleted ticket ID:', data.data.id);
            // Remove ticket from UI
        });
    </script>
</body>
</html>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 50
  },
  "timestamp": "2026-01-09T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message"
}
```

## Broadcasting Events

The server **automatically** broadcasts ticket updates to all clients watching tickets when changes happen via REST API or WebSocket events.

### Automatic Broadcasting
When you use the REST API endpoints, WebSocket clients watching tickets receive real-time updates:

- **POST /api/ocr/tickets** → Broadcasts `ticket-created` event
- **POST /api/ocr/tickets/with-image** → Broadcasts `ticket-created` event
- **PUT /api/ocr/tickets/:id** → Broadcasts `ticket-updated` event
- **DELETE /api/ocr/tickets/:id** → Broadcasts `ticket-deleted` event

### How It Works

1. **Client A** connects and watches tickets:
```javascript
const socket = io('http://localhost:5000');
socket.emit('watch-tickets', { limit: 10 });

socket.on('ticket-created', (data) => {
  console.log('New ticket:', data.data); // Updates in real-time
});
```

2. **Client B** (or API call) creates a ticket:
```bash
POST /api/ocr/tickets/with-image
```

3. **Client A** immediately receives the update via WebSocket:
```javascript
// Automatically receives:
{
  success: true,
  data: { id: 65, ticket_img_path: "...", ... },
  timestamp: "2026-01-09T14:01:50.261541Z"
}
```

### Manual Broadcasting (For Developers)
If you need to manually broadcast updates in your custom code:

```javascript
// In your controller or route handler
const io = req.app.locals.io;

// After creating a ticket
TicketsSocketHandler.broadcastTicketCreated(io, newTicket);

// After updating a ticket
TicketsSocketHandler.broadcastTicketUpdate(io, updatedTicket);

// After deleting a ticket
TicketsSocketHandler.broadcastTicketDeleted(io, ticketId);
```

## Features

✅ Real-time ticket retrieval (sorted latest first)
✅ Pagination support
✅ Search by date range (sorted latest first)
✅ Watch for live updates
✅ Automatic reconnection
✅ Error handling
✅ Socket ID tracking
✅ Namespace support (tickets-room)
✅ Latest tickets first sorting on all queries

## Troubleshooting

**Connection refused?**
- Make sure the server is running: `npm start`
- Check the port is correct (default: 5000)

**Events not working?**
- Ensure socket is connected before emitting events
- Check browser console for errors
- Verify event names match exactly

**Real-time updates not showing?**
- Make sure you've called `watch-tickets` first to subscribe
- Check that server console shows broadcasting messages (📢)
- Verify socket is connected: `console.log(socket.connected)`
- Make sure the socket ID is different from the client making changes
- Check network tab for WebSocket connection and messages

**Updates not coming when using REST API?**
- Verify `server.js` has Socket.IO initialized
- Check that `io` object is passed to controllers via `req.app.locals.io`
- Ensure at least one client is subscribed with `watch-tickets`
- Check server logs for 📢 broadcasting messages

**Data showing as NULL in database?**
- Verify the `data` field in request is valid JSON
- Check that optional fields are being sent if they're required in your schema
- Ensure image upload is working before database save
- Check database schema allows NULL values for optional fields

## Performance Tips

1. **Use pagination** for large datasets
```javascript
socket.emit('get-tickets', { limit: 20, offset: 0 });
```

2. **Unwatch when not needed**
```javascript
socket.emit('unwatch-tickets', {});
```

3. **Handle disconnection gracefully**
```javascript
socket.on('disconnect', () => {
  // Cleanup, retry logic, etc.
});
```

4. **Set reconnection options**
```javascript
const socket = io('http://localhost:5000', {
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```
