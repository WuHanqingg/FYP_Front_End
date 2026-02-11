const Layout = () => import("@/layout/index.vue");

export default {
  path: "/chatai",
  name: "chatai",
  component: Layout,
  redirect: "/chatai/index",
  meta: {
    icon: "mdi:robot",
    title: "AI Agent",
    rank: 2
  },
  children: [
    {
      path: "/chatai/index",
      name: "AI Agent",
      component: () => import("@/views/chatai/ChatGPT.vue"),
      meta: {
        title: "AI Agent"
      }
    }
  ]
} satisfies RouteConfigsTable;
