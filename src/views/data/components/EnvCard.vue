<script setup lang="ts">
import { IconifyIconOnline } from "@/components/ReIcon";
import { computed, PropType } from "vue";

defineOptions({
  name: "EnvironmentCard"
});

interface EnvironmentDataType {
  id: string;
  type: string; // 数据类型，如：PM2.5、温度、湿度等
  unit: string; // 数据单位，如：μg/m³、°C、%等
  value: number; // 当前数值
  threshold: number; // 阈值
  thresholdType: string; // 阈值类型
  icon: string; // 图标类名
  color: string; // 主题色
}

const props = defineProps({
  data: {
    type: Object as PropType<EnvironmentDataType>,
    required: true
  }
});

const emit = defineEmits(["click"]);

const handleClick = () => {
  emit("click", props.data);
};

// 阈值类型映射
const thresholdTypeMap = {
  above: "Beyond threshold warning",
  below: "Below threshold warning",
  none: "No comparison"
};

const computeStatus = () => {
  if (props.data.thresholdType === "none") {
    return "env-card--normal";
  }
  if (props.data.thresholdType === "above") {
    if (props.data.value > props.data.threshold) {
      return "env-card--danger";
    } else if (props.data.value > props.data.threshold * 0.8) {
      return "env-card--warning";
    } else {
      return "env-card--normal";
    }
  }
  if (props.data.thresholdType === "below") {
    if (props.data.value < props.data.threshold) {
      return "env-card--danger";
    } else if (props.data.value < props.data.threshold * 1.2) {
      return "env-card--warning";
    } else {
      return "env-card--normal";
    }
  }
};

const computeProgress = () => {
  if (props.data.thresholdType === "none") {
    return 100;
  }
  if (props.data.thresholdType === "above") {
    const progress = (props.data.value / props.data.threshold) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }
  if (props.data.thresholdType === "below") {
    const progress = (1 / (props.data.value / props.data.threshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }
  return 100;
};

const getStatusText = () => {
  const status = computeStatus();
  if (status === "env-card--danger") {
    return "Critical";
  } else if (status === "env-card--warning") {
    return "Warning";
  } else {
    return "Normal";
  }
};

const statusColorClass = computed(() => {
  const status = computeStatus();
  if (status === "env-card--danger") {
    return "aero-card-crimson";
  } else if (status === "env-card--warning") {
    return "aero-card-amber";
  } else {
    return "aero-card-mint";
  }
});

const progressBarClass = computed(() => {
  const status = computeStatus();
  if (status === "env-card--danger") {
    return "aero-progress-bar-crimson";
  } else if (status === "env-card--warning") {
    return "aero-progress-bar-amber";
  } else {
    return "aero-progress-bar-mint";
  }
});
</script>

<template>
  <div class="env-card aero-card" :class="[computeStatus(), statusColorClass]" @click="handleClick">
    <div class="aero-corner-mark top-left" />
    <div class="aero-corner-mark top-right" />
    <div class="aero-corner-mark bottom-left" />
    <div class="aero-corner-mark bottom-right" />

    <div class="env-card__header">
      <div class="env-card__icon-wrapper">
        <IconifyIconOnline :icon="data.icon" width="24" height="24" />
      </div>
      <div class="env-card__type aero-uppercase aero-tech-label">{{ data.name }}</div>
      <div class="env-card__status-badge" :class="computeStatus()">
        <span class="env-card__status-dot" />
        <span class="env-card__status-text">{{ getStatusText() }}</span>
      </div>
    </div>

    <div class="env-card__content">
      <div class="env-card__value">
        <span class="value-number aero-mono">{{ data.value }}</span>
        <span class="value-unit aero-tech-label">{{ data.unit }}</span>
      </div>

      <div class="env-card__progress">
        <div
          class="env-card__progress-track"
        />
        <div
          class="env-card__progress-bar"
          :class="progressBarClass"
          :style="{ width: computeProgress() + '%' }"
        />
      </div>

      <div class="env-card__info">
        <div class="env-card__threshold-info">
          <div class="env-card__threshold">
            <span class="threshold-label aero-tech-label">THRESHOLD</span>
            <span class="threshold-value aero-mono">{{ data.threshold }}{{ data.unit }}</span>
          </div>
          <div class="env-card__threshold-type">
            <span class="threshold-type-text aero-tech-label">{{
              thresholdTypeMap[
                data.thresholdType as keyof typeof thresholdTypeMap
              ]
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.env-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 24px;
  margin-bottom: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all var(--aero-transition-base);

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &--normal {
    --card-accent: var(--aero-gradient-mint);
  }

  &--warning {
    --card-accent: var(--aero-gradient-amber);
  }

  &--danger {
    --card-accent: var(--aero-gradient-crimson);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  &__icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: var(--aero-text-primary);
    background: var(--aero-bg-glass-weak);
    border-radius: var(--aero-border-radius-md);
    border: 1px solid var(--aero-border-glass);
    transition: all var(--aero-transition-base);

    .env-card--warning & {
      color: #ffaa00;
    }

    .env-card--danger & {
      color: #ff3c3c;
    }
  }

  &__type {
    flex: 1;
    font-size: var(--aero-font-size-sm);
    color: var(--aero-text-secondary);
  }

  &__status-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    font-size: var(--aero-font-size-xs);
    font-weight: var(--aero-font-weight-medium);
    color: var(--aero-text-primary);
    background: var(--aero-bg-glass-weak);
    border-radius: var(--aero-border-radius-full);
    border: 1px solid var(--aero-border-glass);
    transition: all var(--aero-transition-base);

    .env-card--warning & {
      color: #ffaa00;
      border-color: rgba(255, 170, 0, 0.2);
    }

    .env-card--danger & {
      color: #ff3c3c;
      border-color: rgba(255, 60, 60, 0.2);
    }
  }

  &__status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--card-accent);
    box-shadow: 0 0 8px currentColor;
  }

  &__status-text {
    font-weight: var(--aero-font-weight-semibold);
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__value {
    display: flex;
    align-items: baseline;
    gap: 8px;

    .value-number {
      font-size: 40px;
      font-weight: var(--aero-font-weight-light);
      line-height: var(--aero-line-height-tight);
      color: var(--aero-text-primary);
      letter-spacing: -0.02em;
    }

    .value-unit {
      font-size: var(--aero-font-size-sm);
      color: var(--aero-text-tertiary);
    }
  }

  &__progress {
    position: relative;
    height: 4px;
    overflow: hidden;
    border-radius: var(--aero-border-radius-full);
  }

  &__progress-track {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 20, 40, 0.06);
    border-radius: var(--aero-border-radius-full);
  }

  &__progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100%;
    border-radius: var(--aero-border-radius-full);
    transition: width var(--aero-transition-slow);
    box-shadow: 0 0 8px currentColor;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid rgba(0, 20, 40, 0.04);
  }

  &__threshold-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__threshold {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(0, 20, 40, 0.02);
    border-radius: var(--aero-border-radius-sm);
    border: 1px solid rgba(0, 20, 40, 0.04);
    transition: all var(--aero-transition-base);

    &:hover {
      background: rgba(0, 20, 40, 0.04);
      border-color: rgba(0, 20, 40, 0.08);
    }
  }

  &__threshold-type {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: rgba(0, 20, 40, 0.02);
    border-radius: var(--aero-border-radius-sm);
    border: 1px solid rgba(0, 20, 40, 0.04);
    transition: all var(--aero-transition-base);

    &:hover {
      background: rgba(0, 20, 40, 0.04);
      border-color: rgba(0, 20, 40, 0.08);
    }
  }
}
</style>
