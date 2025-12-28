const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Data",
  component: Layout,
  redirect: "/data",
  meta: {
    icon: "ant-design:cloud-filled",
    title: "Current Data",
    rank: 1
  },
  children: [
    {
      path: "/data",
      name: "Data",
      component: () => import("@/views/data/index.vue"),
      meta: {
        title: "Current Data"
      }
    }
  ]
} satisfies RouteConfigsTable;
