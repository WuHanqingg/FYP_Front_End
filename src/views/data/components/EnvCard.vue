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
    const progress = (props.data.value / (props.data.threshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }
  if (props.data.thresholdType === "below") {
    const progress = 1 / (props.data.value / (props.data.threshold)) * 100;
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
</script>

<template>
  <div class="env-card" :class="computeStatus()" @click="handleClick">
    <div class="env-card__header">
      <div class="env-card__icon-wrapper">
        <IconifyIconOnline :icon="data.icon" width="28" height="28" />
      </div>
      <div class="env-card__type">{{ data.type }}</div>
      <div class="env-card__status-badge" :class="computeStatus()">
        {{ getStatusText() }}
      </div>
    </div>

    <div class="env-card__content">
      <div class="env-card__value">
        <span class="value-number">{{ data.value }}</span>
        <span class="value-unit">{{ data.unit }}</span>
      </div>

      <div class="env-card__progress">
        <div
          class="env-card__progress-bar"
          :style="{ width: computeProgress() + '%' }"
        ></div>
      </div>

      <div class="env-card__info">
        <div class="env-card__threshold-info">
          <div class="env-card__threshold">
            <i class="threshold-icon ri-lock-line" />
            <span class="threshold-text">Threshold: {{ data.threshold }}{{ data.unit }}</span>
          </div>
          <div class="env-card__threshold-type">
            {{ thresholdTypeMap[data.thresholdType as keyof typeof thresholdTypeMap] }}
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
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px 0 rgb(0 0 0 / 6%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    content: "";
    transition: all 0.3s ease;
  }

  &:hover {
    box-shadow: 0 12px 32px 0 rgb(0 0 0 / 12%);
    transform: translateY(-4px);

    &::before {
      width: 6px;
    }
  }

  &:active {
    transform: translateY(-2px);
  }

  &--normal {
    background: linear-gradient(135deg, rgba(82, 196, 26, 0.03) 0%, rgba(255, 255, 255, 1) 100%);

    &::before {
      background: linear-gradient(180deg, #52c41a 0%, #73d13d 100%);
      box-shadow: 0 0 12px rgba(82, 196, 26, 0.4);
    }
  }

  &--warning {
    background: linear-gradient(135deg, rgba(250, 173, 20, 0.05) 0%, rgba(255, 255, 255, 1) 100%);

    &::before {
      background: linear-gradient(180deg, #faad14 0%, #ffc53d 100%);
      box-shadow: 0 0 12px rgba(250, 173, 20, 0.4);
    }
  }

  &--danger {
    background: linear-gradient(135deg, rgba(255, 77, 79, 0.08) 0%, rgba(255, 255, 255, 1) 100%);

    &::before {
      background: linear-gradient(180deg, #ff4d4f 0%, #ff7875 100%);
      box-shadow: 0 0 12px rgba(255, 77, 79, 0.4);
    }
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
    width: 48px;
    height: 48px;
    color: #fff;
    background: linear-gradient(180deg, #52c41a 0%, #73d13d 100%);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
    transition: all 0.3s ease;

    .env-card--warning & {
      background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
      box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
    }

    .env-card--danger & {
      background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
      box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
    }
  }

  &__type {
    flex: 1;
    font-size: 18px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.88);
    letter-spacing: 0.3px;
  }

  &__status-badge {
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;

    .env-card--normal & {
      background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
      box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
    }

    .env-card--warning & {
      background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
      box-shadow: 0 2px 8px rgba(250, 173, 20, 0.3);
    }

    .env-card--danger & {
      background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
      box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);
    }
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
      font-size: 48px;
      font-weight: 700;
      line-height: 1;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.65) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -1px;
    }

    .value-unit {
      font-size: 20px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.55);
    }
  }

  &__progress {
    position: relative;
    height: 6px;
    overflow: hidden;
    background-color: rgba(0, 0, 0, 0.06);
    border-radius: 3px;

    &-bar {
      height: 100%;
      background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
      border-radius: 3px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);

      .env-card--warning & {
        background: linear-gradient(90deg, #faad14 0%, #ffc53d 100%);
      }

      .env-card--danger & {
        background: linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%);
      }
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__threshold-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__threshold {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 8px;
    transition: all 0.3s ease;

    .threshold-icon {
      font-size: 16px;
      color: rgba(0, 0, 0, 0.45);
    }

    .threshold-text {
      font-size: 11px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.55);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }
  }

  &__threshold-type {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.55);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }
  }
}
</style>
