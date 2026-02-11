<template>
  <div class="chat-container h-screen flex flex-col bg-white dark:bg-gray-900">
    <Navbar @toggle-sidebar="toggleSidebar" />

    <div class="flex-1 flex overflow-hidden">
      <Sidebar
        :conversations="chatStore.conversations"
        :current-id="chatStore.currentConversationId"
        :class="{ 'sidebar-open': sidebarOpen }"
        @select="selectConversation"
        @create="createNewConversation"
        @delete="deleteConversation"
        @rename="renameConversation"
        @close="toggleSidebar"
      />

      <div
        class="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 main-content"
        :class="{ 'sidebar-open': sidebarOpen }"
      >
        <ChatArea
          :messages="chatStore.currentMessages"
          :generated-files="chatStore.currentConversation?.generatedFiles || []"
          :conversation-id="chatStore.currentConversationId || ''"
          :is-streaming="chatStore.isStreaming"
          :auto-scroll="autoScroll"
          @scroll="handleScroll"
          @copy="copyMessage"
          @regenerate="regenerateResponse"
          @delete="deleteMessage"
          @send="sendMessage"
        />

        <InputArea
          :disabled="chatStore.isStreaming"
          @send="sendMessage"
          @stop="stopGeneration"
        />
      </div>
    </div>

    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="toggleSidebar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useChatStore } from "@/store/modules/chat";
import { chatAPI } from "@/api/chat";
import { message } from "@/utils/message";
import { storageLocal } from "@pureadmin/utils";
import { userKey } from "@/utils/auth";
import Navbar from "./components/Navbar.vue";
import Sidebar from "./components/Sidebar.vue";
import ChatArea from "./components/ChatArea.vue";
import InputArea from "./components/InputArea.vue";

const chatStore = useChatStore();
const autoScroll = ref(true);
const sidebarOpen = ref(false);

function getUsername(): string {
  const userInfo = storageLocal().getItem(userKey);
  return userInfo?.username || "";
}

async function fetchConversations() {
  const username = getUsername();
  if (!username) {
    message("Please log in to access conversations", { type: "warning" });
    return;
  }

  try {
    const conversations = await chatAPI.getUserConversations(username);
    chatStore.loadConversationsFromAPI(conversations);

    if (conversations.length > 0 && !chatStore.currentConversationId) {
      chatStore.switchConversation(conversations[0].conversation_id);
      await loadConversationDetail(conversations[0].conversation_id);
    }
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    message("Failed to load conversations. Please try again.", { type: "error" });
  }
}

async function loadConversationDetail(conversationId: string) {
  const username = getUsername();
  if (!username) return;

  try {
    const detail = await chatAPI.getConversationDetail(conversationId, username);
    chatStore.loadConversationDetail(detail, username);
  } catch (error) {
    console.error("Failed to load conversation detail:", error);
    message("Failed to load conversation messages", { type: "error" });
  }
}

onMounted(() => {
  fetchConversations();
});

onUnmounted(() => {
  chatStore.abortCurrentRequest();
});

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

async function selectConversation(id: string) {
  chatStore.switchConversation(id);
  await loadConversationDetail(id);
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false;
  }
}

function createNewConversation() {
  const conversationId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  chatStore.createConversation(conversationId, "New Analysis");
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false;
  }
}

async function deleteConversation(id: string) {
  const username = getUsername();
  if (!username) {
    message("Please log in to delete conversations", { type: "warning" });
    return;
  }

  try {
    await chatAPI.deleteConversation(id, username);
    chatStore.deleteConversation(id);
    message("Conversation deleted successfully", { type: "success" });
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    message("Failed to delete conversation. Please try again.", { type: "error" });
  }
}

async function renameConversation(id: string, newTitle: string) {
  const username = getUsername();
  if (!username) {
    message("Please log in to rename conversations", { type: "warning" });
    return;
  }

  try {
    await chatAPI.updateConversationTitle(id, username, newTitle);
    chatStore.renameConversation(id, newTitle);
    message("Conversation renamed successfully", { type: "success" });
  } catch (error) {
    console.error("Failed to rename conversation:", error);
    message("Failed to rename conversation. Please try again.", { type: "error" });
  }
}

async function sendMessage(content: string) {
  if (!content.trim()) return;

  const trimmedContent = content.trim();
  let title: string | undefined;
  let conversationId: string | undefined;

  if (!chatStore.currentConversationId) {
    conversationId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    title = trimmedContent.substring(0, 20);
    chatStore.createConversation(conversationId, title);
  } else {
    conversationId = chatStore.currentConversationId;
    title = chatStore.currentConversation?.title;
  }

  chatStore.addMessage({
    role: "user",
    content: trimmedContent
  });

  const abortController = new AbortController();
  chatStore.setAbortController(abortController);
  chatStore.setStreaming(true);
  autoScroll.value = true;

  const assistantMessage = chatStore.addMessage({
    role: "assistant",
    content: "",
    isStreaming: true
  });

  if (!assistantMessage) {
    chatStore.setStreaming(false);
    return;
  }

  let fullContent = "";

  try {
    await chatAPI.sendMessage(
      chatStore.currentMessages.slice(0, -1),
      (chunk: string) => {
        fullContent += chunk;
        chatStore.updateMessage(assistantMessage.id, {
          content: fullContent
        });
      },
      async () => {
        chatStore.updateMessage(assistantMessage.id, {
          isStreaming: false
        });
        chatStore.setStreaming(false);
        chatStore.setAbortController(null);
        if (conversationId) {
          await loadConversationDetail(conversationId);
        }
      },
      (error: Error) => {
        chatStore.updateMessage(assistantMessage.id, {
          isStreaming: false,
          error: error.message
        });
        chatStore.setStreaming(false);
        chatStore.setAbortController(null);
        message(`Error: ${error.message}`, { type: "error" });
      },
      abortController,
      conversationId,
      title
    );
  } catch (error) {
    chatStore.updateMessage(assistantMessage.id, {
      isStreaming: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    chatStore.setStreaming(false);
    chatStore.setAbortController(null);
    message("Failed to send message. Please try again.", { type: "error" });
  }
}

function stopGeneration() {
  chatStore.abortCurrentRequest();
  message("Generation stopped", { type: "info" });
}

function copyMessage(content: string) {
  navigator.clipboard
    .writeText(content)
    .then(() => {
      message("Copied to clipboard", { type: "success" });
    })
    .catch(() => {
      message("Failed to copy", { type: "error" });
    });
}

async function regenerateResponse(messageId: string) {
  const lastUserMessage = chatStore.regenerateLastResponse();
  if (!lastUserMessage) {
    message("No message to regenerate", { type: "warning" });
    return;
  }

  await sendMessage(lastUserMessage.content);
}

function deleteMessage(messageId: string) {
  chatStore.deleteMessage(messageId);
  message("Message deleted", { type: "success" });
}

function handleScroll({
  scrollTop,
  scrollHeight,
  clientHeight
}: {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}) {
  const threshold = 100;
  autoScroll.value = scrollHeight - scrollTop - clientHeight < threshold;
}
</script>

<style scoped>
.chat-container {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
}

.sidebar-overlay {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(0);
  -webkit-backdrop-filter: blur(0);

  &.sidebar-open {
    opacity: 1;
    visibility: visible;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  @media (min-width: 1024px) {
    display: none;
  }
}

.main-content {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1023px) {
    &.sidebar-open {
      transform: translateX(280px);
    }
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    &.sidebar-open {
      transform: translateX(240px);
    }
  }
}

.sidebar {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;

  @media (max-width: 1023px) {
    box-shadow: none;

    &.sidebar-open {
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
