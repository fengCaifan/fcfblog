---
title: "06小程序系统学习——页面及跳转"
date: "2023-04-16"
category: "前端与小程序"
tags: ["网络与安全","微信小程序"]
description: "在 01小程序系统学习——代码结构 https://bhhbdrz3p9.feishu.cn/docx/GHtodjLk4oiUYPx32MBc2HHmnxh 里，以后学习了每个页面的基本组成。这节则会更深入细节。 路径"
feishu_token: "N55fdyR7Oot66fxMIy3cJ6dinuf"
---

# 06小程序系统学习——页面及跳转

在[01小程序系统学习——代码结构](https://bhhbdrz3p9.feishu.cn/docx/GHtodjLk4oiUYPx32MBc2HHmnxh) 里，以后学习了每个页面的基本组成。这节则会更深入细节。

### 路径

页面必须注册到app.json的pages变量中。

### 页面构造器

页面初始化函数Page()是在page.js中默认生成的。

```javascript
Page({ 
  // 页面的初始数据
  data: { text: "This is page data." },
  // 页面加载
  onLoad: function(options) { },
  // 页面初次渲染完成，在onShow之后
  onReady: function() { },
  // 监听页面显示，在onLoad之后
  onShow: function() { },
  // 监听页面隐藏
  onHide: function() { },
  // 监听页面卸载
  onUnload: function() { },
  // 监听用户下拉动作
  onPullDownRefresh: function() { },
  // 页面上拉触底事件
  onReachBottom: function() { },
  // 用户点击右上角转发
  onShareAppMessage: function () { },
  // 页面滚动
  onPageScroll: function() { }
})
```

##### 页面传参

> onLoad在销毁前只会触发1次，在onLoad中，可以获取当前页面所调用的打开参数option。

因为上面说到构造函数是默认的，然后有在pages里注册。所以触发页面进行初始化的情况就是在页面打开的瞬间。

页面的打开路径是按URL的形式进行定义的:

```javascript
'路径?key=value&key2=value2'
```

举个例子：商品详情页需要由商品列表传入一个商品id

```javascript
// list.js
// 列表页使用navigateTo跳转到详情页
wx.navigateTo({ url: 'pages/detail/detail?id=1&other=abc' })

// pages/detail/detail.js
Page({
    onLoad: function(option) {
        console.log(option.id)
        console.log(option.other)
    }
})
```

### 页面跳转和路由

##### wx.navigateTo

```javascript
wx.navigateTo({ url: 'page' })
```

wx.navigate可以推出一个新的页面，该页面会被放置到一个页面栈顶。wx.navigateBack()则会将最顶层页面出栈。注意wx.navigate最多层级不能超过10级。

##### wx.redirectTo

```javascript
wx.redirectTo({ url: 'page' })
```

wx.redirectTo则是替换当前页。所以当页面栈太高，无法再navigateTo的时候，就需要用这个API进行页面跳转。

##### wx.switchTab

小程序提供了原生的Tabar支持。在app.json中可以配置tabBar

```json
{
    "tabBar": {
        "list": [
            {"text": "tab1", "pagePath": "pageA"},
            {"text": "tab2", "pagePath": "pageB"},
            {"text": "tab3", "pagePath": "pageC"},
        ]
    }
}
```

tabBar的切换，则需要通过wx.switchTab来进行。切换后，之前的页面栈会被清空（除了栈内首页）

```javascript
wx.switchTab({ url: 'page' })
```

##### wx.reLaunch

```javascript
wx.reLaunch({ url: 'page' })
```

wx.reLaunch重启小程序，并且打开page页

**注意（吃过亏）**

这里的跳转，最好都用相对路径。否则可能无法跳转。

```javascript
wx.navigateTo({
    url: '../progress/progress',
})
```

下面这样无法跳转

```javascript
wx.navigateTo({
    url: 'pages/progress/progress',
})
```


