<template>
  <div class="message-content">
    <div
      v-if="!content && isStreaming"
      class="text-gray-400 dark:text-gray-500"
    >
      Thinking...
    </div>
    <div v-else v-html="formattedContent" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  content: string;
  isStreaming?: boolean;
}>();

const formattedContent = computed(() => {
  if (!props.content) return "";

  let formatted = props.content;

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

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
</script>

<style scoped>
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
</style>
