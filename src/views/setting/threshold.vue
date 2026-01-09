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
    return "none";
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

// 阈值类型选项
const thresholdTypeOptions = [
  { value: "above", label: "Beyond threshold warning" },
  { value: "below", label: "Below threshold warning" },
  { value: "none", label: "No comparison" }
];

// 阈值类型映射
const thresholdTypeMap = {
  above: "Beyond threshold warning",
  below: "Below threshold warning",
  none: "No comparison"
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
const updateThreshold = async (id: string) => {
  const newValue = newThresholdValues.value[id];
  const newType = getTypeNum(newThresholdTypes.value[id]);
  console.log(newValue, newType, id);

  if ((newValue === undefined || newValue === "") && newType != 2) {
    ElMessage.warning("请输入有效的阈值");
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
    ElMessage.success(`${item.name} 阈值和类型更新成功`);
  } else {
    ElMessage.error(`${item.name} 阈值和类型更新失败`);
  }
};
onMounted(() => {
  console.log("onMounted");
  fetchData();
  initThresholdInputs();
});

</script>

<template>
  <div class="threshold-container">
    <div class="threshold-header">
      <h2>ThresholdSetting</h2>
      <p>
        Set thresholds for environmental indicators. System will alert when
        values exceed thresholds.
      </p>
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
                <h3 class="threshold-type">{{ item.name }}</h3>
                <p class="threshold-current">
                  Current threshold:
                  <span class="current-value"
                    >{{ item.threshold }}{{ item.unit }}</span
                  >
                </p>
                <p class="threshold-type-info">
                  Type:
                  <span class="type-value">{{
                    thresholdTypeMap[
                      item.thresholdType as keyof typeof thresholdTypeMap
                    ]
                  }}</span>
                </p>
              </div>
            </div>

            <div class="threshold-input-group">
              <el-input
                v-model="newThresholdValues[item.id]"
                :placeholder="`输入新的${item.name}阈值`"
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
                class="update-btn"
                @click="updateThreshold(item.id)"
              >
                Update
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 响应式调整
@media (width <= 768px) {
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

.threshold-container {
  min-height: calc(100vh - 100px);
  padding: 20px;
  background-color: #f5f7fa;
}

.threshold-header {
  margin-bottom: 30px;

  h2 {
    margin-bottom: 10px;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
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
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 20px 0 rgb(0 0 0 / 10%);
    transform: translateY(-2px);
  }
}

.threshold-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.threshold-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin-right: 15px;
  background: #fff;
  border-radius: 12px;

  i {
    font-size: 24px;
    color: #409eff;
  }
}

.threshold-info {
  flex: 1;

  .threshold-type {
    margin: 0 0 5px;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .threshold-current {
    margin: 0 0 3px;
    font-size: 13px;
    color: #909399;

    .current-value {
      font-weight: 500;
      color: #409eff;
    }
  }

  .threshold-type-info {
    margin: 0;
    font-size: 12px;
    color: #909399;

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
</style>
