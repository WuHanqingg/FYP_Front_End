<script setup lang="ts">
import { testToken } from "@/api/BackEnd/getUser";
defineOptions({
  name: "Welcome"
});
</script>

<template>
  <h1>Pure-Admin-Thin（非国际化版本）</h1>
  <el-button type="primary" @click="testToken">测试token</el-button>
</template>
