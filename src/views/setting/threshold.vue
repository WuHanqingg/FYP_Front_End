<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import cardData from '@/views/data/cardData';

// 定义环境数据类型
interface EnvironmentDataType {
  id: string;
  type: string;
  unit: string;
  value: number;
  threshold: number | string;
  thresholdType: string;
  icon: string;
}

// 模拟环境数据
const environmentData = ref<EnvironmentDataType[]>([])
// 从cardData中获取环境数据
environmentData.value = cardData.environmentData;

// 阈值类型选项
const thresholdTypeOptions = [
  { value: 'above', label: '超过阈值警告' },
  { value: 'below', label: '低于阈值警告' },
  { value: 'none', label: '不进行比较' }
];

// 阈值类型映射
const thresholdTypeMap = {
  'above': '超过阈值警告',
  'below': '低于阈值警告',
  'none': '不进行比较'
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

// 更新阈值的方法（暂留空）
const updateThreshold = (id: string) => {
  const newValue = newThresholdValues.value[id];
  const newType = newThresholdTypes.value[id];
  
  if (newValue === undefined || newValue === "") {
    ElMessage.warning("请输入有效的阈值");
    return;
  }
  
  // 这里是API调用的位置，暂时留空
  // await api.updateThreshold(id, newValue, newType);
  
  // 更新本地数据
  const item = environmentData.value.find(data => data.id === id);
  if (item) {
    item.threshold = newValue;
    item.thresholdType = newType;
    ElMessage.success(`${item.type} 阈值和类型更新成功`);
  }
};

// 重置所有阈值为默认值
const resetAllThresholds = () => {
  // 这里是API调用的位置，暂时留空
  // await api.resetAllThresholds();
  
  // 重置本地数据
  environmentData.value = [...cardData.environmentData];
  initThresholdInputs();
  ElMessage.info("所有阈值已重置为默认值");
};

onMounted(() => {
  initThresholdInputs();
});
</script>

<template>
  <div class="threshold-container">
    <div class="threshold-header">
      <h2>阈值设置</h2>
      <p>为各项环境指标设置阈值，超出阈值时系统将发出警报</p>
    </div>
    
    <div class="threshold-content">
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
          <div class="threshold-card">
            <div class="threshold-card-header">
              <IconifyIconOnline :icon="item.icon" class="threshold-icon" />
              <div class="threshold-info">
                <h3 class="threshold-type">{{ item.type }}</h3>
                <p class="threshold-current">
                  当前阈值: 
                  <span class="current-value">{{ item.threshold }}{{ item.unit }}</span>
                </p>
                <p class="threshold-type-info">
                  阈值类型: 
                  <span class="type-value">{{ thresholdTypeMap[item.thresholdType as keyof typeof thresholdTypeMap] }}</span>
                </p>
              </div>
            </div>
            
            <div class="threshold-input-group">
              <el-input
                v-model="newThresholdValues[item.id]"
                :placeholder="`输入新的${item.type}阈值`"
                class="threshold-input"
                clearable
              >
                <template #append>{{ item.unit }}</template>
              </el-input>
              
              <el-select
                v-model="newThresholdTypes[item.id]"
                class="threshold-type-select"
                placeholder="请选择阈值类型"
              >
                <el-option
                  v-for="option in thresholdTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              
              <el-button 
                type="primary" 
                @click="updateThreshold(item.id)"
                class="update-btn"
              >
                更新
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <div class="threshold-actions">
        <el-button 
          type="warning" 
          @click="resetAllThresholds"
          plain
        >
          重置所有阈值
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.threshold-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

.threshold-header {
  margin-bottom: 30px;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 14px;
    color: #606266;
  }
}

.threshold-content {
  .el-row {
    margin-bottom: 20px;
  }
}

.threshold-item-col {
  margin-bottom: 20px;
}

.threshold-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.threshold-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.threshold-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  
  i {
    font-size: 24px;
    color: #409eff;
  }
}

.threshold-info {
  flex: 1;
  
  .threshold-type {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 5px 0;
  }
  
  .threshold-current {
    font-size: 13px;
    color: #909399;
    margin: 0 0 3px 0;
    
    .current-value {
      font-weight: 500;
      color: #409eff;
    }
  }
  
  .threshold-type-info {
    font-size: 12px;
    color: #909399;
    margin: 0;
    
    .type-value {
      font-weight: 500;
      color: #67c23a;
    }
  }
}

.threshold-input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  .threshold-input {
    width: 100%;
  }
  
  .threshold-type-select {
    width: 100%;
  }
  
  .update-btn {
    width: 100%;
    padding: 12px 16px;
  }
}

.threshold-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  
  .el-button {
    padding: 12px 30px;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .threshold-container {
    padding: 15px;
  }
  
  .threshold-card {
    padding: 15px;
  }
  
  .threshold-input-group {
    flex-direction: column;
    
    .update-btn {
      width: 100%;
    }
  }
}
</style>