---
title: "08小程序系统学习——网络请求"
date: "2023-04-16"
category: "前端与小程序"
tags: ["网络与安全","微信小程序"]
description: "小程序对网络请求进行了封装。 小程序https请求 https://developers.weixin.qq.com/ebook?action=get_post_info&docid=000ee27c9c8d98ab00"
feishu_token: "RvXGdUKSHoMWE2xVglFcB1annPc"
---

# 08小程序系统学习——网络请求

小程序对网络请求进行了封装。[小程序https请求](https://developers.weixin.qq.com/ebook?action=get_post_info&docid=000ee27c9c8d98ab0086788fa5b00a)

### wx.request

最简单的get请求

```javascript
wx.request({
    url: 'https://test.com/getInfo',
    success: function(res) {
        console.log(res) // 服务器响应
    }
})
```

#### 请求参数

请求参数同样是通过key=value&key2=value2的形式，通过?拼接在url后面

```javascript
url: 'https://test.com/getInfo?id=1&version=1.0.0',
```

#### 更多配置

```javascript

wx.showLoading() // 显示 loading
wx.request({
    url: 'https://test.com/getInfo?id=1&version=1.0.0',
    method: 'POST', // 请求方法
    header: {'content-type': 'application/json'},
    data: {
        a: { 
            b: [1,2,3],
            c: { d: "test"}
        }
    },
    success: function(res) {
        if (res.statusCode === 200) {
            console.log(res.data) // 
        }
    },
    fail: function(res) {
        wx.showToast({ title: '系统错误'})
    },
    complete: function(res) {
       wx.hideLoading() // 隐藏 loading
    }
})
```

##### 网络超时

全局网络请求超时，可以在app.json中设置

```json
{
 "networkTimeout": {
     "request": 3000
 }
}
```

### 服务端接口

- 服务端接口域名，线上环境需要在小程序平台进行配置

- 一定得是https请求


