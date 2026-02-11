<template>
  <header class="navbar">
    <div class="navbar-content">
      <button
        class="menu-toggle"
        aria-label="Toggle sidebar"
        @click="$emit('toggleSidebar')"
      >
        <svg
          class="menu-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M3 12h18M3 6h18M3 18h18"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <h1 class="navbar-title">AI Assistant</h1>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  toggleSidebar: [];
}>();
</script>

<style scoped lang="scss">
.navbar {
  height: 56px;
  background: var(--aero-bg-glass);
  border-bottom: 1px solid var(--aero-border-glass);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
  backdrop-filter: blur(var(--aero-glass-blur));
  -webkit-backdrop-filter: blur(var(--aero-glass-blur));

  @media (max-width: 767px) {
    padding: 0 16px;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    padding: 0 20px;
  }
}

.navbar-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--aero-border-radius-sm);
  cursor: pointer;
  transition: all var(--aero-transition-base);

  &:hover {
    background: var(--aero-bg-glass-weak);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 1023px) {
    display: flex;
  }
}

.menu-icon {
  width: 24px;
  height: 24px;
  color: var(--aero-text-primary);

  @media (max-width: 767px) {
    width: 20px;
    height: 20px;
  }
}

.navbar-title {
  font-family: var(--aero-font-display);
  font-size: 18px;
  font-weight: var(--aero-font-weight-semibold);
  color: var(--aero-text-primary);
  margin: 0;

  @media (max-width: 767px) {
    font-size: 16px;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    font-size: 17px;
  }
}
</style>
