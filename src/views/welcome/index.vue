<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";

defineOptions({
  name: "Welcome"
});

const router = useRouter();
const isLoaded = ref(false);

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);
});

const projectModules = [
  {
    id: "data",
    title: "Environmental Data",
    description:
      "Real-time monitoring and visualization of environmental metrics with interactive charts and analytics.",
    icon: "carbon:chart-line-data",
    route: "/currentData",
    color: "#059669"
  },
  {
    id: "chatai",
    title: "AI Assistant",
    description:
      "Intelligent conversational interface for data analysis, insights, and automated reporting.",
    icon: "carbon:chat-bot",
    route: "/chatai",
    color: "#7c3aed"
  },
  {
    id: "chart",
    title: "Analytics Dashboard",
    description:
      "Comprehensive data visualization with customizable charts and trend analysis tools.",
    icon: "carbon:dashboard",
    route: "/chart",
    color: "#dc2626"
  }
];

const handleNavigate = (route: string) => {
  router.push(route);
};

const moduleCardClass = (color: string) => {
  const colorMap: Record<string, string> = {
    "#059669": "aero-card-mint",
    "#7c3aed": "aero-card-purple",
    "#dc2626": "aero-card-crimson"
  };
  return colorMap[color] || "aero-card-cyan";
};
</script>

<template>
  <div class="welcome-container aero-dot-bg">
    <div class="aero-noise-bg" />
    
    <section class="hero-section" :class="{ 'is-loaded': isLoaded }">
      <div class="hero-content">
        <div class="logo-badge aero-glass-weak">
          <Icon icon="carbon:cloud-monitoring" class="logo-icon" />
          <span class="aero-tech-label">ENVIRONMENTAL MONITORING SYSTEM</span>
        </div>
        <h1 class="hero-title aero-display">
          Smart Environmental
          <span class="highlight aero-text-gradient">Data Management</span>
        </h1>
        <p class="hero-description aero-body">
          A comprehensive platform for real-time environmental monitoring,
          intelligent data analysis, and AI-powered insights. Streamline your
          workflow with intuitive visualization tools and automated reporting
          capabilities.
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-value aero-mono">Real-time</span>
            <span class="stat-label aero-tech-label">Data Updates</span>
          </div>
          <div class="stat-divider aero-divider-vertical" />
          <div class="stat-item">
            <span class="stat-value aero-mono">AI-Powered</span>
            <span class="stat-label aero-tech-label">Analysis</span>
          </div>
          <div class="stat-divider aero-divider-vertical" />
          <div class="stat-item">
            <span class="stat-value aero-mono">Secure</span>
            <span class="stat-label aero-tech-label">Data Handling</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="visual-card primary aero-card-cyan aero-float">
          <Icon icon="carbon:cloud" class="visual-icon" />
        </div>
        <div class="visual-card secondary aero-card aero-float">
          <Icon icon="carbon:chart-radial" class="visual-icon" />
        </div>
        <div class="visual-card tertiary aero-card aero-float">
          <Icon icon="carbon:ai-status" class="visual-icon" />
        </div>
      </div>
    </section>

    <section class="modules-section" :class="{ 'is-loaded': isLoaded }">
      <div class="section-header">
        <h2 class="section-title aero-display">Project Modules</h2>
        <p class="section-subtitle aero-body">
          Select a module to access specific features and tools
        </p>
      </div>

      <div class="modules-grid">
        <div
          v-for="(module, index) in projectModules"
          :key="module.id"
          class="module-card aero-card"
          :class="moduleCardClass(module.color)"
          :style="{
            '--delay': `${index * 100}ms`
          }"
          tabindex="0"
          role="button"
          @click="handleNavigate(module.route)"
          @keydown.enter="handleNavigate(module.route)"
        >
          <div class="aero-corner-mark top-left" />
          <div class="aero-corner-mark top-right" />
          <div class="aero-corner-mark bottom-left" />
          <div class="aero-corner-mark bottom-right" />
          
          <div class="card-header">
            <div
              class="module-icon-wrapper"
            >
              <Icon
                :icon="module.icon"
                class="module-icon"
              />
            </div>
            <Icon icon="carbon:arrow-right" class="arrow-icon" />
          </div>
          <h3 class="module-title aero-display">{{ module.title }}</h3>
          <p class="module-description aero-body">{{ module.description }}</p>
          <div class="card-footer">
            <span class="access-text aero-tech-label">Access Module</span>
            <div class="progress-bar">
              <div class="progress-fill" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.welcome-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(180deg, var(--aero-bg-base) 0%, #f0f4f8 100%);
  padding: 2rem;
  font-family: var(--aero-font-body);

  .aero-noise-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 0;
  }
}

.hero-section {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto 4rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 3rem 0;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;

  &.is-loaded {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.logo-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  width: fit-content;
  border-radius: var(--aero-border-radius-full);

  @media (max-width: 900px) {
    margin: 0 auto;
  }
}

.logo-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--aero-text-primary);
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: var(--aero-font-weight-semibold);
  line-height: var(--aero-line-height-tight);
  color: var(--aero-text-primary);
  letter-spacing: var(--aero-letter-spacing-tight);

  .highlight {
    display: block;
  }
}

.hero-description {
  font-size: var(--aero-font-size-lg);
  line-height: var(--aero-line-height-relaxed);
  color: var(--aero-text-secondary);
  max-width: 540px;

  @media (max-width: 900px) {
    margin: 0 auto;
  }
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 900px) {
    justify-content: center;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 1rem;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: var(--aero-font-size-base);
  font-weight: var(--aero-font-weight-light);
  color: var(--aero-text-primary);
}

.stat-label {
  font-size: var(--aero-font-size-xs);
  color: var(--aero-text-tertiary);
}

.hero-visual {
  position: relative;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 900px) {
    height: 240px;
  }
}

.visual-card {
  position: absolute;
  border-radius: var(--aero-border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;

  &.primary {
    width: 160px;
    height: 160px;
    z-index: 3;
    animation-delay: 0s;

    .visual-icon {
      color: var(--aero-text-primary);
    }
  }

  &.secondary {
    width: 120px;
    height: 120px;
    top: 20px;
    right: 60px;
    z-index: 2;
    animation-delay: 0.5s;

    .visual-icon {
      color: #059669;
    }
  }

  &.tertiary {
    width: 100px;
    height: 100px;
    bottom: 30px;
    left: 60px;
    z-index: 2;
    animation-delay: 1s;

    .visual-icon {
      color: #7c3aed;
    }
  }

  @media (max-width: 900px) {
    &.primary {
      width: 120px;
      height: 120px;
    }

    &.secondary {
      width: 90px;
      height: 90px;
      right: 40px;
    }

    &.tertiary {
      width: 80px;
      height: 80px;
      left: 40px;
    }
  }
}

.visual-icon {
  width: 3rem;
  height: 3rem;

  @media (max-width: 900px) {
    width: 2.25rem;
    height: 2.25rem;
  }
}

.modules-section {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto 4rem;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease 0.2s,
    transform 0.6s ease 0.2s;

  &.is-loaded {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: var(--aero-font-size-2xl);
  font-weight: var(--aero-font-weight-semibold);
  color: var(--aero-text-primary);
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: var(--aero-font-size-base);
  color: var(--aero-text-secondary);
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.module-card {
  padding: 1.5rem;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  animation: cardEnter 0.5s ease forwards;
  animation-delay: var(--delay, 0ms);

  &:hover,
  &:focus {
    transform: translateY(-4px);

    .arrow-icon {
      transform: translateX(4px);
      color: var(--aero-text-primary);
    }

    .progress-fill {
      width: 100%;
    }
  }

  &:focus-visible {
    outline: 2px solid var(--aero-text-primary);
    outline-offset: 2px;
  }
}

@keyframes cardEnter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.module-icon-wrapper {
  width: 3rem;
  height: 3rem;
  border-radius: var(--aero-border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--aero-bg-glass-weak);
  border: 1px solid var(--aero-border-glass);
  transition: transform var(--aero-transition-base);

  .module-card:hover & {
    transform: scale(1.05);
  }
}

.module-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--aero-text-primary);
}

.arrow-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--aero-text-tertiary);
  transition: all var(--aero-transition-base);
}

.module-title {
  font-size: var(--aero-font-size-xl);
  font-weight: var(--aero-font-weight-semibold);
  color: var(--aero-text-primary);
  margin-bottom: 0.5rem;
}

.module-description {
  font-size: var(--aero-font-size-sm);
  line-height: var(--aero-line-height-relaxed);
  color: var(--aero-text-secondary);
  margin-bottom: 1.25rem;
}

.card-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.access-text {
  font-size: var(--aero-font-size-xs);
  font-weight: var(--aero-font-weight-medium);
  color: var(--aero-text-secondary);
}

.progress-bar {
  height: 3px;
  border-radius: var(--aero-border-radius-full);
  overflow: hidden;
  background: rgba(0, 20, 40, 0.06);
}

.progress-fill {
  height: 100%;
  width: 30%;
  border-radius: var(--aero-border-radius-full);
  background: var(--aero-gradient-cyan);
  transition: width var(--aero-transition-base);
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
}

@media (prefers-reduced-motion: reduce) {
  .hero-section,
  .modules-section,
  .module-card {
    animation: none;
    opacity: 1;
    transform: none;
    transition: none;
  }

  .visual-card {
    animation: none;
  }
}
</style>
