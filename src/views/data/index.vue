<script setup lang="ts">
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { ref, onMounted, nextTick } from "vue";
import CardData from "./cardData";
import EnvCard from "./components/EnvCard.vue";
import { getWeatherData, getYesterdayData } from "./getCurrentData";

defineOptions({
  name: "CardList"
});

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

const INITIAL_DATA = {
  name: "",
  status: "",
  description: "",
  type: "",
  mark: ""
};

const pagination = ref({ current: 1, pageSize: 12, total: 0 });

const dataLoading = ref(false);
const EnvData = ref([]);
const getCardListData = async () => {
  const data = await getWeatherData();
  EnvData.value = CardData.environmentData;
  EnvData.value.forEach(item => {
    item.value = data[item.id][0].value;
  });
  pagination.value = {
    ...pagination.value,
    total: CardData.environmentData.length
  };
};

onMounted(() => {
  getCardListData();
});

const searchValue = ref("");

const onPageSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.current = 1;
};
const onCurrentChange = (current: number) => {
  pagination.value.current = current;
};
</script>

<template>
  <div>
    <div
      v-loading="dataLoading"
      :element-loading-svg="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-empty
        v-show="
          EnvData.slice(
            pagination.pageSize * (pagination.current - 1),
            pagination.pageSize * pagination.current
          ).filter(v => v.id.toLowerCase().includes(searchValue.toLowerCase()))
            .length === 0
        "
        :description="`${searchValue} 暂无数据`"
      />
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
        <!-- <el-button type="primary" @click="getWeatherData">添加环境</el-button>
        <el-button type="primary" @click="getYesterdayData">历史数据</el-button> -->
        <!-- <el-pagination
          v-model:currentPage="pagination.current"
          class="float-right"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[12, 24, 36]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onPageSizeChange"
          @current-change="onCurrentChange"
        /> -->
      </template>
    </div>
  </div>
</template>
