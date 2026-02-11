<script setup lang="ts">
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "./utils/rule";
import { ref, reactive, toRaw } from "vue";
import { debounce } from "@pureadmin/utils";
import { useNav } from "@/layout/hooks/useNav";
import { useEventListener } from "@vueuse/core";
import type { FormInstance } from "element-plus";
import { useLayout } from "@/layout/hooks/useLayout";
import { bg, avatar, illustration } from "./utils/static";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import { getToken, setToken } from "@/utils/auth";
import { addPathMatch, getTopMenu } from "@/router/utils";
import { usePermissionStoreHook } from "@/store/modules/permission";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import Lock from "~icons/ri/lock-fill";
import User from "~icons/ri/user-3-fill";
import { Icon } from "@iconify/vue";

import { login } from "@/api/BackEnd/getUser";
defineOptions({
  name: "Login"
});

const router = useRouter();
const loading = ref(false);
const disabled = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);
const { title } = useNav();

const ruleForm = reactive({
  username: "admin",
  password: "admin123"
});

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      loading.value = true;
      const res = await login({
        username: ruleForm.username,
        passwordHash: ruleForm.password
      });
      if (res.data.code == 200) {
        setToken(res.data.data);
      } else {
        message("Login Failed, Please Check Your Credentials", {
          type: "error"
        });
      }
      //全部采取静态路由模式
      usePermissionStoreHook().handleWholeMenus([]);
      addPathMatch();
      router.push(getTopMenu(true).path);
      message("Login Successful", { type: "success" });
      loading.value = false;
    }
    loading.value = false;
  });
};

const immediateDebounce: any = debounce(
  formRef => onLogin(formRef),
  1000,
  true
);

useEventListener(document, "keydown", ({ code }) => {
  if (
    ["Enter", "NumpadEnter"].includes(code) &&
    !disabled.value &&
    !loading.value
  )
    immediateDebounce(ruleFormRef.value);
});
</script>

<template>
  <div class="login-container aero-dot-bg">
    <div class="aero-noise-bg" />
    
    <div class="flex-c absolute right-5 top-3">
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
        class="theme-switch"
      />
    </div>
    
    <div class="login-content">
      <div class="login-visual">
        <div class="visual-card primary aero-card-cyan aero-float">
          <Icon icon="carbon:cloud" class="visual-icon" />
        </div>
        <div class="visual-card secondary aero-card aero-float">
          <Icon icon="carbon:security" class="visual-icon" />
        </div>
        <div class="visual-card tertiary aero-card aero-float">
          <Icon icon="carbon:chart-line-data" class="visual-icon" />
        </div>
      </div>
      
      <div class="login-box aero-card">
        <div class="aero-corner-mark top-left" />
        <div class="aero-corner-mark top-right" />
        <div class="aero-corner-mark bottom-left" />
        <div class="aero-corner-mark bottom-right" />
        
        <div class="login-form">
          <Motion>
            <h2 class="login-title aero-display aero-uppercase">{{ title }}</h2>
          </Motion>

          <el-form ref="ruleFormRef" :model="ruleForm" size="large">
            <Motion :delay="100">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: 'Please enter your username',
                    trigger: 'blur'
                  }
                ]"
                prop="username"
              >
                <el-input
                  v-model="ruleForm.username"
                  clearable
                  placeholder="Username"
                  :prefix-icon="useRenderIcon(User)"
                  class="aero-input"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="ruleForm.password"
                  clearable
                  show-password
                  placeholder="Password"
                  :prefix-icon="useRenderIcon(Lock)"
                  class="aero-input"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button
                class="login-btn aero-button"
                size="default"
                type="primary"
                :loading="loading"
                :disabled="disabled"
                @click="onLogin(ruleFormRef)"
              >
                Login
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import url("@/style/login.css");

/* 修复1: 容器改为 Flex 居中，并修正宽度防止滚动条 */
.login-container {
  position: relative;
  width: 100%; /* 从 100vw 改为 100% 防止水平滚动条 */
  min-height: 100vh;
  background: linear-gradient(180deg, var(--aero-bg-base) 0%, #f0f4f8 100%);
  font-family: var(--aero-font-body);
  display: flex; /* 关键改动 */
  justify-content: center;
  align-items: center;

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

/* 修复2: 内容区域使用 Flex 布局，不再依赖 Grid */
.login-content {
  position: relative;
  z-index: 1;
  width: auto; /* 自适应内容宽度 */
  max-width: 1200px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4rem; /* 控制图标区域和登录框的间距 */
  padding: 2rem;
}

/* 修复3: 视觉区域逻辑重构 */
.login-visual {
  position: relative;
  width: 400px;
  height: 400px;
  /* 增加 Flex 属性，强制内部 relative 元素居中 */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media screen and (max-width: 1180px) {
    width: 300px;
    height: 300px;
  }

  @media screen and (max-width: 968px) {
    display: none;
  }
}

.visual-card {
  position: absolute; /* 默认 absolute 保持不变 */
  border-radius: var(--aero-border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;

  /* 修复4: Primary 卡片改为 relative，这样它会被父级 Flex 完美居中 */
  &.primary {
    position: relative; 
    width: 180px;
    height: 180px;
    z-index: 3;
    animation-delay: 0s;

    .visual-icon {
      color: var(--aero-text-primary);
    }
  }

  /* Secondary 和 Tertiary 保持 absolute，围绕中心点分布 */
  &.secondary {
    width: 140px;
    height: 140px;
    top: 40px;
    right: 80px;
    z-index: 2;
    animation-delay: 0.5s;

    .visual-icon {
      color: #059669;
    }
  }

  &.tertiary {
    width: 120px;
    height: 120px;
    bottom: 60px;
    left: 80px;
    z-index: 2;
    animation-delay: 1s;

    .visual-icon {
      color: #7c3aed;
    }
  }

  @media screen and (max-width: 1180px) {
    &.primary {
      width: 140px;
      height: 140px;
    }

    &.secondary {
      width: 110px;
      height: 110px;
      right: 60px;
    }

    &.tertiary {
      width: 90px;
      height: 90px;
      left: 60px;
    }
  }
}

.visual-icon {
  width: 3.5rem;
  height: 3.5rem;

  @media screen and (max-width: 1180px) {
    width: 2.5rem;
    height: 2.5rem;
  }
}

.login-box {
  width: 400px;
  padding: 2.5rem;
  flex-shrink: 0; /* 防止被挤压 */

  @media screen and (max-width: 1180px) {
    width: 320px;
    padding: 2rem;
  }

  @media screen and (max-width: 968px) {
    margin: 0 auto;
  }
}

.login-form {
  width: 100%;
}

.login-title {
  font-size: var(--aero-font-size-3xl);
  font-weight: var(--aero-font-weight-semibold);
  color: var(--aero-text-primary);
  margin-bottom: 2rem;
  letter-spacing: var(--aero-letter-spacing-wider);
}

.aero-input {
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

  :deep(.el-input__prefix-inner) {
    color: var(--aero-text-tertiary);
  }
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: var(--aero-font-size-base);
  font-weight: var(--aero-font-weight-semibold);
  letter-spacing: var(--aero-letter-spacing-wide);
  border-radius: var(--aero-border-radius-md);
  background: var(--aero-gradient-cyan);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
  transition: all var(--aero-transition-base);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 212, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: var(--aero-opacity-disabled);
    cursor: not-allowed;
  }
}

.theme-switch {
  :deep(.el-switch__core) {
    background: var(--aero-bg-glass-weak);
    border: 1px solid var(--aero-border-glass);
  }

  :deep(.el-switch.is-checked .el-switch__core) {
    background: var(--aero-gradient-cyan);
  }
}

</style>
