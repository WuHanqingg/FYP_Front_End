<template>
  <div class="message-content">
    <!-- Show thinking state when processing (no content yet or only has Thought: section) -->
    <div v-if="showThinkingState" class="thinking-indicator">
      <div class="thinking-dots">
        <span class="dot" />
        <span class="dot" />
        <span class="dot" />
      </div>
      <span class="thinking-text">Thinking</span>
    </div>
    <!-- Show formatted content when available -->
    <div
      v-else
      :class="{ 'streaming-content': isStreaming }"
      v-html="formattedContent"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  content: string;
  isStreaming?: boolean;
}>();

// 流式时：仅当出现 Answer 后才展示内容，否则显示 Thinking
// 后端 ReAct 输出: Thought -> Action -> [Observation] -> Answer
const showThinkingState = computed(() => {
  if (!props.isStreaming) return false;
  if (!props.content?.trim()) return true;

  const hasAnswer = props.content.includes("Answer:");
  // 无 Answer 时一律显示 Thinking（含 Thought/Action/Observation 等中间过程）
  return !hasAnswer;
});

const formattedContent = computed(() => {
  if (!props.content) return "";

  let formatted = props.content;

  formatted = filterToolCalls(formatted);

  // Extract only the Answer section if it exists
  formatted = extractAnswerSection(formatted);

  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
  formatted = formatted.replace(
    /`(.*?)`/g,
    '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm">$1</code>'
  );

  formatted = formatted.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (match, lang, code) => {
      return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-3"><code>${escapeHtml(code.trim())}</code></pre>`;
    }
  );

  formatted = formatted.replace(/\n/g, "<br>");

  return formatted;
});

/**
 * 仅对 assistant 的 ReAct 输出提取最终回答，过滤 Thought/Action/Observation
 * 用户消息无 Answer:，直接原样返回
 */
function extractAnswerSection(content: string): string {
  const answerIndex = content.lastIndexOf("Answer:");
  if (answerIndex !== -1) {
    const afterAnswer = content.substring(answerIndex + 7);
    return afterAnswer.replace(/^\s*/, "");
  }
  // 无 Answer 时原样返回（用户消息或非 ReAct 格式）
  return content;
}

/** 过滤工具调用、Observation 等中间输出（用于 Answer 前的兼容处理） */
function filterToolCalls(content: string): string {
  const lines = content.split("\n");
  const filteredLines = lines.filter(line => {
    const trimmedLine = line.trim();
    // Action / 行动
    if (trimmedLine.startsWith("行动:") || trimmedLine.startsWith("Action:")) {
      return false;
    }
    if (trimmedLine.match(/^(行动|Action):\s*\{.*\}$/)) {
      return false;
    }
    if (trimmedLine.match(/^\{["\s]*"name["\s]*:.*"params["\s]*:.*\}$/)) {
      return false;
    }
    // [Observation] 或 Observation: (工具执行结果)
    if (
      trimmedLine.startsWith("[Observation]") ||
      trimmedLine.startsWith("Observation:")
    ) {
      return false;
    }
    // Thought: 段（推理过程，仅展示最终 Answer）
    if (trimmedLine.startsWith("Thought:") || trimmedLine.startsWith("思考:")) {
      return false;
    }
    return true;
  });
  return filteredLines.join("\n");
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
</script>

<style scoped>
.message-content {
  min-height: 1.5rem;
}

/* Thinking indicator styles */
.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: var(--text-color-secondary, #6b7280);
}

.thinking-dots {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: currentColor;
  border-radius: 50%;
  animation: thinking-bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes thinking-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.thinking-text {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.8;
}

/* Streaming content with smooth fade-in */
.streaming-content {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Cursor blink effect for streaming text */
.streaming-content::after {
  content: "";
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: var(--accent-color, #3b82f6);
  margin-left: 2px;
  animation: cursor-blink 1s step-end infinite;
  vertical-align: text-bottom;
}

@keyframes cursor-blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.message-content :deep(pre) {
  font-family: "Courier New", Courier, monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.message-content :deep(code) {
  font-family: "Courier New", Courier, monospace;
}

.message-content :deep(p) {
  margin-bottom: 0.5rem;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .thinking-indicator {
    color: var(--text-color-secondary, #9ca3af);
  }

  .streaming-content::after {
    background-color: var(--accent-color, #60a5fa);
  }
}
</style>
