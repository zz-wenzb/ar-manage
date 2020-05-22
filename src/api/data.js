import axios from '@/libs/api.request'

//登录
export const login = (data) => {
  return axios.request({
    url: '/system/login',
    method: 'post',
    data:data
  })
}

// 向 localstorage 中存入数据  仅支持存字符串与对象格式
export const setLocalStorage = function (key, val, type) {
  if (!type) return
  if (type === 'string') {
    localStorage.setItem(key, val)
  }
  if (type === 'object') {
    localStorage.setItem(key, JSON.stringify(val))
  }

}

// 向 localstorage 中取数据
export const getLocalStorage = function (key, type) {
  if (!type) return
  if (type === 'string') {
    return localStorage.getItem(key)
  }
  if (type === 'object') {
    return JSON.parse(localStorage.getItem(key))
  }

}

// 从 localstorage 中除以数据
export const removeLocalStorage = function (key) {
  localStorage.removeItem(key);
}

// 设置token
export const setToken = function (val) {
  setLocalStorage('token', val,'string')
}

// 获取token
export const getToken = function () {
  return getLocalStorage('token', 'string')
}

// 获取个人信息
export const getUserinfo = function () {
  return getLocalStorage('userinfo', 'object')
}

// 设置个人信息
export const setUserinfo = function (val) {
  return setLocalStorage('userinfo',val, 'object')
}

// 获取商品列表
export const getGoodsList = (params) => {
  return axios.request({
    url: '/event/goods/getGoodsList',
    method: 'post',
    data: params
  })
}

export const addGoods = (params) => {
  return axios.request({
    url: '/event/goods/create',
    method: 'post',
    data: params
  })
}

export const editGoods = (params) => {
  return axios.request({
    url: '/event/goods/update',
    method: 'post',
    data: params
  })
}

export const getGoodsById = (params) => {
  return axios.request({
    url: '/event/goods/getGoodsById',
    method: 'post',
    data: params
  })
}

export const delGoods = (params) => {
  return axios.request({
    url: '/event/goods/delete',
    method: 'post',
    data: params
  })
}

export const getUserList = (params) => {
  return axios.request({
    url: '/event/user/getUserList',
    method: 'post',
    data: params
  })
}

export const updateUser = (params) => {
  return axios.request({
    url: '/event/user/update',
    method: 'post',
    data: params
  })
}

export const getOrderList = (params) => {
  return axios.request({
    url: '/event/order/getOrderList',
    method: 'post',
    data: params
  })
}
