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
      path: "/threshold",
      name: "Threshold",
      component: () => import("@/views/setting/threshold.vue"),
      meta: {
        title: "阈值",
      }
    },
        {
      path: "/chart",
      name: "Chart",
      component: () => import("@/views/setting/chart.vue"),
      meta: {
        title: "数据图",
      }
    }
  ]
} satisfies RouteConfigsTable;
