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

<style scoped lang="scss">
.input-container {
  padding: 20px;
  background: var(--aero-bg-glass);
  border-top: 1px solid var(--aero-border-glass);
  backdrop-filter: blur(var(--aero-glass-blur));
  -webkit-backdrop-filter: blur(var(--aero-glass-blur));

  @media (max-width: 767px) {
    padding: 16px;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 767px) {
    gap: 10px;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    max-width: 700px;
  }
}

.input-field {
  flex: 1;
  min-height: 52px;
  max-height: 192px;
  padding: 14px 16px;
  border: 1px solid var(--aero-border-glass);
  border-radius: var(--aero-border-radius-lg);
  background: var(--aero-bg-glass-weak);
  color: var(--aero-text-primary);
  font-family: var(--aero-font-body);
  font-size: var(--aero-font-size-base);
  line-height: var(--aero-line-height-normal);
  resize: none;
  outline: none;
  transition: all var(--aero-transition-base);
  box-shadow: var(--aero-shadow-ambient);

  @media (max-width: 767px) {
    min-height: 48px;
    padding: 12px 14px;
    font-size: 14px;
  }

  &:focus {
    border-color: rgba(0, 212, 255, 0.6);
    box-shadow: var(--aero-shadow-ambient), 0 0 0 3px rgba(0, 212, 255, 0.1);
  }

  &::placeholder {
    color: var(--aero-text-tertiary);
  }

  &:disabled {
    background: rgba(0, 20, 40, 0.02);
    cursor: not-allowed;
    opacity: var(--aero-opacity-disabled);
  }
}

.send-button {
  width: 52px;
  height: 52px;
  border: none;
  border-radius: var(--aero-border-radius-lg);
  background: var(--aero-gradient-cyan);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--aero-transition-base);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
  flex-shrink: 0;

  @media (max-width: 767px) {
    width: 48px;
    height: 48px;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 212, 255, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: var(--aero-text-tertiary);
    cursor: not-allowed;
    opacity: var(--aero-opacity-disabled);
    box-shadow: none;
  }
}

.send-icon {
  width: 22px;
  height: 22px;

  @media (max-width: 767px) {
    width: 20px;
    height: 20px;
  }
}

.stop-button {
  width: 52px;
  height: 52px;
  border: none;
  border-radius: var(--aero-border-radius-lg);
  background: var(--aero-gradient-crimson);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--aero-transition-base);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  flex-shrink: 0;

  @media (max-width: 767px) {
    width: 48px;
    height: 48px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.stop-icon {
  width: 18px;
  height: 18px;

  @media (max-width: 767px) {
    width: 16px;
    height: 16px;
  }
}
</style>
