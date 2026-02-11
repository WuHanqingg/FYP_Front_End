<template>
  <div ref="chatContainer" class="chat-area" @scroll="handleScroll">
    <!-- 欢迎页面 -->
    <div v-if="messages.length === 0" class="welcome-view">
      <div class="welcome-content">
        <div class="welcome-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2 class="welcome-title">AI Assistant</h2>
        <p class="welcome-subtitle">
          Intelligent analysis and insights for your environmental data
        </p>

        <div class="suggestions-grid">
          <button
            v-for="suggestion in suggestions"
            :key="suggestion"
            class="suggestion-card"
            @click="$emit('send', suggestion)"
          >
            <span class="suggestion-text">{{ suggestion }}</span>
            <svg
              class="suggestion-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div v-else class="messages-view">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-row"
        :class="message.role === 'user' ? 'user-row' : 'assistant-row'"
      >
        <div class="message-avatar">
          <div v-if="message.role === 'user'" class="avatar user-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div v-else class="avatar assistant-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
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
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
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
              class="action-btn"
              title="Copy to clipboard"
              @click="$emit('copy', message.content)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>Copy</span>
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
  "Analyze the data from yesterday",
  "Is it colder or warmer compared to last week?",
  "What was the hottest day of the last year?"
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

<style scoped lang="scss">
.chat-area {
  flex: 1;
  overflow-y: auto;
  background: var(--aero-bg-base);
}

.welcome-view {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;

  @media (max-width: 767px) {
    padding: 24px 16px;
  }
}

.welcome-content {
  max-width: 600px;
  text-align: center;

  @media (max-width: 767px) {
    max-width: 100%;
  }
}

.welcome-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--aero-bg-glass-weak);
  border: 1px solid var(--aero-border-glass);
  border-radius: var(--aero-border-radius-xl);
  color: var(--aero-text-primary);
  box-shadow: var(--aero-shadow-ambient);

  @media (max-width: 767px) {
    width: 60px;
    height: 60px;
    margin: 0 auto 24px;
  }
}

.welcome-icon svg {
  width: 40px;
  height: 40px;

  @media (max-width: 767px) {
    width: 30px;
    height: 30px;
  }
}

.welcome-title {
  font-family: var(--aero-font-display);
  font-size: var(--aero-font-size-3xl);
  font-weight: var(--aero-font-weight-semibold);
  color: var(--aero-text-primary);
  margin: 0 0 16px 0;
  letter-spacing: var(--aero-letter-spacing-tight);

  @media (max-width: 767px) {
    font-size: 24px;
    margin: 0 0 12px 0;
  }
}

.welcome-subtitle {
  font-size: var(--aero-font-size-base);
  color: var(--aero-text-secondary);
  margin: 0 0 48px 0;
  line-height: var(--aero-line-height-relaxed);

  @media (max-width: 767px) {
    font-size: 14px;
    margin: 0 0 32px 0;
  }
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.suggestion-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px;
  background: var(--aero-bg-glass);
  border: 1px solid var(--aero-border-glass);
  border-radius: var(--aero-border-radius-lg);
  cursor: pointer;
  transition: all var(--aero-transition-base);
  text-align: left;
  box-shadow: var(--aero-shadow-ambient);

  @media (max-width: 767px) {
    padding: 16px;
    gap: 10px;
  }

  &:hover {
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: var(--aero-shadow-ambient-strong), var(--aero-shadow-glow-cyan);
    transform: translateY(-2px);
  }
}

.suggestion-text {
  font-size: var(--aero-font-size-sm);
  color: var(--aero-text-primary);
  line-height: var(--aero-line-height-normal);
  font-weight: var(--aero-font-weight-regular);

  @media (max-width: 767px) {
    font-size: 13px;
  }
}

.suggestion-arrow {
  width: 20px;
  height: 20px;
  color: var(--aero-text-tertiary);
  flex-shrink: 0;
  transition: color var(--aero-transition-base);

  @media (max-width: 767px) {
    width: 18px;
    height: 18px;
  }
}

.suggestion-card:hover .suggestion-arrow {
  color: var(--aero-text-primary);
}

.messages-view {
  padding: 32px 24px;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 767px) {
    padding: 20px 16px;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    padding: 24px 20px;
  }
}

.message-row {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 767px) {
    gap: 12px;
    margin-bottom: 24px;
  }
}

.user-row {
  flex-direction: row-reverse;
}

.assistant-row {
  flex-direction: row;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--aero-border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--aero-bg-glass-weak);
  border: 1px solid var(--aero-border-glass);

  @media (max-width: 767px) {
    width: 32px;
    height: 32px;
  }
}

.avatar svg {
  width: 20px;
  height: 20px;

  @media (max-width: 767px) {
    width: 16px;
    height: 16px;
  }
}

.user-avatar {
  color: var(--aero-text-secondary);
}

.assistant-avatar {
  color: var(--aero-text-primary);
}

.message-content-wrapper {
  flex: 1;
  max-width: calc(100% - 56px);

  @media (max-width: 767px) {
    max-width: calc(100% - 44px);
  }
}

.message-bubble {
  padding: 16px 20px;
  border-radius: var(--aero-border-radius-lg);
  position: relative;
  transition: all var(--aero-transition-base);

  @media (max-width: 767px) {
    padding: 12px 16px;
  }
}

.user-bubble {
  background: var(--aero-bg-glass);
  border: 1px solid var(--aero-border-glass);
  margin-left: auto;
  max-width: 80%;

  @media (max-width: 767px) {
    max-width: 90%;
  }
}

.assistant-bubble {
  background: var(--aero-bg-glass-weak);
  border: 1px solid var(--aero-border-glass);
  max-width: 100%;
}

.error-content {
  padding: 12px;
  background: rgba(220, 38, 38, 0.05);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--aero-border-radius-md);

  @media (max-width: 767px) {
    padding: 10px;
  }
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.error-icon {
  width: 20px;
  height: 20px;
  color: #dc2626;

  @media (max-width: 767px) {
    width: 18px;
    height: 18px;
  }
}

.error-title {
  font-size: var(--aero-font-size-sm);
  font-weight: var(--aero-font-weight-semibold);
  color: #dc2626;

  @media (max-width: 767px) {
    font-size: 13px;
  }
}

.error-text {
  font-size: var(--aero-font-size-sm);
  color: var(--aero-text-secondary);
  margin: 0;
  line-height: var(--aero-line-height-normal);

  @media (max-width: 767px) {
    font-size: 13px;
  }
}

.message-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-start;

  @media (max-width: 767px) {
    gap: 6px;
    margin-top: 6px;
  }
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--aero-bg-glass-weak);
  border: 1px solid var(--aero-border-glass);
  border-radius: var(--aero-border-radius-sm);
  color: var(--aero-text-secondary);
  font-size: var(--aero-font-size-xs);
  font-weight: var(--aero-font-weight-medium);
  cursor: pointer;
  transition: all var(--aero-transition-base);

  @media (max-width: 767px) {
    padding: 6px 10px;
    font-size: 11px;
    gap: 4px;
  }

  &:hover {
    background: var(--aero-bg-glass);
    border-color: rgba(0, 212, 255, 0.3);
    color: var(--aero-text-primary);
  }

  svg {
    width: 16px;
    height: 16px;

    @media (max-width: 767px) {
      width: 14px;
      height: 14px;
    }
  }
}

.scroll-anchor {
  height: 1px;
}
</style>
