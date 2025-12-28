const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Charts",
  component: Layout,
  redirect: "/chart",
  meta: {
    icon: "gridicons:line-graph",
    title: "Charts",
    rank: 2
  },
  children: [
    {
      path: "/chart",
      name: "Chart",
      component: () => import("@/views/chart/index.vue"),
      meta: {
        title: "Charts"
      }
    }
  ]
} satisfies RouteConfigsTable;
