# Workflow Approval History API Guide

## Overview
This API provides endpoints to retrieve workflow approval history for reprint requests. It allows you to track the status of approvals at each workflow node and see the complete audit trail of approval actions.

## API Endpoints

### Get Workflow Approval History for a Reprint Request

**Endpoint:**
```
GET /api/reprint-requests/:requestId/approvals
```

**Description:**
Retrieves the complete approval status and history for a specific reprint request, including:
- Current workflow node information
- All pending and completed approvals
- Complete approval history with timestamps and comments

**Parameters:**
- `requestId` (path parameter, required): The ID of the reprint request

**Response Format:**
```json
{
  "success": true,
  "data": {
    "reprint_request": {
      "id": 1,
      "workflow_id": 5,
      "current_node_order": 2,
      "approval_status": "PENDING"
    },
    "current_node": {
      "id": 12,
      "name": "Manager Approval",
      "node_order": 2,
      "approval_type": "ALL",
      "status": {
        "approvalType": "ALL",
        "total": 2,
        "approved": 1,
        "rejected": 0,
        "pending": 1,
        "isComplete": false,
        "nodeStatus": "PENDING"
      }
    },
    "all_approvals": [
      {
        "id": 1,
        "reprint_request_id": 1,
        "node_id": 10,
        "user_id": 5,
        "status": "APPROVED",
        "comments": "Looks good",
        "first_name": "John",
        "last_name": "Doe",
        "username": "jdoe",
        "node_name": "Manager Review",
        "node_order": 1,
        "approval_type": "ALL",
        "created_at": "2025-01-15T10:30:00Z",
        "updated_at": "2025-01-15T10:35:00Z",
        "action_at": "2025-01-15T10:35:00Z"
      },
      {
        "id": 2,
        "reprint_request_id": 1,
        "node_id": 12,
        "user_id": 6,
        "status": "PENDING",
        "comments": null,
        "first_name": "Jane",
        "last_name": "Smith",
        "username": "jsmith",
        "node_name": "Manager Approval",
        "node_order": 2,
        "approval_type": "ALL",
        "created_at": "2025-01-15T10:40:00Z",
        "updated_at": "2025-01-15T10:40:00Z",
        "action_at": null
      }
    ],
    "approval_history": [
      {
        "id": 1,
        "reprint_request_id": 1,
        "node_id": 10,
        "user_id": 5,
        "status": "APPROVED",
        "comments": "Looks good",
        "first_name": "John",
        "last_name": "Doe",
        "username": "jdoe",
        "node_name": "Manager Review",
        "node_order": 1,
        "action_at": "2025-01-15T10:35:00Z"
      }
    ]
  }
}
```

## Response Fields Explanation

### reprint_request Object
- `id`: Unique identifier of the reprint request
- `workflow_id`: ID of the workflow assigned to this reprint request
- `current_node_order`: The current node the request is at in the workflow
- `approval_status`: Overall approval status (PENDING, APPROVED, REJECTED, NOT_REQUIRED)

### current_node Object
Information about the current workflow node:
- `id`: Node ID
- `name`: Node name (e.g., "Manager Approval")
- `node_order`: Order of this node in the workflow sequence
- `approval_type`: Type of approval required (ALL - all approvers must approve, ANY - at least one approver must approve)
- `status`: Current node approval status object

### Node Status Object
- `approvalType`: Type of approval (ALL or ANY)
- `total`: Total number of approvers assigned to this node
- `approved`: Number of approvals received
- `rejected`: Number of rejections received
- `pending`: Number of pending approvals
- `isComplete`: Whether this node's approval is complete
- `nodeStatus`: Current state (PENDING, APPROVED, or REJECTED)

### all_approvals Array
List of all approval records for this reprint request (includes pending and completed):
- `id`: Approval record ID
- `reprint_request_id`: Reference to reprint request
- `node_id`: Reference to workflow node
- `user_id`: ID of the approver
- `status`: Approval status (PENDING, APPROVED, REJECTED)
- `comments`: Optional comments from approver
- `first_name`, `last_name`, `username`: Approver information
- `node_name`, `node_order`, `approval_type`: Node details
- `created_at`: When the approval record was created
- `updated_at`: Last update timestamp
- `action_at`: When the approval action was taken (null if still pending)

### approval_history Array
List of completed approval actions only (where action_at is not null), sorted by action date:
- Same fields as all_approvals, but filtered to only include completed actions
- Useful for audit trail and timeline tracking

## Usage Examples

### JavaScript/Fetch
```javascript
const requestId = 1;
const response = await fetch(`/api/reprint-requests/${requestId}/approvals`);
const data = await response.json();

if (data.success) {
  console.log('Current approval status:', data.data.current_node.status);
  console.log('Approval history:', data.data.approval_history);
}
```

### Using in a Reprint Request Details View
```javascript
// Fetch the approval data
async function getApprovalStatus(reprintRequestId) {
  try {
    const response = await fetch(`/api/reprint-requests/${reprintRequestId}/approvals`);
    const result = await response.json();
    
    if (result.success) {
      const approvalData = result.data;
      
      // Display current approval progress
      const current = approvalData.current_node;
      if (current && current.status) {
        console.log(`Node: ${current.name}`);
        console.log(`Progress: ${current.status.approved}/${current.status.total} approved`);
        console.log(`Status: ${current.status.nodeStatus}`);
      }
      
      // Display approval timeline
      approvalData.approval_history.forEach(approval => {
        console.log(`${approval.username} ${approval.status} at ${approval.action_at}`);
        if (approval.comments) {
          console.log(`Comment: ${approval.comments}`);
        }
      });
    }
  } catch (error) {
    console.error('Error fetching approval status:', error);
  }
}
```

## Related Endpoints

### Approve/Reject a Reprint Request
```
POST /api/reprint-requests/:requestId/approve
```
Submit approval or rejection for a reprint request.

Request Body:
```json
{
  "node_id": 10,
  "user_id": 5,
  "action": "APPROVED",
  "comments": "Approved for printing"
}
```

### Initialize Workflow for Reprint Request
```
POST /api/reprint-requests/:requestId/workflow
```
Attach and initialize a workflow for a reprint request.

Request Body:
```json
{
  "workflow_id": 5
}
```

## Error Responses

### Reprint Request Not Found
```
Status: 404
{
  "error": "Reprint request not found"
}
```

### Server Error
```
Status: 500
{
  "error": "Failed to get reprint request approvals"
}
```

## Data Model Information

The approval history is built from the following database tables:

### reprint_request_approvals
- `id`: Primary key
- `reprint_request_id`: Foreign key to reprint_requests
- `node_id`: Foreign key to workflow_nodes
- `user_id`: Foreign key to users
- `status`: PENDING, APPROVED, or REJECTED
- `comments`: Optional approval comments
- `action_at`: Timestamp of when approval action was taken
- `created_at`: When record was created
- `updated_at`: Last update timestamp

### reprint_requests
- `id`: Primary key
- `workflow_id`: Currently assigned workflow
- `current_node_order`: Current position in workflow
- `approval_status`: Overall approval state

## Key Features

1. **Complete Approval Tracking**: View all approvals at each workflow node
2. **Approval History**: See chronological record of all approval actions
3. **Real-time Status**: Check current pending approvals and overall progress
4. **Audit Trail**: Complete record of who approved/rejected and when
5. **Node Status Details**: Get aggregated approval counts and requirements

## Best Practices

1. **Regular Status Checks**: Poll this endpoint to track approval progress
2. **Display Approval Progress**: Show which approvers have acted and who is pending
3. **Audit Logging**: Use approval_history for compliance and tracking
4. **Error Handling**: Check for 404 when reprint request doesn't exist
5. **Performance**: Use requestId directly for efficient queries (indexed)

## Database Indexes

The following indexes are created for optimal performance:
- `idx_reprint_request_approvals_request_id`: For fast approval lookups by request
- `idx_reprint_request_approvals_node_id`: For node-based queries
- `idx_reprint_request_approvals_user_id`: For user-based queries
- `idx_reprint_request_approvals_status`: For status-based filtering
- `idx_reprint_requests_workflow_id`: For workflow lookups
- `idx_reprint_requests_approval_status`: For approval status queries
