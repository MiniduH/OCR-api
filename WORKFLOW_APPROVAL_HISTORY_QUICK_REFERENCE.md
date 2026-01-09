# Workflow Approval History - Quick Reference

## Get Approval History for a Reprint Request

**Endpoint**: `GET /api/reprint-requests/:requestId/approvals`

**Example Request**:
```bash
curl -X GET http://localhost:3000/api/reprint-requests/1/approvals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
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
    "all_approvals": [...],
    "approval_history": [...]
  }
}
```

## Understanding the Response

| Field | Purpose |
|-------|---------|
| `reprint_request` | Basic reprint request info and current workflow state |
| `current_node` | Details about the current workflow step being processed |
| `current_node.status` | Approval metrics for current node (how many approved, rejected, pending) |
| `all_approvals` | All approval records (both pending and completed) |
| `approval_history` | Only completed approvals, sorted chronologically (good for audit trail) |

## Key Status Values

### Approval Status
- `PENDING` - Awaiting action
- `APPROVED` - Approved
- `REJECTED` - Rejected

### Overall Approval Status
- `PENDING` - Workflow in progress
- `APPROVED` - All nodes completed successfully
- `REJECTED` - Request rejected at some node
- `NOT_REQUIRED` - No workflow assigned

### Node Approval Type
- `ALL` - All assignees must approve
- `ANY` - At least one assignee must approve

## Common Use Cases

### 1. Check if request is ready to proceed to next node
```javascript
const approval = await fetch(`/api/reprint-requests/${id}/approvals`);
const data = await approval.json();
const isComplete = data.data.current_node.status.isComplete;
const wasApproved = data.data.current_node.status.nodeStatus === 'APPROVED';
```

### 2. Get approval timeline
```javascript
const approval = await fetch(`/api/reprint-requests/${id}/approvals`);
const data = await approval.json();
const timeline = data.data.approval_history; // Already sorted by date
timeline.forEach(item => {
  console.log(`${item.first_name} ${item.last_name} ${item.status} at ${item.action_at}`);
});
```

### 3. Find pending approvers
```javascript
const approval = await fetch(`/api/reprint-requests/${id}/approvals`);
const data = await approval.json();
const pending = data.data.current_node 
  ? data.data.all_approvals
      .filter(a => a.node_id === data.data.current_node.id && a.status === 'PENDING')
      .map(a => `${a.first_name} ${a.last_name}`)
  : [];
```

### 4. Check approval progress
```javascript
const approval = await fetch(`/api/reprint-requests/${id}/approvals`);
const data = await approval.json();
const node = data.data.current_node.status;
console.log(`${node.approved}/${node.total} approvals received`);
console.log(`Progress: ${Math.round(node.approved / node.total * 100)}%`);
```

## Database Tables Used

```
reprint_request_approvals
├── reprint_request_id → reprint_requests
├── node_id → workflow_nodes
├── user_id → users
├── status
├── comments
├── action_at (null if pending)
└── timestamps

reprint_requests
├── workflow_id → workflows
├── current_node_order
├── approval_status
└── other fields

workflow_nodes
├── workflow_id → workflows
├── name
├── node_order
├── approval_type (ALL or ANY)
└── users (many-to-many)
```

## Notes

- **action_at field**: Only populated once approval action is taken. Null for pending approvals.
- **approval_history**: Filtered query that only returns records with action_at NOT NULL
- **all_approvals**: Includes both pending and completed approvals
- **Node Status Determination**:
  - If ANY rejection exists → REJECTED
  - If approval_type=ALL and all approved → APPROVED
  - If approval_type=ANY and at least one approved → APPROVED
  - Otherwise → PENDING

## Error Handling

```javascript
try {
  const response = await fetch(`/api/reprint-requests/${id}/approvals`);
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 404) {
      console.log('Reprint request not found');
    } else {
      console.log('Server error:', data.error);
    }
  } else {
    // Process data.data
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## Related APIs

- `POST /api/reprint-requests/:requestId/approve` - Submit approval/rejection
- `POST /api/reprint-requests/:requestId/workflow` - Assign workflow
- `GET /api/reprint-requests` - List all reprint requests
- `GET /api/reprint-requests/:id` - Get single reprint request details
