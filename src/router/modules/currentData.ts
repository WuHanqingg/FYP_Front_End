const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Data",
  component: Layout,
  redirect: "/currentData",
  meta: {
    icon: "ant-design:cloud-filled",
    title: "data",
    rank: 1
  },
  children: [
    {
      path: "/currentData",
      name: "data",
      component: () => import("@/views/data/index.vue"),
      meta: {
        title: "currentData"
      }
    }
  ]
} satisfies RouteConfigsTable;
