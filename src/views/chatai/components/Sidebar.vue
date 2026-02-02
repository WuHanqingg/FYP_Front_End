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
      <TransitionGroup name="conversation">
        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          class="conversation-item"
          :class="{
            active: currentId === conversation.id,
            renaming: renamingId === conversation.id,
            'is-deleting': deletingId === conversation.id
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

          <div v-else class="rename-container">
            <input
              ref="renameInput"
              v-model="newTitle"
              class="rename-input"
              @keydown.enter="handleRenameKeydown"
              @keydown.esc="cancelRename"
            />
            <div class="rename-actions">
              <button
                class="rename-action-btn confirm"
                title="Confirm Rename"
                @click="confirmRename"
              >
                <svg class="action-icon" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button
                class="rename-action-btn cancel"
                title="Cancel Rename"
                @click="cancelRename"
              >
                <svg class="action-icon" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

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
              @click.stop="openDeleteModal(conversation)"
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
      </TransitionGroup>

      <div v-if="conversations.length === 0" class="empty-state">
        No conversations yet
      </div>
    </div>

    <!-- Custom Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDeleteModal"
          class="modal-overlay"
          @click="closeDeleteModal"
        >
          <div class="modal-container" @click.stop>
            <div class="modal-header">
              <div class="modal-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <h3 class="modal-title">Delete Conversation</h3>
            </div>
            <div class="modal-body">
              <p class="modal-message">
                Are you sure you want to delete
                <strong>"{{ conversationToDelete?.title }}"</strong>?
              </p>
              <p class="modal-hint">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button class="modal-btn cancel" @click="closeDeleteModal">
                Cancel
              </button>
              <button class="modal-btn confirm" @click="executeDelete">
                Delete
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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

// Rename functionality
const renamingId = ref<string | null>(null);
const newTitle = ref("");
const renameInput = ref<HTMLInputElement>();

// Delete functionality
const showDeleteModal = ref(false);
const conversationToDelete = ref<Conversation | null>(null);
const deletingId = ref<string | null>(null);

function startRename(conversation: Conversation) {
  renamingId.value = conversation.id;
  newTitle.value = conversation.title;
  nextTick(() => {
    renameInput.value?.focus();
    renameInput.value?.select();
  });
}

function handleRenameKeydown() {
  confirmRename();
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

// Custom delete modal functions
function openDeleteModal(conversation: Conversation) {
  conversationToDelete.value = conversation;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  conversationToDelete.value = null;
}

function executeDelete() {
  if (conversationToDelete.value) {
    const id = conversationToDelete.value.id;
    deletingId.value = id;
    showDeleteModal.value = false;

    // Wait for animation to complete before emitting delete
    setTimeout(() => {
      emit("delete", id);
      deletingId.value = null;
      conversationToDelete.value = null;
    }, 400);
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
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.conversation-item.renaming {
  padding: 2px 0;
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

/* Rename Container */
.rename-container {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #3b82f6;
  animation: renameSlideIn 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

@keyframes renameSlideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rename-input {
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
  background: transparent;
  border: none;
  color: #1f2937;
  font-size: 14px;
  outline: none;
}

.rename-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.rename-action-btn {
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
  flex-shrink: 0;
}

.rename-action-btn:hover {
  background: #f3f4f6;
}

.rename-action-btn.confirm {
  color: #10b981;
}

.rename-action-btn.confirm:hover {
  background: #d1fae5;
}

.rename-action-btn.cancel {
  color: #ef4444;
}

.rename-action-btn.cancel:hover {
  background: #fee2e2;
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

/* Delete Animation */
.conversation-item.is-deleting {
  animation: deleteSlideOut 0.4s ease forwards;
}

@keyframes deleteSlideOut {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
    max-height: 60px;
    margin-bottom: 4px;
  }
  50% {
    opacity: 0.5;
    transform: translateX(-20px) scale(0.95);
  }
  100% {
    opacity: 0;
    transform: translateX(-40px) scale(0.9);
    max-height: 0;
    margin-bottom: 0;
    padding: 0;
  }
}

/* TransitionGroup Animations */
.conversation-enter-active,
.conversation-leave-active {
  transition: all 0.4s ease;
}

.conversation-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.conversation-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 400px;
  margin: 16px;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 24px 16px;
  gap: 12px;
}

.modal-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fee2e2;
  border-radius: 50%;
  color: #dc2626;
}

.modal-icon svg {
  width: 24px;
  height: 24px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-body {
  padding: 0 24px 24px;
  text-align: center;
}

.modal-message {
  font-size: 14px;
  color: #4b5563;
  margin: 0 0 8px;
  line-height: 1.5;
}

.modal-message strong {
  color: #1f2937;
}

.modal-hint {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

.modal-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.modal-btn.cancel {
  background: #f3f4f6;
  color: #4b5563;
}

.modal-btn.cancel:hover {
  background: #e5e7eb;
}

.modal-btn.confirm {
  background: #dc2626;
  color: white;
}

.modal-btn.confirm:hover {
  background: #b91c1c;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
