<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <button class="new-conversation-btn" @click="$emit('create')">
        <svg class="chat-icon" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        New Conversation
      </button>
    </div>

    <div class="conversation-list">
      <div
        v-for="conversation in conversations"
        :key="conversation.id"
        class="conversation-item"
        :class="{
          active: currentId === conversation.id,
          renaming: renamingId === conversation.id
        }"
      >
        <button
          v-if="renamingId !== conversation.id"
          class="conversation-btn"
          @click="$emit('select', conversation.id)"
        >
          <svg class="conversation-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="conversation-title">{{ conversation.title }}</span>
        </button>

        <input
          v-else
          ref="renameInput"
          v-model="newTitle"
          class="rename-input"
          @blur="confirmRename"
          @keydown.enter="confirmRename"
          @keydown.esc="cancelRename"
        />

        <div v-if="renamingId !== conversation.id" class="action-buttons">
          <button
            class="action-btn rename-btn"
            title="Rename"
            @click.stop="startRename(conversation)"
          >
            <svg class="action-icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            class="action-btn delete-btn"
            title="Delete"
            @click.stop="confirmDelete(conversation)"
          >
            <svg class="action-icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="conversations.length === 0" class="empty-state">
        No conversations yet
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import type { Conversation } from "@/store/modules/chat";

const props = defineProps<{
  conversations: Conversation[];
  currentId: string | null;
}>();

const emit = defineEmits<{
  select: [id: string];
  create: [];
  delete: [id: string];
  rename: [id: string, title: string];
}>();

const renamingId = ref<string | null>(null);
const newTitle = ref("");
const renameInput = ref<HTMLInputElement>();

function startRename(conversation: Conversation) {
  renamingId.value = conversation.id;
  newTitle.value = conversation.title;
  nextTick(() => {
    renameInput.value?.focus();
    renameInput.value?.select();
  });
}

function confirmRename() {
  if (renamingId.value && newTitle.value.trim()) {
    emit("rename", renamingId.value, newTitle.value.trim());
    renamingId.value = null;
    newTitle.value = "";
  }
}

function cancelRename() {
  renamingId.value = null;
  newTitle.value = "";
}

function confirmDelete(conversation: Conversation) {
  if (confirm(`Delete "${conversation.title}"?`)) {
    emit("delete", conversation.id);
  }
}
</script>

<style scoped>
.sidebar {
  width: 256px;
  background: #f8f9fa;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.new-conversation-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.new-conversation-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.chat-icon {
  width: 18px;
  height: 18px;
  color: #6b7280;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  position: relative;
  margin-bottom: 4px;
  z-index: 1;
}

.conversation-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: left;
}

.conversation-btn:hover {
  background: #e5e7eb;
}

.conversation-item.active .conversation-btn {
  background: #dbeafe;
  color: #1e40af;
}

.conversation-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
  flex-shrink: 0;
}

.conversation-item.active .conversation-icon {
  color: #1e40af;
}

.conversation-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rename-input {
  flex: 1;
  padding: 10px 12px;
  background: white;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  color: #1f2937;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.rename-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.action-buttons {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.conversation-item:hover .action-buttons {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e5e7eb;
}

.action-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.rename-btn:hover .action-icon {
  color: #3b82f6;
}

.delete-btn:hover .action-icon {
  color: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: #9ca3af;
  font-size: 14px;
}
</style>
