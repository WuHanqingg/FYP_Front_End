const Layout = () => import("@/layout/index.vue");

export default {
  path: "/currentData",
  name: "Data",
  component: Layout,
  redirect: "/currentData/index",
  meta: {
    icon: "ant-design:cloud-filled",
    title: "Current Data",
    rank: 1
  },
  children: [
    {
      path: "/currentData/index",
      name: "data",
      component: () => import("@/views/data/index.vue"),
      meta: {
        title: "Current Data"
      }
    }
  ]
} satisfies RouteConfigsTable;
