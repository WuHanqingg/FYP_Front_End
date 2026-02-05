# Data Agent API 文档

## 概述

本文档描述了 Data Agent 后端 API 的所有端点，包括对话管理、聊天功能等。

**基础URL**: `http://localhost:5000`

**认证**: 当前版本使用简单的用户名验证，所有需要用户身份的端点都需要提供 `username` 参数。

---

## 1. 对话管理 API

### 1.1 获取用户对话列表

获取特定用户的所有对话历史，仅返回对话ID和标题。

- **URL**: `/api/conversations`
- **方法**: `GET`
- **Content-Type**: `application/json`

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |

#### 请求示例

```http
GET /api/conversations?username=user001
```

#### 成功响应

**状态码**: `200 OK`

```json
{
  "success": true,
  "conversations": [
    {
      "conversation_id": "conv_1738755600000_a1b2c3d4",
      "title": "销售数据分析对话"
    },
    {
      "conversation_id": "conv_1738755500000_e5f6g7h8",
      "title": "用户行为分析"
    }
  ],
  "count": 2
}
```

#### 错误响应

**状态码**: `400 Bad Request`

```json
{
  "success": false,
  "error": "username参数不能为空"
}
```

**状态码**: `500 Internal Server Error`

```json
{
  "success": false,
  "error": "服务器错误: 错误详情"
}
```

---

### 1.2 获取对话详情

获取特定对话的完整详细信息，包括所有消息和元数据。

- **URL**: `/api/conversations/<conversation_id>`
- **方法**: `GET`
- **Content-Type**: `application/json`

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（Query参数） |
| conversation_id | string | 是 | 对话ID（URL参数） |

#### 请求示例

```http
GET /api/conversations/conv_1738755600000_a1b2c3d4?username=user001
```

#### 成功响应

**状态码**: `200 OK`

```json
{
  "success": true,
  "conversation": {
    "conversation_id": "conv_1738755600000_a1b2c3d4",
    "username": "user001",
    "title": "销售数据分析对话",
    "messages": [
      {
        "sender": "user001",
        "receiver": "assistant",
        "timestamp": "2025-02-05T14:30:00.123456",
        "content": "帮我分析上个月的销售数据"
      },
      {
        "sender": "assistant",
        "receiver": "user001",
        "timestamp": "2025-02-05T14:30:05.654321",
        "content": "好的，我来为您分析上个月的销售数据..."
      }
    ],
    "generated_files": [],
    "created_at": "2025-02-05T14:30:00.123456",
    "updated_at": "2025-02-05T14:30:05.654321"
  }
}
```

#### 错误响应

**状态码**: `400 Bad Request`

```json
{
  "success": false,
  "error": "username参数不能为空"
}
```

**状态码**: `403 Forbidden`

```json
{
  "success": false,
  "error": "无权访问此对话"
}
```

**状态码**: `404 Not Found`

```json
{
  "success": false,
  "error": "对话不存在"
}
```

---

### 1.3 删除对话

永久删除特定的对话记录。

- **URL**: `/api/conversations/<conversation_id>/delete`
- **方法**: `GET`
- **Content-Type**: `application/json`

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（Query参数） |
| conversation_id | string | 是 | 对话ID（URL参数） |

#### 请求示例

```http
GET /api/conversations/conv_1738755600000_a1b2c3d4/delete?username=user001
```

#### 成功响应

**状态码**: `200 OK`

```json
{
  "success": true,
  "message": "对话已成功删除"
}
```

#### 错误响应

**状态码**: `400 Bad Request`

```json
{
  "success": false,
  "error": "username参数不能为空"
}
```

**状态码**: `403 Forbidden`

```json
{
  "success": false,
  "error": "无权删除此对话"
}
```

**状态码**: `404 Not Found`

```json
{
  "success": false,
  "error": "对话不存在"
}
```

---

### 1.4 更新对话标题

修改现有对话的标题。

- **URL**: `/api/conversations/<conversation_id>/title`
- **方法**: `POST`
- **Content-Type**: `application/json`

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| conversation_id | string | 是 | 对话ID（URL参数） |
| username | string | 是 | 用户名（Body参数） |
| title | string | 是 | 新标题（Body参数），1-200字符 |

#### 请求示例

```http
POST /api/conversations/conv_1738755600000_a1b2c3d4/title
Content-Type: application/json

{
  "username": "user001",
  "title": "新的对话标题"
}
```

#### 成功响应

**状态码**: `200 OK`

```json
{
  "success": true,
  "message": "标题更新成功",
  "conversation": {
    "conversation_id": "conv_1738755600000_a1b2c3d4",
    "username": "user001",
    "title": "新的对话标题",
    "messages": [...],
    "generated_files": [],
    "created_at": "2025-02-05T14:30:00.123456",
    "updated_at": "2025-02-05T15:00:00.789012"
  }
}
```

#### 错误响应

**状态码**: `400 Bad Request`

```json
{
  "success": false,
  "error": "username不能为空"
}
```

```json
{
  "success": false,
  "error": "title不能为空"
}
```

```json
{
  "success": false,
  "error": "title长度不能超过200字符"
}
```

**状态码**: `403 Forbidden`

```json
{
  "success": false,
  "error": "无权修改此对话"
}
```

**状态码**: `404 Not Found`

```json
{
  "success": false,
  "error": "对话不存在"
}
```

---

## 2. 聊天 API

### 2.1 发送聊天消息（流式响应）

发送消息给AI助手并获取流式响应。如果提供了conversation_id和title，对话将在完成后自动保存。

- **URL**: `/api/chat/completions`
- **方法**: `POST`
- **Content-Type**: `application/json`
- **响应类型**: `text/event-stream` (SSE)

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| messages | array | 是 | 消息列表，包含角色和内容 |
| username | string | 否 | 用户名 |
| conversation_id | string | 否 | 对话ID（用于保存对话） |
| title | string | 否 | 对话标题（用于保存对话） |

#### 消息格式

```json
{
  "role": "user" | "assistant",
  "content": "消息内容"
}
```

#### 请求示例

**普通聊天（不保存）:**

```http
POST /api/chat/completions
Content-Type: application/json

{
  "username": "user001",
  "messages": [
    {"role": "user", "content": "你好"}
  ]
}
```

**保存新对话:**

```http
POST /api/chat/completions
Content-Type: application/json

{
  "username": "user001",
  "conversation_id": "conv_1738755600000_a1b2c3d4",
  "title": "销售数据分析",
  "messages": [
    {"role": "user", "content": "帮我分析销售数据"}
  ]
}
```

**继续现有对话:**

```http
POST /api/chat/completions
Content-Type: application/json

{
  "username": "user001",
  "conversation_id": "conv_1738755600000_a1b2c3d4",
  "title": "销售数据分析",
  "messages": [
    {"role": "user", "content": "帮我分析销售数据"},
    {"role": "assistant", "content": "好的，我来为您分析..."},
    {"role": "user", "content": "再详细一点"}
  ]
}
```

#### 成功响应（SSE流）

**Content-Type**: `text/event-stream`

```
data: {"id": "chatcmpl-a1b2c3d4e5f6", "object": "chat.completion.chunk", "created": 1738755600, "model": "deepseek-chat", "choices": [{"index": 0, "delta": {"role": "assistant"}, "finish_reason": null}]}

data: {"id": "chatcmpl-a1b2c3d4e5f6", "object": "chat.completion.chunk", "created": 1738755600, "model": "deepseek-chat", "choices": [{"index": 0, "delta": {"content": "好的"}, "finish_reason": null}]}

data: {"id": "chatcmpl-a1b2c3d4e5f6", "object": "chat.completion.chunk", "created": 1738755600, "model": "deepseek-chat", "choices": [{"index": 0, "delta": {"content": "，"}, "finish_reason": null}]}

data: {"id": "chatcmpl-a1b2c3d4e5f6", "object": "chat.completion.chunk", "created": 1738755600, "model": "deepseek-chat", "choices": [{"index": 0, "delta": {"content": "我来"}, "finish_reason": null}]}

data: {"id": "chatcmpl-a1b2c3d4e5f6", "object": "chat.completion.chunk", "created": 1738755600, "model": "deepseek-chat", "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}]}

data: [DONE]

```

#### 错误响应

**状态码**: `400 Bad Request`

```json
{
  "error": "Request body is required"
}
```

**状态码**: `500 Internal Server Error`

```json
{
  "error": "Server error: 错误详情"
}
```

---

## 3. 健康检查 API

### 3.1 服务健康检查

检查API服务是否正常运行。

- **URL**: `/health`
- **方法**: `GET`

#### 请求示例

```http
GET /health
```

#### 成功响应

**状态码**: `200 OK`

```json
{
  "status": "healthy",
  "service": "data-agent-api"
}
```

---

## 4. 前端集成示例

### 4.1 JavaScript/Fetch API 示例

#### 获取用户对话列表

```javascript
async function getUserConversations(username) {
  const response = await fetch(`/api/conversations?username=${encodeURIComponent(username)}`);
  const data = await response.json();
  
  if (data.success) {
    console.log('对话列表:', data.conversations);
    return data.conversations;
  } else {
    console.error('获取失败:', data.error);
    throw new Error(data.error);
  }
}
```

#### 获取对话详情

```javascript
async function getConversationDetail(conversationId, username) {
  const response = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}?username=${encodeURIComponent(username)}`
  );
  const data = await response.json();
  
  if (data.success) {
    console.log('对话详情:', data.conversation);
    return data.conversation;
  } else {
    console.error('获取失败:', data.error);
    throw new Error(data.error);
  }
}
```

#### 删除对话

```javascript
async function deleteConversation(conversationId, username) {
  const response = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/delete?username=${encodeURIComponent(username)}`
  );
  const data = await response.json();
  
  if (data.success) {
    console.log('删除成功:', data.message);
    return true;
  } else {
    console.error('删除失败:', data.error);
    throw new Error(data.error);
  }
}
```

#### 更新对话标题

```javascript
async function updateConversationTitle(conversationId, username, newTitle) {
  const response = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/title`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        title: newTitle
      })
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    console.log('标题更新成功:', data.conversation);
    return data.conversation;
  } else {
    console.error('更新失败:', data.error);
    throw new Error(data.error);
  }
}
```

#### 发送聊天消息（SSE流式响应）

```javascript
async function sendChatMessage(messages, username, conversationId, title) {
  const response = await fetch('/api/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      conversation_id: conversationId,
      title: title,
      messages: messages
    })
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        
        if (data === '[DONE]') {
          console.log('流式响应完成');
          return fullContent;
        }
        
        try {
          const parsed = JSON.parse(data);
          
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          
          if (parsed.choices && parsed.choices[0].delta.content) {
            const content = parsed.choices[0].delta.content;
            fullContent += content;
            // 实时更新UI
            updateChatUI(content);
          }
        } catch (e) {
          console.error('解析错误:', e);
        }
      }
    }
  }
  
  return fullContent;
}

// 使用示例
const messages = [
  { role: 'user', content: '帮我分析销售数据' }
];

sendChatMessage(
  messages,
  'user001',
  'conv_1738755600000_a1b2c3d4',
  '销售数据分析'
).then(response => {
  console.log('完整响应:', response);
});
```

---

### 4.2 React 组件示例

```jsx
import React, { useState, useEffect } from 'react';

// 对话列表组件
function ConversationList({ username, onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/conversations?username=${encodeURIComponent(username)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConversations(data.conversations);
        }
        setLoading(false);
      });
  }, [username]);

  if (loading) return <div>加载中...</div>;

  return (
    <div className="conversation-list">
      {conversations.map(conv => (
        <div
          key={conv.conversation_id}
          className="conversation-item"
          onClick={() => onSelectConversation(conv.conversation_id)}
        >
          <h4>{conv.title}</h4>
          <small>{conv.conversation_id}</small>
        </div>
      ))}
    </div>
  );
}

// 聊天组件
function ChatComponent({ username, conversationId, title }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    const response = await fetch('/api/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        conversation_id: conversationId,
        title,
        messages: newMessages
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.choices?.[0]?.delta?.content) {
              assistantContent += parsed.choices[0].delta.content;
              setMessages([
                ...newMessages,
                { role: 'assistant', content: assistantContent }
              ]);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }

    setStreaming(false);
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          disabled={streaming}
        />
        <button onClick={sendMessage} disabled={streaming}>
          发送
        </button>
      </div>
    </div>
  );
}

export { ConversationList, ChatComponent };
```

---

### 4.3 Vue 3 组合式API示例

```vue
<template>
  <div class="conversation-manager">
    <div class="conversation-list">
      <div
        v-for="conv in conversations"
        :key="conv.conversation_id"
        class="conversation-item"
        @click="selectConversation(conv.conversation_id)"
      >
        <h4>{{ conv.title }}</h4>
      </div>
    </div>
    
    <div class="chat-area" v-if="currentConversation">
      <div class="messages">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="['message', msg.role]"
        >
          {{ msg.content }}
        </div>
      </div>
      
      <div class="input-area">
        <input
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          :disabled="streaming"
        />
        <button @click="sendMessage" :disabled="streaming">
          {{ streaming ? '发送中...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  username: String
});

const conversations = ref([]);
const currentConversation = ref(null);
const messages = ref([]);
const inputMessage = ref('');
const streaming = ref(false);

// 获取对话列表
const fetchConversations = async () => {
  const response = await fetch(
    `/api/conversations?username=${encodeURIComponent(props.username)}`
  );
  const data = await response.json();
  if (data.success) {
    conversations.value = data.conversations;
  }
};

// 获取对话详情
const selectConversation = async (conversationId) => {
  const response = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}?username=${encodeURIComponent(props.username)}`
  );
  const data = await response.json();
  if (data.success) {
    currentConversation.value = data.conversation;
    // 转换消息格式
    messages.value = data.conversation.messages.map(msg => ({
      role: msg.sender === props.username ? 'user' : 'assistant',
      content: msg.content
    }));
  }
};

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;

  const newMessages = [
    ...messages.value,
    { role: 'user', content: inputMessage.value }
  ];
  messages.value = newMessages;
  streaming.value = true;

  const response = await fetch('/api/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: props.username,
      conversation_id: currentConversation.value?.conversation_id,
      title: currentConversation.value?.title,
      messages: newMessages
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let assistantContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.choices?.[0]?.delta?.content) {
            assistantContent += parsed.choices[0].delta.content;
            messages.value = [
              ...newMessages,
              { role: 'assistant', content: assistantContent }
            ];
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  streaming.value = false;
  inputMessage.value = '';
};

onMounted(fetchConversations);
</script>
```

---

## 5. 错误代码参考

| 状态码 | 含义 | 常见场景 |
|--------|------|----------|
| 200 | 成功 | 请求处理成功 |
| 400 | 请求参数错误 | 缺少必填参数、参数格式错误 |
| 403 | 禁止访问 | 用户无权访问/修改/删除该对话 |
| 404 | 资源不存在 | 对话ID不存在 |
| 500 | 服务器内部错误 | 服务器处理异常 |

---

## 6. 数据模型

### Conversation（对话）

```typescript
interface Conversation {
  conversation_id: string;      // 对话唯一标识
  username: string;             // 所属用户
  title: string;                // 对话标题
  messages: Message[];          // 消息列表
  generated_files: GeneratedFile[];  // 生成的文件列表
  created_at: string;           // 创建时间（ISO格式）
  updated_at: string;           // 更新时间（ISO格式）
}
```

### Message（消息）

```typescript
interface Message {
  sender: string;       // 发送者
  receiver: string;     // 接收者
  timestamp: string;    // 时间戳（ISO格式）
  content: string;      // 消息内容
}
```

### GeneratedFile（生成的文件）

```typescript
interface GeneratedFile {
  filename: string;       // 文件名
  filepath: string;       // 文件路径
  generated_time: string; // 生成时间
  file_type: string;      // 文件类型
}
```

---

## 7. 注意事项

1. **SSE流式响应**: 聊天API使用Server-Sent Events格式返回流式响应，前端需要正确处理SSE格式。

2. **对话保存**: 聊天API只有在同时提供 `username`、`conversation_id` 和 `title` 三个参数时才会保存对话。

3. **用户权限**: 所有对话管理API都会验证用户权限，用户只能访问/修改/删除自己的对话。

4. **标题长度**: 对话标题长度限制为1-200个字符。

5. **CORS**: API已启用CORS，支持跨域请求。
