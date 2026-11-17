---
title: "Vue3：11、Axios网络请求"
date: "2023-09-24"
category: "前端与小程序"
tags: ["网络与安全","Vue / 前端"]
description: "Axios是一个基于promise的网络请求库 基本使用 安装 引入 组件中引入 这里无需额外注册组件了。 全局引入 将main.js改成下面代码： 然后下面使用的时候改成： this.$axios .xxx 使用 ge"
feishu_token: "IEjRdKfTqoNNUrxGfBGcsytknwb"
---

# Vue3：11、Axios网络请求

Axios是一个基于promise的网络请求库

## 基本使用

#### 安装

```bash
npm install --save axios
```

#### 引入

##### 组件中引入

这里无需额外注册组件了。

```javascript
import axios from 'axios'
```

##### 全局引入

将main.js改成下面代码：

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'

// 将 axios 挂载到全局
const app = createApp(App)
app.config.globalProperties.$axios = axios
app.mount('#app')
```

然后下面使用的时候改成：**this.$axios**.xxx

```javascript
this.$axios.get("http://iwenwiki.com/api/blueberrypai/getChengpinDetails.php")
            .then(res => {
            console.log(res.data);
            this.chenpin = res.data.chengpinDetails[0]
        })
```

#### 使用

- get请求
```html
<script>
import axios from 'axios'
export default {
    name: 'axiosComponent',
    data() {
        return {
            chenpin: {}
        }
    },
    mounted() {
        // get 请求方式
        axios({
            method: "get",
            url: "http://iwenwiki.com/api/blueberrypai/getChengpinDetails.php"
        }).then(res => {
            console.log(res.data);
            this.chenpin = res.data.chengpinDetails[0]
        })
    }
}
</script>
```

  注意这里的数据解析与使用方式，根本没有键值对的映射，直接从chenpin中取

```html
<p>{{ chenpin.title }}</p>
```

  - get快捷方式
```javascript
axios.get("http://iwenwiki.com/api/blueberrypai/getChengpinDetails.php")
            .then(res => {
            console.log(res.data);
            this.chenpin = res.data.chengpinDetails[0]
        })
```

- post请求
```html
<script>
import axios from 'axios'
export default {
    name: 'axiosComponent',
    data() {
        return {
            chenpin: {}
        }
    },
    mounted() {
        // post请求方式
        axios({
            method: "post",
            url: "http://iwenwiki.com/api/blueberrypai/login.php",
            data: {
                user_id: "iwen@qq.com",
                password: "iwen123",
                verification_code: "crfvw"
            }
        }).then(res => {
            console.log(res.data);
            this.chenpin = res.data.chengpinDetails[0]
        })
    }
}
</script>
```

  - 注意，这里发出请求后，会报一个参数错误，原因是data需要转成字符串形式。
  - 安装querystring
```bash
$ npm install --save querystring
```

  - 使用
```javascript
import querystring from 'querystring'

// post请求方式
        axios({
            method: "post",
            url: "http://iwenwiki.com/api/blueberrypai/login.php",
            data: querystring.stringify({
                user_id: "iwen@qq.com",
                password: "iwen123",
                verification_code: "crfvw"
            })
        }).then(res => {
            console.log(res.data);
            this.chenpin = res.data.chengpinDetails[0]
        })
```

  - post快捷方式
```javascript
axios.post("http://iwenwiki.com/api/blueberrypai/login.php", querystring.stringify({
                user_id: "iwen@qq.com",
                password: "iwen123",
                verification_code: "crfvw"
            })).then(res => {
                console.log(res.data);
            })
```

## 封装

封装主要就是处理请求前的拦截以打印日志和请求数据回来的拦截，以打印异常

- 创建一个utils/request.js

```javascript
import axios from "axios";
import querystring from 'querystring'

const errorHandle = (status, info) => {
    switch(status) {
        case 400:
            console.log("语义有误");
            break;
        case 401:
            console.log("服务器认证失败");
            break;
        case 403:
            console.log("服务器拒绝访问");
            break;
        case 404:
            console.log("地址错误");
            break;
        case 500:
            console.log("服务器遇到意外");
            break;
        case 502:
            console.log("服务器无响应");
            break;
        default:
            console.log(info);
            break;
    }
}

const instance = axios.create({
    // 网络请求的公共配置
    timeout: 5000
})

// 封装网络请求最常见的就是拦截器
// 发送数据之前
instance.interceptors.request.use(
    config => {
        if (config.method === "post") {
            config.data = querystring.stringify(config.data)
        }
        return config;
    },
    error => {
        return Promise.reject(error)
    }
)

// 获取数据之前
instance.interceptors.response.use(
    response => {
        return response.status === 200 ? Promise.resolve(response): Promise.reject(response)
    },
    error => {
        const { response } = error;
        errorHandle(response.status, response.info)
    }
)

export default instance;
```

- 统一管理路径 path.js

```javascript
const base = {
    baseUrl: "http://iwenwiki.com",
    chengpin: "/api/blueberrypai/getChengpinDetails.php"
}

export default base;
```

- 统一管理api: index.js

```javascript
import axios from "../utils/request";
import path from "./path"

const api = {
    getChengpin() {
        return axios.get(path.baseUrl + path.chengpin)
    }
}

export default api;
```

- 使用

```javascript
import api from "../api/index"

 mounted() {
     api.getChengpin().then( res => {
        console.log(res.data);
        this.chenpin = res.data.chengpinDetails[0]
     })
 }
```

## 跨域问题

js的网络采用的是同源策略：即浏览器只允许js代码请求和当前所在服务器域名、端口、协议相同的数据接口上的数据。

所以当协议、端口、域名任一不同时，就会产生跨域问题。

目前主流的跨域解决方案：

- 后台解决：cors

- 前台解决：proxy
   在vue.config.js中添加如下代码

```javascript
devServer: {
    proxy: {
      "/api": {
        target: 'xxx', // 这里是可能会跨域的域名
        changeOrigin: true
      }
    }
  }
```


