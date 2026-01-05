<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import * as echarts from "echarts";
import { getHistoryData } from "@/api/CloudPlatformApi/getCurrentData";
import chartData from "@/views/data/chartData";
import * as xlsx from "xlsx";

// 图表实例
const chartRef = ref<HTMLDivElement | null>(null);
let windDirectionChart: echarts.ECharts | null = null;

// 数据间隔选项（毫秒）
const intervalOptions = chartData.intervalOptions;

const chartDataType = chartData.chartDataType;

const currentChartDataType = ref("windDirection");

// 数据状态
const state = reactive({
  // 时间范围选择
  dateRange: [],
  // 风向数据
  currentData: [] as { time: string; value: number }[],
  // 加载状态
  loading: false,
  // 访问令牌
  token: "",
  // 数据间隔
  interval: null, // 默认1小时
  // 自定义间隔值
  customInterval: 60, // 默认60分钟
  // 是否显示自定义输入框
  showCustomInterval: false,
  // 原始数据备份，用户自定义间隔用
  originalData: [] as { time: string; windDirection: number }[]
});

//默认为风向数据
const currentChartDataDetail = ref(chartData.windDirectionData);


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
      text: currentChartDataDetail.value.title
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>${currentChartDataDetail.value.seriesName}
        : ${data.value} ${currentChartDataDetail.value.unit}`;
      }
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100
      },
      {
        type: "slider",
        start: 0,
        end: 100,
        height: 20,
        bottom: 10
      }
    ],
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: state.currentData.map(item => item.time)
    },
    yAxis: {
      type: "value",
      name: currentChartDataDetail.value.unit
    },
    series: [
      {
        name: currentChartDataDetail.value.seriesName,
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
        data: state.currentData.map(item => item.value)
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

const updateDataType = () => {
  currentChartDataDetail.value = chartData[currentChartDataType.value];
  updateChart();
  fetchChartData();
};

// 获取风向数据
const fetchChartData = async () => {
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
      currentChartDataDetail.value.apiRequestName, // keys参数，指定获取风向数据
      startTs, // 开始时间戳
      endTs, // 结束时间戳
      0,
      1440,
      "NONE"
    );

    // 处理API返回的数据
    if (res[currentChartDataDetail.value.apiRequestName]) {
      // 将API返回的数据转换为图表所需格式
      const formattedData = res[currentChartDataDetail.value.apiRequestName]
        .map((item: { ts: number; value: string }) => ({
          time: new Date(item.ts).toISOString().slice(0, 16).replace("T", " "),
          value: parseFloat(item.value)
        }))
        // 按时间排序
        .sort(
          (a: { time: string }, b: { time: string }) =>
            new Date(a.time).getTime() - new Date(b.time).getTime()
        );
      state.currentData = formattedData;
      // 备份原始数据
      state.originalData = formattedData;
    } else {
      state.currentData = [];
    }

    // 更新图表
    nextTick(() => {
      updateChart();
    });
  } catch (error) {
    console.error("获取数据失败:", error);
    state.currentData = [];
  } finally {
    state.loading = false;
  }
};

// 处理时间范围变化
const handleDateChange = () => {
  fetchChartData();
};

// 处理数据间隔变化
const handleIntervalChange = () => {
  if (state.interval === -1) {
    state.showCustomInterval = true;
  } else {
    state.showCustomInterval = false;
  }
  const trueData = ref([]);
  trueData.value[0] = state.originalData[0];
  for (let i = 1; i < state.originalData.length; i++) {
    let newestTime = new Date(
      trueData.value[trueData.value.length - 1].time
    ).getTime();
    if (
      new Date(state.originalData[i].time).getTime() - newestTime >=
      state.interval
    ) {
      trueData.value.push(state.originalData[i]);
      newestTime = new Date(state.originalData[i].time).getTime();
    }
  }
  // 更新图表数据
  state.currentData = trueData.value;
  updateChart();
};

// 处理自定义间隔变化
const handleCustomIntervalChange = () => {
  const trueData = ref([]);
  trueData.value[0] = state.originalData[0];
  for (let i = 1; i < state.originalData.length; i++) {
    let newestTime = new Date(
      trueData.value[trueData.value.length - 1].time
    ).getTime();
    if (
      new Date(state.originalData[i].time).getTime() - newestTime >=
      state.customInterval * 60 * 1000
    ) {
      trueData.value.push(state.originalData[i]);
      newestTime = new Date(state.originalData[i].time).getTime();
    }
  }
  // 更新图表数据
  state.currentData = trueData.value;
  updateChart();
};

// 重置时间范围
const resetDateRange = () => {
  state.dateRange = [];
  fetchChartData();
};

const exportExcel = () => {
  const fileName = currentChartDataType.value + ".xlsx";
  const exportData = state.currentData.map((item: { time: string; value: number }) => ({
    time: item.time,
    [currentChartDataDetail.value.seriesName]: item.value
  }));
  const ws = xlsx.utils.json_to_sheet(exportData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, fileName);
  xlsx.writeFile(wb, fileName);
};

// 组件挂载后初始化
onMounted(() => {
  initChart();
  fetchChartData();

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
      <el-select
        v-model="currentChartDataType"
        placeholder="Choose Data Type"
        style="width: 170px; margin-left: 10px"
        @change="updateDataType()"
      >
        <el-option
          v-for="item in chartDataType"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <div class="controls">
        <el-date-picker
          v-model="state.dateRange"
          type="datetimerange"
          range-separator="To"
          start-placeholder="Start Time"
          end-placeholder="End Time"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          @change="handleDateChange"
        />
        <el-select
          v-model="state.interval"
          placeholder="Choose Interval"
          style="width: 170px; margin-left: 10px"
          @change="handleIntervalChange"
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
            style="width: 100px; margin-left: 10px"
          />
          <span style="margin-left: 5px">min</span>
          <el-button
            style="margin-left: 10px"
            @click="handleCustomIntervalChange"
            >Confirm</el-button
          >
        </div>

        <el-button style="margin-left: 10px" @click="resetDateRange"
          >Reset</el-button
        >
        <el-button style="margin-left: 10px" @click="exportExcel"
          >Download</el-button
        >
      </div>
    </div>

    <div class="chart-wrapper">
      <div
        ref="chartRef"
        class="chart"
        :style="{ width: '100%', height: 'calc(100vh - 200px)' }"
      />

      <div v-if="state.loading" class="loading">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item
              variant="rect"
              style="width: 100%; height: 400px"
            />
          </template>
        </el-skeleton>
      </div>
    </div>

    <div class="data-info">
      <h3>Tips</h3>
      <p>• The X-axis represents time (accurate to minutes)</p>
      <p>• The Y-axis represents value of data</p>
      <p>• Left up corner: choose data type</p>
      <p>
        • Uses a smooth line chart to show the change trend of wind direction
        over time
      </p>
      <p>• Filter data for specific time periods via the time selector above</p>
      <p>• Adjust the density of data points via the data interval selector</p>
      <p>
        • Select the "Custom" option to enter any number of minutes as the data
        interval
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wind-direction-chart-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;

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
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: rgb(255 255 255 / 80%);
    }
  }

  .data-info {
    padding: 15px;
    margin-top: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;

    h3 {
      margin-top: 0;
      color: #606266;
    }

    p {
      margin: 5px 0;
      font-size: 14px;
      color: #909399;
    }
  }
}
</style>
