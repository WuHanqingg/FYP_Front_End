<template>
  <div
    ref="chatContainer"
    class="flex-1 overflow-y-auto bg-white dark:bg-gray-900"
    @scroll="handleScroll"
  >
    <div v-if="messages.length === 0" class="welcome-container">
      <h2 class="welcome-title">AI Assistant</h2>
      <p class="welcome-subtitle">
        Please enter your question, and I'll help you.
      </p>
      <div class="suggestions-grid">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          class="suggestion-button"
          @click="$emit('send', suggestion)"
        >
          <span class="suggestion-text">{{ suggestion }}</span>
        </button>
      </div>
    </div>

    <div v-else class="messages-container">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-wrapper"
        :class="message.role === 'user' ? 'user-message' : 'assistant-message'"
      >
        <div class="message-avatar">
          <svg
            v-if="message.role === 'user'"
            class="avatar-icon user-avatar"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle
              cx="12"
              cy="7"
              r="4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg
            v-else
            class="avatar-icon assistant-avatar"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="message-content-wrapper">
          <div
            class="message-bubble"
            :class="
              message.role === 'user' ? 'user-bubble' : 'assistant-bubble'
            "
          >
            <div v-if="message.error" class="error-content">
              <div class="error-header">
                <svg
                  class="error-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="error-title">Error</span>
              </div>
              <p class="error-text">{{ message.error }}</p>
            </div>
            <div v-else>
              <MessageContent
                :content="message.content"
                :is-streaming="message.isStreaming"
              />
            </div>
          </div>

          <div
            v-if="message.role === 'assistant' && !message.isStreaming"
            class="message-actions"
          >
            <button
              class="action-button"
              title="Copy"
              @click="$emit('copy', message.content)"
            >
              <svg
                class="action-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div ref="scrollAnchor" class="scroll-anchor" />

      <FileList
        v-if="generatedFiles.length > 0"
        :files="generatedFiles"
        :conversation-id="conversationId"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import type { Message, GeneratedFile } from "@/store/modules/chat";
import MessageContent from "./MessageContent.vue";
import FileList from "./FileList.vue";

const props = defineProps<{
  messages: Message[];
  generatedFiles: GeneratedFile[];
  conversationId: string;
  isStreaming: boolean;
  autoScroll: boolean;
}>();

const emit = defineEmits<{
  scroll: [
    data: { scrollTop: number; scrollHeight: number; clientHeight: number }
  ];
  copy: [content: string];
  regenerate: [id: string];
  delete: [id: string];
  send: [content: string];
}>();

const chatContainer = ref<HTMLElement>();
const scrollAnchor = ref<HTMLElement>();

const suggestions = [
  "How is the weather today?",
  "Analyze the data yesterday.",
  "Is it colder or warmer compared to last week?",
  "What is the hottest day of the last year?"
];

function handleScroll() {
  if (!chatContainer.value) return;
  emit("scroll", {
    scrollTop: chatContainer.value.scrollTop,
    scrollHeight: chatContainer.value.scrollHeight,
    clientHeight: chatContainer.value.clientHeight
  });
}

function scrollToBottom() {
  nextTick(() => {
    if (scrollAnchor.value && props.autoScroll) {
      scrollAnchor.value.scrollIntoView({ behavior: "smooth" });
    }
  });
}

watch(() => props.messages.length, scrollToBottom);
watch(
  () => props.isStreaming,
  () => {
    if (props.isStreaming) {
      scrollToBottom();
    }
  }
);
</script>

<style>
/* Global font settings */
:root {
  --primary-font:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 20px;
  --line-height-base: 1.6;
  --line-height-tight: 1.3;
  --letter-spacing-base: 0.02em;
  --text-color-primary: #333333;
  --text-color-secondary: #666666;
  --text-color-tertiary: #999999;
  --background-color: #ffffff;
  --border-color: #e5e7eb;
  --hover-color: #f3f4f6;
  --accent-color: #3b82f6;
  --suggestion-bg: #f8f9fa;
  --suggestion-hover-bg: #e9ecef;
  --assistant-bubble-bg: #f0f2f5;
}

/* Dark mode adaptation */
@media (prefers-color-scheme: dark) {
  :root {
    --text-color-primary: #ffffff;
    --text-color-secondary: #d1d5db;
    --text-color-tertiary: #9ca3af;
    --background-color: #111827;
    --border-color: #374151;
    --hover-color: #1f2937;
    --suggestion-bg: #1f2937;
    --suggestion-hover-bg: #374151;
    --assistant-bubble-bg: #1e293b;
  }

  .user-avatar {
    color: #60a5fa;
    background-color: #1e3a5f;
  }

  .assistant-avatar {
    color: #34d399;
    background-color: #064e3b;
  }
}
</style>

<style scoped>
/* Welcome page styles */
.welcome-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  background-color: var(--background-color);
}

.welcome-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-color-primary);
  margin-bottom: 1rem;
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-base);
}

.welcome-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-color-secondary);
  max-width: 400px;
  margin-bottom: 2.5rem;
  line-height: var(--line-height-base);
  letter-spacing: var(--letter-spacing-base);
  padding: 0 1rem;
}

/* Suggestion list styles */
.suggestions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  max-width: 700px;
  width: 100%;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .suggestions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

.suggestion-button {
  background-color: var(--suggestion-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  display: flex;
  align-items: center;
}

.suggestion-button:hover {
  background-color: var(--suggestion-hover-bg);
  border-color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.suggestion-text {
  font-size: var(--font-size-base);
  color: var(--text-color-primary);
  line-height: var(--line-height-base);
  letter-spacing: var(--letter-spacing-base);
  font-weight: 400;
  word-break: break-word;
}

/* Message container styles */
.messages-container {
  padding: 1.5rem;
  background-color: var(--background-color);
}

/* Message wrapper */
.message-wrapper {
  margin-bottom: 1.5rem;
  display: flex;
  width: 100%;
  gap: 0.75rem;
}

.user-message {
  justify-content: flex-end;
}

.assistant-message {
  justify-content: flex-start;
}

.message-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-message .message-avatar {
  order: 2;
}

.assistant-message .message-avatar {
  order: 1;
}

.avatar-icon {
  width: 20px;
  height: 20px;
}

.user-avatar {
  color: #3b82f6;
  background-color: #eff6ff;
}

.assistant-avatar {
  color: #10b981;
  background-color: #ecfdf5;
}

.message-content-wrapper {
  max-width: 85%;
  display: flex;
  flex-direction: column;
}

.user-message .message-content-wrapper {
  align-items: flex-end;
  order: 1;
}

.assistant-message .message-content-wrapper {
  align-items: flex-start;
  order: 2;
}

/* Message bubble */
.message-bubble {
  padding: 1rem 1.25rem;
  border-radius: 8px;
  line-height: var(--line-height-base);
  letter-spacing: var(--letter-spacing-base);
  word-wrap: break-word;
  font-size: var(--font-size-base);
}

.user-bubble {
  background-color: var(--accent-color);
  color: white;
  border-bottom-right-radius: 0;
}

.assistant-bubble {
  background-color: var(--assistant-bubble-bg);
  color: var(--text-color-primary);
  border-bottom-left-radius: 0;
}

/* Error message styles */
.error-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.error-icon {
  width: 18px;
  height: 18px;
}

.error-title {
  font-size: var(--font-size-sm);
}

.error-text {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-base);
}

/* Message action buttons */
.message-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.action-button {
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-color-tertiary);
}

.action-button:hover {
  background-color: var(--hover-color);
  color: var(--text-color-secondary);
}

.action-icon {
  width: 16px;
  height: 16px;
}

/* Scroll anchor */
.scroll-anchor {
  height: 2rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .suggestions-grid {
    padding: 0 0.5rem;
  }

  .suggestion-button {
    padding: 1rem 1.25rem;
  }

  .suggestion-text {
    font-size: var(--font-size-sm);
  }

  .messages-container {
    padding: 1rem;
  }

  .message-content-wrapper {
    max-width: 90%;
  }

  .message-bubble {
    padding: 0.875rem 1rem;
    font-size: var(--font-size-sm);
  }

  .message-avatar {
    width: 32px;
    height: 32px;
  }

  .avatar-icon {
    width: 18px;
    height: 18px;
  }

  .welcome-container {
    padding: 1.5rem 1rem;
  }

  .welcome-title {
    font-size: var(--font-size-base);
  }

  .welcome-subtitle {
    font-size: var(--font-size-sm);
    margin-bottom: 2rem;
  }
}
</style>
