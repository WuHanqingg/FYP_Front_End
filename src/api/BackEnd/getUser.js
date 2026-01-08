import request from './request';
import { getToken, formatToken, setToken } from '@/utils/auth';
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data: data
  })
}

export function refreshToken() {
  return request({
    url: '/refreshToken',
    method: 'post',
    headers: {
      "Authorization": getToken().refreshToken
    }
  })
}

export function testToken() {
  return request({
    url: '/testLogin',
    method: 'post',
    data: {}
  })
}

