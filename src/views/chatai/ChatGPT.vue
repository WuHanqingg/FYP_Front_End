<template>
  <div class="chat-container h-screen flex flex-col bg-white dark:bg-gray-900">
    <Navbar />

    <div class="flex-1 flex overflow-hidden">
      <Sidebar
        :conversations="chatStore.conversations"
        :current-id="chatStore.currentConversationId"
        @select="selectConversation"
        @create="createNewConversation"
        @delete="deleteConversation"
        @rename="renameConversation"
      />

      <div class="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900">
        <ChatArea
          :messages="chatStore.currentMessages"
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useChatStore } from "@/store/modules/chat";
import { chatAPI } from "@/api/chat";
import { message } from "@/utils/message";
import Navbar from "./components/Navbar.vue";
import Sidebar from "./components/Sidebar.vue";
import ChatArea from "./components/ChatArea.vue";
import InputArea from "./components/InputArea.vue";

const chatStore = useChatStore();
const autoScroll = ref(true);
onMounted(() => {
  if (!chatStore.currentConversationId) {
    chatStore.createConversation("New Conversation");
  }
});

onUnmounted(() => {
  chatStore.abortCurrentRequest();
});

function selectConversation(id: string) {
  chatStore.switchConversation(id);
}

function createNewConversation() {
  chatStore.createConversation("New Analysis");
}

function deleteConversation(id: string) {
  chatStore.deleteConversation(id);
}

function renameConversation(id: string, newTitle: string) {
  chatStore.renameConversation(id, newTitle);
}

async function sendMessage(content: string) {
  if (!content.trim()) return;

  if (!chatStore.currentConversationId) {
    chatStore.createConversation("New Analysis");
  }

  chatStore.addMessage({
    role: "user",
    content: content.trim()
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
      () => {
        chatStore.updateMessage(assistantMessage.id, {
          isStreaming: false
        });
        chatStore.setStreaming(false);
        chatStore.setAbortController(null);
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
      abortController
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
</style>
