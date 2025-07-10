import axios from "axios";
import {store} from "../redux/store"; // 修正路径
import { changeLoading } from "../redux/reducers/LoadingSlice"; // 修正路径
axios.defaults.baseURL = "http://localhost:8000";

const instance = axios.create();

// 请求拦截器
instance.interceptors.request.use(function (config) {
  store.dispatch(changeLoading()); // 使用 store.dispatch
  return config;
}, function (error) {
  return Promise.reject(error);
});

// 响应拦截器
instance.interceptors.response.use(function (response) {
  store.dispatch(changeLoading()); // 使用 store.dispatch
  return response;
}, function (error) {
  store.dispatch(changeLoading()); // 使用 store.dispatch
  return Promise.reject(error);
});

export default instance;