# Debug Guide - Chat Features

## 🔍 Debug Console Logs

All debug logs are prefixed with `[v0]` for easy filtering.

### Filter in DevTools
```javascript
// In console, to see only v0 logs
console.log = ((original) => (msg, ...args) => {
  if (msg.includes('[v0]')) original(msg, ...args);
})(console.log);
```

### Current Debug Points

```javascript
// In ChatPage.tsx

// Message received
console.log("[v0] RECEIVED MESSAGE:", message);

// Typing indicators
console.log("[v0] User typing:", data.username);
console.log("[v0] Removing reaction:", emoji, "from message:", messageId);

// Reactions
console.log("[v0] Adding reaction:", emoji, "to message:", messageId);

// API calls
console.log("[v0] User data received:", userData);
```

## 🐛 Common Issues & Solutions

### Issue 1: WebSocket Not Connected
**Symptom**: Messages don't send, connection status shows "Offline"

**Debug Steps**:
1. Open DevTools → Network tab
2. Filter by WebSocket
3. Look for connection to `https://node.aitechnotech.in`
4. Check for "101 Switching Protocols" response

**Solution**:
```javascript
// In SocketContext.tsx, add logging
newSocket.on("connect", () => {
  console.log("[v0] Socket connected:", newSocket.id);
});

newSocket.on("connect_error", (err) => {
  console.log("[v0] Socket error:", err.message);
});
```

### Issue 2: Messages Not Appearing
**Symptom**: Send message, it doesn't appear in chat

**Debug Steps**:
1. Check if `joinConversation` was emitted
```javascript
// Add to ChatPage.tsx
console.log("[v0] Joining conversation:", conversation._id);
socket.emit("joinConversation", conversation._id);
```

2. Check message format
```javascript
const newMessage = {
  conversationId: selectedConversation._id,  // Required
  content: input,                              // Required
  senderId: currentUser._id,                   // Required
  senderName: currentUser.name,                // For groups
  timestamp: new Date().toISOString(),         // Required
  status: "sent",                              // Required
};
```

3. Monitor socket events
```javascript
socket.onAny((event, ...args) => {
  console.log("[v0] Socket event:", event, args);
});
```

### Issue 3: Typing Indicator Not Showing
**Symptom**: Other users don't see "typing..." message

**Debug Steps**:
1. Verify typing event emission
```javascript
console.log("[v0] Emitting typing for:", currentUser.name);
socket.emit("user_typing", {
  conversationId: selectedConversation._id,
  userId: currentUser._id,
  username: currentUser.name,
});
```

2. Check typing timeout
```javascript
console.log("[v0] Typing users:", typingUsers);
// Should auto-clear after 3 seconds
```

3. Listen for typing events
```javascript
socket.on("user_typing", (data) => {
  console.log("[v0] Received typing from:", data.username);
});
```

### Issue 4: Reactions Not Working
**Symptom**: Click emoji, nothing happens or error in console

**Debug Steps**:
1. Check message has _id
```javascript
console.log("[v0] Message:", message);
// Should have _id property
```

2. Verify API call
```javascript
const response = await messageReactionAPI.addReaction(messageId, emoji, userId);
console.log("[v0] Reaction response:", response);
```

3. Check state update
```javascript
console.log("[v0] Messages after reaction:", messages);
// Should show updated reactions array
```

### Issue 5: Group Creation Failing
**Symptom**: Modal stays in loading state or shows error

**Debug Steps**:
1. Check user selection
```javascript
console.log("[v0] Selected users:", selectedUsers);
// Should have at least 2 users
```

2. Check API response
```javascript
const res = await conversationAPI.createGroup({
  title: groupName,
  participants: participantIds,
});
console.log("[v0] Group creation response:", res);
```

3. Verify response structure
```javascript
const conversation = res.data.data || res.data;
console.log("[v0] Conversation object:", conversation);
// Should have _id, title, participants
```

## 📊 Performance Debugging

### Monitor Message Rendering
```javascript
// Add to ChatMessageItem
useEffect(() => {
  console.log("[v0] Rendering message:", message._id);
}, [message]);
```

### Check Re-renders
```javascript
// Add to any component
useEffect(() => {
  console.log("[v0] Component rendered");
  return () => {
    console.log("[v0] Component cleanup");
  };
}, []);
```

### Monitor State Changes
```javascript
// In ChatPage.tsx
useEffect(() => {
  console.log("[v0] Messages count:", messages.length);
}, [messages]);

useEffect(() => {
  console.log("[v0] Typing users:", typingUsers);
}, [typingUsers]);
```

## 🔍 Network Debugging

### Monitor API Calls
```javascript
// In api.ts, add logging
export const apiCall = async (endpoint, options) => {
  console.log("[v0] API Call:", endpoint, options);
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  console.log("[v0] API Response:", endpoint, data);
  return data;
};
```

### Check Socket Payload Size
```javascript
socket.on("receiveMessage", (message) => {
  const size = JSON.stringify(message).length;
  console.log("[v0] Message size:", size, "bytes");
});
```

## 🧪 Manual Testing

### Test 1: Direct Message Flow
```javascript
// Step 1: Select a user
handleSelectUser(user);
console.log("[v0] Selected user:", user);

// Step 2: Type and send message
const message = { conversationId: "123", content: "test", ... };
socket.emit("sendMessage", message);
console.log("[v0] Message sent:", message);

// Step 3: Verify reception
// Should see "[v0] RECEIVED MESSAGE:" in console
```

### Test 2: Typing Indicator Flow
```javascript
// User A starts typing
socket.emit("user_typing", { userId: "A", username: "User A", ... });
console.log("[v0] User A typing event emitted");

// User B should see
// "[v0] Received typing from: User A"
// "[v0] Typing users: ['User A']"

// After 3 seconds, should auto-clear
// "[v0] Typing users: []"
```

### Test 3: Reaction Flow
```javascript
// Click emoji on a message
await messageReactionAPI.addReaction(messageId, "👍", userId);
console.log("[v0] Reaction added");

// Check message state
console.log("[v0] Message reactions:", message.reactions);

// Should show
// [{ emoji: "👍", users: ["userId"], count: 1 }]
```

## 🎯 Logging Checklist

Add these logs before deployment to debug later:

- [ ] Socket connection established
- [ ] Conversation joined
- [ ] Message sent/received
- [ ] Typing indicator triggered
- [ ] Reaction added/removed
- [ ] Group created
- [ ] User selected
- [ ] Profile modal opened

## 🔧 Advanced Debugging

### Redux DevTools (if using Redux)
```javascript
// Not currently used, but can be added for state management
import { composeWithDevTools } from 'redux-devtools-extension';
```

### Performance Profiling
```javascript
// Measure message rendering time
console.time('[v0] Render messages');
// ... render code
console.timeEnd('[v0] Render messages');
```

### Memory Leaks Check
```javascript
// In useEffect cleanup
useEffect(() => {
  return () => {
    console.log("[v0] Cleaning up listeners");
    socket?.off("messageReceived");
    // Remove all listeners
  };
}, [socket]);
```

## 📝 Creating Bug Reports

When reporting issues, include:

1. **Console Logs**:
   - Copy all "[v0]" logs
   - Include timestamps

2. **Network Info**:
   - Screenshot of Network tab
   - WebSocket connection status
   - API response status codes

3. **Browser Info**:
   - Browser name and version
   - Device type (desktop/mobile)
   - Screen size

4. **Steps to Reproduce**:
   - Exact steps that caused the issue
   - Expected vs actual behavior

5. **Error Message**:
   - Full error stack trace
   - Error boundaries (if applicable)

## 🚀 Before Removing Debug Logs

**Search and clean up**:
```bash
# Find all [v0] logs
grep -r "\[v0\]" src/

# Remove them
grep -rn "console.log.*\[v0\]" src/ | cut -d: -f1 | sort -u | xargs sed -i '/\[v0\]/d'
```

Or use find/replace in IDE:
- Search: `console.log.*\[v0\].*`
- Replace: `` (empty)

---

**Happy debugging! 🐛**
