const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "数据",
  component: Layout,
  redirect: "/data",
  meta: {
    icon: "ant-design:cloud-filled",
    title: "实时数据",
    rank: 0
  },
  children: [
    {
      path: "/data",
      name: "Data",
      component: () => import("@/views/data/index.vue"),
      meta: {
        title: "实时数据",
      }
    }
  ]
} satisfies RouteConfigsTable;
