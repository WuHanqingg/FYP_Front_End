import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
}

export interface GeneratedFile {
  file_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  generated_time: string;
  created_by: string;
  conversation_id: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  generatedFiles: GeneratedFile[];
  createdAt: number;
  updatedAt: number;
}

export const useChatStore = defineStore("chat", () => {
  const conversations = ref<Conversation[]>([]);
  const currentConversationId = ref<string | null>(null);
  const isStreaming = ref(false);
  const currentAbortController = ref<AbortController | null>(null);
  const messageIdCounter = ref(0);

  const currentConversation = computed(() => {
    if (!currentConversationId.value) return null;
    return (
      conversations.value.find(c => c.id === currentConversationId.value) ||
      null
    );
  });

  const currentMessages = computed(() => {
    return currentConversation.value?.messages || [];
  });

  function hasEmptyConversation(): boolean {
    return conversations.value.some(c => c.messages.length === 0);
  }

  function getEmptyConversation(): Conversation | null {
    return conversations.value.find(c => c.messages.length === 0) || null;
  }

  function createConversation(id: string, title?: string) {
    const emptyConversation = getEmptyConversation();
    if (emptyConversation) {
      currentConversationId.value = emptyConversation.id;
      return emptyConversation;
    }

    messageIdCounter.value++;
    const newConversation: Conversation = {
      id,
      title: title || `Analysis ${conversations.value.length + 1}`,
      messages: [],
      generatedFiles: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    conversations.value.unshift(newConversation);
    currentConversationId.value = id;
    return newConversation;
  }

  function loadConversationsFromAPI(
    conversationList: Array<{ conversation_id: string; title: string }>
  ) {
    conversations.value = conversationList.map(conv => ({
      id: conv.conversation_id,
      title: conv.title,
      messages: [],
      generatedFiles: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
  }

  function loadConversationDetail(
    conversationDetail: {
      conversation_id: string;
      username: string;
      title: string;
      messages: Array<{
        sender: string;
        receiver: string;
        timestamp: string;
        content: string;
      }>;
      generated_files: GeneratedFile[];
      created_at: string;
      updated_at: string;
    },
    currentUsername: string
  ) {
    const existingIndex = conversations.value.findIndex(
      c => c.id === conversationDetail.conversation_id
    );

    const messages: Message[] = conversationDetail.messages.map((msg, idx) => ({
      id: `${conversationDetail.conversation_id}-${idx}`,
      role: msg.sender === currentUsername ? "user" : "assistant",
      content: msg.content,
      timestamp: new Date(msg.timestamp).getTime()
    }));

    const generatedFiles: GeneratedFile[] =
      conversationDetail.generated_files || [];

    const conversation: Conversation = {
      id: conversationDetail.conversation_id,
      title: conversationDetail.title,
      messages,
      generatedFiles,
      createdAt: new Date(conversationDetail.created_at).getTime(),
      updatedAt: new Date(conversationDetail.updated_at).getTime()
    };

    if (existingIndex !== -1) {
      conversations.value[existingIndex] = conversation;
    } else {
      conversations.value.unshift(conversation);
    }

    currentConversationId.value = conversationDetail.conversation_id;
  }

  function deleteConversation(id: string) {
    const index = conversations.value.findIndex(c => c.id === id);
    if (index !== -1) {
      conversations.value.splice(index, 1);
      if (currentConversationId.value === id) {
        currentConversationId.value = conversations.value[0]?.id || null;
      }
    }
  }

  function renameConversation(id: string, newTitle: string) {
    const conversation = conversations.value.find(c => c.id === id);
    if (conversation) {
      conversation.title = newTitle;
      conversation.updatedAt = Date.now();
    }
  }

  function addMessage(message: Omit<Message, "id" | "timestamp">) {
    const conversation = currentConversation.value;
    if (!conversation) return null;

    messageIdCounter.value++;
    const newMessage: Message = {
      ...message,
      id: `${Date.now()}-${messageIdCounter.value}`,
      timestamp: Date.now()
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = Date.now();
    return newMessage;
  }

  function updateMessage(messageId: string, updates: Partial<Message>) {
    const conversation = currentConversation.value;
    if (!conversation) return;

    const message = conversation.messages.find(m => m.id === messageId);
    if (message) {
      Object.assign(message, updates);
      conversation.updatedAt = Date.now();
    }
  }

  function deleteMessage(messageId: string) {
    const conversation = currentConversation.value;
    if (!conversation) return;

    const index = conversation.messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      conversation.messages.splice(index, 1);
      conversation.updatedAt = Date.now();
    }
  }

  function regenerateLastResponse() {
    const conversation = currentConversation.value;
    if (!conversation || conversation.messages.length < 2) return null;

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (lastMessage.role === "assistant") {
      conversation.messages.pop();
      return conversation.messages[conversation.messages.length - 1];
    }
    return null;
  }

  function setStreaming(streaming: boolean) {
    isStreaming.value = streaming;
  }

  function setAbortController(controller: AbortController | null) {
    currentAbortController.value = controller;
  }

  function abortCurrentRequest() {
    if (currentAbortController.value) {
      currentAbortController.value.abort();
      currentAbortController.value = null;
      setStreaming(false);
    }
  }

  function clearAllConversations() {
    conversations.value = [];
    currentConversationId.value = null;
  }

  function switchConversation(id: string) {
    if (conversations.value.find(c => c.id === id)) {
      currentConversationId.value = id;
    }
  }

  return {
    conversations,
    currentConversationId,
    currentConversation,
    currentMessages,
    isStreaming,
    createConversation,
    loadConversationsFromAPI,
    loadConversationDetail,
    deleteConversation,
    renameConversation,
    addMessage,
    updateMessage,
    deleteMessage,
    regenerateLastResponse,
    setStreaming,
    setAbortController,
    abortCurrentRequest,
    clearAllConversations,
    switchConversation
  };
});
