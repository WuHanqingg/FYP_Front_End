// axios.config.js
import axios from 'axios';
import { getToken, formatToken, setToken } from '@/utils/auth';
import { refreshToken } from './getUser';
import { message } from '@/utils/message';

// 创建 axios 实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // 设置基础 URL
  timeout: 10000, // 设置超时时间
});

// 设置请求头信息
//instance.defaults.headers.common['Authorization'] = formatToken(getToken().accessToken);
instance.defaults.headers.post['Content-Type'] = 'application/json';

// 定义刷新token的状态和请求队列
let isRefreshing = false;
let refreshSubscribers = [];

// 将等待刷新的请求添加到队列
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// 通知所有等待的请求继续执行
const onRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// 请求拦截器
instance.interceptors.request.use(
  async config => {
    // 在发送请求之前做些什么
    // console.log('请求拦截器：', config);
    const whileList = ['/login', '/refreshToken'];
    if (!whileList.includes(config.url)) {
      let tokenInfo = getToken();
      let remainTime = tokenInfo.expires - Date.now();
      if (remainTime <= 1000 * 60 * 10) {
        // 如果正在刷新token，将当前请求加入队列
        if (isRefreshing) {
          return new Promise(resolve => {
            subscribeTokenRefresh(newToken => {
              config.headers["Authorization"] = newToken;
              resolve(config);
            });
          });
        }

        // 标记开始刷新token
        isRefreshing = true;

        try {
          // 刷新token
          const res = await refreshToken();
          if (res.data.code == 200) {
            setToken(res.data.data);
            const newToken = formatToken(res.data.data.accessToken);
            config.headers["Authorization"] = newToken;

            // 通知所有等待的请求继续执行
            onRefreshed(newToken);
            return config;
          } else {
            message("刷新token失败", { type: "error" });
            return Promise.reject(new Error("刷新token失败"));
          }
        } catch (error) {
          message("刷新token失败", { type: "error" });
          return Promise.reject(error);
        } finally {
          // 标记刷新完成
          isRefreshing = false;
        }
      } else {
        config.headers["Authorization"] = formatToken(tokenInfo.accessToken);
      }
    }
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    //console.log('响应拦截器：', response);
    return response;
  },
  error => {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);



export default instance;