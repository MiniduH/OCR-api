# TMS Permissions API Guide

## Overview
This guide provides information about the TMS Permissions API endpoints. The permissions system provides read-only access to all available permissions in the system. Permissions are referenced by roles to control access.

**Base URL:** `http://localhost:5000/api`

---

## Table of Contents
1. [Permission Endpoints](#permission-endpoints)
2. [Available Permissions](#available-permissions)
3. [Error Handling](#error-handling)
4. [Implementation Examples](#implementation-examples)

---

## Permission Endpoints

### 1. Get All Permissions
Retrieve all permissions in the system with pagination.

**Endpoint:** `GET /permissions?limit=100&offset=0`

**Query Parameters:**
- `limit` (optional): Number of permissions per page (default: 100)
- `offset` (optional): Number of permissions to skip (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "create",
      "description": "Create new content or resources",
      "created_at": "2025-12-29T13:30:00Z",
      "updated_at": "2025-12-29T13:30:00Z"
    },
    {
      "id": 2,
      "name": "read",
      "description": "View content or resources",
      "created_at": "2025-12-29T13:30:00Z",
      "updated_at": "2025-12-29T13:30:00Z"
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 15
  }
}
```

---

### 2. Get Permission by ID
Retrieve a specific permission by its ID.

**Endpoint:** `GET /permissions/id/:permissionId`

**Example:** `GET /permissions/id/1`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "create",
    "description": "Create new content or resources",
    "created_at": "2025-12-29T13:30:00Z",
    "updated_at": "2025-12-29T13:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Permission not found"
}
```

---

### 3. Get Permission by Name
Retrieve a permission by its name.

**Endpoint:** `GET /permissions/name/:permissionName`

**Example:** `GET /permissions/name/create`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "create",
    "description": "Create new content or resources",
    "created_at": "2025-12-29T13:30:00Z",
    "updated_at": "2025-12-29T13:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Permission not found"
}
```

---

### 4. Get Permission Count
Get the total number of permissions in the system.

**Endpoint:** `GET /permissions/count`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 15
  }
}
```

---

### 5. Search Permissions
Search for permissions by name or description.

**Endpoint:** `GET /permissions/search?q=manage&limit=10&offset=0`

**Query Parameters:**
- `q` (required): Search query string
- `limit` (optional): Number of results per page (default: 10)
- `offset` (optional): Number of results to skip (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "manage_users",
      "description": "Manage user accounts and profiles",
      "created_at": "2025-12-29T13:30:00Z",
      "updated_at": "2025-12-29T13:30:00Z"
    },
    {
      "id": 6,
      "name": "manage_roles",
      "description": "Create, update, and delete roles",
      "created_at": "2025-12-29T13:30:00Z",
      "updated_at": "2025-12-29T13:30:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "search_query": "manage"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Search query is required"
}
```

---

## Available Permissions

The system includes the following default permissions:

| ID | Name | Description |
|---|---|---|
| 1 | `create` | Create new content or resources |
| 2 | `read` | View content or resources |
| 3 | `update` | Edit existing content or resources |
| 4 | `delete` | Remove content or resources |
| 5 | `manage_users` | Manage user accounts and profiles |
| 6 | `manage_roles` | Create, update, and delete roles |
| 7 | `manage_settings` | Access system settings |
| 8 | `manage_permissions` | Manage role permissions |
| 9 | `view_reports` | Access analytics and reports |
| 10 | `export_data` | Export data from the system |
| 11 | `manage_tickets` | Manage ticket system and operations |
| 12 | `view_analytics` | View system analytics and statistics |
| 13 | `approve_requests` | Approve pending requests |
| 14 | `reject_requests` | Reject pending requests |
| 15 | `audit_logs` | Access and view audit logs |

Additional custom permissions can be seeded as needed.

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
- `400` - Bad Request (missing required parameters)
- `404` - Not Found (permission doesn't exist)
- `500` - Server Error

---

## Implementation Examples

### 1. Fetch All Available Permissions
```javascript
async function getAllPermissions() {
  try {
    const response = await fetch('http://localhost:5000/api/permissions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('Available permissions:', data.data);
      return data.data;
    } else {
      console.error('Failed to fetch permissions:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 2. Get Permission by Name
```javascript
async function getPermissionByName(permissionName) {
  try {
    const response = await fetch(`http://localhost:5000/api/permissions/name/${permissionName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('Permission details:', data.data);
      return data.data;
    } else {
      console.error('Permission not found:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage
getPermissionByName('create');
getPermissionByName('manage_users');
```

### 3. Search Permissions
```javascript
async function searchPermissions(query) {
  try {
    const response = await fetch(`http://localhost:5000/api/permissions/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log(`Search results for "${query}":`, data.data);
      return data.data;
    } else {
      console.error('Search failed:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage
searchPermissions('manage');
searchPermissions('create');
```

### 4. Get Permission Count
```javascript
async function getPermissionCount() {
  try {
    const response = await fetch('http://localhost:5000/api/permissions/count', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log(`Total permissions: ${data.data.count}`);
      return data.data.count;
    } else {
      console.error('Failed to get count:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 5. Build Permission Selector Dropdown
```javascript
async function buildPermissionDropdown() {
  try {
    const permissions = await getAllPermissions();
    
    const dropdown = document.getElementById('permission-select');
    permissions.forEach(permission => {
      const option = document.createElement('option');
      option.value = permission.name;
      option.textContent = `${permission.name} - ${permission.description}`;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error('Error building dropdown:', error);
  }
}

// HTML
// <select id="permission-select">
//   <option value="">Select a permission</option>
// </select>
```

### 6. Validate Permission Exists
```javascript
async function permissionExists(permissionName) {
  try {
    const response = await fetch(`http://localhost:5000/api/permissions/name/${permissionName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Usage
const exists = await permissionExists('manage_users');
if (exists) {
  console.log('Permission exists');
} else {
  console.log('Permission does not exist');
}
```

---

## Best Practices

1. **Cache permissions locally** - Fetch all permissions once and store in memory/localStorage
2. **Use permission names** - Reference permissions by name rather than ID for readability
3. **Validate before assignment** - Check if a permission exists before assigning it to a role
4. **Provide dropdown selectors** - Use the permissions list to populate permission selectors in UI
5. **Display descriptions** - Show permission descriptions to users when selecting permissions
6. **Search functionality** - Implement search for finding permissions quickly in large lists
7. **Read-only access** - Remember that permissions are read-only; modifications go through roles API

---

## Summary

The Permissions API provides:
- **Read-only access** to all system permissions
- **Search functionality** for finding specific permissions
- **Pagination support** for handling large permission lists
- **15 default permissions** covering common system operations
- **Extensible design** for adding custom permissions via database seeders

For more help, contact the backend development team.
