const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "数据图",
  component: Layout,
  redirect: "/chart",
  meta: {
    icon: "gridicons:line-graph",
    title: "数据图",
    rank: 2
  },
  children: [
    {
      path: "/chart",
      name: "Chart",
      component: () => import("@/views/chart/index.vue"),
      meta: {
        title: "数据图",
      }
    }
  ]
} satisfies RouteConfigsTable;
