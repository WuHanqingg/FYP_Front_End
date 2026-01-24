import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { storageLocal } from "../utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
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

  const STORAGE_KEY = "ai-data-analysis-conversations";

  function loadFromStorage() {
    const stored = storageLocal().getItem<Conversation[]>(STORAGE_KEY);
    if (stored) {
      conversations.value = stored;
      if (conversations.value.length > 0 && !currentConversationId.value) {
        currentConversationId.value = conversations.value[0].id;
      }
    }
  }

  function saveToStorage() {
    storageLocal().setItem(STORAGE_KEY, conversations.value);
  }

  function createConversation(title?: string) {
    messageIdCounter.value++;
    const id = `${Date.now()}-${messageIdCounter.value}`;
    const newConversation: Conversation = {
      id,
      title: title || `Analysis ${conversations.value.length + 1}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    conversations.value.unshift(newConversation);
    currentConversationId.value = id;
    saveToStorage();
    return newConversation;
  }

  function deleteConversation(id: string) {
    const index = conversations.value.findIndex(c => c.id === id);
    if (index !== -1) {
      conversations.value.splice(index, 1);
      if (currentConversationId.value === id) {
        currentConversationId.value = conversations.value[0]?.id || null;
      }
      saveToStorage();
    }
  }

  function renameConversation(id: string, newTitle: string) {
    const conversation = conversations.value.find(c => c.id === id);
    if (conversation) {
      conversation.title = newTitle;
      conversation.updatedAt = Date.now();
      saveToStorage();
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
    saveToStorage();
    return newMessage;
  }

  function updateMessage(messageId: string, updates: Partial<Message>) {
    const conversation = currentConversation.value;
    if (!conversation) return;

    const message = conversation.messages.find(m => m.id === messageId);
    if (message) {
      Object.assign(message, updates);
      conversation.updatedAt = Date.now();
      saveToStorage();
    }
  }

  function deleteMessage(messageId: string) {
    const conversation = currentConversation.value;
    if (!conversation) return;

    const index = conversation.messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      conversation.messages.splice(index, 1);
      conversation.updatedAt = Date.now();
      saveToStorage();
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
    saveToStorage();
  }

  function switchConversation(id: string) {
    if (conversations.value.find(c => c.id === id)) {
      currentConversationId.value = id;
    }
  }

  loadFromStorage();

  return {
    conversations,
    currentConversationId,
    currentConversation,
    currentMessages,
    isStreaming,
    createConversation,
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
