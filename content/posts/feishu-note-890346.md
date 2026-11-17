---
title: "09小程序系统学习——微信登录"
date: "2023-04-22"
category: "前端与小程序"
tags: ["网络与安全","Go","微信小程序"]
description: "小程序登录时序 图片 /images/feishu/feishu note 890346/LjWgbaseLoOjudxnagccCUr3nac.png 具体代码： 登录凭证code，为什么需要微信登录凭证code？ 如"
feishu_token: "PiTvdAHXtonn4ExAxjNcW7rhnLc"
---

# 09小程序系统学习——微信登录

### 小程序登录时序

![图片](/images/feishu/feishu-note-890346/LjWgbaseLoOjudxnagccCUr3nac.png)

具体代码：

```javascript
tapLogin: function() {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: 'https://test.com/login',
            data: {
              username: 'xxx',
              password: 'pwd123456',
              code: res.code
            },
            success: function(res) {
              if (res.statusCode == 200) {
                console.log(res.data.sessionId)
              }
            }
          })
        } else {
          console.log('获取用户登录态失败' + res.errMsg)
        }
      },
    })
  }
```

- 登录凭证code，为什么需要微信登录凭证code？

如果只需调用wx.login()就可以直接拿到用户信息。那会有风险，黑客可以遍历所有id,拿到用户数据。

- code发送给自有服务器，自有服务器再调用微信指定服务器，拿到用户数据。再返回到小程序

### SessionId

###### 缓存用户登录态Sessionid

```javascript
// app.js
App({
  globalData: {
    sessionId: null,
    expiredTime: 0
  },

  // 小程序初始化完成
  onLaunch: function(options) { 
    var sessionId = wx.getStorageSync('SessionId')
    var expiredTime = wx.getStorageSync('ExpiredTime')
    var now = +new Date()
    if (now - expiredTime <= 1*24*60*60*1000)  {
      this.globalData.sessionId = sessionId
      this.globalData.expiredTime = expiredTime
    }
    console.log( "onLaunch" + options) 
  },
})
```

```javascript
// 首页
var app = getApp()

Page({
  onLoad: function() {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: 'https://test.com/login',
            data: { code: res.code },
            success: function(res) {
              if (res.statusCode == 200) {
                var data = res.data
                app.globalData.sessionId = data.sessionId
                wx.setStorageSync('SessionId', data.sessionId)
                // 假设登录状态保持1天
                var expiredTime = +new Date() + 1*24*60*60*1000
                app.globalData.expiredTime = expiredTime
                wx.setStorageSync('ExpiredTime', data.sessionId)
              }
            }
          })
        } else {
          console.log('获取用户登录态失败' + res.errMsg)
        }
      },
    })
  },
 }
```

[10小程序系统学习——本地缓存](https://bhhbdrz3p9.feishu.cn/docx/J9yfdLH4Zoa2R8xyZFZcA6LsngL)


