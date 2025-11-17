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
  'above': '超过阈值警告',
  'below': '低于阈值警告',
  'none': '不进行比较'
};

const computeStatus = () => {
  if(props.data.thresholdType === 'none') {
    return "env-card--normal";
  }
  if (props.data.thresholdType === 'above') {
    if (props.data.value > props.data.threshold) {
      return "env-card--danger";
    } else if (props.data.value > props.data.threshold * 0.8) {
      return "env-card--warning";
    } else {
      return "env-card--normal";
    }
  }
  if (props.data.thresholdType === 'below') {
    if (props.data.value < props.data.threshold) {
      return "env-card--danger";
    } else if (props.data.value < props.data.threshold * 0.8) {
      return "env-card--warning";
    } else {
      return "env-card--normal";
    }
  }
};
</script>

<template>
  <div class="env-card" :class="computeStatus()" @click="handleClick">
    <div class="env-card__header">
      <IconifyIconOnline :icon="data.icon" width="50" height="50" />
      <div class="env-card__type">{{ data.type }}</div>
      <div class="env-card__threshold">
        <div class="threshold-value">
          <i class="threshold-icon ri-lock-line" />
          <span>{{ data.threshold }}{{ data.unit }}</span>
        </div>
        <div class="threshold-label">Threshold</div>
      </div>
    </div>

    <div class="env-card__content">
      <div class="env-card__value">
        <span class="value-number">{{ data.value }}</span>
        <span class="value-unit">{{ data.unit }}</span>
      </div>
      <!-- 添加阈值类型显示 -->
      <div class="env-card__threshold-type" style="font-size: 14px;">
        {{ thresholdTypeMap[data.thresholdType as keyof typeof thresholdTypeMap] }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.env-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  margin-bottom: 16px;
  overflow: hidden;
  cursor: pointer;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 25px 0 rgb(0 0 0 / 10%);
    transform: translateY(-5px);
  }

  &--normal {
    border-left: 4px solid #52c41a;
  }

  &--warning {
    border-left: 4px solid #faad14;
  }

  &--danger {
    border-left: 4px solid #ff4d4f;
  }

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-right: 12px;
    font-size: 24px;
    color: white;
    border-radius: 12px;
  }

  &__type {
    flex: 1;
    font-size: 22px;
    font-weight: 500;
    color: rgb(0 0 0 / 85%);
    text-align: left;
  }

  &__threshold {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 8px 12px;
    background-color: #f5f5f5;
    border-radius: 8px;

    .threshold-value {
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
      color: #333;

      .threshold-icon {
        margin-right: 6px;
        font-size: 20px;
        color: #1890ff;
      }
    }

    .threshold-label {
      font-size: 12px;
      font-weight: 500;
      color: rgb(0 0 0 / 45%);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  &__status {
    font-size: 20px;
    color: #52c41a;

    .env-card--warning & {
      color: #faad14;
    }

    .env-card--danger & {
      color: #ff4d4f;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
  }

  &__value {
    display: flex;
    align-items: baseline;

    .value-number {
      font-size: 56px;
      font-weight: 500;
      line-height: 1;
      color: rgb(0 0 0 / 85%);
    }

    .value-unit {
      margin-left: 8px;
      font-size: 28px;
      color: rgb(0 0 0 / 65%);
    }
  }

  // 添加阈值类型样式
  &__threshold-type {
    margin-top: 10px;
    font-size: 12px;
    font-weight: 500;
    color: #909399;
    text-align: center;
    padding: 4px 8px;
    background-color: #f5f7fa;
    border-radius: 4px;
    align-self: flex-start;
  }
}
</style>