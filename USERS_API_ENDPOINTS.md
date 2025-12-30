# TMS API Documentation

**Base URL:** `http://localhost:5000/api`

---

# Authentication Endpoints

## 1. Register User
Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phone": "+1234567890"
}
```

**Required Fields:**
- `firstName` (string) - First name
- `lastName` (string) - Last name
- `username` (string) - Unique username
- `email` (string) - Valid email address (unique)
- `password` (string) - Minimum 6 characters

**Optional Fields:**
- `phone` (string) - Phone number

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "status": "active",
      "fullName": "John Doe",
      "createdAt": "2025-12-29T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 2. Login User
Authenticate user and get JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Required Fields:**
- `email` (string) - User email
- `password` (string) - User password

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "lastLogin": "2025-12-29T10:30:00Z",
      "fullName": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 3. Refresh Token
Get a new JWT token using refresh token.

**Endpoint:** `POST /auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Required Fields:**
- `refreshToken` (string) - Refresh token from login response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 4. Get Current User Profile
Get logged-in user's profile information.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "status": "active",
    "department": "IT",
    "isVerified": true,
    "lastLogin": "2025-12-29T10:30:00Z",
    "metadata": {
      "bio": "Software Developer",
      "profileImage": "https://example.com/profile.jpg"
    },
    "fullName": "John Doe",
    "createdAt": "2025-12-01T08:00:00Z",
    "updatedAt": "2025-12-29T10:30:00Z"
  }
}
```

---

## 5. Verify Token
Verify if JWT token is valid.

**Endpoint:** `POST /auth/verify-token`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (empty)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "status": "active"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

---

## 6. Change Password
Change user's password (requires current password).

**Endpoint:** `POST /auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456",
  "confirmPassword": "NewPassword456"
}
```

**Required Fields:**
- `currentPassword` (string) - Current password for verification
- `newPassword` (string) - New password (minimum 6 characters)
- `confirmPassword` (string) - Confirm new password (must match newPassword)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

## 7. Logout
Logout user (token invalidation on client side).

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (empty)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful. Please remove token from client storage."
}
```

---

## 8. Forgot Password
Request password reset link.

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Required Fields:**
- `email` (string) - User email address

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email"
}
```

---

## 9. Reset Password
Reset password using reset token.

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword456",
  "confirmPassword": "NewPassword456"
}
```

**Required Fields:**
- `token` (string) - Reset token from email
- `newPassword` (string) - New password
- `confirmPassword` (string) - Confirm password

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful. Please login with your new password."
}
```

---

# Users Management API Endpoints

## 10. Get All Users
Retrieve a paginated list of all users with filtering and search capabilities.

**Endpoint:** `GET /users`

**Query Parameters:**
- `page` (number, optional) - Page number for pagination (default: 1)
- `limit` (number, optional) - Number of users per page (default: 10)
- `role` (string, optional) - Filter by role: `user`, `moderator`, `admin`
- `status` (string, optional) - Filter by status: `active`, `inactive`, `suspended`
- `search` (string, optional) - Search by firstName, lastName, email, or username

**Example Request:**
```bash
GET /users?page=1&limit=10&role=admin&search=john
```

**Success Response (200):**
```json
{
  "success": true,
  "total": 50,
  "page": 1,
  "limit": 10,
  "pages": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "admin",
      "status": "active",
      "department": "IT",
      "isVerified": true,
      "lastLogin": "2025-12-29T10:30:00Z",
      "fullName": "John Doe",
      "createdAt": "2025-12-01T08:00:00Z",
      "updatedAt": "2025-12-29T10:30:00Z"
    }
  ]
}
```

---

## 11. Get Single User
Retrieve details of a specific user by ID.

**Endpoint:** `GET /users/:id`

**URL Parameters:**
- `id` (string, required) - User ID (MongoDB ObjectId)

**Example Request:**
```bash
GET /users/507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "admin",
    "status": "active",
    "department": "IT",
    "isVerified": true,
    "lastLogin": "2025-12-29T10:30:00Z",
    "metadata": {
      "bio": "Senior IT Manager",
      "profileImage": "https://example.com/image.jpg",
      "address": "123 Main St",
      "city": "New York",
      "country": "USA"
    },
    "fullName": "John Doe",
    "createdAt": "2025-12-01T08:00:00Z",
    "updatedAt": "2025-12-29T10:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 12. Create User
Create a new user account.

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "username": "janesmith",
  "email": "jane@example.com",
  "password": "SecurePassword123",
  "phone": "+1987654321",
  "role": "user",
  "department": "Marketing",
  "metadata": {
    "bio": "Marketing Manager",
    "address": "456 Oak Ave",
    "city": "Los Angeles",
    "country": "USA"
  }
}
```

**Required Fields:**
- `firstName` (string) - First name
- `lastName` (string) - Last name
- `username` (string) - Unique username (lowercase)
- `email` (string) - Valid email address (must be unique)
- `password` (string) - Minimum 6 characters

**Optional Fields:**
- `phone` (string) - Phone number
- `role` (string) - Role: `user`, `moderator`, `admin` (default: `user`)
- `department` (string) - Department name
- `metadata` (object) - Additional profile information

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "Jane",
    "lastName": "Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "phone": "+1987654321",
    "role": "user",
    "status": "active",
    "department": "Marketing",
    "isVerified": false,
    "lastLogin": null,
    "metadata": {
      "bio": "Marketing Manager",
      "address": "456 Oak Ave",
      "city": "Los Angeles",
      "country": "USA"
    },
    "fullName": "Jane Smith",
    "createdAt": "2025-12-29T12:00:00Z",
    "updatedAt": "2025-12-29T12:00:00Z"
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "User with this email or username already exists"
}
```

---

## 13. Update User
Update user information.

**Endpoint:** `PUT /users/:id`

**URL Parameters:**
- `id` (string, required) - User ID

**Request Body (all fields optional):**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1987654321",
  "role": "moderator",
  "status": "active",
  "department": "Marketing",
  "isVerified": true,
  "metadata": {
    "bio": "Senior Marketing Manager",
    "profileImage": "https://example.com/jane.jpg",
    "city": "San Francisco"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "Jane",
    "lastName": "Smith",
    "username": "janesmith",
    "email": "jane.smith@example.com",
    "phone": "+1987654321",
    "role": "moderator",
    "status": "active",
    "department": "Marketing",
    "isVerified": true,
    "lastLogin": null,
    "metadata": {
      "bio": "Senior Marketing Manager",
      "profileImage": "https://example.com/jane.jpg",
      "address": "456 Oak Ave",
      "city": "San Francisco",
      "country": "USA"
    },
    "fullName": "Jane Smith",
    "createdAt": "2025-12-29T12:00:00Z",
    "updatedAt": "2025-12-29T12:30:00Z"
  }
}
```

---

## 14. Update User Password
Change a user's password.

**Endpoint:** `PUT /users/:id/password`

**URL Parameters:**
- `id` (string, required) - User ID

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePassword456"
}
```

**Required Fields:**
- `currentPassword` (string) - Current password for verification
- `newPassword` (string) - New password (minimum 6 characters)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

## 15. Change User Status
Update a user's status (active, inactive, or suspended).

**Endpoint:** `PATCH /users/:id/status`

**URL Parameters:**
- `id` (string, required) - User ID

**Request Body:**
```json
{
  "status": "suspended"
}
```

**Allowed Status Values:**
- `active` - User account is active
- `inactive` - User account is inactive
- `suspended` - User account is suspended

**Success Response (200):**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "Jane",
    "lastName": "Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "status": "suspended",
    "role": "user",
    "createdAt": "2025-12-29T12:00:00Z",
    "updatedAt": "2025-12-29T13:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please provide a valid status (active, inactive, suspended)"
}
```

---

## 16. Update Last Login
Update the user's last login timestamp.

**Endpoint:** `PATCH /users/:id/last-login`

**URL Parameters:**
- `id` (string, required) - User ID

**Request Body:** (empty)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "Jane",
    "lastName": "Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "lastLogin": "2025-12-29T13:30:00Z",
    "createdAt": "2025-12-29T12:00:00Z",
    "updatedAt": "2025-12-29T13:30:00Z"
  }
}
```

---

## 17. Delete User
Delete a user account.

**Endpoint:** `DELETE /users/:id`

**URL Parameters:**
- `id` (string, required) - User ID

**Example Request:**
```bash
DELETE /users/507f1f77bcf86cd799439012
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {}
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## User Object Schema

```typescript
{
  _id: string;                    // MongoDB ObjectId
  firstName: string;              // User's first name
  lastName: string;               // User's last name
  username: string;               // Unique username (lowercase)
  email: string;                  // Unique email address
  phone?: string;                 // Phone number (optional)
  role: "user" | "moderator" | "admin";  // User role
  status: "active" | "inactive" | "suspended";  // User status
  department?: string;            // Department name (optional)
  isVerified: boolean;            // Email verification status
  lastLogin?: Date;               // Last login timestamp
  fullName: string;               // Virtual: firstName + lastName
  metadata?: {
    bio?: string;
    profileImage?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  createdAt: Date;                // Account creation timestamp
  updatedAt: Date;                // Last update timestamp
}
```

---

## Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid parameters |
| `404` | Not Found - User/resource not found |
| `409` | Conflict - Email/username already exists |
| `500` | Server Error - Internal server error |

---

## Sample Frontend Usage (JavaScript/Axios)

### Register User
```javascript
import axios from 'axios';

const registerUser = async (userData) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      phone: userData.phone
    });
    
    // Save tokens to localStorage
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Login User
```javascript
const loginUser = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    
    // Save tokens to localStorage
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Get Current User
```javascript
const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Refresh Token
```javascript
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post('http://localhost:5000/api/auth/refresh-token', {
      refreshToken
    });
    
    // Update token in localStorage
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
    // Redirect to login if refresh fails
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
};
```

### Change Password
```javascript
const changePassword = async (currentPassword, newPassword) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:5000/api/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword: newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Logout
```javascript
const logoutUser = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/api/auth/logout', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Clear tokens from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Setup Axios Interceptor for Auto Token Refresh
```javascript
const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const response = await axios.post('http://localhost:5000/api/auth/refresh-token', {
            refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );
};
```

### Get All Users
```javascript
const getUsers = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/users', {
      params: { page, limit },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Create User (Admin)
```javascript
const createUser = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:5000/api/users', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      role: userData.role || 'user'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Update User
```javascript
const updateUser = async (userId, updateData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `http://localhost:5000/api/users/${userId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Delete User
```javascript
const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(
      `http://localhost:5000/api/users/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

---

## Environment Variables Required

Create a `.env` file in your project root with the following variables:

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tms_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# MongoDB (if using with Mongoose)
MONGODB_URI=mongodb://localhost:27017/tms_database

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Registration/Login                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  POST /auth/login │
                    └──────────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │ Return: token + refresh │
                  │ Save to localStorage    │
                  └────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────────┐
              │  API Request with Bearer Token    │
              │  Authorization: Bearer <token>    │
              └───────────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
          ┌─────────────┐          ┌──────────────┐
          │ Token Valid │          │ Token Expired │
          └─────────────┘          └──────────────┘
                 │                         │
                 ▼                         ▼
          ┌─────────────────┐       ┌──────────────────────┐
          │ Process Request │       │ POST /auth/refresh    │
          └─────────────────┘       │ (send refreshToken)   │
                 │                   └──────────────────────┘
                 ▼                         │
          ┌──────────────┐                ▼
          │ Return Data  │          ┌──────────────────┐
          └──────────────┘          │ Return new tokens│
                                    └──────────────────┘
                                         │
                                         ▼
                                   Retry original request
```

---

## Security Best Practices

1. **Token Storage**: Store tokens in secure HTTP-only cookies or localStorage
2. **Token Refresh**: Implement automatic token refresh before expiration
3. **HTTPS Only**: Always use HTTPS in production
4. **Strong Passwords**: Enforce minimum password requirements
5. **Rate Limiting**: Implement rate limiting on auth endpoints
6. **CORS**: Configure CORS appropriately for your domain
7. **Token Expiration**: Use short-lived access tokens (7d) and longer refresh tokens (30d)
8. **Password Hashing**: Passwords are automatically hashed with bcrypt
9. **Error Messages**: Don't reveal whether email/username exists (use generic messages)
10. **Session Management**: Implement logout functionality to clear tokens

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Passwords are automatically hashed using bcrypt and never returned
- Email and username must be unique across the system
- User roles: `user` (default), `moderator`, `admin`
- User status: `active` (default), `inactive`, `suspended`
- JWT tokens expire based on `JWT_EXPIRATION` setting
- Refresh tokens expire based on `JWT_REFRESH_EXPIRATION` setting
