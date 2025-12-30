# Workflow Approval System API Guide

## Overview

The Ticket Approval Workflow system provides a flexible, multi-stage approval process for tickets. Each workflow can have multiple nodes (approval stages), and each node can have multiple assigned users.

## Database Schema

### Tables Created

1. **workflows** - Workflow templates
2. **workflow_nodes** - Approval stages within a workflow
3. **workflow_node_users** - Users assigned to each node
4. **ticket_approvals** - Tracks individual approvals per ticket

### Tickets Table Updates
- `workflow_id` - References the assigned workflow
- `current_node_order` - Current approval stage
- `approval_status` - PENDING, APPROVED, REJECTED, NOT_REQUIRED
- `created_by` - User who created the ticket

---

## API Endpoints

### 1. Workflow Management

#### Create Workflow
```http
POST /api/workflows
Content-Type: application/json

{
  "name": "Ticket Approval",
  "description": "Standard ticket approval workflow",
  "is_active": true
}
```

#### Get All Workflows
```http
GET /api/workflows
GET /api/workflows?active=true        # Only active workflows
GET /api/workflows?limit=10&offset=0  # Pagination
```

#### Get Workflow by ID (with nodes & users)
```http
GET /api/workflows/:id
```

#### Update Workflow
```http
PUT /api/workflows/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "is_active": false
}
```

#### Delete Workflow
```http
DELETE /api/workflows/:id
```

---

### 2. Workflow Nodes Management

#### Add Node to Workflow
```http
POST /api/workflows/:workflowId/nodes
Content-Type: application/json

{
  "name": "Manager Approval",
  "node_order": 1,
  "approval_type": "ALL",    // "ALL" or "ANY"
  "description": "All managers must approve",
  "user_ids": [1, 2, 3]      // Optional: assign users immediately
}
```

**Approval Types:**
- `ALL` - All assigned users must approve
- `ANY` - Any one user approval is sufficient

#### Get All Nodes for Workflow
```http
GET /api/workflows/:workflowId/nodes
```

#### Update Node
```http
PUT /api/workflows/:workflowId/nodes/:nodeId
Content-Type: application/json

{
  "name": "Senior Manager Approval",
  "approval_type": "ANY",
  "description": "Any senior manager can approve"
}
```

#### Delete Node
```http
DELETE /api/workflows/:workflowId/nodes/:nodeId
```

#### Reorder Nodes
```http
PUT /api/workflows/:workflowId/nodes/reorder
Content-Type: application/json

{
  "node_orders": [
    { "id": 3, "node_order": 1 },
    { "id": 1, "node_order": 2 },
    { "id": 2, "node_order": 3 }
  ]
}
```

---

### 3. Node Users Management

#### Get Users for Node
```http
GET /api/nodes/:nodeId/users
```

#### Add Users to Node
```http
POST /api/nodes/:nodeId/users
Content-Type: application/json

{
  "user_ids": [4, 5, 6]
}
```

#### Set Users for Node (Replace All)
```http
PUT /api/nodes/:nodeId/users
Content-Type: application/json

{
  "user_ids": [7, 8]
}
```

#### Remove User from Node
```http
DELETE /api/nodes/:nodeId/users/:userId
```

---

### 4. Ticket Approval Operations

#### Initialize Workflow for Ticket
```http
POST /api/ocr/tickets/:ticketId/workflow
Content-Type: application/json

{
  "workflow_id": 1
}
```

This will:
1. Assign the workflow to the ticket
2. Set `current_node_order = 1`
3. Create pending approval records for all users in the first node

#### Get Pending Approvals (for a user)
```http
GET /api/approvals/pending?userId=5
```

Returns all tickets waiting for the user's approval at the current stage.

#### Get Tickets Pending Approval (Dashboard)
```http
GET /api/approvals/tickets/pending?userId=5&limit=20&offset=0
```

#### Approve/Reject Ticket
```http
POST /api/ocr/tickets/:ticketId/approve
Content-Type: application/json

{
  "user_id": 5,
  "action": "APPROVE",      // "APPROVE" or "REJECT"
  "comments": "Looks good!"
}
```

**Response includes:**
- `approval_recorded` - Confirmation
- `node_status` - Current node approval progress
- `moved_to_next_node` - If moved to next approval stage
- `ticket_status` - Final status if workflow complete

#### Get Ticket Approval Status & History
```http
GET /api/ocr/tickets/:ticketId/approvals
```

Returns:
- Current ticket status
- Current node info and progress
- All approval records
- Approval history timeline

---

## Workflow Example

### Setup: Create Workflow with 2 Nodes

```javascript
// 1. Create Workflow
POST /api/workflows
{
  "name": "Ticket Approval",
  "description": "Two-stage approval process"
}
// Response: { "id": 1, "name": "Ticket Approval", ... }

// 2. Add Node 1 (Team Leads)
POST /api/workflows/1/nodes
{
  "name": "Team Lead Approval",
  "node_order": 1,
  "approval_type": "ALL",
  "user_ids": [10, 11]  // Sahan, Kavindu
}

// 3. Add Node 2 (Managers)
POST /api/workflows/1/nodes
{
  "name": "Manager Approval",
  "node_order": 2,
  "approval_type": "ANY",
  "user_ids": [20, 21]  // Rukshan, Minindu
}
```

### Usage: Process a Ticket

```javascript
// 1. Initialize workflow on ticket
POST /api/ocr/tickets/100/workflow
{ "workflow_id": 1 }

// 2. User 10 (Sahan) gets pending approvals
GET /api/approvals/pending?userId=10
// Returns ticket 100

// 3. Sahan approves
POST /api/ocr/tickets/100/approve
{ "user_id": 10, "action": "APPROVE" }
// Response: "Waiting for 1 more approval(s)"

// 4. Kavindu approves
POST /api/ocr/tickets/100/approve
{ "user_id": 11, "action": "APPROVE" }
// Response: "Moved to next approval stage: Manager Approval"

// 5. Rukshan approves (ANY is enough)
POST /api/ocr/tickets/100/approve
{ "user_id": 20, "action": "APPROVE" }
// Response: "Ticket has been fully approved"
```

---

## Status Flow

```
Ticket Created
    ↓
Initialize Workflow → PENDING (Node 1)
    ↓
Node 1 Approved → PENDING (Node 2)
    ↓
Node 2 Approved → APPROVED ✓

At any point:
Rejection → REJECTED ✗
```

---

## Error Codes

| Code | Message |
|------|---------|
| 400 | `workflow_id is required` |
| 400 | `Workflow is not active` |
| 400 | `Workflow has no nodes` |
| 400 | `First node has no assigned users` |
| 400 | `Ticket is already APPROVED/REJECTED` |
| 403 | `You are not authorized to approve this ticket at current stage` |
| 404 | `Workflow not found` |
| 404 | `Ticket not found` |
| 404 | `Node not found` |

---

## Best Practices

1. **Always check workflow is active** before assigning to tickets
2. **Assign users to all nodes** before initializing workflow
3. **Use approval_type wisely**:
   - `ALL` for critical approvals requiring consensus
   - `ANY` for quick approvals where one authorization is enough
4. **Handle rejections** - Once rejected, ticket cannot be re-approved without restarting workflow
5. **Track approval history** for audit purposes

---

## Files Created

| File | Purpose |
|------|---------|
| `models/Workflows.js` | Workflow CRUD operations |
| `models/WorkflowNodes.js` | Node management |
| `models/WorkflowNodeUsers.js` | User-node mapping |
| `models/TicketApprovals.js` | Ticket approval tracking |
| `models/ReprintRequestApprovals.js` | Reprint request approval tracking |
| `controllers/workflowsController.js` | Business logic |
| `routes/workflows.js` | Workflow routes |
| `routes/workflowNodes.js` | Node user routes |
| `routes/approvals.js` | Approval routes |
| `database/migrations/050_create_workflow_tables.js` | Workflow tables migration |
| `database/migrations/055_add_workflow_to_reprint_requests.js` | Reprint request workflow migration |

---

## Reprint Request Workflow API

The workflow system also supports **Reprint Requests**. The API is identical to tickets.

### Initialize Workflow for Reprint Request
```http
POST /api/reprint-requests/:requestId/workflow
Content-Type: application/json

{
  "workflow_id": 1
}
```

### Get Pending Reprint Request Approvals (for a user)
```http
GET /api/approvals/reprint-requests/pending?userId=5
```

### Get Reprint Requests Pending Approval (Dashboard)
```http
GET /api/approvals/reprint-requests/list?userId=5&limit=20&offset=0
```

### Approve/Reject Reprint Request
```http
POST /api/reprint-requests/:requestId/approve
Content-Type: application/json

{
  "user_id": 5,
  "action": "APPROVE",
  "comments": "Approved for reprinting"
}
```

### Get Reprint Request Approval Status & History
```http
GET /api/reprint-requests/:requestId/approvals
```

---

## Summary of All Endpoints

### Workflows
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workflows` | Create workflow |
| GET | `/api/workflows` | List all workflows |
| GET | `/api/workflows/:id` | Get workflow with nodes |
| PUT | `/api/workflows/:id` | Update workflow |
| DELETE | `/api/workflows/:id` | Delete workflow |

### Workflow Nodes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workflows/:workflowId/nodes` | Add node |
| GET | `/api/workflows/:workflowId/nodes` | List nodes |
| PUT | `/api/workflows/:workflowId/nodes/:nodeId` | Update node |
| DELETE | `/api/workflows/:workflowId/nodes/:nodeId` | Delete node |
| PUT | `/api/workflows/:workflowId/nodes/reorder` | Reorder nodes |

### Node Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/nodes/:nodeId/users` | Get node users |
| POST | `/api/nodes/:nodeId/users` | Add users to node |
| PUT | `/api/nodes/:nodeId/users` | Set node users |
| DELETE | `/api/nodes/:nodeId/users/:userId` | Remove user |

### Ticket Approvals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ocr/tickets/:ticketId/workflow` | Initialize workflow |
| POST | `/api/ocr/tickets/:ticketId/approve` | Approve/reject |
| GET | `/api/ocr/tickets/:ticketId/approvals` | Get approval status |
| GET | `/api/approvals/pending?userId=X` | User's pending approvals |
| GET | `/api/approvals/tickets/pending` | Pending tickets list |

### Reprint Request Approvals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reprint-requests/:requestId/workflow` | Initialize workflow |
| POST | `/api/reprint-requests/:requestId/approve` | Approve/reject |
| GET | `/api/reprint-requests/:requestId/approvals` | Get approval status |
| GET | `/api/approvals/reprint-requests/pending?userId=X` | User's pending approvals |
| GET | `/api/approvals/reprint-requests/list` | Pending requests list |
