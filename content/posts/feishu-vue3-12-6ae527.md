---
title: "Vue3：12、路由"
date: "2023-09-24"
category: "前端与小程序"
tags: ["Vue / 前端"]
description: "在vue中，可以通过vue router路由管理页面之间的关系。Vue Router是Vue.js的官方路由 引入路由 下载安装路由 配置独立的路由文件 新建一个router文件夹，创建一个index.js文件，里面放置"
feishu_token: "SsordyKCXoe5VQx3FfAcifJxnJg"
---

# Vue3：12、路由

在vue中，可以通过vue-router路由管理页面之间的关系。Vue Router是Vue.js的官方路由

## 引入路由

- 下载安装路由

```bash
npm install --save vue-router
```

- 配置独立的路由文件

新建一个router文件夹，创建一个index.js文件，里面放置路由文件

```javascript
import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from "../components/home.vue"
import AboutView from "../components/about.vue"

// 配置信息中需要页面的相关配置
// 具体页面
const routes = [
    {
        path: "/",
        component: HomeView
    },
    {
        path: "/about",
        component: AboutView
    }
]

// 创建路由
const router = createRouter({
    /*
    * createWebHashHistory: 原理使用了a标签锚点连接
    * createWebHistory: 原理使用了h5的pushState()
    * 没有hash的方式，直接显示路径，但是需要后台做重定向，否则会出现404问题。
    */
    history: createWebHashHistory(),
    routes
})

// 全局导出
export default router
```

- 引入路由到项目中

在main.js中引入router

```javascript
import router from './router'

// 将 axios 挂载到全局
const app = createApp(App)
app.config.globalProperties.$axios = axios
app.use(router), // 注意这里一定要加,
app.mount('#app')
```

- 指定显示入口

在App.vue中添加路由目标页面

```javascript
<RouterView></RouterView>
```

注意，这里<RouterView></RouterView>是会默认显示"/"页面，在我们这，就是首页。

所以这个位置会显示首页的信息。

其次如果你直接用http://localhost:8080/ 则显示出来的就是首页，如果使用http://localhost:8080/about 就是关于页面。和我们在路由器中直接使用url是一样的。

- 指定路由跳转

除了用浏览器打开，也可以添加入口

```javascript
<RouterLink to="/">首页</RouterLink> | 
<RouterLink to="/about">关于</RouterLink>
```

这样，页面就会出现两个类似导航栏的入口。

```javascript
<RouterLink to="/">首页</RouterLink> | 
<RouterLink to="/about">关于</RouterLink>
<RouterView></RouterView>
```

这里的话，就相当于说，点击了不同link，则RouterView就会显示对应的页面。

## 路由传递参数

#### 新建页面

- 新建一个新闻页面，里面一个列表

```html
<template>
    <h3> 新闻</h3>
    <ul>
        <li>百度新闻</li>
        <li>网易新闻</li>
        <li>腾讯新闻</li>
    </ul>
</template>

<script>
export default {
    name: "newsView"
}
</script>
```

- 给新闻页面添加路由

```json
{
        path: "/news",
        name: "news",
        // 异步加载方式，组件引入是懒加载的方式。除了home页或者主页，其他子页面都推荐使用这种方式
        component: () => import("../components/news.vue")
}
```

注意：**异步加载方式，组件引入是懒加载的方式。除了home页或者主页，其他子页面都推荐使用这种方式**

- 新建一个新闻详情页

```html
<template>
    <h3> 新闻详情 </h3>
</template>

<script>
export default {
    name: "newsDetails"
}
</script>
```

- 给新闻详情页添加路由

```json
{
        path: "/newsDetails",
        name: "newsDetails",
        component: () => import("../components/newsDetail.vue")
    }
```

- 设置新闻页每个li的点击跳转到新闻详情

```javascript
<li><RouterLink to="/newsDetails">百度新闻</RouterLink> </li>
<li><RouterLink to="/newsDetails">网易新闻</RouterLink></li>
<li><RouterLink to="/newsDetails">腾讯新闻</RouterLink></li>
```

但是这里依旧无法区分是哪个新闻详情页

#### 传参

- 第一步：在路由配置中指定参数key

```json
{
        path: "/newsDetails/:name",
        name: "newsDetails",
        component: () => import("../components/newsDetail.vue")
    }
```

- 在跳转过程中携带参数

```javascript
<li><RouterLink to="/newsDetails/百度">百度新闻</RouterLink> </li>
<li><RouterLink to="/newsDetails/网易">网易新闻</RouterLink></li>
<li><RouterLink to="/newsDetails/腾讯">腾讯新闻</RouterLink></li>
```

- 在详情页，读取路由携带过来的参数

```html
<template>
    <h3> 新闻详情 </h3>
    <p> {{ $route.params.name }}</p>
</template>
```

这样参数就完成了。

注意：**这一节的路由跳转是指页面与页面之间的跳转传参，之前的是组件与组件之间的跳转传参。需要注意区分。**

## 嵌套路由配置

上面那种是一级导航栏，但是通常网页上有多级。这样也就会有嵌套情况出现

假设，我们在上面about的基础上再加两个子页面

- 创建两个子页面

```html
<template>
    <h3> 关于信息 </h3>
</template>

<script>
export default {
    name: 'AboutInfo',
}
</script>
```

```html
<template>
    <h3> 关于我们 </h3>
</template>

<script>
export default {
    name: 'AboutUs',
}
</script>
```

- 将子页面的路由进行注册

在原来about页面路由里添加

```javascript
{
        path: "/about",
        name: "about",
        redirect: "about/us",
        component: () => import("../components/about.vue"),
        children: [
            {
                // 二级导航的路径不要加/
                path: "us",
                component: () => import("../components/aboutUs.vue")
            },
            {
                path: "info",
                component: () => import("../components/aboutInfo.vue")
            },
        ]
    },
```

注意：**redirect是重定向，表示默认打开是关于我们页面。其次，子页面的path不需要再加/**

- 在about页面中添加调整

```html
<template>
    <h3> 关于 </h3>
    <RouterLink to="/about/info">关于信息</RouterLink> | 
    <RouterLink to="/about/us">关于我们</RouterLink>
    <RouterView></RouterView>
</template>

<script>
export default {
    name: 'AboutView',
}
</script>
```

注意：**这里的RouterLink to是输入的路由path。另外一定要带上父路由的路径**


