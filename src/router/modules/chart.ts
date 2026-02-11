const Layout = () => import("@/layout/index.vue");

export default {
  path: "/chart",
  name: "Charts",
  component: Layout,
  redirect: "/chart/index",
  meta: {
    icon: "gridicons:line-graph",
    title: "Charts",
    rank: 2
  },
  children: [
    {
      path: "/chart/index",
      name: "Chart",
      component: () => import("@/views/chart/index.vue"),
      meta: {
        title: "Charts"
      }
    }
  ]
} satisfies RouteConfigsTable;
