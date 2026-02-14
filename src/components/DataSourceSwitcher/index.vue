<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useDataSourceStoreHook, DATA_SOURCE_OPTIONS, type DataSourceType } from "@/store/modules/dataSource";
import { IconifyIconOnline } from "@/components/ReIcon";

defineOptions({
  name: "DataSourceSwitcher"
});

const emit = defineEmits<{
  (e: "change", source: DataSourceType): void;
  (e: "error", error: Error): void;
}>();

const store = useDataSourceStoreHook();
const isExpanded = ref(false);
const isTransitioning = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const dropdownPosition = ref({ top: 0, left: 0, width: 0 });

const currentSource = computed(() => store.getCurrentSource);
const isLoading = computed(() => store.getIsLoading);
const currentOption = computed(() => store.getCurrentSourceOption);

const updateDropdownPosition = () => {
  if (triggerRef.value) {
    const rect = triggerRef.value.getBoundingClientRect();
    dropdownPosition.value = {
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: rect.width
    };
  }
};

const handleSourceChange = async (source: DataSourceType) => {
  if (source === currentSource.value || isLoading.value || isTransitioning.value) {
    return;
  }

  isTransitioning.value = true;
  isExpanded.value = false;

  try {
    await store.switchDataSource(source);
    emit("change", source);
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Failed to switch data source");
    emit("error", err);
  } finally {
    isTransitioning.value = false;
  }
};

const toggleExpanded = () => {
  if (!isLoading.value && !isTransitioning.value) {
    if (!isExpanded.value) {
      updateDropdownPosition();
      nextTick(() => {
        updateDropdownPosition();
      });
    }
    isExpanded.value = !isExpanded.value;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".data-source-switcher") && !target.closest(".data-source-dropdown-teleport")) {
    isExpanded.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", () => {
    if (isExpanded.value) {
      updateDropdownPosition();
    }
  });
  window.addEventListener("scroll", () => {
    if (isExpanded.value) {
      updateDropdownPosition();
    }
  });
});
</script>

<template>
  <div class="data-source-switcher" :class="{ 'is-loading': isLoading, 'is-transitioning': isTransitioning }">
    <button ref="triggerRef" class="switcher-trigger aero-card" @click="toggleExpanded">
      <div class="aero-corner-mark top-left" />
      <div class="aero-corner-mark top-right" />
      <div class="aero-corner-mark bottom-left" />
      <div class="aero-corner-mark bottom-right" />

      <div class="trigger-content">
        <div class="source-icon-wrapper">
          <IconifyIconOnline
            v-if="currentOption"
            :icon="currentOption.icon"
            width="18"
            height="18"
          />
        </div>

        <div class="source-info">
          <span class="source-label aero-tech-label">DATA SOURCE</span>
          <span class="source-name aero-body">{{ currentOption?.label || "Select Source" }}</span>
        </div>

        <div class="trigger-indicator">
          <div v-if="isLoading || isTransitioning" class="loading-spinner" />
          <svg
            v-else
            class="chevron-icon"
            :class="{ 'is-expanded': isExpanded }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </button>

    <Teleport to="body">
      <Transition name="dropdown-advanced">
        <div
          v-if="isExpanded"
          class="data-source-dropdown-teleport"
          :style="{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }"
        >
          <div class="switcher-dropdown aero-card">
            <div class="aero-corner-mark top-left" />
            <div class="aero-corner-mark top-right" />
            <div class="aero-corner-mark bottom-left" />
            <div class="aero-corner-mark bottom-right" />

            <div class="dropdown-header">
              <span class="dropdown-title aero-tech-label">SELECT DATA SOURCE</span>
            </div>

            <div class="dropdown-options">
              <button
                v-for="option in DATA_SOURCE_OPTIONS"
                :key="option.value"
                class="option-item"
                :class="{ 'is-selected': option.value === currentSource }"
                :disabled="isLoading || isTransitioning"
                @click="handleSourceChange(option.value)"
              >
                <div class="option-icon-wrapper">
                  <IconifyIconOnline :icon="option.icon" width="20" height="20" />
                </div>

                <div class="option-content">
                  <span class="option-label aero-body">{{ option.label }}</span>
                  <span class="option-description aero-tech-label">{{ option.description }}</span>
                </div>

                <div v-if="option.value === currentSource" class="option-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </button>
            </div>

            <div class="dropdown-footer">
              <span class="footer-hint aero-tech-label">
                Switching will preserve your current filters and settings
              </span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isTransitioning" class="transition-overlay">
          <div class="transition-content">
            <div class="transition-spinner" />
            <span class="transition-text aero-tech-label">Switching data source...</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.data-source-switcher {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;

  &.is-loading,
  &.is-transitioning {
    .switcher-trigger {
      pointer-events: none;
    }
  }
}

.switcher-trigger {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border: none;
  background: var(--aero-bg-glass);
  backdrop-filter: blur(var(--aero-glass-blur));
  -webkit-backdrop-filter: blur(var(--aero-glass-blur));
  transition: all var(--aero-transition-base);
  min-width: 220px;
  position: relative;
  z-index: 1001;

  &:hover:not(:disabled) {
    background: var(--aero-bg-glass-strong);
    transform: translateY(-1px);
    box-shadow: var(--aero-shadow-ambient);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.source-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--aero-bg-glass-weak);
  border: 1px solid var(--aero-border-glass);
  border-radius: var(--aero-border-radius-md);
  color: var(--aero-text-primary);
  transition: all var(--aero-transition-base);
}

.source-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  text-align: left;
}

.source-label {
  font-size: 10px;
  color: var(--aero-text-tertiary);
  letter-spacing: var(--aero-letter-spacing-wider);
}

.source-name {
  font-size: var(--aero-font-size-sm);
  font-weight: var(--aero-font-weight-medium);
  color: var(--aero-text-primary);
}

.trigger-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--aero-border-glass);
  border-top-color: var(--aero-text-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.chevron-icon {
  width: 16px;
  height: 16px;
  color: var(--aero-text-secondary);
  transition: transform var(--aero-transition-base);

  &.is-expanded {
    transform: rotate(180deg);
  }
}

.data-source-dropdown-teleport {
  position: absolute;
  z-index: 9999;
  min-width: 280px;
}

.switcher-dropdown {
  padding: 0;
  background: var(--aero-bg-glass-strong);
  backdrop-filter: blur(var(--aero-glass-blur-strong));
  -webkit-backdrop-filter: blur(var(--aero-glass-blur-strong));
  box-shadow: var(--aero-shadow-ambient-strong);
  overflow: hidden;
  border: 1px solid var(--aero-border-glass-strong);
  width: 100%;
}

.dropdown-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--aero-border-glass);
}

.dropdown-title {
  font-size: 10px;
  color: var(--aero-text-tertiary);
  letter-spacing: var(--aero-letter-spacing-widest);
}

.dropdown-options {
  display: flex;
  flex-direction: column;
  padding: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  border: none;
  background: transparent;
  border-radius: var(--aero-border-radius-md);
  transition: all var(--aero-transition-base);
  text-align: left;
  width: 100%;

  &:hover:not(:disabled) {
    background: var(--aero-bg-glass-weak);
  }

  &.is-selected {
    background: rgba(0, 180, 200, 0.08);

    .option-icon-wrapper {
      color: #00a8c0;
      border-color: rgba(0, 180, 200, 0.3);
    }
  }

  &:disabled {
    opacity: var(--aero-opacity-disabled);
    cursor: not-allowed;
  }
}

.option-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--aero-bg-glass-weak);
  border: 1px solid var(--aero-border-glass);
  border-radius: var(--aero-border-radius-md);
  color: var(--aero-text-secondary);
  transition: all var(--aero-transition-base);
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.option-label {
  font-size: var(--aero-font-size-sm);
  font-weight: var(--aero-font-weight-medium);
  color: var(--aero-text-primary);
}

.option-description {
  font-size: 11px;
  color: var(--aero-text-tertiary);
}

.option-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #00a8c0;

  svg {
    width: 16px;
    height: 16px;
  }
}

.dropdown-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--aero-border-glass);
  background: var(--aero-bg-glass-weak);
}

.footer-hint {
  font-size: 10px;
  color: var(--aero-text-tertiary);
  letter-spacing: var(--aero-letter-spacing-wide);
}

.transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(232, 228, 224, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 99999;
}

.transition-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background: var(--aero-bg-glass-strong);
  border: 1px solid var(--aero-border-glass-strong);
  border-radius: var(--aero-border-radius-lg);
  box-shadow: var(--aero-shadow-ambient-strong);
}

.transition-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--aero-border-glass);
  border-top-color: #00a8c0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.transition-text {
  font-size: var(--aero-font-size-sm);
  color: var(--aero-text-secondary);
  letter-spacing: var(--aero-letter-spacing-wide);
}

.dropdown-advanced-enter-active,
.dropdown-advanced-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-advanced-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.92);
}

.dropdown-advanced-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .switcher-trigger {
    padding: 10px 12px;
    min-width: 180px;
  }

  .data-source-dropdown-teleport {
    min-width: 240px;
  }

  .source-icon-wrapper {
    width: 32px;
    height: 32px;
  }

  .source-label {
    font-size: 9px;
  }

  .source-name {
    font-size: 11px;
  }
}
</style>
