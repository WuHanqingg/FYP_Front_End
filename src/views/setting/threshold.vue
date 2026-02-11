<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import cardData from "@/views/data/cardData";
import { getThreshold, updateThresholdById } from "@/api/BackEnd/getThreshold";

// 定义环境数据类型
interface EnvironmentDataType {
  id: string;
  name: string;
  unit: string;
  value: number;
  threshold: number | string;
  thresholdType: string;
  icon: string;
}

// 模拟环境数据
const environmentData = ref<EnvironmentDataType[]>([]);
// 从cardData中获取环境数据
environmentData.value = cardData.environmentData;

const fetchData = async () => {
  try {
    const response = await getThreshold();
    if (response.data.code == 200) {
      const result = response.data.data.list;
      result.forEach(item => {
        const envItem = environmentData.value.find(
          data => data.name == item.name
        );
        if (envItem) {
          envItem.threshold = item.value;
          envItem.thresholdType = getTypeString(item.type);
          envItem.name = item.name;
          envItem.unit = item.unit;
          envItem.id = item.id;
        }
      });
      initThresholdInputs();
    } else {
      ElMessage.error("Failed to fetch threshold data");
    }
  } catch (error) {
    ElMessage.error("Failed to fetch threshold data");
  }
};

const getTypeString = (type: number) => {
  if (type == 1) {
    return "above";
  } else if (type == 0) {
    return "below";
  } else {
    return "off";
  }
};

const getTypeNum = (type: string) => {
  if (type == "above") {
    return 1;
  } else if (type == "below") {
    return 0;
  } else {
    return 2;
  }
};

// 新阈值输入值
const newThresholdValues = ref<Record<string, string>>({});

// 新阈值类型选择值
const newThresholdTypes = ref<Record<string, string>>({});

// 初始化输入框的值
const initThresholdInputs = () => {
  environmentData.value.forEach(item => {
    newThresholdValues.value[item.id] = String(item.threshold);
    newThresholdTypes.value[item.id] = item.thresholdType;
  });
};

// 设置触发类型
const setTriggerType = (id: string, type: string) => {
  newThresholdTypes.value[id] = type;
};

// 取消修改
const cancelUpdate = (item: EnvironmentDataType) => {
  newThresholdValues.value[item.id] = String(item.threshold);
  newThresholdTypes.value[item.id] = item.thresholdType;
  ElMessage.info("Changes cancelled");
};

// 更新阈值的方法
const updateThreshold = async (id: string) => {
  const newValue = newThresholdValues.value[id];
  const newType = getTypeNum(newThresholdTypes.value[id]);

  if ((newValue === undefined || newValue === "") && newType != 2) {
    ElMessage.warning("Please enter a valid threshold value");
    return;
  }

  const item = environmentData.value.find(data => data.id === id);
  const data = {
    value: newValue,
    type: newType,
    id: id
  };
  const res = await updateThresholdById(data);
  if (res.data.code == 200) {
    ElMessage.success(`${item.name} alert settings updated successfully`);
    // 更新本地数据
    item.threshold = newValue;
    item.thresholdType = newThresholdTypes.value[id];
  } else {
    ElMessage.error(`${item.name} alert settings update failed`);
  }
};

// 获取当前读数状态
const getReadingStatus = (item: EnvironmentDataType) => {
  const value = Number(item.value) || 0;
  const threshold = Number(item.threshold) || 0;
  
  if (item.thresholdType === "off" || threshold === 0) {
    return "Normal";
  }
  
  if (item.thresholdType === "above") {
    return value > threshold ? "Alert" : "Normal";
  } else if (item.thresholdType === "below") {
    return value < threshold ? "Alert" : "Normal";
  }
  
  return "Normal";
};

onMounted(() => {
  fetchData();
  initThresholdInputs();
});
</script>

<template>
  <div class="threshold-container aero-dot-bg">
    <div class="aero-noise-bg" />
    
    <div class="threshold-content">
      <div class="threshold-header aero-card">
        <div class="aero-corner-mark top-left" />
        <div class="aero-corner-mark top-right" />
        <div class="aero-corner-mark bottom-left" />
        <div class="aero-corner-mark bottom-right" />
        
        <h2 class="threshold-title aero-display aero-uppercase">THRESHOLD SETTING</h2>
        <p class="threshold-description aero-body">
          Set thresholds for environmental indicators. System will alert when
          values exceed thresholds.
        </p>
      </div>

      <el-row :gutter="20">
        <el-col
          v-for="item in environmentData"
          :key="item.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          class="threshold-item-col"
        >
          <div class="alert-card aero-card">
            <div class="aero-corner-mark top-left" />
            <div class="aero-corner-mark top-right" />
            <div class="aero-corner-mark bottom-left" />
            <div class="aero-corner-mark bottom-right" />
            
            <!-- Card Title -->
            <div class="card-title-row">
              <h3 class="card-title aero-display">{{ item.name }} Alert Settings</h3>
            </div>
            
            <!-- Row 1: Current Reading -->
            <div class="reading-row">
              <div class="reading-badge aero-glass-weak">
                <span class="reading-label">Current Reading:</span>
                <span class="reading-value aero-mono">{{ item.value || 0 }} {{ item.unit }}</span>
                <span class="reading-status" :class="getReadingStatus(item).toLowerCase()">
                  ({{ getReadingStatus(item) }})
                </span>
              </div>
            </div>
            
            <!-- Row 2: Trigger Condition -->
            <div class="trigger-row">
              <label class="trigger-label aero-tech-label">Trigger Condition</label>
              <div class="trigger-options">
                <button
                  class="trigger-btn"
                  :class="{ active: newThresholdTypes[item.id] === 'above' }"
                  @click="setTriggerType(item.id, 'above')"
                >
                  Alert if Above (>)
                </button>
                <button
                  class="trigger-btn"
                  :class="{ active: newThresholdTypes[item.id] === 'below' }"
                  @click="setTriggerType(item.id, 'below')"
                >
                  Alert if Below (<)
                </button>
                <button
                  class="trigger-btn"
                  :class="{ active: newThresholdTypes[item.id] === 'off' }"
                  @click="setTriggerType(item.id, 'off')"
                >
                  Off
                </button>
              </div>
            </div>
            
            <!-- Row 3: Threshold Value -->
            <div class="value-row">
              <label class="value-label aero-tech-label">Threshold Value</label>
              <div class="value-input-wrapper">
                <input
                  v-model="newThresholdValues[item.id]"
                  type="number"
                  class="value-input aero-mono"
                  placeholder="Enter value"
                  :disabled="newThresholdTypes[item.id] === 'off'"
                />
                <span class="value-unit aero-tech-label">{{ item.unit }}</span>
              </div>
            </div>
            
            <!-- Row 4: Action Buttons -->
            <div class="action-row">
              <button class="cancel-btn" @click="cancelUpdate(item)">
                Cancel
              </button>
              <button class="confirm-btn" @click="updateThreshold(item.id)">
                Save Configuration
              </button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.threshold-container {
  position: relative;
  min-height: calc(100vh - 100px);
  padding: 20px;
  background: linear-gradient(180deg, var(--aero-bg-base) 0%, #e8e4e0 100%);
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

.threshold-content {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;

  .el-row {
    margin-bottom: 20px;
  }
}

.threshold-header {
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;

  .threshold-title {
    font-size: var(--aero-font-size-2xl);
    font-weight: var(--aero-font-weight-semibold);
    color: var(--aero-text-primary);
    margin-bottom: 0.75rem;
    letter-spacing: var(--aero-letter-spacing-wider);
  }

  .threshold-description {
    font-size: var(--aero-font-size-base);
    color: var(--aero-text-secondary);
    max-width: 600px;
    margin: 0 auto;
  }
}

.threshold-item-col {
  margin-bottom: 20px;
}

// Alert Card - New Design
.alert-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

// Card Title
.card-title-row {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(60, 60, 60, 0.05);

  .card-title {
    font-size: var(--aero-font-size-lg);
    font-weight: var(--aero-font-weight-semibold);
    color: var(--aero-text-primary);
    margin: 0;
    letter-spacing: var(--aero-letter-spacing-tight);
  }
}

// Row 1: Current Reading
.reading-row {
  .reading-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--aero-border-radius-md);
    border: 1px solid var(--aero-border-glass);
    font-size: var(--aero-font-size-sm);

    .reading-label {
      color: var(--aero-text-secondary);
      font-weight: var(--aero-font-weight-medium);
    }

    .reading-value {
      color: var(--aero-text-primary);
      font-weight: var(--aero-font-weight-semibold);
    }

    .reading-status {
      font-weight: var(--aero-font-weight-medium);
      
      &.normal {
        color: #00a050;
      }
      
      &.alert {
        color: #d05050;
      }
    }
  }
}

// Row 2: Trigger Condition
.trigger-row {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .trigger-label {
    font-size: var(--aero-font-size-xs);
    color: var(--aero-text-secondary);
    text-transform: uppercase;
    letter-spacing: var(--aero-letter-spacing-wider);
  }

  .trigger-options {
    display: flex;
    border-radius: var(--aero-border-radius-md);
    overflow: hidden;
    border: 1px solid var(--aero-border-glass);
    background: var(--aero-bg-glass-weak);
  }

  .trigger-btn {
    flex: 1;
    padding: 8px 6px;
    border: none;
    background: transparent;
    color: var(--aero-text-secondary);
    font-size: 10px;
    font-weight: var(--aero-font-weight-medium);
    cursor: pointer;
    transition: all var(--aero-transition-fast);
    text-align: center;
    white-space: nowrap;

    &:not(:last-child) {
      border-right: 1px solid var(--aero-border-glass);
    }

    &:hover {
      background: rgba(64, 158, 255, 0.08);
      color: var(--aero-text-primary);
    }

    &.active {
      background: linear-gradient(135deg, var(--el-color-primary) 0%, #337ecc 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.35);
    }
  }
}

// Row 3: Threshold Value
.value-row {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .value-label {
    font-size: var(--aero-font-size-xs);
    color: var(--aero-text-secondary);
    text-transform: uppercase;
    letter-spacing: var(--aero-letter-spacing-wider);
  }

  .value-input-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: rgba(60, 60, 60, 0.04);
    border: 1px solid var(--aero-border-glass);
    border-radius: var(--aero-border-radius-md);
    transition: all var(--aero-transition-base);

    &:focus-within {
      border-color: rgba(64, 158, 255, 0.4);
      box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.08);
      background: rgba(60, 60, 60, 0.02);
    }
  }

  .value-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 26px;
    font-weight: var(--aero-font-weight-light);
    color: var(--aero-text-primary);
    outline: none;
    width: 100%;

    &::placeholder {
      color: var(--aero-text-tertiary);
      font-size: var(--aero-font-size-lg);
    }

    &:disabled {
      color: var(--aero-text-tertiary);
      cursor: not-allowed;
    }
  }

  .value-unit {
    font-size: var(--aero-font-size-sm);
    color: var(--aero-text-secondary);
    font-weight: var(--aero-font-weight-medium);
    white-space: nowrap;
  }
}

// Row 4: Action Buttons
.action-row {
  display: flex;
  gap: 10px;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(60, 60, 60, 0.05);

  .cancel-btn,
  .confirm-btn {
    flex: 1;
    padding: 10px 14px;
    border-radius: var(--aero-border-radius-md);
    font-size: var(--aero-font-size-xs);
    font-weight: var(--aero-font-weight-semibold);
    cursor: pointer;
    transition: all var(--aero-transition-base);
    border: none;
    letter-spacing: var(--aero-letter-spacing-wide);
  }

  .cancel-btn {
    background: rgba(60, 60, 60, 0.05);
    color: var(--aero-text-secondary);
    border: 1px solid var(--aero-border-glass);

    &:hover {
      background: rgba(60, 60, 60, 0.08);
      color: var(--aero-text-primary);
      border-color: rgba(60, 60, 60, 0.12);
    }
  }

  .confirm-btn {
    background: linear-gradient(135deg, var(--el-color-primary) 0%, #337ecc 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

@media (width <= 768px) {
  .threshold-container {
    padding: 15px;
  }

  .alert-card {
    padding: 1rem;
  }

  .trigger-row {
    .trigger-btn {
      padding: 6px 4px;
      font-size: 9px;
    }
  }

  .value-row {
    .value-input {
      font-size: 22px;
    }
  }

  .action-row {
    .cancel-btn,
    .confirm-btn {
      padding: 8px 10px;
      font-size: 10px;
    }
  }
}
</style>
