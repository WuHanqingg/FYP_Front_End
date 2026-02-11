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
  interval: null,
  // 自定义间隔值
  customInterval: 60,
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
  { label: "Area Chart", value: "area" }
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
  if (windDirectionChart) {
    windDirectionChart.dispose();
  }
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

  calculateStatistics();

  const color = currentChartDataDetail.value.color;

  const option = {
    backgroundColor: "transparent",
    title: {
      text: currentChartDataDetail.value.title,
      textStyle: {
        fontSize: 18,
        fontWeight: 600,
        color: "#1a2332",
        fontFamily: "Inter, sans-serif"
      },
      left: "center",
      padding: [10, 0, 20, 0]
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const { name, value, marker } = params[0];
        const { seriesName, unit } = currentChartDataDetail.value;
        return `${name}<br/>${marker}${seriesName}: ${value} ${unit}`;
      },
      backgroundColor: "rgba(26, 35, 50, 0.9)",
      borderColor: color,
      borderWidth: 1,
      textStyle: {
        color: "#fff",
        fontSize: 12
      },
      padding: 12,
      borderRadius: 8
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: true
      },
      {
        type: "slider",
        start: 0,
        end: 100,
        height: 24,
        bottom: 15,
        backgroundColor: "rgba(0, 20, 40, 0.04)",
        borderColor: "rgba(0, 20, 40, 0.08)",
        fillerColor: color + "33",
        handleStyle: {
          color: color,
          borderColor: color
        },
        showDetail: true,
        showDataShadow: "auto",
        zoomLock: false
      }
    ],
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: state.currentData.map(item => item.time),
      axisLine: {
        lineStyle: {
          color: "rgba(0, 20, 40, 0.1)"
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: "#6b7b8c",
        fontSize: 11,
        rotate: 45,
        interval: "auto",
        hideOverlap: true,
        autoRotate: true,
        formatter: (value: string) => {
          return value.length > 16 ? value.substring(0, 16) + "..." : value;
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "rgba(0, 20, 40, 0.04)",
          type: "dashed"
        }
      }
    },
    yAxis: {
      type: "value",
      name: currentChartDataDetail.value.unit,
      nameTextStyle: {
        color: "#6b7b8c",
        fontSize: 12
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "rgba(0, 20, 40, 0.1)"
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: "#6b7b8c",
        fontSize: 12
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "rgba(0, 20, 40, 0.04)",
          type: "dashed"
        }
      }
    },
    legend: {
      data: [currentChartDataDetail.value.seriesName],
      top: 35,
      right: 30,
      textStyle: {
        color: "#6b7b8c",
        fontSize: 12
      },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 15
    },
    series: [
      {
        name: currentChartDataDetail.value.seriesName,
        type: currentChartType.value === "area" ? "line" : currentChartType.value,
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        areaStyle:
          currentChartType.value === "area"
            ? {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: color + "80"
                  },
                  {
                    offset: 1,
                    color: color + "10"
                  }
                ])
              }
            : currentChartType.value === "line"
              ? {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: color + "20"
                    },
                    {
                      offset: 1,
                      color: color + "05"
                    }
                  ])
                }
              : undefined,
        lineStyle: {
          width: 1.5,
          color: color
        },
        itemStyle: {
          color: color,
          borderWidth: 2,
          shadowBlur: 8,
          shadowColor: color + "66"
        },
        data: state.currentData.map(item => item.value)
      }
    ],
    grid: {
      left: "4%",
      right: "6%",
      bottom: "15%",
      top: "18%",
      containLabel: true,
      backgroundColor: "transparent",
      borderColor: "rgba(0, 20, 40, 0.08)",
      borderWidth: 1,
      borderRadius: 12
    }
  };

  windDirectionChart.setOption(option);
};

const updateDataType = () => {
  const type = currentChartDataType.value;
  const config = chartData[type as keyof typeof chartData];
  if (
    config &&
    typeof config === "object" &&
    "title" in config &&
    "unit" in config
  ) {
    currentChartDataDetail.value = config as ChartDataTypeConfig;
  }
  updateChart();
  fetchChartData();
};

const fetchChartData = async () => {
  state.loading = true;
  state.batchProgress = 0;
  state.totalBatches = 0;
  state.currentBatch = 0;

  try {
    let startTs: number;
    let endTs: number;

    if (state.dateRange && state.dateRange.length === 2) {
      startTs = new Date(state.dateRange[0]).getTime();
      endTs = new Date(state.dateRange[1]).getTime();
    } else {
      endTs = Date.now();
      startTs = endTs - 24 * 60 * 60 * 1000;
    }

    const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
    const timeRange = endTs - startTs;

    if (timeRange <= ONE_MONTH_MS) {
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
      const batchSize = ONE_MONTH_MS;
      const numBatches = Math.ceil(timeRange / batchSize);
      state.totalBatches = numBatches;
      state.currentBatch = 1;

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
            state.currentBatch += 1;
            state.batchProgress = Math.round(((i + 1) / numBatches) * 100);
            return result;
          })
        );
      }

      const batchResults = await Promise.allSettled(batchPromises);

      const allData: any[] = [];
      let successCount = 0;
      let failCount = 0;

      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successCount++;
          const batchData = result.value;
          if (
            batchData &&
            batchData[currentChartDataDetail.value.apiRequestName]
          ) {
            allData.push(
              ...batchData[currentChartDataDetail.value.apiRequestName]
            );
          }
        } else {
          failCount++;
          console.error(`Batch ${index + 1} data fetch failed:`, result.reason);
        }
      });

      if (successCount > 0) {
        const res = {
          [currentChartDataDetail.value.apiRequestName]: allData
        };
        processChartData(res);

        if (failCount > 0) {
          console.warn(
            `Data fetch completed, ${successCount} batches succeeded, ${failCount} batches failed`
          );
        }
      } else {
        throw new Error("All batches failed to fetch data");
      }
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
    state.currentData = [];
  } finally {
    state.loading = false;
    setTimeout(() => {
      state.batchProgress = 0;
      state.totalBatches = 0;
      state.currentBatch = 0;
    }, 2000);
  }
};

const processChartData = (res: any) => {
  if (res[currentChartDataDetail.value.apiRequestName]) {
    const formattedData = res[currentChartDataDetail.value.apiRequestName]
      .map((item: { ts: number; value: string }) => ({
        time: new Date(item.ts).toISOString().slice(0, 16).replace("T", " "),
        value: parseFloat(item.value)
      }))
      .sort(
        (a: { time: string }, b: { time: string }) =>
          new Date(a.time).getTime() - new Date(b.time).getTime()
      );

    const maxDataPoints = 3000;
    let finalData = formattedData;
    if (formattedData.length > maxDataPoints) {
      const step = Math.ceil(formattedData.length / maxDataPoints);
      finalData = [formattedData[0]];
      for (let i = step; i < formattedData.length - 1; i += step) {
        finalData.push(formattedData[i]);
      }
      finalData.push(formattedData[formattedData.length - 1]);
      ElMessage.warning(
        `Total ${formattedData.length} data points, displayed ${finalData.length} points to ensure performance`
      );
    }

    state.currentData = finalData;
    state.originalData = formattedData;
  } else {
    state.currentData = [];
  }

  nextTick(() => {
    updateChart();
  });
};

const handleDateChange = () => {
  fetchChartData();
};

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

  if (filteredData.length === 1 && state.originalData.length > 1) {
    filteredData.push(state.originalData[state.originalData.length - 1]);
  }

  state.currentData = filteredData;
  updateChart();
};

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

const handleCustomIntervalChange = () => {
  const intervalMs = state.customInterval * 60 * 1000;
  filterDataByInterval(intervalMs);
};

const resetDateRange = () => {
  state.dateRange = [];
  fetchChartData();
};

const exportExcel = () => {
  const fileName = currentChartDataType.value + ".xlsx";
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

const downloadChart = (type: "png" | "svg") => {
  if (!windDirectionChart) return;

  const fileName = `${currentChartDataType.value}_${new Date().getTime()}.${type}`;
  const dataURL = windDirectionChart.getDataURL({
    type: type,
    pixelRatio: 2,
    backgroundColor: "#f8fafc"
  });

  const link = document.createElement("a");
  link.href = dataURL;
  link.download = fileName;
  link.click();
};

onMounted(() => {
  initChart();
  fetchChartData();

  window.addEventListener("resize", () => {
    if (windDirectionChart) {
      windDirectionChart.resize();
    }
  });
});
</script>

<template>
  <div class="chart-container aero-dot-bg">
    <div class="aero-noise-bg" />
    
    <div class="chart-content">
      <!-- Header -->
      <div class="header-section aero-card">
        <div class="aero-corner-mark top-left" />
        <div class="aero-corner-mark top-right" />
        <div class="aero-corner-mark bottom-left" />
        <div class="aero-corner-mark bottom-right" />
        
        <h2 class="page-title aero-display aero-uppercase">DATA ANALYTICS</h2>
        
        <div class="controls-row">
          <div class="control-group">
            <label class="control-label aero-tech-label">DATA TYPE</label>
            <el-select
              v-model="currentChartDataType"
              placeholder="Choose Data Type"
              class="aero-select"
              @change="updateDataType()"
            >
              <el-option
                v-for="item in chartDataType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          
          <div class="control-group">
            <label class="control-label aero-tech-label">CHART TYPE</label>
            <el-select
              v-model="currentChartType"
              placeholder="Choose Chart Type"
              class="aero-select"
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
        </div>
        
        <div class="filter-row">
          <div class="filter-item">
            <label class="filter-label aero-tech-label">TIME RANGE</label>
            <el-date-picker
              v-model="state.dateRange"
              type="datetimerange"
              range-separator="To"
              start-placeholder="Start Time"
              end-placeholder="End Time"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              class="aero-date-picker"
              @change="handleDateChange"
            />
          </div>
          
          <div class="filter-item">
            <label class="filter-label aero-tech-label">DATA INTERVAL</label>
            <el-select
              v-model="state.interval"
              placeholder="Choose Interval"
              class="aero-select"
              @change="handleIntervalChange"
            >
              <el-option
                v-for="item in intervalOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          
          <div v-if="state.showCustomInterval" class="filter-item custom-interval">
            <label class="filter-label aero-tech-label">CUSTOM (MIN)</label>
            <el-input-number
              v-model="state.customInterval"
              :min="1"
              :max="1440"
              controls-position="right"
              class="aero-input-number"
            />
            <button class="confirm-btn" @click="handleCustomIntervalChange">
              Apply
            </button>
          </div>
          
          <div class="action-buttons">
            <button class="action-btn secondary" @click="resetDateRange">
              Reset
            </button>
            <button class="action-btn secondary" @click="exportExcel">
              Export Excel
            </button>
            <el-dropdown>
              <button class="action-btn primary">
                Download Chart
              </button>
              <template #dropdown>
                <el-dropdown-menu class="aero-dropdown-menu">
                  <el-dropdown-item @click="downloadChart('png')">
                    PNG Format
                  </el-dropdown-item>
                  <el-dropdown-item @click="downloadChart('svg')">
                    SVG Format
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
      
      <!-- Chart Section -->
      <div class="chart-section aero-card">
        <div class="aero-corner-mark top-left" />
        <div class="aero-corner-mark top-right" />
        <div class="aero-corner-mark bottom-left" />
        <div class="aero-corner-mark bottom-right" />
        
        <div class="chart-wrapper">
          <div
            ref="chartRef"
            class="chart"
          />
          
          <div v-if="state.loading" class="loading-overlay">
            <div class="loading-content">
              <div class="loading-spinner" />
              <p class="loading-text aero-tech-label">Loading data...</p>
              
              <div v-if="state.totalBatches > 1" class="batch-progress">
                <div class="progress-info">
                  <span class="progress-label aero-tech-label">
                    Batch {{ state.currentBatch }}/{{ state.totalBatches }}
                  </span>
                  <span class="progress-value aero-mono">{{ state.batchProgress }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: state.batchProgress + '%' }" />
                </div>
                <p class="progress-note aero-tech-label">
                  Time range exceeds 1 month, fetching in batches...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Statistics Section -->
      <div class="statistics-section">
        <div class="stat-card aero-card">
          <div class="aero-corner-mark top-left" />
          <div class="aero-corner-mark top-right" />
          <div class="aero-corner-mark bottom-left" />
          <div class="aero-corner-mark bottom-right" />
          
          <div class="stat-icon-wrapper">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label aero-tech-label">TOTAL POINTS</span>
            <span class="stat-value aero-mono">{{ statistics.count }}</span>
          </div>
        </div>
        
        <div class="stat-card aero-card">
          <div class="aero-corner-mark top-left" />
          <div class="aero-corner-mark top-right" />
          <div class="aero-corner-mark bottom-left" />
          <div class="aero-corner-mark bottom-right" />
          
          <div class="stat-icon-wrapper" style="color: #00d4ff">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label aero-tech-label">MAXIMUM</span>
            <span class="stat-value aero-mono">
              {{ statistics.max.toFixed(2) }} {{ currentChartDataDetail.unit }}
            </span>
          </div>
        </div>
        
        <div class="stat-card aero-card">
          <div class="aero-corner-mark top-left" />
          <div class="aero-corner-mark top-right" />
          <div class="aero-corner-mark bottom-left" />
          <div class="aero-corner-mark bottom-right" />
          
          <div class="stat-icon-wrapper" style="color: #00ffaa">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 21h18M5 21V7l8-4 8 4V7" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label aero-tech-label">MINIMUM</span>
            <span class="stat-value aero-mono">
              {{ statistics.min.toFixed(2) }} {{ currentChartDataDetail.unit }}
            </span>
          </div>
        </div>
        
        <div class="stat-card aero-card">
          <div class="aero-corner-mark top-left" />
          <div class="aero-corner-mark top-right" />
          <div class="aero-corner-mark bottom-left" />
          <div class="aero-corner-mark bottom-right" />
          
          <div class="stat-icon-wrapper" style="color: #7c3aed">
            <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 00-2-2z" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label aero-tech-label">AVERAGE</span>
            <span class="stat-value aero-mono">
              {{ statistics.avg.toFixed(2) }} {{ currentChartDataDetail.unit }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Info Section -->
      <div class="info-section aero-card">
        <div class="aero-corner-mark top-left" />
        <div class="aero-corner-mark top-right" />
        <div class="aero-corner-mark bottom-left" />
        <div class="aero-corner-mark bottom-right" />
        
        <h3 class="info-title aero-display aero-uppercase">USAGE GUIDE</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="info-dot" />
            <span class="info-text aero-body">X-axis represents time (accurate to minutes)</span>
          </div>
          <div class="info-item">
            <span class="info-dot" />
            <span class="info-text aero-body">Y-axis represents value of data</span>
          </div>
          <div class="info-item">
            <span class="info-dot" />
            <span class="info-text aero-body">Choose data type from the dropdown menu</span>
          </div>
          <div class="info-item">
            <span class="info-dot" />
            <span class="info-text aero-body">Filter data for specific time periods</span>
          </div>
          <div class="info-item">
            <span class="info-dot" />
            <span class="info-text aero-body">Adjust data point density via interval selector</span>
          </div>
          <div class="info-item">
            <span class="info-dot" />
            <span class="info-text aero-body">Select "Custom" to enter custom interval</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart-container {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, var(--aero-bg-base) 0%, #f0f4f8 100%);
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

.chart-content {
  position: relative;
  z-index: 1;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// Header Section
.header-section {
  padding: 1.5rem;
  margin-bottom: 20px;

  .page-title {
    font-size: var(--aero-font-size-2xl);
    font-weight: var(--aero-font-weight-semibold);
    color: var(--aero-text-primary);
    margin: 0 0 1.5rem 0;
    text-align: center;
    letter-spacing: var(--aero-letter-spacing-wider);
  }

  .controls-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 200px;
  }

  .control-label {
    font-size: var(--aero-font-size-xs);
    color: var(--aero-text-secondary);
  }

  .filter-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 20, 40, 0.06);
  }

  .filter-item {
    display: flex;
    align-items: center;
    gap: 8px;

    &.custom-interval {
      flex-wrap: wrap;
    }
  }

  .filter-label {
    font-size: var(--aero-font-size-xs);
    color: var(--aero-text-secondary);
    white-space: nowrap;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .action-btn {
    padding: 10px 16px;
    border-radius: var(--aero-border-radius-md);
    font-size: var(--aero-font-size-xs);
    font-weight: var(--aero-font-weight-semibold);
    cursor: pointer;
    transition: all var(--aero-transition-base);
    border: none;
    letter-spacing: var(--aero-letter-spacing-wide);
    text-transform: uppercase;

    &.secondary {
      background: rgba(0, 20, 40, 0.06);
      color: var(--aero-text-secondary);
      border: 1px solid var(--aero-border-glass);

      &:hover {
        background: rgba(0, 20, 40, 0.1);
        color: var(--aero-text-primary);
        border-color: rgba(0, 20, 40, 0.15);
      }
    }

    &.primary {
      background: var(--aero-gradient-cyan);
      color: white;
      box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 212, 255, 0.4);
      }
    }
  }

  .confirm-btn {
    padding: 10px 16px;
    border-radius: var(--aero-border-radius-md);
    font-size: var(--aero-font-size-xs);
    font-weight: var(--aero-font-weight-semibold);
    cursor: pointer;
    transition: all var(--aero-transition-base);
    border: none;
    background: var(--aero-gradient-cyan);
    color: white;
    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 212, 255, 0.4);
    }
  }
}

// Chart Section
.chart-section {
  padding: 1.5rem;
  min-height: 500px;

  .chart-wrapper {
    position: relative;
    width: 100%;
    height: calc(100vh - 350px);
    min-height: 400px;
  }

  .chart {
    width: 100%;
    height: 100%;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: var(--aero-border-radius-lg);
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 2rem;
    background: var(--aero-bg-glass-strong);
    border: 1px solid var(--aero-border-glass-strong);
    border-radius: var(--aero-border-radius-lg);
    box-shadow: var(--aero-shadow-ambient-strong);
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(0, 212, 255, 0.1);
    border-top-color: #00d4ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    font-size: var(--aero-font-size-sm);
    color: var(--aero-text-secondary);
  }

  .batch-progress {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 280px;

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .progress-label {
      font-size: var(--aero-font-size-xs);
      color: var(--aero-text-secondary);
    }

    .progress-value {
      font-size: var(--aero-font-size-lg);
      font-weight: var(--aero-font-weight-semibold);
      color: var(--aero-text-primary);
    }

    .progress-bar {
      height: 6px;
      background: rgba(0, 20, 40, 0.06);
      border-radius: var(--aero-border-radius-full);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--aero-gradient-cyan);
      border-radius: var(--aero-border-radius-full);
      transition: width 0.3s ease;
      box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
    }

    .progress-note {
      font-size: var(--aero-font-size-xs);
      color: var(--aero-text-tertiary);
      text-align: center;
    }
  }
}

// Statistics Section
.statistics-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  .stat-card {
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all var(--aero-transition-base);

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--aero-shadow-ambient-strong);
    }
  }

  .stat-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: var(--aero-bg-glass-weak);
    border: 1px solid var(--aero-border-glass);
    border-radius: var(--aero-border-radius-lg);
    color: var(--aero-text-secondary);
    transition: all var(--aero-transition-base);
  }

  .stat-card:hover .stat-icon-wrapper {
    background: rgba(0, 212, 255, 0.05);
    border-color: rgba(0, 212, 255, 0.2);
    box-shadow: 0 0 12px rgba(0, 212, 255, 0.15);
  }

  .stat-icon {
    width: 28px;
    height: 28px;
  }

  .stat-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-label {
    font-size: var(--aero-font-size-xs);
    color: var(--aero-text-tertiary);
  }

  .stat-value {
    font-size: var(--aero-font-size-2xl);
    font-weight: var(--aero-font-weight-light);
    color: var(--aero-text-primary);
    letter-spacing: -0.02em;
  }
}

// Info Section
.info-section {
  padding: 1.5rem;

  .info-title {
    font-size: var(--aero-font-size-lg);
    font-weight: var(--aero-font-weight-semibold);
    color: var(--aero-text-primary);
    margin: 0 0 1rem 0;
    letter-spacing: var(--aero-letter-spacing-wider);
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: rgba(0, 20, 40, 0.02);
    border-radius: var(--aero-border-radius-sm);
    transition: all var(--aero-transition-base);

    &:hover {
      background: rgba(0, 20, 40, 0.04);
    }
  }

  .info-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--aero-gradient-cyan);
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
    flex-shrink: 0;
  }

  .info-text {
    font-size: var(--aero-font-size-sm);
    color: var(--aero-text-secondary);
    line-height: var(--aero-line-height-normal);
  }
}

// Aero Select Styling
.aero-select {
  min-width: 140px;

  :deep(.el-input__wrapper) {
    background: var(--aero-bg-glass-weak);
    border: 1px solid var(--aero-border-glass);
    border-radius: var(--aero-border-radius-md);
    box-shadow: none;
    transition: all var(--aero-transition-base);

    &:hover {
      border-color: rgba(0, 160, 180, 0.3);
    }

    &.is-focus {
      border-color: rgba(0, 160, 180, 0.5);
      box-shadow: 0 0 0 3px rgba(0, 160, 180, 0.08);
    }
  }

  :deep(.el-input__inner) {
    color: var(--aero-text-primary);
    font-family: var(--aero-font-body);
  }
}

.aero-date-picker {
  :deep(.el-input__wrapper) {
    background: var(--aero-bg-glass-weak);
    border: 1px solid var(--aero-border-glass);
    border-radius: var(--aero-border-radius-md);
    box-shadow: none;
    transition: all var(--aero-transition-base);

    &:hover {
      border-color: rgba(0, 212, 255, 0.3);
    }

    &.is-focus {
      border-color: rgba(0, 212, 255, 0.6);
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }
  }

  :deep(.el-input__inner) {
    color: var(--aero-text-primary);
    font-family: var(--aero-font-body);
  }
}

.aero-input-number {
  :deep(.el-input__wrapper) {
    background: var(--aero-bg-glass-weak);
    border: 1px solid var(--aero-border-glass);
    border-radius: var(--aero-border-radius-md);
    box-shadow: none;
    transition: all var(--aero-transition-base);

    &:hover {
      border-color: rgba(0, 212, 255, 0.3);
    }

    &.is-focus {
      border-color: rgba(0, 212, 255, 0.6);
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }
  }

  :deep(.el-input__inner) {
    color: var(--aero-text-primary);
    font-family: var(--aero-font-mono);
  }
}

.aero-dropdown-menu {
  background: var(--aero-bg-glass-strong);
  backdrop-filter: blur(var(--aero-glass-blur-strong));
  -webkit-backdrop-filter: blur(var(--aero-glass-blur-strong));
  border: 1px solid var(--aero-border-glass-strong);
  border-radius: var(--aero-border-radius-md);
  box-shadow: var(--aero-shadow-ambient-strong);

  :deep(.el-dropdown-menu__item) {
    color: var(--aero-text-primary);
    font-family: var(--aero-font-body);

    &:hover {
      background: rgba(0, 212, 255, 0.1);
      color: var(--aero-text-primary);
    }
  }
}

// Responsive
@media (max-width: 1200px) {
  .statistics-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .chart-container {
    padding: 15px;
  }

  .header-section {
    padding: 1.25rem;

    .controls-row,
    .filter-row {
      flex-direction: column;
      align-items: stretch;
    }

    .control-group,
    .filter-item {
      width: 100%;
      min-width: unset;
    }

    .action-buttons {
      width: 100%;

      .action-btn {
        flex: 1;
      }
    }
  }

  .chart-section {
    padding: 1rem;

    .chart-wrapper {
      height: calc(100vh - 450px);
    }
  }

  .statistics-section {
    grid-template-columns: 1fr;
  }

  .info-section {
    padding: 1.25rem;
  }
}
</style>
