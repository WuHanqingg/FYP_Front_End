## Implementation Plan

### 1. Update API Client (`src/api/chat.ts`)
Add conversation management API methods:
- `getUserConversations(username)` - GET /api/conversations
- `getConversationDetail(conversationId, username)` - GET /api/conversations/{id}
- `deleteConversation(conversationId, username)` - GET /api/conversations/{id}/delete
- `updateConversationTitle(conversationId, username, title)` - POST /api/conversations/{id}/title

### 2. Refactor Chat Store (`src/store/modules/chat.ts`)
Remove all localStorage functionality:
- Remove `STORAGE_KEY`, `loadFromStorage()`, `saveToStorage()` functions
- Remove automatic storage loading on initialization
- Remove all `saveToStorage()` calls in mutation functions

Add API-based data management:
- Add `fetchConversations(username)` - Load conversations from API
- Add `fetchConversationDetail(conversationId, username)` - Load specific conversation
- Update `deleteConversation()` to call API instead of local storage
- Update `renameConversation()` to call API instead of local storage
- Remove `createConversation()` local storage persistence (conversations are created via chat API)
- Remove `addMessage()`, `updateMessage()`, `deleteMessage()` local storage persistence

### 3. Update ChatGPT Component (`src/views/chatai/ChatGPT.vue`)
- Add `onMounted` hook to fetch conversations from API on component load
- Update `createNewConversation()` to not persist locally
- Update `deleteConversation()` to handle API errors
- Update `renameConversation()` to handle API errors
- Add username retrieval from auth storage

### 4. Error Handling
- Add proper error handling for all API calls
- Display user-friendly error messages
- Handle network errors gracefully

### 5. Data Synchronization
- Ensure conversations are fetched from API on component mount
- Ensure conversation details are loaded when switching conversations
- Maintain local state for UI responsiveness while relying on API for persistence