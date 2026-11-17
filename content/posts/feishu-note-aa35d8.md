---
title: "01小程序系统学习——代码结构"
date: "2024-12-07"
category: "前端与小程序"
tags: ["微信小程序"]
description: "小程序功能的有一个非常明显的特征，就是无论是大到工程，小到页面。基本都是由4个文件类型构成： 1、.json后缀的JSON配置文件 2、.wxml后缀的WXML模板文件 3、.wxss后缀的WXSS样式文件 4、.js "
feishu_token: "GHtodjLk4oiUYPx32MBc2HHmnxh"
---

# 01小程序系统学习——代码结构

小程序功能的有一个非常明显的特征，就是无论是大到工程，小到页面。基本都是由4个文件类型构成：

1、.json后缀的JSON配置文件

2、.wxml后缀的WXML模板文件

3、.wxss后缀的WXSS样式文件

4、.js 后缀的JS脚本逻辑文件

### JSON配置

json是一种数据格式，它的作用就是静态配置。

JSON语法：整个内容必须包裹在一个大括号中{}，通过key-value的方式来表达数据。其中key必须使用双引号包裹。

#### app.json

app.json是当前小程序的全局配置。包括了小程序的所有页面路径、界面表现、网络超时、底部tab等。

- pages字段——用于描述当前小程序所有页面路径。是为了让微信客户端知道当前小程序页面定义在哪个目录

- window字段——定义了小程序所有页面的顶部背景色、文字颜色等

这里tabBar配置需要注意，要使用绝对路径，否则会报错

```javascript
"tabBar": {
    "list": [{
      "pagePath": "pages/list/list", // 不能使用"../list/list"
      "text": "首页"
    },{
      "pagePath": "pages/icon/icon",
      "text": "其他"
    }]
  },
```

#### project.config.json

在工具上做的任何配置都会写入到这个文件，比如编辑器颜色等

#### 页面配置page.json

page.json针对的是当前页面的配置。app.json是针对整个工程的配置。比如说app.json里配置了整个功能的背景色，但是当前页面想单独一种颜色，则就可以在这个页面进行配置。

### WXML模板

web编程是使用HTML+CSS+JS这样的组合，其中HTML是用来描述当前这个页面的结构，CSS用来描述页面的样子，JS用来处理这个页面和用户的交互的。

同样的小程序里，WXML就是充当HTML的角色的。

WXML和HTML一样是由标签、属性等构成。

WXML的不同点：1、使用view、button等对HTML中的一些标签进行了封装。2、多了一些wx:if这样的属性以及{{}}这样的表达式。

小程序提倡把渲染和逻辑分离。简单来说就是不要让JS直接操控DOM，JS只需要管理状态即可，然后再通过一种模板语法来描述状态和界面结构的关系即可。

比如，把hello world字符串显示在界面上。

WXML代码:

```javascript
<text>{{msg}}</text>
```

JS代码

```javascript
this.setData({msg: "hello world"})
```

### WXSS样式

wxcc是和css一样的作用，只是做了一些扩充和修改。主要用来描述页面的样子。比如WXSS仅支持部分CSS选择器

和“app.json与page.json”的关系一样。你也可以定义一个app.wxss来作为全局样式，会作用于当前小程序的所有页面，局部样式page.wxss仅对当前页面生效

### JS逻辑交互

WXML和WXSS都是用于处理界面展示的。而JS则是处理和用户做交互的。比如响应用户的点击、获取用户的位置等。

举个🌰：

```javascript
<view>{{msg}}</view>
<button bindtap="clickMe">点击我</button>
```

这里点击这个按钮，则把界面上的msg显示成hello world。于是我们在js文件里声明一个clickMe方法来响应这次点击操作：

```javascript
Page({
    clickMe: function() {
        this.setData({ msg: "Hello World" })
    }
})
```


