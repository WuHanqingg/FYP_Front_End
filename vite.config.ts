import { getPluginsList } from "./build/plugins";
import { include, exclude } from "./build/optimize";
import { type UserConfigExport, type ConfigEnv, loadEnv } from "vite";
import {
  root,
  alias,
  wrapperEnv,
  pathResolve,
  __APP_INFO__
} from "./build/utils";

export default ({ mode }: ConfigEnv): UserConfigExport => {
  const { VITE_CDN, VITE_PORT, VITE_COMPRESSION, VITE_PUBLIC_PATH } =
    wrapperEnv(loadEnv(mode, root));
  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias
    },
    // 服务端渲染
    server: {
      // 端口号
      port: VITE_PORT,
      host: "0.0.0.0",
      // 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
      proxy: {
        '/cloud': {
          target: 'http://182.40.193.119:8081',
          changeOrigin: true,
          secure: false,
          // 合并代理配置，确保所有必要的请求头都被设置
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              proxyReq.setHeader('Referer', 'http://182.40.193.119:9010/');
            });
          },
          rewrite: (path) => path.replace(/^\/cloud/, ''),
        },
        '/weatherMonitor': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/weatherMonitor/, ''),
        },
        '/chatai': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/chatai/, ''),
        },
        '/ambient-api': {
          target: 'https://api.ambientweather.net/v1',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/ambient-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            });
          },
        },
      },
      // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      warmup: {
        clientFiles: ["./index.html", "./src/{views,components}/*"]
      }
    },
    plugins: getPluginsList(VITE_CDN, VITE_COMPRESSION),
    // https://cn.vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
    optimizeDeps: {
      include,
      exclude
    },
    build: {
      // https://cn.vitejs.dev/guide/build.html#browser-compatibility
      target: "es2015",
      sourcemap: false,
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        input: {
          index: pathResolve("./index.html", import.meta.url)
        },
        // 静态资源分类打包
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]"
        }
      }
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    }
  };
};
