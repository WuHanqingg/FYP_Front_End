const Layout = () => import("@/layout/index.vue");

export default {
  path: "/setting",
  name: "Setting",
  component: Layout,
  redirect: "/setting",
  meta: {
    icon: "ant-design:setting-filled",
    title: "Setting",
    rank: 20
  },
  children: [
    {
      path: "/thresholdSetting",
      name: "thresholdSetting",
      component: () => import("@/views/setting/threshold.vue"),
      meta: {
        title: "ThresholdSetting"
      }
    },
    {
      path: "/userSetting",
      name: "userSetting",
      component: () => import("@/views/setting/user.vue"),
      meta: {
        title: "UserSetting"
      }
    }
  ]
} satisfies RouteConfigsTable;
