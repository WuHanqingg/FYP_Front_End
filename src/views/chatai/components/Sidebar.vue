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

<style scoped lang="scss">
.sidebar {
  width: 280px;
  background: var(--aero-bg-glass);
  border-right: 1px solid var(--aero-border-glass);
  display: flex;
  flex-direction: column;
  height: 100%;
  backdrop-filter: blur(var(--aero-glass-blur));
  -webkit-backdrop-filter: blur(var(--aero-glass-blur));
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 20, 40, 0.04);
}

.new-conversation-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--aero-bg-glass-weak);
  border: 1px solid var(--aero-border-glass);
  border-radius: var(--aero-border-radius-md);
  color: var(--aero-text-primary);
  font-family: var(--aero-font-body);
  font-size: var(--aero-font-size-sm);
  font-weight: var(--aero-font-weight-semibold);
  cursor: pointer;
  transition: all var(--aero-transition-base);
  letter-spacing: var(--aero-letter-spacing-wide);
  text-transform: uppercase;

  &:hover {
    background: var(--aero-bg-glass);
    border-color: rgba(0, 212, 255, 0.3);
    box-shadow: var(--aero-shadow-glow-cyan);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.chat-icon {
  width: 20px;
  height: 20px;
  color: var(--aero-text-secondary);
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.conversation-item {
  position: relative;
  margin-bottom: 6px;
  z-index: 1;
  transition: all var(--aero-transition-base);
  width: 100%;
  box-sizing: border-box;
}

.conversation-item.renaming {
  padding: 4px 0;
}

.conversation-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: transparent;
  border: none;
  border-radius: var(--aero-border-radius-sm);
  color: var(--aero-text-secondary);
  font-family: var(--aero-font-body);
  font-size: var(--aero-font-size-sm);
  cursor: pointer;
  transition: all var(--aero-transition-base);
  text-align: left;

  &:hover {
    background: var(--aero-bg-glass-weak);
    color: var(--aero-text-primary);
  }
}

.conversation-item.active .conversation-btn {
  background: rgba(0, 212, 255, 0.1);
  color: var(--aero-text-primary);
  border: 1px solid rgba(0, 212, 255, 0.2);
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.1);
}

.conversation-icon {
  width: 18px;
  height: 18px;
  color: var(--aero-text-tertiary);
  flex-shrink: 0;
}

.conversation-item.active .conversation-icon {
  color: var(--aero-text-primary);
}

.conversation-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--aero-font-weight-regular);
}

.rename-container {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--aero-bg-glass);
  border-radius: var(--aero-border-radius-sm);
  border: 1px solid rgba(0, 212, 255, 0.3);
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
  color: var(--aero-text-primary);
  font-family: var(--aero-font-body);
  font-size: var(--aero-font-size-sm);
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
  border-radius: var(--aero-border-radius-sm);
  cursor: pointer;
  transition: all var(--aero-transition-base);
  flex-shrink: 0;

  &:hover {
    background: var(--aero-bg-glass-weak);
  }
}

.rename-action-btn.confirm {
  color: #00ffaa;
}

.rename-action-btn.confirm:hover {
  background: rgba(0, 255, 170, 0.1);
}

.rename-action-btn.cancel {
  color: #ff3c3c;
}

.rename-action-btn.cancel:hover {
  background: rgba(255, 60, 60, 0.1);
}

.action-buttons {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  margin-left: 8px;
  opacity: 0;
  transition: opacity var(--aero-transition-base);
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
  border-radius: var(--aero-border-radius-sm);
  cursor: pointer;
  transition: all var(--aero-transition-base);

  &:hover {
    background: var(--aero-bg-glass-weak);
  }
}

.action-icon {
  width: 16px;
  height: 16px;
  color: var(--aero-text-tertiary);
}

.rename-btn:hover .action-icon {
  color: var(--aero-text-primary);
}

.delete-btn:hover .action-icon {
  color: #ff3c3c;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--aero-text-tertiary);
  font-family: var(--aero-font-body);
  font-size: var(--aero-font-size-sm);
}

.conversation-item.is-deleting {
  animation: deleteSlideOut 0.4s ease forwards;
}

@keyframes deleteSlideOut {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
    max-height: 60px;
    margin-bottom: 6px;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 20, 40, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-container {
  background: var(--aero-bg-glass-strong);
  border: 1px solid var(--aero-border-glass-strong);
  border-radius: var(--aero-border-radius-lg);
  box-shadow: var(--aero-shadow-ambient-strong);
  width: 100%;
  max-width: 400px;
  margin: 16px;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
  backdrop-filter: blur(var(--aero-glass-blur-strong));
  -webkit-backdrop-filter: blur(var(--aero-glass-blur-strong));
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
  background: rgba(220, 38, 38, 0.1);
  border-radius: 50%;
  color: #dc2626;
}

.modal-icon svg {
  width: 24px;
  height: 24px;
}

.modal-title {
  font-family: var(--aero-font-display);
  font-size: var(--aero-font-size-xl);
  font-weight: var(--aero-font-weight-semibold);
  color: var(--aero-text-primary);
  margin: 0;
}

.modal-body {
  padding: 0 24px 24px;
  text-align: center;
}

.modal-message {
  font-family: var(--aero-font-body);
  font-size: var(--aero-font-size-sm);
  color: var(--aero-text-secondary);
  margin: 0 0 8px;
  line-height: var(--aero-line-height-normal);
}

.modal-message strong {
  color: var(--aero-text-primary);
  font-weight: var(--aero-font-weight-semibold);
}

.modal-hint {
  font-family: var(--aero-font-body);
  font-size: var(--aero-font-size-xs);
  color: var(--aero-text-tertiary);
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

.modal-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: var(--aero-border-radius-md);
  font-family: var(--aero-font-body);
  font-size: var(--aero-font-size-sm);
  font-weight: var(--aero-font-weight-semibold);
  cursor: pointer;
  transition: all var(--aero-transition-base);
  border: none;
}

.modal-btn.cancel {
  background: var(--aero-bg-glass-weak);
  color: var(--aero-text-secondary);
  border: 1px solid var(--aero-border-glass);

  &:hover {
    background: var(--aero-bg-glass);
    border-color: rgba(0, 212, 255, 0.3);
  }
}

.modal-btn.confirm {
  background: var(--aero-gradient-crimson);
  color: white;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

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
