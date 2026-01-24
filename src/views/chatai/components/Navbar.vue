<template>
  <header
    class="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0"
  >
    <div class="flex items-center gap-4">
      <h1 class="text-lg font-semibold text-gray-800 dark:text-white">
        AI Assistant
      </h1>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  toggleSidebar: [];
}>();
</script>
