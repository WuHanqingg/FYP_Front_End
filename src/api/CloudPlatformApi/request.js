// axios.config.js
import axios from 'axios';

// 创建 axios 实例
const instance = axios.create({
  //baseURL: 'http://182.40.193.119:8081', // 设置基础 URL
  timeout: 10000, // 设置超时时间
});

// 设置请求头信息
//instance.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
instance.defaults.headers.post['Content-Type'] = 'application/json';

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    //console.log('请求拦截器：', config);
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