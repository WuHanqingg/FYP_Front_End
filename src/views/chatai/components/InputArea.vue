<template>
  <div class="input-container">
    <div class="input-wrapper">
      <textarea
        ref="textareaRef"
        v-model="inputValue"
        :disabled="disabled"
        :placeholder="
          disabled ? 'Generating response...' : 'Enter your question...'
        "
        class="input-field"
        rows="1"
        @keydown="handleKeyDown"
        @input="autoResize"
      />
      <button
        v-if="!disabled"
        :disabled="!inputValue.trim()"
        class="send-button"
        title="Send message"
        @click="handleSend"
      >
        <svg class="send-icon" viewBox="0 0 24 24" fill="none">
          <path
            d="M2 12L22 2L12 22L9 13L2 12Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        v-else
        class="stop-button"
        title="Stop generation"
        @click="$emit('stop')"
      >
        <svg class="stop-icon" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";

const props = defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  send: [content: string];
  stop: [];
}>();

const textareaRef = ref<HTMLTextAreaElement>();
const inputValue = ref("");

function autoResize() {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = "auto";
      const newHeight = Math.min(textareaRef.value.scrollHeight, 192);
      textareaRef.value.style.height = `${newHeight}px`;
    }
  });
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
}

function handleSend() {
  const content = inputValue.value.trim();
  if (content && !props.disabled) {
    emit("send", content);
    inputValue.value = "";
    autoResize();
  }
}

watch(
  () => props.disabled,
  newVal => {
    if (!newVal) {
      nextTick(() => {
        textareaRef.value?.focus();
      });
    }
  }
);
</script>

<style scoped>
.input-container {
  padding: 16px;
  background: white;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.input-field {
  flex: 1;
  min-height: 48px;
  max-height: 192px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #3b82f6;
}

.input-field::placeholder {
  color: #9ca3af;
}

.input-field:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.send-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #2563eb;
}

.send-button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.send-icon {
  width: 20px;
  height: 20px;
}

.stop-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  background: #ef4444;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.stop-button:hover {
  background: #dc2626;
}

.stop-icon {
  width: 16px;
  height: 16px;
}
</style>
