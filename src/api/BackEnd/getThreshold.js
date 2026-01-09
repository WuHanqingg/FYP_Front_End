import request from "./request";
import { getToken, formatToken, setToken } from "@/utils/auth";

export function getThreshold() {
  return request({
    url: "/threshold/loadDataList",
    method: "get"
  });
}

export function updateThresholdById(data) {
  return request({
    url: `/threshold/updateThresholdById`,
    method: "post",
    data: data
  });
}
