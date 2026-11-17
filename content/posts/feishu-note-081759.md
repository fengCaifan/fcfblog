---
title: "10小程序系统学习——本地缓存"
date: "2023-04-29"
category: "前端与小程序"
tags: ["微信小程序","AI Agent"]
description: "读写本地数据缓存 读 wx.getStorage/wx.getStorageSync （sync是同步接口） 写 wx.setStorage/wx.setStorageSync （sync是同步接口） 缓存限制与隔离 不"
feishu_token: "J9yfdLH4Zoa2R8xyZFZcA6LsngL"
---

# 10小程序系统学习——本地缓存

#### 读写本地数据缓存

##### 读

> wx.getStorage/wx.getStorageSync （sync是同步接口）

```javascript
storageRead: function() {
    // 异步获取
    let that = this
    wx.getStorage({
      key: 'key1',
      success: function(res) {
        console.log('获取到缓存:'+res.data)
        that.setData({ // 注意这里是异步回调，不能直接使用this，应该用一个临时变量承接一下。
          storageValue1: res.data
        })
      },
      fail: function() {
        console.log('获取缓存失败')
      }
    })

    // 同步获取
    try{
      var value2 = wx.getStorageSync('key2')
      console.log('获取到缓存:'+value2)
      this.setData({
        storageValue2: value2
      })
    } catch (e) {
      console.log('获取缓存失败')
    }
  }
```

##### 写

> wx.setStorage/wx.setStorageSync （sync是同步接口）

```javascript
storageWrite: function() {
    // 异步写入
    wx.setStorage({
      key: 'key1',
      data: 'value1',
      success: function() {
        console.log('写入value1成功')
      },
      fail: function() {
        console.log('写入value1错误')
      }
    })

    // 同步写入
    try {
      wx.setStorageSync('key2', 'value2')
      console.log('写入value2成功')
    } catch (e) {
      console.log('写入value2错误')
    }
  },
```

#### 缓存限制与隔离

- 不同小程序的本地缓存空间是分开的。每个小程序的缓存空间上限为10MB，如果已经到达10MB，则写入缓存会fail

#### 利用本地缓存提前渲染界面

正常一个首页数据，可能是需要先从服务端下载过来。然后再进行渲染。如果用户退出小程序再进来，就会有一段时间白屏现象。

为了优化这种用户体验，可以考虑把下载的数据先进行缓存，然后在接口数据回来前提前进行渲染。

```javascript
onLoad(options) {
    var that = this
    var list = wx.getStorageSync('list')
    if (list) {
      // 本地有缓存
      that.setData({
        list: list
      })
    }
    wx.request({
      url: 'https://test.com/getproductlist',
      success: function(res) {
        if (res.statusCode == 200) {
          list = res.data.list
          that.setData({
            list: list
          })
          wx.setStorageSync('list', list) // 缓存
        }
      }
    })
  },
```

#### 缓存用户登录态SessionId

网络请求成功后，缓存sessionId到本地

```javascript
var app = getApp()
Page({
    tapLogin: function() {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: 'https://test.com/login',
            data: { code: res.code },
            success: function(res) {
              if (res.statusCode == 200) {
                var data = res.data
                // 把Sessionid和过期时间放在内存中的全局对象和本地缓存里
                app.globalData.sessionId = data.sessionId
                wx.setStorageSync('SESSIONID', data.sessionId)

                // 假设登录态保持1天
                var expiredTime = +new Date() + 1*24*60*60*1000
                app.globalData.expiredTime = expiredTime
                wx.setStorageSync('EXPIREDTIMEE', expiredTime)
              }
            }
          })
        } else {
          console.log('获取用户登录态失败' + res.errMsg)
        }
      },
    })
  },
})
```

在app.js中设置全局变量，在小程序启动的时候，恢复缓存的sessionId

```javascript
App({
  globalData: {
    sessionId: null,
    expiredTime: 0
  },
 
 // 小程序初始化完成
  onLaunch: function(options) { 
    console.log( "onLaunch" + options) 
    var sessionId = wx.getStorageSync('SESSIONID')
    var expiredTime = wx.getStorageSync('EXPIREDTIME')
    var now = +new Date()

    if (now - expiredTime <= 1*24*60*60*1000) {
      // 如果还在有效期内，则重新取出缓存，恢复登录态sessionId
      this.globalData.sessionId = sessionId
      this.globalData.expiredTime = expiredTime
    }
  }, 
 })
```


