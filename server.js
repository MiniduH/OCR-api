require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server: SocketServer } = require('socket.io');
const { connectDB } = require('./config/database');

// Import WebSocket handlers
const TicketsSocketHandler = require('./websocket/ticketsHandler');

// Import authentication routes
const authRoutes = require('./routes/auth');

// Import OCR API routes
const ticketsRoutes = require('./routes/tickets');

// Import Public Web Routes (no authentication required)
const webPublicRoutes = require('./routes/webPublic');

// Import Users routes
const usersRoutes = require('./routes/users');

// Import Permissions routes
const permissionsRoutes = require('./routes/permissions');

// Import Roles routes
const rolesRoutes = require('./routes/roles');

// Import Reprint Requests routes
const reprintRequestsRoutes = require('./routes/reprintRequests');

// Import Workflow routes
const workflowsRoutes = require('./routes/workflows');
const workflowNodesRoutes = require('./routes/workflowNodes');
const approvalsRoutes = require('./routes/approvals');

const app = express();

// Connect to database
connectDB();

// CORS Configuration - Allow all origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // For HTTPS, allow localhost on any port
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // In production, add your specific domains
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('CORS not allowed'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Authentication Routes (public routes)
app.use('/api/auth', authRoutes);

// OCR API Routes
app.use('/api/ocr/tickets', ticketsRoutes);

// Public Web Routes (no authentication required)
app.use('/api/web', webPublicRoutes);

// Users Management Routes
app.use('/api/users', usersRoutes);

// Permissions Routes
app.use('/api/permissions', permissionsRoutes);

// Roles Routes
app.use('/api/roles', rolesRoutes);

// Reprint Requests Routes
app.use('/api/reprint-requests', reprintRequestsRoutes);

// Workflows Routes
app.use('/api/workflows', workflowsRoutes);

// Workflow Nodes Routes
app.use('/api/nodes', workflowNodesRoutes);

// Approvals Routes
app.use('/api/approvals', approvalsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Documentation
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TMS API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout (requires token)',
        refreshToken: 'POST /api/auth/refresh-token',
        getCurrentUser: 'GET /api/auth/me (requires token)',
        verifyToken: 'POST /api/auth/verify-token (requires token)',
        changePassword: 'POST /api/auth/change-password (requires token)',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password',
      },
      users: {
        getAll: 'GET /api/users',
        getById: 'GET /api/users/:id',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        updatePassword: 'PUT /api/users/:id/password',
        changeStatus: 'PATCH /api/users/:id/status',
        updateLastLogin: 'PATCH /api/users/:id/last-login',
        delete: 'DELETE /api/users/:id',
      },
      ocr: {
        tickets: {
          create: 'POST /api/ocr/tickets',
          createWithImage: 'POST /api/ocr/tickets/with-image (multipart/form-data)',
          getAll: 'GET /api/ocr/tickets',
          getById: 'GET /api/ocr/tickets/:id',
          getByTraceNo: 'GET /api/ocr/tickets/trace/:traceNo',
          getCount: 'GET /api/ocr/tickets/count',
          searchByDateRange: 'GET /api/ocr/tickets/search/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD',
          update: 'PUT /api/ocr/tickets/:id',
          delete: 'DELETE /api/ocr/tickets/:id',
          initializeWorkflow: 'POST /api/ocr/tickets/:ticketId/workflow',
          approve: 'POST /api/ocr/tickets/:ticketId/approve',
          getApprovals: 'GET /api/ocr/tickets/:ticketId/approvals',
        },
      },
      workflows: {
        create: 'POST /api/workflows',
        getAll: 'GET /api/workflows',
        getById: 'GET /api/workflows/:id',
        update: 'PUT /api/workflows/:id',
        delete: 'DELETE /api/workflows/:id',
        addNode: 'POST /api/workflows/:workflowId/nodes',
        getNodes: 'GET /api/workflows/:workflowId/nodes',
        updateNode: 'PUT /api/workflows/:workflowId/nodes/:nodeId',
        deleteNode: 'DELETE /api/workflows/:workflowId/nodes/:nodeId',
        reorderNodes: 'PUT /api/workflows/:workflowId/nodes/reorder',
      },
      nodes: {
        getUsers: 'GET /api/nodes/:nodeId/users',
        addUsers: 'POST /api/nodes/:nodeId/users',
        setUsers: 'PUT /api/nodes/:nodeId/users',
        removeUser: 'DELETE /api/nodes/:nodeId/users/:userId',
      },
      approvals: {
        getPending: 'GET /api/approvals/pending?userId=:userId',
        getTicketsPending: 'GET /api/approvals/tickets/pending?userId=:userId',
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.IO support
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new SocketServer(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

// Socket.IO middleware for handling connections
io.on('connection', (socket) => {
  // Initialize ticket handlers
  TicketsSocketHandler.initialize(socket);
});

// Make io accessible to routes and controllers if needed
app.locals.io = io;

// HTTP Configuration
server.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket running on ws://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
});
