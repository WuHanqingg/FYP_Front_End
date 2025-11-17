<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import * as echarts from "echarts";
import { getRainData } from "@/views/chart/getHistoryData";

// 图表实例
const chartRef = ref<HTMLDivElement | null>(null);
let rainfallChart: echarts.ECharts | null = null;

// 数据状态
const state = reactive({
  // 时间范围选择
  dateRange: [],
  // 降雨量数据
  rainfallData: [] as { time: string; rainfall: number }[],
  // 加载状态
  loading: false,
  // 访问令牌
  token: ""
});

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    rainfallChart = echarts.init(chartRef.value);
    updateChart();
  }
};

// 更新图表
const updateChart = () => {
  if (!rainfallChart) return;

  const option = {
    title: {
      text: "降雨量数据统计"
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>降雨量: ${data.value} mm`;
      }
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: state.rainfallData.map(item => item.time)
    },
    yAxis: {
      type: "value",
      name: "降雨量 (mm)"
    },
    series: [
      {
        name: "降雨量",
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
        data: state.rainfallData.map(item => item.rainfall)
      }
    ],
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    }
  };

  rainfallChart.setOption(option);
};


// 获取降雨量数据
const fetchRainfallData = async () => {
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
    
    // 调用API获取降雨量历史数据
    const res = await getRainData(
      "rainfall", // keys参数，指定获取降雨量数据
      startTs,    // 开始时间戳
      endTs,      // 结束时间戳
      0,          // interval
      1440,       // limit
      "NONE",     // agg
    );
    
    // 处理API返回的数据
    console.log(res.rainfall)
    if (res.rainfall) {
      // 将API返回的数据转换为图表所需格式
      const formattedData = res.rainfall
        .map((item: { ts: number; value: string }) => ({
          time: new Date(item.ts).toISOString().slice(0, 16).replace("T", " "),
          rainfall: parseFloat(item.value)
        }))
        // 按时间排序
        .sort((a: { time: string }, b: { time: string }) => 
          new Date(a.time).getTime() - new Date(b.time).getTime()
        );
      //console.log(formattedData)
      state.rainfallData = formattedData;
    } else {
      state.rainfallData = [];
    }
    
    // 更新图表
    nextTick(() => {
      updateChart();
    });
  } catch (error) {
    console.error("获取降雨量数据失败:", error);
    state.rainfallData = [];
  } finally {
    state.loading = false;
  }
};

// 处理时间范围变化
const handleDateChange = () => {
  fetchRainfallData();
};

// 重置时间范围
const resetDateRange = () => {
  state.dateRange = [];
  fetchRainfallData();
};

// 组件挂载后初始化
onMounted(() => {
  initChart();
  fetchRainfallData();
  
  // 监听窗口大小变化
  window.addEventListener("resize", () => {
    if (rainfallChart) {
      rainfallChart.resize();
    }
  });
});
</script>

<template>
  <div class="rainfall-chart-container">
    <div class="header">
      <h2>降雨量数据可视化</h2>
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
      <p>• 纵轴表示降雨量（单位：毫米）</p>
      <p>• 使用平滑折线图展示降雨量随时间的变化趋势</p>
      <p>• 可通过上方时间选择器筛选特定时间段的数据</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rainfall-chart-container {
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