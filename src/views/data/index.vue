<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import CardData from "./cardData";
import EnvCard from "./components/EnvCard.vue";
import { DataSourceSwitcher } from "@/components/DataSourceSwitcher";
import { useDataSourceStoreHook, type DataSourceType } from "@/store/modules/dataSource";
import { fetchCurrentData } from "@/api/dataService";
import { message } from "@/utils/message";

defineOptions({
  name: "data"
});

const store = useDataSourceStoreHook();

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;

const pagination = ref({ current: 1, pageSize: 12, total: 0 });
const dataLoading = ref(false);
const EnvData = ref([]);
const searchValue = ref("");
const currentSource = computed(() => store.getCurrentSource);

const AMBIENT_SUPPORTED_FIELDS = [
  "ambientTemperature",
  "ambientHumidity",
  "pressure",
  "windSpeed",
  "windDirection",
  "rainfall"
];

const getCardListData = async () => {
  dataLoading.value = true;

  try {
    const result = await fetchCurrentData(currentSource.value);
    const data = result.data;

    let baseData = CardData.environmentData.map(item => ({ ...item }));

    if (currentSource.value === "ambientWeather") {
      baseData = baseData.filter(item =>
        AMBIENT_SUPPORTED_FIELDS.includes(item.id)
      );
    }

    EnvData.value = baseData;

    if (data) {
      EnvData.value.forEach(item => {
        const fieldData = data[item.id];
        if (fieldData && fieldData[0]) {
          item.value = fieldData[0].value;
        }
      });
    }

    pagination.value = {
      ...pagination.value,
      total: EnvData.value.length
    };

    store.setLastUpdated(Date.now());
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch data";
    message(errorMessage, { type: "error" });
    store.setError(errorMessage);
  } finally {
    dataLoading.value = false;
  }
};

const handleSourceChange = (source: DataSourceType) => {
  store.preserveState({
    pagination: { ...pagination.value },
    searchValue: searchValue.value
  });
  getCardListData();
};

const handleSourceError = (error: Error) => {
  message(error.message, { type: "error" });
};

const onPageSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.current = 1;
};

const onCurrentChange = (current: number) => {
  pagination.value.current = current;
};

watch(currentSource, () => {
  const preserved = store.restoreState();
  if (preserved.pagination) {
    pagination.value = { ...preserved.pagination };
  }
  if (preserved.searchValue !== undefined) {
    searchValue.value = preserved.searchValue;
  }
});

onMounted(() => {
  getCardListData();
});
</script>

<template>
  <div class="data-page-container aero-dot-bg">
    <div class="aero-noise-bg" />

    <div class="data-page-content">
      <div class="page-header aero-card">
        <div class="aero-corner-mark top-left" />
        <div class="aero-corner-mark top-right" />
        <div class="aero-corner-mark bottom-left" />
        <div class="aero-corner-mark bottom-right" />

        <div class="header-top">
          <h2 class="page-title aero-display aero-uppercase">ENVIRONMENTAL MONITOR</h2>
          <div class="header-actions">
            <button class="refresh-btn" @click="getCardListData" :disabled="dataLoading">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" :class="{ 'spinning': dataLoading }">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
            <DataSourceSwitcher @change="handleSourceChange" @error="handleSourceError" />
          </div>
        </div>

        <div class="header-info">
          <div class="info-item">
            <span class="info-label aero-tech-label">CURRENT SOURCE</span>
            <span class="info-value aero-body">{{ store.getCurrentSourceOption?.label }}</span>
          </div>
          <div v-if="store.getLastUpdated" class="info-item">
            <span class="info-label aero-tech-label">LAST UPDATED</span>
            <span class="info-value aero-mono">
              {{ new Date(store.getLastUpdated).toLocaleTimeString() }}
            </span>
          </div>
        </div>
      </div>

      <div
        class="data-grid-wrapper"
        v-loading="dataLoading"
        :element-loading-svg="svg"
        element-loading-svg-view-box="-10, -10, 50, 50"
      >
        <template v-if="pagination.total > 0">
          <el-row :gutter="16">
            <el-col
              v-for="(data, index) in EnvData.slice(
                pagination.pageSize * (pagination.current - 1),
                pagination.pageSize * pagination.current
              )"
              :key="index"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
              :xl="4"
            >
              <EnvCard :key="data.id" :data="data" />
            </el-col>
          </el-row>
        </template>

        <div v-else-if="!dataLoading" class="empty-state aero-card">
          <div class="aero-corner-mark top-left" />
          <div class="aero-corner-mark top-right" />
          <div class="aero-corner-mark bottom-left" />
          <div class="aero-corner-mark bottom-right" />

          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="empty-text aero-body">No data available from current source</p>
          <p class="empty-hint aero-tech-label">Try switching to a different data source</p>
        </div>
      </div>

      <div v-if="pagination.total > 0" class="pagination-wrapper aero-card">
        <div class="aero-corner-mark top-left" />
        <div class="aero-corner-mark top-right" />
        <div class="aero-corner-mark bottom-left" />
        <div class="aero-corner-mark bottom-right" />

        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[12, 24, 36, 48]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onPageSizeChange"
          @current-change="onCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-page-container {
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

.data-page-content {
  position: relative;
  z-index: 1;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  padding: 1.5rem;

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 1rem;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--aero-bg-glass-weak);
    border: 1px solid var(--aero-border-glass);
    border-radius: var(--aero-border-radius-md);
    color: var(--aero-text-secondary);
    font-size: var(--aero-font-size-sm);
    font-weight: var(--aero-font-weight-medium);
    cursor: pointer;
    transition: all var(--aero-transition-base);

    &:hover:not(:disabled) {
      background: var(--aero-bg-glass);
      border-color: rgba(0, 212, 255, 0.3);
      color: var(--aero-text-primary);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    svg {
      width: 18px;
      height: 18px;

      &.spinning {
        animation: spin 1s linear infinite;
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }

  .page-title {
    font-size: var(--aero-font-size-2xl);
    font-weight: var(--aero-font-weight-semibold);
    color: var(--aero-text-primary);
    margin: 0;
    letter-spacing: var(--aero-letter-spacing-wider);
  }

  .header-info {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    padding-top: 1rem;
    border-top: 1px solid var(--aero-border-glass);
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    font-size: 10px;
    color: var(--aero-text-tertiary);
    letter-spacing: var(--aero-letter-spacing-wider);
  }

  .info-value {
    font-size: var(--aero-font-size-sm);
    color: var(--aero-text-primary);
  }
}

.data-grid-wrapper {
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;

  .empty-icon {
    width: 64px;
    height: 64px;
    color: var(--aero-text-tertiary);
    margin-bottom: 1rem;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .empty-text {
    font-size: var(--aero-font-size-lg);
    color: var(--aero-text-secondary);
    margin: 0 0 0.5rem 0;
  }

  .empty-hint {
    font-size: var(--aero-font-size-sm);
    color: var(--aero-text-tertiary);
    margin: 0;
  }
}

.pagination-wrapper {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: center;

  :deep(.el-pagination) {
    .el-pagination__total,
    .el-pagination__sizes,
    .el-pagination__jump {
      color: var(--aero-text-secondary);
      font-family: var(--aero-font-body);
    }

    .btn-prev,
    .btn-next,
    .el-pager li {
      background: var(--aero-bg-glass-weak);
      border: 1px solid var(--aero-border-glass);
      border-radius: var(--aero-border-radius-sm);
      color: var(--aero-text-primary);
      font-family: var(--aero-font-body);

      &:hover {
        background: var(--aero-bg-glass);
        border-color: var(--aero-border-glass-strong);
      }

      &.is-active {
        background: var(--aero-gradient-cyan);
        border-color: transparent;
        color: white;
      }
    }
  }
}

@media (max-width: 767px) {
  .data-page-container {
    padding: 15px;
  }

  .page-header {
    padding: 1rem;

    .header-top {
      flex-direction: column;
      align-items: flex-start;
    }

    .page-title {
      font-size: var(--aero-font-size-xl);
    }

    .header-info {
      gap: 16px;
    }
  }

  .pagination-wrapper {
    padding: 0.75rem 1rem;

    :deep(.el-pagination) {
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
    }
  }
}
</style>
