# TMS API Guide for Frontend Developers

## Overview
This guide provides detailed information about the TMS API endpoints for authentication and user management. All endpoints are RESTful and use JSON for request/response bodies.

**Base URL:** `http://localhost:5000/api`

---

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Error Handling](#error-handling)

---

## Authentication

### 1. Register User
Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Email already registered"
}
```

---

### 2. Login User
Authenticate user and get JWT tokens.

**Endpoint:** `POST /auth/login`

**Request Body (Option 1 - Email):**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Request Body (Option 2 - Username):**
```json
{
  "username": "johndoe",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresAt": "2025-12-29T14:30:00Z",
      "tokenType": "Bearer"
    }
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid email/username or password"
}
```

---

### 3. Refresh Token
Get a new access token using refresh token.

**Endpoint:** `POST /auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-12-29T14:30:00Z",
    "tokenType": "Bearer"
  }
}
```

---

### 4. Verify Token
Verify if an access token is valid.

**Endpoint:** `POST /auth/verify-token`

**Request Body:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    },
    "tokenExpiry": "2025-12-29T14:30:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Token is invalid or revoked"
}
```

---

### 5. Logout
Revoke the current access token.

**Endpoint:** `POST /auth/logout`

**Request Body:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 6. Logout All Devices
Revoke all tokens for a user across all devices.

**Endpoint:** `POST /auth/logout-all/:userId`

**Request Body:**
```json
{
  "userId": 1
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

---

### 7. Change Password
Update user password and revoke all tokens.

**Endpoint:** `POST /auth/change-password/:userId`

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully. Please login again."
}
```

**Error Response (401):**
```json
{
  "error": "Current password is incorrect"
}
```

---

### 8. Get User Tokens
Retrieve all active tokens for a user.

**Endpoint:** `GET /auth/tokens/:userId`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "token_type": "Bearer",
      "is_revoked": false,
      "expires_at": "2025-12-29T14:30:00Z",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-12-29T13:30:00Z"
    }
  ]
}
```

---

### 9. Revoke Specific Token
Revoke a specific token by ID.

**Endpoint:** `POST /auth/revoke-token/:tokenId`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token revoked successfully",
  "data": {
    "id": 1,
    "is_revoked": true,
    "updated_at": "2025-12-29T13:35:00Z"
  }
}
```

---

## User Management

### 1. Create User
Create a new user (same as register endpoint).

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "username": "janesmith",
  "email": "jane@example.com",
  "password": "SecurePassword123",
  "role": "moderator",
  "department": "Support"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "role": "moderator",
    "status": "active",
    "created_at": "2025-12-29T13:30:00Z"
  }
}
```

---

### 2. Get All Users
Retrieve all users with pagination.

**Endpoint:** `GET /users?limit=10&offset=0`

**Query Parameters:**
- `limit` (optional): Number of users per page (default: 10)
- `offset` (optional): Number of users to skip (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "created_at": "2025-12-29T13:30:00Z"
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

### 3. Get User Count
Get total number of users.

**Endpoint:** `GET /users/count`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

### 4. Get User by ID
Retrieve a specific user by ID.

**Endpoint:** `GET /users/id/:userId`

**Example:** `GET /users/id/1`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "status": "active",
    "phone": "+1234567890",
    "department": "Support",
    "is_verified": true,
    "last_login": "2025-12-29T13:30:00Z",
    "created_at": "2025-12-29T13:30:00Z",
    "updated_at": "2025-12-29T13:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "User not found"
}
```

---

### 5. Get User by Username
Retrieve a user by username.

**Endpoint:** `GET /users/username/:username`

**Example:** `GET /users/username/johndoe`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### 6. Get User by Email
Retrieve a user by email address.

**Endpoint:** `GET /users/email/:email`

**Example:** `GET /users/email/john@example.com`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "role": "user"
  }
}
```

---

### 7. Get Users by Role
Get all users with a specific role.

**Endpoint:** `GET /users/role/:role`

**Example:** `GET /users/role/admin`

**Available Roles:**
- `user`
- `moderator`
- `admin`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "admin"
    }
  ]
}
```

---

### 8. Get Users by Status
Get all users with a specific status.

**Endpoint:** `GET /users/status/:status`

**Example:** `GET /users/status/active`

**Available Statuses:**
- `active`
- `inactive`
- `suspended`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "status": "active"
    }
  ]
}
```

---

### 9. Update User
Update user information.

**Endpoint:** `PUT /users/:userId`

**Request Body (Update only fields you need):**
```json
{
  "first_name": "Jonathan",
  "last_name": "Doe",
  "phone": "+1234567890",
  "department": "Management",
  "role": "moderator",
  "status": "active"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "Jonathan",
    "last_name": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "department": "Management",
    "role": "moderator",
    "status": "active",
    "updated_at": "2025-12-29T14:00:00Z"
  }
}
```

---

### 10. Delete User
Delete a user account.

**Endpoint:** `DELETE /users/:userId`

**Example:** `DELETE /users/1`

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Response (404):**
```json
{
  "error": "User not found"
}
```

---

## Error Handling

All errors follow a consistent format:

**Error Response Format:**
```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials or token)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate email/username)
- `500` - Server Error

---

## Implementation Guide

### 1. Store Tokens Securely
```javascript
// After login, store tokens
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('accessToken', data.data.tokens.accessToken);
localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
```

### 2. Send Token in Requests
```javascript
// Include token in Authorization header
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
};
```

### 3. Handle Token Expiry
```javascript
// When token expires (401 response), refresh it
async function refreshAccessToken() {
  const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refreshToken: localStorage.getItem('refreshToken')
    })
  });

  const data = await response.json();
  localStorage.setItem('accessToken', data.data.accessToken);
  return data.data.accessToken;
}
```

### 4. Logout
```javascript
// Clear tokens and call logout endpoint
async function logout() {
  await fetch('http://localhost:5000/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessToken: localStorage.getItem('accessToken')
    })
  });

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Redirect to login page
}
```

---

## Summary
- Use `/auth/register` to create new users
- Use `/auth/login` to authenticate users
- Use `/auth/refresh-token` to get new access tokens when expired
- Use `/users/*` endpoints for user management
- Always include `Authorization: Bearer {accessToken}` header for protected endpoints
- Handle 401 responses by refreshing the token

For more help, contact the backend development team.
