<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import * as echarts from "echarts";
import { getHistoryData } from "@/api/CloudPlatformApi/getCurrentData";
import { tr } from "element-plus/es/locale/index.mjs";

// 图表实例
const chartRef = ref<HTMLDivElement | null>(null);
let windDirectionChart: echarts.ECharts | null = null;

// 数据间隔选项（毫秒）
const intervalOptions = [
  { label: "5分钟", value: 5 * 60 * 1000 },
  { label: "10分钟", value: 10 * 60 * 1000 },
  { label: "30分钟", value: 30 * 60 * 1000 },
  { label: "1小时", value: 60 * 60 * 1000 },
  { label: "2小时", value: 2 * 60 * 60 * 1000 },
  { label: "6小时", value: 6 * 60 * 60 * 1000 },
  { label: "12小时", value: 12 * 60 * 60 * 1000 },
  { label: "1天", value: 24 * 60 * 60 * 1000 },
  { label: "自定义", value: -1 } // 自定义选项
];

// 数据状态
const state = reactive({
  // 时间范围选择
  dateRange: [],
  // 风向数据
  windDirectionData: [] as { time: string; windDirection: number }[],
  // 加载状态
  loading: false,
  // 访问令牌
  token: "",
  // 数据间隔
  interval: 60 * 60 * 1000, // 默认1小时
  // 自定义间隔值
  customInterval: 60, // 默认60分钟
  // 是否显示自定义输入框
  showCustomInterval: false,
  // 原始数据备份，用户自定义间隔用
  originalData: [] as { time: string; windDirection: number }[],
});

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    windDirectionChart = echarts.init(chartRef.value);
    updateChart();
  }
};

// 更新图表
const updateChart = () => {
  if (!windDirectionChart) return;

  const option = {
    title: {
      text: "风向数据统计"
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>风向: ${data.value} °`;
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: 20,
        bottom: 10
      }
    ],
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: state.windDirectionData.map(item => item.time)
    },
    yAxis: {
      type: "value",
      name: "风向 (°)"
    },
    series: [
      {
        name: "风向",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "rgba(32, 160, 255, 0.5)"
            },
            {
              offset: 1,
              color: "rgba(32, 160, 255, 0.1)"
            }
          ])
        },
        lineStyle: {
          width: 2,
          color: "#20a0ff"
        },
        itemStyle: {
          color: "#20a0ff",
          borderWidth: 2
        },
        data: state.windDirectionData.map(item => item.windDirection)
      }
    ],
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    }
  };

  windDirectionChart.setOption(option);
};

// 获取风向数据
const fetchWindDirectionData = async () => {
  state.loading = true;
  
  try {
    // 确定时间范围
    let startTs: number;
    let endTs: number;
    
    if (state.dateRange && state.dateRange.length === 2) {
      startTs = new Date(state.dateRange[0]).getTime();
      endTs = new Date(state.dateRange[1]).getTime();
    } else {
      // 默认显示最近24小时
      endTs = Date.now();
      startTs = endTs - 24 * 60 * 60 * 1000;
    }
    
    // 计算limit值，确保获取足够的数据点
    const timeRange = endTs - startTs;
    
    // 调用API获取风向历史数据
    const res = await getHistoryData(
      "windDirection", // keys参数，指定获取风向数据
      startTs,    // 开始时间戳
      endTs,      // 结束时间戳
      0, 
      1440,      
      "NONE",     
    );
    
    // 处理API返回的数据
    console.log(res.windDirection)
    if (res.windDirection) {
      // 将API返回的数据转换为图表所需格式
      const formattedData = res.windDirection
        .map((item: { ts: number; value: string }) => ({
          time: new Date(item.ts).toISOString().slice(0, 16).replace("T", " "),
          windDirection: parseFloat(item.value)
        }))
        // 按时间排序
        .sort((a: { time: string }, b: { time: string }) => 
          new Date(a.time).getTime() - new Date(b.time).getTime()
        );
      state.windDirectionData = formattedData;
      // 备份原始数据
      state.originalData = formattedData;
    } else {
      state.windDirectionData = [];
    }
    
    // 更新图表
    nextTick(() => {
      updateChart();
    });
  } catch (error) {
    console.error("获取风向数据失败:", error);
    state.windDirectionData = [];
  } finally {
    state.loading = false;
  }
};

// 处理时间范围变化
const handleDateChange = () => {
  fetchWindDirectionData();
};

// 处理数据间隔变化
const handleIntervalChange = () => {
  if (state.interval === -1) {
    state.showCustomInterval = true;
  } else {
    state.showCustomInterval = false;
  }
  const trueData = ref([])
  trueData.value[0] = state.originalData[0]
  for (let i = 1; i < state.originalData.length; i++){
    let newestTime = new Date(trueData.value[trueData.value.length-1].time).getTime()
    if(new Date(state.originalData[i].time).getTime()-newestTime>=state.interval){
      trueData.value.push(state.originalData[i])
      newestTime = new Date(state.originalData[i].time).getTime()
    }
  }
  // 更新图表数据
  state.windDirectionData = trueData.value
  updateChart();
};

// 处理自定义间隔变化
const handleCustomIntervalChange = () => {
  const trueData = ref([])
  trueData.value[0] = state.originalData[0]
  for (let i = 1; i < state.originalData.length; i++){
    let newestTime = new Date(trueData.value[trueData.value.length-1].time).getTime()
    if(new Date(state.originalData[i].time).getTime()-newestTime>=state.customInterval*60*1000){
      trueData.value.push(state.originalData[i])
      newestTime = new Date(state.originalData[i].time).getTime()
    }
  } 
  // 更新图表数据
  state.windDirectionData = trueData.value
  updateChart();
};

// 重置时间范围
const resetDateRange = () => {
  state.dateRange = [];
  fetchWindDirectionData();
};

// 组件挂载后初始化
onMounted(() => {
  initChart();
  fetchWindDirectionData();
  
  // 监听窗口大小变化
  window.addEventListener("resize", () => {
    if (windDirectionChart) {
      windDirectionChart.resize();
    }
  });
});
</script>

<template>
  <div class="wind-direction-chart-container">
    <div class="header">
      <h2>风向数据可视化</h2>
      <div class="controls">
        <el-date-picker
          v-model="state.dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          @change="handleDateChange"
        />
        <el-select 
          v-model="state.interval" 
          placeholder="选择数据间隔"
          @change="handleIntervalChange"
          style="width: 120px; margin-left: 10px;"
        >
          <el-option
            v-for="item in intervalOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        
        <!-- 自定义间隔输入框 -->
        <div v-if="state.showCustomInterval" class="custom-interval-input">
          <el-input-number
            v-model="state.customInterval"
            :min="1"
            :max="1440"
            controls-position="right"
            style="width: 100px; margin-left: 10px;"
          />
          <span style="margin-left: 5px;">分钟</span>
          <el-button @click="handleCustomIntervalChange" style="margin-left: 10px;">确定</el-button>
        </div>
        
        <el-button @click="resetDateRange" style="margin-left: 10px;">重置</el-button>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <div 
        ref="chartRef" 
        class="chart" 
        :style="{ width: '100%', height: 'calc(100vh - 200px)' }"
      ></div>
      
      <div v-if="state.loading" class="loading">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="rect" style="width: 100%; height: 400px;" />
          </template>
        </el-skeleton>
      </div>
    </div>
    
    <div class="data-info">
      <h3>数据说明</h3>
      <p>• 横轴表示时间（精确到分钟）</p>
      <p>• 纵轴表示风向（单位：度）</p>
      <p>• 使用平滑折线图展示风向随时间的变化趋势</p>
      <p>• 可通过上方时间选择器筛选特定时间段的数据</p>
      <p>• 可通过数据间隔选择器调整数据点的密度</p>
      <p>• 选择"自定义"选项可输入任意分钟数作为数据间隔</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wind-direction-chart-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }
    
    .controls {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      
      .custom-interval-input {
        display: flex;
        align-items: center;
      }
    }
  }
  
  .chart-wrapper {
    position: relative;
    
    .chart {
      min-height: 400px;
    }
    
    .loading {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.8);
    }
  }
  
  .data-info {
    margin-top: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
    
    h3 {
      margin-top: 0;
      color: #606266;
    }
    
    p {
      margin: 5px 0;
      color: #909399;
      font-size: 14px;
    }
  }
}
</style>