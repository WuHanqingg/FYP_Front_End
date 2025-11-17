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
  yesterdayValue: number; // 昨天的数值
  status: 'normal' | 'warning' | 'danger'; // 数据状态
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

// 计算相比昨天的变化百分比
const changePercentage = computed(() => {
  if (props.data.yesterdayValue === 0) return 0;
  return ((props.data.value - props.data.yesterdayValue) / props.data.yesterdayValue * 100).toFixed(1);
});

// 判断是上升还是下降
const isUp = computed(() => props.data.value > props.data.yesterdayValue);

// 根据状态获取背景色
const statusBgClass = computed(() => {
  switch (props.data.status) {
    case 'danger':
      return 'env-card--danger';
    case 'warning':
      return 'env-card--warning';
    default:
      return 'env-card--normal';
  }
});

// 根据状态获取图标
const statusIcon = computed(() => {
  switch (props.data.status) {
    case 'danger':
      return 'ri-error-warning-line';
    case 'warning':
      return 'ri-alert-line';
    default:
      return 'ri-checkbox-circle-line';
  }
});
</script>

<template>
  <div class="env-card" :class="statusBgClass" @click="handleClick">
    <div class="env-card__header">
      <!-- <div class="env-card__icon" :style="{ backgroundColor: data.color }">
        <i :class="data.icon"></i>
      </div> -->
      <IconifyIconOnline :icon=data.icon width="50" height="50" />
      <div class="env-card__type">{{ data.type }}</div>
      <div class="env-card__change-top">
        <div class="change-indicator" :class="{ 'change-up': isUp, 'change-down': !isUp }">
          <i :class="isUp ? 'ri-arrow-up-line' : 'ri-arrow-down-line'"></i>
          <span>{{ Math.abs(Number(changePercentage)) }}%</span>
        </div>
        <div class="change-text">较昨日</div>
      </div>
    </div>
    
    <div class="env-card__content">
      <div class="env-card__value">
        <span class="value-number">{{ data.value }}</span>
        <span class="value-unit">{{ data.unit }}</span>
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
  
  &__change-top {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    
    .change-indicator {
      display: flex;
      align-items: center;
      margin-bottom: 2px;
      font-size: 24px;
      font-weight: 500;
      
      &.change-up {
        color: #ff4d4f;
      }
      
      &.change-down {
        color: #52c41a;
      }
      
      i {
        margin-right: 4px;
        font-size: 24px;
      }
    }
    
    .change-text {
      font-size: 14px;
      color: rgb(0 0 0 / 45%);
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
}
</style>