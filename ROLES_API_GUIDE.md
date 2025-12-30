# TMS Roles API Guide

## Overview
This guide provides detailed information about the TMS Roles API endpoints. The roles system manages user roles and their associated permissions for the application.

**Base URL:** `http://localhost:5000/api`

---

## Table of Contents
1. [Role Management](#role-management)
2. [Permission Management](#permission-management)
3. [Available Permissions](#available-permissions)
4. [Default Roles](#default-roles)
5. [Error Handling](#error-handling)

---

## Role Management

### 1. Create Role
Create a new role with permissions.

**Endpoint:** `POST /roles`

**Request Body:**
```json
{
  "name": "editor",
  "description": "Editor role with content management access",
  "permissions": ["create", "read", "update"],
  "is_active": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "editor",
    "description": "Editor role with content management access",
    "permissions": ["create", "read", "update"],
    "is_active": true,
    "created_at": "2025-12-29T13:30:00Z",
    "updated_at": "2025-12-29T13:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Missing required field: name"
}
```

---

### 2. Get All Roles
Retrieve all roles with pagination.

**Endpoint:** `GET /roles?limit=10&offset=0`

**Query Parameters:**
- `limit` (optional): Number of roles per page (default: 10)
- `offset` (optional): Number of roles to skip (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "admin",
      "description": "Administrator with full access",
      "permissions": ["create", "read", "update", "delete", "manage_users", "manage_roles"],
      "is_active": true,
      "created_at": "2025-12-29T13:30:00Z",
      "updated_at": "2025-12-29T13:30:00Z"
    },
    {
      "id": 2,
      "name": "moderator",
      "description": "Moderator with limited access",
      "permissions": ["create", "read", "update", "delete"],
      "is_active": true,
      "created_at": "2025-12-29T13:30:00Z",
      "updated_at": "2025-12-29T13:30:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 3
  }
}
```

---

### 3. Get Active Roles
Retrieve only active roles.

**Endpoint:** `GET /roles/active?limit=10&offset=0`

**Query Parameters:**
- `limit` (optional): Number of roles per page (default: 10)
- `offset` (optional): Number of roles to skip (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "admin",
      "description": "Administrator with full access",
      "permissions": ["create", "read", "update", "delete", "manage_users", "manage_roles"],
      "is_active": true,
      "created_at": "2025-12-29T13:30:00Z",
      "updated_at": "2025-12-29T13:30:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0
  }
}
```

---

### 4. Get Role by ID
Retrieve a specific role by ID.

**Endpoint:** `GET /roles/id/:roleId`

**Example:** `GET /roles/id/1`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "admin",
    "description": "Administrator with full access",
    "permissions": ["create", "read", "update", "delete", "manage_users", "manage_roles"],
    "is_active": true,
    "created_at": "2025-12-29T13:30:00Z",
    "updated_at": "2025-12-29T13:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Role not found"
}
```

---

### 5. Get Role by Name
Retrieve a role by its name.

**Endpoint:** `GET /roles/name/:roleName`

**Example:** `GET /roles/name/admin`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "admin",
    "description": "Administrator with full access",
    "permissions": ["create", "read", "update", "delete", "manage_users", "manage_roles"],
    "is_active": true,
    "created_at": "2025-12-29T13:30:00Z",
    "updated_at": "2025-12-29T13:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Role not found"
}
```

---

### 6. Get Role Count
Get the total number of roles.

**Endpoint:** `GET /roles/count`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

---

### 7. Update Role
Update role information including name, description, and active status.

**Endpoint:** `PUT /roles/:roleId`

**Request Body (Update only fields you need):**
```json
{
  "description": "Updated editor role description",
  "is_active": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "editor",
    "description": "Updated editor role description",
    "permissions": ["create", "read", "update"],
    "is_active": true,
    "created_at": "2025-12-29T13:30:00Z",
    "updated_at": "2025-12-29T13:35:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Role not found"
}
```

---

### 8. Delete Role
Delete a role.

**Endpoint:** `DELETE /roles/:roleId`

**Example:** `DELETE /roles/4`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

**Error Response (404):**
```json
{
  "error": "Role not found"
}
```

---

## Permission Management

### 1. Add Permission to Role
Add a new permission to an existing role.

**Endpoint:** `POST /roles/:roleId/permission`

**Request Body:**
```json
{
  "permission": "manage_settings"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Permission 'manage_settings' added to role",
  "data": {
    "id": 4,
    "name": "editor",
    "description": "Editor role with content management access",
    "permissions": ["create", "read", "update", "manage_settings"],
    "is_active": true,
    "created_at": "2025-12-29T13:30:00Z",
    "updated_at": "2025-12-29T13:40:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Permission is required"
}
```

**Error Response (404):**
```json
{
  "error": "Role not found"
}
```

---

### 2. Remove Permission from Role
Remove a permission from a role.

**Endpoint:** `POST /roles/:roleId/permission/remove`

**Request Body:**
```json
{
  "permission": "manage_settings"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Permission 'manage_settings' removed from role",
  "data": {
    "id": 4,
    "name": "editor",
    "description": "Editor role with content management access",
    "permissions": ["create", "read", "update"],
    "is_active": true,
    "created_at": "2025-12-29T13:30:00Z",
    "updated_at": "2025-12-29T13:45:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Role not found"
}
```

---

### 3. Check Permission
Check if a role has a specific permission.

**Endpoint:** `POST /roles/:roleId/permission/check`

**Request Body:**
```json
{
  "permission": "manage_users"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "role_id": 1,
  "permission": "manage_users",
  "has_permission": true
}
```

**Example: Permission Not Found (200):**
```json
{
  "success": true,
  "role_id": 4,
  "permission": "manage_users",
  "has_permission": false
}
```

**Error Response (404):**
```json
{
  "error": "Role not found"
}
```

---

## Available Permissions

The following permissions are commonly used in the system:

| Permission | Description |
|---|---|
| `create` | Create new content or resources |
| `read` | View content or resources |
| `update` | Edit existing content or resources |
| `delete` | Remove content or resources |
| `manage_users` | Manage user accounts and profiles |
| `manage_roles` | Create, update, and delete roles |
| `manage_settings` | Access system settings |
| `manage_permissions` | Manage role permissions |
| `view_reports` | Access analytics and reports |
| `export_data` | Export data from the system |

Custom permissions can be added as needed.

---

## Default Roles

### Admin
- **ID:** 1
- **Name:** admin
- **Description:** Administrator with full access
- **Permissions:** `create`, `read`, `update`, `delete`, `manage_users`, `manage_roles`
- **Status:** Active

### Moderator
- **ID:** 2
- **Name:** moderator
- **Description:** Moderator with limited access
- **Permissions:** `create`, `read`, `update`, `delete`
- **Status:** Active

### User
- **ID:** 3
- **Name:** user
- **Description:** Regular user with basic access
- **Permissions:** `read`, `create`
- **Status:** Active

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
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error

---

## Implementation Guide

### 1. Fetch User's Role with Permissions
```javascript
async function getUserRole(userId) {
  // First get the user to find their role
  const userResponse = await fetch(`http://localhost:5000/api/users/id/${userId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  const userData = await userResponse.json();
  const userRole = userData.data.role;
  
  // Then fetch the role details including permissions
  const roleResponse = await fetch(`http://localhost:5000/api/roles/name/${userRole}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  const roleData = await roleResponse.json();
  return roleData.data;
}
```

### 2. Check if User Has Permission
```javascript
async function userHasPermission(userId, requiredPermission) {
  const role = await getUserRole(userId);
  
  // Check permission locally
  const hasPermission = role.permissions.includes(requiredPermission);
  
  // Or verify with server
  if (!hasPermission) {
    const response = await fetch(`http://localhost:5000/api/roles/${role.id}/permission/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ permission: requiredPermission })
    });
    
    const data = await response.json();
    return data.has_permission;
  }
  
  return hasPermission;
}
```

### 3. Create a New Role
```javascript
async function createNewRole(roleName, description, permissions) {
  const response = await fetch('http://localhost:5000/api/roles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      name: roleName,
      description: description,
      permissions: permissions,
      is_active: true
    })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Role created:', data.data);
    return data.data;
  } else {
    console.error('Failed to create role:', data.error);
  }
}
```

### 4. Add Permission to Role
```javascript
async function grantPermissionToRole(roleId, permission) {
  const response = await fetch(`http://localhost:5000/api/roles/${roleId}/permission`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ permission: permission })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log(`Permission '${permission}' granted to role`);
    return data.data;
  } else {
    console.error('Failed to add permission:', data.error);
  }
}
```

### 5. Remove Permission from Role
```javascript
async function revokePermissionFromRole(roleId, permission) {
  const response = await fetch(`http://localhost:5000/api/roles/${roleId}/permission/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ permission: permission })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log(`Permission '${permission}' revoked from role`);
    return data.data;
  } else {
    console.error('Failed to remove permission:', data.error);
  }
}
```

### 6. Disable a Role
```javascript
async function disableRole(roleId) {
  const response = await fetch(`http://localhost:5000/api/roles/${roleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ is_active: false })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Role disabled');
    return data.data;
  } else {
    console.error('Failed to disable role:', data.error);
  }
}
```

---

## Best Practices

1. **Always validate permissions on the server side** - Don't rely solely on client-side permission checks
2. **Use role names instead of IDs** - Role names are more descriptive and easier to maintain
3. **Cache role data** - Store role information in local storage or state management to reduce API calls
4. **Implement permission hierarchies** - Consider admin permissions as superset of all other permissions
5. **Audit permission changes** - Log when permissions are added or removed for security
6. **Default to least privilege** - When in doubt, restrict permissions rather than grant them
7. **Review permissions regularly** - Periodically audit which users have which permissions

---

## Summary

The Roles API provides comprehensive role and permission management:

- **Role CRUD** - Create, read, update, and delete roles
- **Permission Management** - Add, remove, and check permissions on roles
- **Role Filtering** - Get all roles, active roles, or specific roles by ID/name
- **Flexibility** - Support for custom permissions beyond the defaults

For more help, contact the backend development team.
