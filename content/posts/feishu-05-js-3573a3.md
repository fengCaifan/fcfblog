---
title: "05小程序系统学习——js"
date: "2023-04-22"
category: "前端与小程序"
tags: ["Vue / 前端","微信小程序"]
description: "简介 小程序的js和浏览器的js是不一样的，它是由ECMAScript以及小程序框架和小程序API来实现的。小程序里的JavaScript没有BOM（浏览器对象模型）和DOM（文档对象模型）对象。 模块化 浏览器中，所有"
feishu_token: "CqjmdxLTdoYCpmxup5lcetCbneh"
---

# 05小程序系统学习——js

### 简介

小程序的js和浏览器的js是不一样的，它是由ECMAScript以及小程序框架和小程序API来实现的。小程序里的JavaScript没有BOM（浏览器对象模型）和DOM（文档对象模型）对象。

### 模块化

浏览器中，所有 JavaScript 是在运行在同一个作用域下的，定义的参数或者方法可以被后续加载的脚本访问或者改写。同浏览器不同，小程序中可以将任何一个JavaScript 文件作为一个模块，通过module.exports 或者 exports 对外暴露接口。

```javascript
// moduleA.js
module.exports = function(value) {
    return value * 2;
}
```

引用

```javascript
// B.js
// require(path): 将公共代码引入
var multiplyBy2 = require('./moduleA')
var result = multiplyBy2(4)
```

### 作用域

##### 小程序全局数据

通常设置的变量都是局部变量，值在当前页是有效的。如果要在全局范围内使用的话，需要将其设置在app.js里。

```javascript
// app.js
App({
    gloalData: 1
})

// 获取
var app = getApp()

// 修改
app.globbalData++
```

##### 小程序生命周期

小程序的一些生命周期函数也是在App里。

```javascript
App({
  // 小程序初始化完成
  onLaunch: function(options) { console.log( "onLaunch" + options) },
  // 小程序启动，或从后台进入前台
  onShow: function(options) { console.log(options) },
  // 小程序从前台进入后台
  onHide: function(options) { console.log(options) },
  // 小程序发生脚本错误
  onError: function(options) { console.log(options) },
})
```

参数里都带了很多可用字段，比如打开小程序的场景值。[程序与页面](https://developers.weixin.qq.com/ebook?action=get_post_info&docid=0004eec99acc808b00861a5bd5280a)

### setData

在前面的部分学习笔记里有说过，wxml绑定的数据是通过setData函数进行传递的[03小程序系统学习——WXML模板](https://bhhbdrz3p9.feishu.cn/docx/JNuWdwvJHo9Wuux3NcpcNg5Pnic) 。它相当于是渲染线程和逻辑线程的一个桥梁。在Page实例中，可以通过this.setData来手动调用，从而触发页面数据的更新。渲染完成，可以通过第二个回调参数接收到（因为setData是异步的）。

```javascript
Page({
    onLoad: function() {
        this.setData({
            text: 'text'
        }, function() {
            // 在这次setData对界面渲染完毕后触发
        })
    }
})
```

- 每次由于变更需要刷新界面时，并不需要把所有data数据都重新设置一遍，只需要单独设置变更了的变量就行。

- 如果是异步回调的block里，不能直接使用this，应该用额外的零时变量


