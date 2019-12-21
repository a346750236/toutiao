// 对axios 进行处理
import axios from 'axios' // 引入组件对象
import router from '../router' // 引入路由
import { Message } from 'element-ui'
axios.defaults.baseURL = 'http://ttapi.research.itcast.cn/mp/v1_0'
// 请求拦截器
axios.interceptors.request.use(function (config) {
  // 在发起请求的时候做一些业务处理
  //   config是要发送请求的配置信息
  let token = window.localStorage.getItem('user-token') // 获取token
  config.headers['Authorization'] = `Bearer ${token}`
  // 统一注入token 到headers属性 因为所有接口要求的token格式是一样的
  return config // 返回的config 就会作为新的请求选项去进行请求
}, function (error) {
  // 执行请求失败
  // 对响应错误做处理
  return Promise.reject(error)
})

// 响应拦截器
axios.interceptors.response.use(function (response) {
  // 成功时执行
  return response.data ? response.data : {} // 解决当data不存在时  then中读取数据报错问题
}, function (error) {
  console.log(error)
  // 回调函数  所有的失败 都会进入到第二个回调函数
  // 失败时执行 状态码 不是200 或者201/204
  // 获取状态码 => 根据状态码 进行相应的提示或者操作
  let status = error.response.status // 获取状态码 根据状态码进行提示
  let message = ' ' // 提示信息
  switch (status) {
    case 400:
      message = '手机号或者验证码错误'
      break
      // 如果同样的状态码 但是不同意思 => 需要通过 请求地址来判断是哪个的响应  请求地址 + 状态码 一起来判断 怎么处理
      // resfehtoken 过期 强制跳转到登录页 resfehtoken => 是用来换取 token的
      // this.$router => 路由实例对象
    case 403:
      router.push('/login')
      break
    case 401:
      // token过期
      router.push('/login') // 强制回登录
      break
    case 507:
      message = '服务器数据库异常'
      break
    case 404:
      message = '手机号不正确'
      break
    default:
      break
  }
  Message({ type: 'warning', message }) // 提示消息
  // 状态码 提示
})
// 导出axios
export default axios