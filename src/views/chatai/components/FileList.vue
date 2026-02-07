<template>
  <div class="file-list-container">
    <div class="file-list-header">
      <svg class="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <span class="file-list-title">Generated Files ({{ files.length }})</span>
    </div>

    <div v-if="files.length === 0" class="file-list-empty">
      <p>No files generated yet</p>
    </div>

    <div v-else class="file-list-content">
      <div
        v-for="file in files"
        :key="file.file_id"
        class="file-item"
        @click="downloadFile(file)"
      >
        <div class="file-info">
          <div class="file-name" :title="file.filename">{{ file.filename }}</div>
          <div class="file-meta">
            <span class="file-type">{{ file.file_type.toUpperCase() }}</span>
            <span class="file-size">{{ formatFileSize(file.file_size) }}</span>
            <span class="file-time">{{ formatTime(file.generated_time) }}</span>
          </div>
        </div>
        <button class="file-download-btn" :disabled="downloadingId === file.file_id">
          <svg
            v-if="downloadingId !== file.file_id"
            class="download-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span v-else class="loading-spinner"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { GeneratedFile } from "@/store/modules/chat";
import { chatAPI } from "@/api/chat";
import { message } from "@/utils/message";
import { storageLocal } from "@pureadmin/utils";
import { userKey, type DataInfo } from "@/utils/auth";

const props = defineProps<{
  files: GeneratedFile[];
  conversationId: string;
}>();

const downloadingId = ref<string | null>(null);

function getUsername(): string {
  const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  return userInfo?.username || "";
}

function formatFileSize(bytes: number | undefined): string {
  if (bytes == null || bytes === 0 || !Number.isFinite(bytes)) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatTime(timeStr: string): string {
  const date = new Date(timeStr);
  return date.toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function downloadFile(file: GeneratedFile) {
  const username = getUsername();
  if (!username) {
    message("Please log in to download files", { type: "warning" });
    return;
  }

  if (downloadingId.value === file.file_id) return;

  downloadingId.value = file.file_id;

  try {
    const blob = await chatAPI.downloadFile(
      file.file_id,
      username,
      props.conversationId
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    message(`Downloaded: ${file.filename}`, { type: "success" });
  } catch (error) {
    console.error("Failed to download file:", error);
    message(
      error instanceof Error ? error.message : "Failed to download file",
      { type: "error" }
    );
  } finally {
    downloadingId.value = null;
  }
}
</script>

<style scoped>
.file-list-container {
  background-color: var(--assistant-bubble-bg, #f0f2f5);
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.file-list-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.file-icon {
  width: 18px;
  height: 18px;
  color: var(--accent-color, #3b82f6);
}

.file-list-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color-primary, #333);
}

.file-list-empty {
  text-align: center;
  padding: 16px;
  color: var(--text-color-tertiary, #999);
  font-size: 13px;
}

.file-list-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background-color: var(--background-color, #fff);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.file-item:hover {
  border-color: var(--accent-color, #3b82f6);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.file-info {
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color-primary, #333);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-color-tertiary, #999);
}

.file-type {
  background-color: var(--accent-color, #3b82f6);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
}

.file-time {
  font-size: 11px;
}

.file-download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background-color: var(--hover-color, #f3f4f6);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-color-secondary, #666);
  flex-shrink: 0;
}

.file-download-btn:hover:not(:disabled) {
  background-color: var(--accent-color, #3b82f6);
  color: white;
}

.file-download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-icon {
  width: 16px;
  height: 16px;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .file-list-container {
    background-color: var(--assistant-bubble-bg, #1e293b);
  }

  .file-list-title {
    color: var(--text-color-primary, #fff);
  }

  .file-item {
    background-color: var(--background-color, #111827);
  }

  .file-name {
    color: var(--text-color-primary, #fff);
  }

  .file-download-btn {
    background-color: var(--hover-color, #1f2937);
    color: var(--text-color-secondary, #d1d5db);
  }
}
</style>
