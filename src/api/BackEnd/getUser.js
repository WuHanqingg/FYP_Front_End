import request from "./request";
import { getToken, formatToken, setToken } from "@/utils/auth";
export function login(data) {
  return request({
    url: "/login",
    method: "post",
    data: data
  });
}

export function refreshToken() {
  return request({
    url: "/refreshToken",
    method: "post",
    headers: {
      Authorization: getToken().refreshToken
    }
  });
}

export function testToken() {
  return request({
    url: "/testLogin",
    method: "post",
    data: {}
  });
}

export function getUsers() {
  return request({
    url: "/users/loadDataList",
    method: "get"
  });
}

export function getUserById(id) {
  return request({
    url: `/users/loadDataList?id=${id}`,
    method: "get"
  });
}

export function addUser(data) {
  return request({
    url: "/users/add",
    method: "post",
    data: data
  });
}

export function updateUsersById(data) {
  return request({
    url: `/users/updateUsersById`,
    method: "post",
    data: data
  });
}

export function deleteUsersById(id) {
  return request({
    url: `/users/deleteUsersById?id=${id}`,
    method: "get"
  });
}
