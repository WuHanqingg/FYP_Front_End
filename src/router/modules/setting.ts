const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "设置",
  component: Layout,
  redirect: "/setting",
  meta: {
    icon: "ant-design:setting-filled",
    title: "设置",
    rank: 20
  },
  children: [
    {
      path: "/thresholdSetting",
      name: "thresholdSetting",
      component: () => import("@/views/setting/threshold.vue"),
      meta: {
        title: "阈值设置",
      }
    },
        {
      path: "/chartSetting",
      name: "chartSetting",
      component: () => import("@/views/setting/chart.vue"),
      meta: {
        title: "数据图设置",
      }
    }
  ]
} satisfies RouteConfigsTable;
