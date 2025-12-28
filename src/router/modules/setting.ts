const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Setting",
  component: Layout,
  redirect: "/setting",
  meta: {
    icon: "ant-design:setting-filled",
    title: "Setting",
    rank: 20
  },
  children: [
    {
      path: "/thresholdSetting",
      name: "thresholdSetting",
      component: () => import("@/views/setting/threshold.vue"),
      meta: {
        title: "ThresholdSetting"
      }
    },
    {
      path: "/chartSetting",
      name: "chartSetting",
      component: () => import("@/views/setting/chart.vue"),
      meta: {
        title: "ChartSetting"
      }
    }
  ]
} satisfies RouteConfigsTable;
