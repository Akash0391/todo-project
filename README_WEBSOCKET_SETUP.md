# WebSocket Implementation Guide

## Overview
This implementation adds real-time WebSocket functionality to your todo app, enabling instant updates across all connected clients when tasks are created, updated, deleted, or reordered.

## 🏗️ Architecture

### Backend Structure
```
backend/
├── socket/
│   ├── socketServer.ts          # Main WebSocket server configuration
│   └── handlers/
│       └── taskHandlers.ts      # Task-specific event handlers
├── server.ts                    # Updated to integrate Socket.IO
└── controllers/
    └── taskController.ts        # Updated to emit socket events
```

### Frontend Structure
```
frontend/
├── src/
│   ├── lib/
│   │   └── socket.ts           # Socket client manager
│   ├── context/
│   │   └── SocketContext.tsx   # React context for socket connection
│   ├── hooks/
│   │   ├── useSocket.ts        # WebSocket hooks for real-time features
│   │   └── useTasks.ts         # Updated to integrate with socket events
│   └── components/
│       └── Providers.tsx       # Updated to include SocketProvider
```

## 🚀 Features Implemented

### Real-time Task Operations
- **Task Creation**: Instantly shows new tasks on all connected clients
- **Task Updates**: Real-time updates when tasks are modified
- **Task Deletion**: Immediate removal from all clients
- **Task Reordering**: Live reordering across all sessions

### WebSocket Events
- `task:created` - New task added
- `task:updated` - Task modified
- `task:deleted` - Task removed
- `task:reordered` - Tasks reordered
- `task:join` / `task:leave` - Room management for collaboration
- `task:typing` - Real-time typing indicators
- `task:quick-update` - Instant field updates

## 🔧 Setup Instructions

### 1. Environment Variables

Create these environment variables:

**Backend (.env)**
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Start the Application

**Backend**
```bash
cd backend
npm run dev
```

**Frontend**
```bash
cd frontend
npm run dev
```

### 3. Test WebSocket Connection

1. Open multiple browser tabs/windows to `http://localhost:3000`
2. Create, update, or delete tasks in one tab
3. Observe real-time updates in other tabs

## 📋 Usage Examples

### Basic Usage (Automatic)
The WebSocket integration works automatically! Simply use your existing task operations:

```tsx
// In your components
const { data: tasks } = useTasks(); // Now includes real-time updates
const createTaskMutation = useCreateTask(); // Automatically broadcasts to all clients
const updateTaskMutation = useUpdateTask(); // Real-time updates
const deleteTaskMutation = useDeleteTask(); // Real-time deletion
```

### Advanced Real-time Features

```tsx
// For task-specific collaboration
import { useTaskRealTime } from '@/hooks/useSocket';

function TaskEditor({ taskId }: { taskId: string }) {
  const { setTyping, quickUpdate, isConnected } = useTaskRealTime(taskId);
  
  // Show typing indicator
  const handleTyping = (isTyping: boolean) => {
    setTyping(isTyping);
  };
  
  // Quick real-time updates
  const handleQuickToggle = (completed: boolean) => {
    quickUpdate('completed', completed);
  };
  
  return (
    <div>
      <span>Connected: {isConnected ? '✅' : '❌'}</span>
      {/* Your task editor UI */}
    </div>
  );
}
```

### Connection Status

```tsx
import { useSocket } from '@/context/SocketContext';

function ConnectionStatus() {
  const { isConnected } = useSocket();
  
  return (
    <div className={isConnected ? 'text-green-500' : 'text-red-500'}>
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

## 🎯 Key Features

### 1. Automatic Cache Updates
- TanStack Query cache is automatically updated when socket events are received
- Optimistic updates work alongside real-time updates
- Smart cache invalidation prevents stale data

### 2. Connection Management
- Automatic reconnection on connection loss
- Graceful error handling
- Connection status indicators

### 3. User Rooms
- Each user automatically joins their personal room
- Task-specific rooms for collaboration
- Scalable room-based architecture

### 4. Error Handling
- Socket connection errors are logged and handled
- Failed operations show appropriate error messages
- Automatic retry mechanisms

## 🔧 Customization

### Adding New Events

**Backend (taskHandlers.ts)**
```typescript
socket.on('custom:event', (data) => {
  // Handle custom event
  io.emit('custom:response', { result: 'processed' });
});
```

**Frontend (useSocket.ts)**
```typescript
const handleCustomEvent = useCallback((data) => {
  console.log('Custom event received:', data);
}, []);

useEffect(() => {
  on('custom:response', handleCustomEvent);
  return () => off('custom:response', handleCustomEvent);
}, [on, off, handleCustomEvent]);
```

### Authentication
To add JWT authentication, update `socketServer.ts`:

```typescript
// Uncomment and modify in socketServer.ts
const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
socket.userId = decoded.userId;
socket.user = decoded;
```

## 🚨 Important Notes

### Security
- Currently accepts anonymous connections for testing
- In production, implement proper JWT authentication
- Validate all socket event data on the backend
- Implement rate limiting for socket events

### Performance
- Socket events are broadcasted to all connected clients
- Consider implementing user-specific rooms for large applications
- Monitor memory usage with many concurrent connections

### Error Handling
- Check console for WebSocket connection logs
- Socket events include error handling and logging
- Failed connections will attempt to reconnect automatically

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if backend server is running on port 5000
   - Verify CORS settings in socketServer.ts
   - Check browser console for connection errors

2. **Events Not Received**
   - Ensure SocketProvider wraps your app
   - Check if useTaskSocket() is called in useTasks()
   - Verify event names match between client and server

3. **Cache Not Updating**
   - Confirm TanStack Query is properly configured
   - Check if task keys match in all queries
   - Verify socket event handlers are registered

### Debug Mode
Enable debug logs by adding to browser console:
```javascript
localStorage.debug = 'socket.io-client:socket';
```

## 🎉 What's Next?

Consider adding these features:
- User presence indicators
- Real-time comments on tasks
- Activity feeds
- Push notifications
- Multi-team collaboration
- Task assignments with notifications

The foundation is now in place for any real-time collaborative features you want to add! 