<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";
import { getHistoryData } from "@/api/CloudPlatformApi/getCurrentData";
import chartData from "@/views/data/chartData";
import * as xlsx from "xlsx";
import { ElMessage } from "element-plus";

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
  originalData: [] as { time: string; value: number }[],
  // 批处理进度
  batchProgress: 0,
  // 总批次数
  totalBatches: 0,
  // 当前批次
  currentBatch: 0
});

// 图表类型选项
const chartTypeOptions = [
  { label: "Line Chart", value: "line" },
  { label: "Bar Chart", value: "bar" },
  { label: "Area Chart", value: "area" } // 使用专门的area类型
];

// 当前图表类型
const currentChartType = ref("line");

// 定义图表数据类型配置的接口
interface ChartDataTypeConfig {
  title: string;
  unit: string;
  seriesName: string;
  apiRequestName: string;
  label: string;
  value: string;
  color: string;
}

// 默认为风向数据
const currentChartDataDetail = ref<ChartDataTypeConfig>(
  chartData.windDirectionData as ChartDataTypeConfig
);

// 统计数据
const statistics = reactive({
  max: 0,
  min: 0,
  avg: 0,
  count: 0
});

// 组件卸载时的清理工作
onUnmounted(() => {
  // 清理工作
});

// 计算统计数据
const calculateStatistics = () => {
  if (state.currentData.length === 0) {
    statistics.max = 0;
    statistics.min = 0;
    statistics.avg = 0;
    statistics.count = 0;
    return;
  }

  const values = state.currentData.map(item => item.value);
  statistics.max = Math.max(...values);
  statistics.min = Math.min(...values);
  statistics.avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  statistics.count = values.length;
};

// 将calculateStatistics调用直接添加到updateChart函数内部

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

  // 先计算统计数据
  calculateStatistics();

  const option = {
    backgroundColor: "#fafafa",
    title: {
      text: currentChartDataDetail.value.title,
      textStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333"
      },
      left: "center",
      padding: [10, 0, 20, 0]
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        // 极简格式，只显示必要信息
        const { name, value, marker } = params[0];
        const { seriesName, unit } = currentChartDataDetail.value;

        return `${name}<br/>${marker}${seriesName}: ${value} ${unit}`;
      },
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      borderColor: currentChartDataDetail.value.color,
      borderWidth: 1,
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      padding: 10,
      borderRadius: 6,
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: "#999"
        }
      }
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
        // 支持鼠标滚轮缩放
        zoomOnMouseWheel: true,
        // 支持拖拽平移
        moveOnMouseMove: true,
        // 支持点击缩放
        moveOnMouseWheel: true
      },
      {
        type: "slider",
        start: 0,
        end: 100,
        height: 20,
        bottom: 10,
        backgroundColor: "#f5f5f5",
        borderColor: "#e8e8e8",
        fillerColor: `rgba(${currentChartDataDetail.value.color.slice(1)}, 0.2)`,
        handleStyle: {
          color: currentChartDataDetail.value.color
        },
        // 显示缩放按钮
        showDetail: true,
        // 显示数据范围
        showDataShadow: "auto",
        // 缩放时保持选中范围的中心位置
        zoomLock: false
      }
    ],
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: state.currentData.map(item => item.time),
      axisLine: {
        lineStyle: {
          color: "#ccc"
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: "#666",
        fontSize: 11,
        rotate: 45,
        // 自动调整标签间隔，放大时显示更多标签
        interval: 'auto',
        // 标签过多时自动隐藏，保证可读性
        hideOverlap: true,
        // 自动旋转标签以适应空间
        autoRotate: true,
        // 省略过长的标签
        formatter: (value: string) => {
          return value.length > 16 ? value.substring(0, 16) + '...' : value;
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#f0f0f0",
          type: "dashed"
        }
      },
      // 添加滚动条配置
      scrollbar: {
        show: true,
        type: "inside",
        height: 8,
        bottom: 20
      }
    },
    yAxis: {
      type: "value",
      name: currentChartDataDetail.value.unit,
      nameTextStyle: {
        color: "#666",
        fontSize: 12
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#ccc"
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: "#666",
        fontSize: 12
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#f0f0f0",
          type: "dashed"
        }
      }
    },
    legend: {
      data: [currentChartDataDetail.value.seriesName],
      top: 30,
      right: 30,
      textStyle: {
        color: "#666",
        fontSize: 12
      },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 15
    },
    series: [
      {
        name: currentChartDataDetail.value.seriesName,
        type:
          currentChartType.value === "area" ? "line" : currentChartType.value,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        // 为area chart添加专门的配置
        areaStyle:
          currentChartType.value === "area"
            ? {
                // 当选择Area Chart时，使用更明显的面积效果
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: currentChartDataDetail.value.color + "80" // 使用主题色，透明度50%
                  },
                  {
                    offset: 1,
                    color: currentChartDataDetail.value.color + "10" // 使用主题色，透明度10%
                  }
                ])
              }
            : currentChartType.value === "line"
              ? {
                  // 普通折线图使用较浅的面积效果
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: currentChartDataDetail.value.color + "20" // 使用主题色，透明度20%
                    },
                    {
                      offset: 1,
                      color: currentChartDataDetail.value.color + "05" // 使用主题色，透明度5%
                    }
                  ])
                }
              : undefined,
        lineStyle: {
          width: 2,
          color: currentChartDataDetail.value.color
        },
        itemStyle: {
          color: currentChartDataDetail.value.color,
          borderWidth: 2
        },
        data: state.currentData.map(item => item.value)
      }
    ],
    grid: {
      left: "4%",
      right: "6%",
      bottom: "12%",
      top: "15%",
      containLabel: true,
      backgroundColor: "#fff",
      borderColor: "#e8e8e8",
      borderWidth: 1,
      borderRadius: 8
    }
  };

  windDirectionChart.setOption(option);
};

const updateDataType = () => {
  // 确保获取到正确的配置对象
  const type = currentChartDataType.value;
  // 从chartData中获取对应的数据类型配置
  // 注意：chartData包含chartDataType和intervalOptions数组，所以需要确保只获取数据配置对象
  const config = chartData[type as keyof typeof chartData];
  if (
    config &&
    typeof config === "object" &&
    "title" in config &&
    "unit" in config
  ) {
    // 确保config是数据配置对象，而不是数组
    currentChartDataDetail.value = config as ChartDataTypeConfig;
  }
  updateChart();
  fetchChartData();
};

// 获取风向数据
const fetchChartData = async () => {
  state.loading = true;
  // 重置批处理状态
  state.batchProgress = 0;
  state.totalBatches = 0;
  state.currentBatch = 0;

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

    // 定义一个月的时间常量（30天）
    const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
    const timeRange = endTs - startTs;

    // 判断是否需要分批次获取
    if (timeRange <= ONE_MONTH_MS) {
      // 时间范围不超过一个月，直接获取数据
      state.totalBatches = 1;
      state.currentBatch = 1;
      
      const res = await getHistoryData(
        currentChartDataDetail.value.apiRequestName,
        startTs,
        endTs,
        0,
        43200,
        "NONE"
      );

      state.batchProgress = 100;
      processChartData(res);
    } else {
      // 时间范围超过一个月，需要分批次获取
      const batchSize = ONE_MONTH_MS;
      const numBatches = Math.ceil(timeRange / batchSize);
      state.totalBatches = numBatches;
      state.currentBatch = 1;
      
      // 创建批次时间范围数组
      const batchPromises = [];
      for (let i = 0; i < numBatches; i++) {
        const batchStart = startTs + i * batchSize;
        const batchEnd = Math.min(batchStart + batchSize - 1, endTs);
        
        batchPromises.push(
          getHistoryData(
            currentChartDataDetail.value.apiRequestName,
            batchStart,
            batchEnd,
            0,
            43200,
            "NONE"
          ).then(result => {
            // 更新当前批次和进度
            state.currentBatch += 1;
            state.batchProgress = Math.round(((i + 1) / numBatches) * 100);
            return result;
          })
        );
      }

      // 并行执行所有批次请求，使用allSettled处理部分失败的情况
      const batchResults = await Promise.allSettled(batchPromises);
      
      // 合并成功批次的数据
      const allData: any[] = [];
      let successCount = 0;
      let failCount = 0;
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
          const batchData = result.value;
          if (batchData && batchData[currentChartDataDetail.value.apiRequestName]) {
            allData.push(...batchData[currentChartDataDetail.value.apiRequestName]);
          }
        } else {
          failCount++;
          console.error(`Batch ${index + 1} data fetch failed:`, result.reason);
        }
      });

      // 如果有成功获取的数据
      if (successCount > 0) {
        const res = {
          [currentChartDataDetail.value.apiRequestName]: allData
        };
        processChartData(res);
        
        // 如果有失败的批次，显示警告信息
        if (failCount > 0) {
          console.warn(`Data fetch completed, ${successCount} batches succeeded, ${failCount} batches failed`);
        }
      } else {
        // 所有批次都失败了
        throw new Error('All batches failed to fetch data');
      }
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
    state.currentData = [];
  } finally {
    state.loading = false;
    // 重置批处理进度显示
    setTimeout(() => {
      state.batchProgress = 0;
      state.totalBatches = 0;
      state.currentBatch = 0;
    }, 2000);
  }
};

// 处理图表数据的公共函数
const processChartData = (res: any) => {
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
    
    // 性能优化：如果数据点过多，进行抽样显示
    const maxDataPoints = 3000; // 进一步限制最大数据点数量以保证性能
    let finalData = formattedData;
    if (formattedData.length > maxDataPoints) {
      const step = Math.ceil(formattedData.length / maxDataPoints);
      // 确保包含第一个和最后一个数据点
      finalData = [formattedData[0]];
      for (let i = step; i < formattedData.length - 1; i += step) {
        finalData.push(formattedData[i]);
      }
      finalData.push(formattedData[formattedData.length - 1]);
      // 确保包含第一个和最后一个数据点
      ElMessage.warning(`Total ${formattedData.length} data points, displayed ${finalData.length} points to ensure performance`);
    }
    
    state.currentData = finalData;
    // 备份原始数据
    state.originalData = formattedData;
  } else {
    state.currentData = [];
  }

  // 更新图表
  nextTick(() => {
    updateChart();
  });
};

// 处理时间范围变化
const handleDateChange = () => {
  fetchChartData();
};

// 通用的数据间隔筛选函数
const filterDataByInterval = (intervalMs: number) => {
  if (!state.originalData || state.originalData.length === 0) {
    state.currentData = [];
    return;
  }

  const filteredData = [state.originalData[0]];
  let lastTime = new Date(state.originalData[0].time).getTime();

  for (let i = 1; i < state.originalData.length; i++) {
    const currentTime = new Date(state.originalData[i].time).getTime();
    if (currentTime - lastTime >= intervalMs) {
      filteredData.push(state.originalData[i]);
      lastTime = currentTime;
    }
  }

  // 如果只有一个数据点，并且原始数据有多个，添加最后一个数据点以保证图表显示
  if (filteredData.length === 1 && state.originalData.length > 1) {
    filteredData.push(state.originalData[state.originalData.length - 1]);
  }

  state.currentData = filteredData;
  updateChart();
};

// 处理数据间隔变化
const handleIntervalChange = () => {
  if (state.interval === -1) {
    state.showCustomInterval = true;
  } else {
    state.showCustomInterval = false;
    if (state.interval) {
      filterDataByInterval(state.interval);
    }
  }
};

// 处理自定义间隔变化
const handleCustomIntervalChange = () => {
  const intervalMs = state.customInterval * 60 * 1000;
  filterDataByInterval(intervalMs);
};

// 重置时间范围
const resetDateRange = () => {
  state.dateRange = [];
  fetchChartData();
};

const exportExcel = () => {
  const fileName = currentChartDataType.value + ".xlsx";
  // Use original full data for export, but display filtered data for chart
  const exportData = state.originalData.map(
    (item: { time: string; value: number }) => ({
      time: item.time,
      [currentChartDataDetail.value.seriesName]: item.value
    })
  );
  const ws = xlsx.utils.json_to_sheet(exportData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, fileName);
  xlsx.writeFile(wb, fileName);
};

// 下载图表为图片
const downloadChart = (type: "png" | "svg") => {
  if (!windDirectionChart) return;

  const fileName = `${currentChartDataType.value}_${new Date().getTime()}.${type}`;
  const dataURL = windDirectionChart.getDataURL({
    type: type,
    pixelRatio: 2, // 提高图片质量
    backgroundColor: "#fafafa"
  });

  const link = document.createElement("a");
  link.href = dataURL;
  link.download = fileName;
  link.click();
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
      <div style="display: flex; gap: 10px; align-items: center">
        <el-select
          v-model="currentChartDataType"
          placeholder="Choose Data Type"
          style="width: 170px"
          @change="updateDataType()"
        >
          <el-option
            v-for="item in chartDataType"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select
          v-model="currentChartType"
          placeholder="Choose Chart Type"
          style="width: 170px"
          @change="updateChart"
        >
          <el-option
            v-for="item in chartTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
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
          >Export Excel</el-button
        >
        <el-dropdown style="margin-left: 10px">
          <el-button>
            Download Chart<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="downloadChart('png')"
                >PNG Format</el-dropdown-item
              >
              <el-dropdown-item @click="downloadChart('svg')"
                >SVG Format</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="chart-wrapper">
      <div
        ref="chartRef"
        class="chart"
        :style="{ width: '100%', height: 'calc(100vh - 280px)' }"
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
        
        <!-- 批处理进度指示器 -->
        <div v-if="state.totalBatches > 1" class="batch-progress">
          <div class="progress-info">
            <span>Data fetch progress: {{ state.currentBatch }}/{{ state.totalBatches }} batches</span>
            <span style="margin-left: 20px">{{ state.batchProgress }}%</span>
          </div>
          <el-progress 
            :percentage="state.batchProgress" 
            :stroke-width="8"
            :show-text="false"
            style="width: 80%; margin: 10px auto;"
          />
          <div class="progress-note" v-if="state.totalBatches > 1">
            <small>Time Range over 1 month, fetching data in batches...</small>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息区域 -->
    <div class="statistics-panel">
      <div class="statistic-item">
        <div class="statistic-label">Total Points</div>
        <div class="statistic-value">{{ statistics.count }}</div>
      </div>
      <div class="statistic-item">
        <div class="statistic-label">Maximum</div>
        <div
          class="statistic-value"
          :style="{ color: (currentChartDataDetail.value as any).color }"
        >
          {{ statistics.max.toFixed(2) }}
          {{ (currentChartDataDetail.value as any).unit }}
        </div>
      </div>
      <div class="statistic-item">
        <div class="statistic-label">Minimum</div>
        <div
          class="statistic-value"
          :style="{ color: (currentChartDataDetail.value as any).color }"
        >
          {{ statistics.min.toFixed(2) }}
          {{ (currentChartDataDetail.value as any).unit }}
        </div>
      </div>
      <div class="statistic-item">
        <div class="statistic-label">Average</div>
        <div
          class="statistic-value"
          :style="{ color: (currentChartDataDetail.value as any).color }"
        >
          {{ statistics.avg.toFixed(2) }}
          {{ (currentChartDataDetail.value as any).unit }}
        </div>
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
        width: 100%;
        overflow: hidden;
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

  .statistics-panel {
    display: flex;
    gap: 20px;
    margin-top: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 8px;

    .statistic-item {
      flex: 1;
      text-align: center;
      padding: 10px;
      background-color: #fff;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      .statistic-label {
        font-size: 12px;
        color: #909399;
        margin-bottom: 6px;
      }

      .statistic-value {
        font-size: 20px;
        font-weight: bold;
        color: #303133;
      }
    }
  }

  .batch-progress {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    padding: 15px;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
    text-align: center;

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 14px;
      color: #606266;
    }

    .progress-note {
      margin-top: 10px;
      font-size: 12px;
      color: #909399;
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
