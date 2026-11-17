---
title: "03小程序系统学习——WXML模板"
date: "2023-04-16"
category: "前端与小程序"
tags: ["网络与安全","微信小程序"]
description: "WXML可以构建页面的结构。 小程序开发指南 https://developers.weixin.qq.com/ebook?action=get_post_info&docid=000ee2c29d4f805b0086a"
feishu_token: "JNuWdwvJHo9Wuux3NcpcNg5Pnic"
---

# 03小程序系统学习——WXML模板

WXML可以构建页面的结构。[小程序开发指南](https://developers.weixin.qq.com/ebook?action=get_post_info&docid=000ee2c29d4f805b0086a37a254c0a)

### 介绍

wxml的基础语法

```javascript
<!-- 在此处写注释 -->

<标签名 属性名1="属性值1" 属性名2="属性值2" ...>...</标签名>
```

- **一个完整的WXML语句由一段开始标签和一段结束标签组成**。WXML要求标签必须是严格闭合的，没有闭合将导致编译错误。

- 标签可以拥有属性，属性总是定义在开始标签中。除特殊的属性外，其余属性格式都是key="value"的方式成对出现。其次属性是大小写敏感的。

### 数据绑定

WXML通过{{变量名}}来绑定WXML文件和对应的js文件中data对象属性

比如：

.wxml

```javascript
<text>当前时间：{{time}}</text>
```

.js

```javascript
Page({
    data: {
        time: (new Date()).toString()
    },
})
```

属性值的改变略有不同，**属性值必须包裹在双引号中**

```javascript
<text data-test="{{test}}">hello world</text>
```

注意：

- 变量名是大小写敏感的

- 没有被定义的变量或被设置为undefined的变量不会同步到wxml中

##### 逻辑语法

通过{{变量名}}语法可以使得WXML拥有动态渲染的能力，除此之外还可以在{{}}内进行简单的逻辑运算

```javascript
// 三元运行
<text>{{ a === 10 ? "a=10": "a!=10"}}</text>
// 算数运行
<text>{{a+b}}+{{c}}+d</text> // 输出x+x+x
// 字符串拼接
<text>{{"hello"+name}}</text>
```

### 条件判断

WXML中，使用**wx:if="{{condition}}"****来判断是否该渲染该代码块**

```javascript
<view wx:if="{{condition}}">true</view>
```

还可以结合**wx:elif**和**wx:else**来添加else块

```javascript
<view wx:if="{{length > 5}}">1</view>
<view wx:elif="{{length > 2}}">2</view>
<view wx:else>3</view>
```

如果要一次性判断多个组件标签，可以使用<block>标签将多个组件包装起来

```javascript
<block wx:if="{{true}}">
  <view>view1</view>    
  <view>view2</view>
</block>
```

### 循环遍历

组件上**使用****wx:for****控制属性绑定一个数组，即可使数组中各项的数据重复渲染该组件**。默认数组的当前下标变量名为index，数组当前项为item.

举个例子🌰：

.js

```javascript
Page({
    data: {
        array: [{message: '1'},
                {message: '2'},
                {message: '3'},
                {message: '4'}]
    },
})
```

.wxml

```javascript
<view wx:for="{{array}}">
  {{index}}: {{item.message}}
</view>
```

为了方阅读，小程序也允许index和item进行自定义名字

```javascript
<view wx:for="{{array}}" wx:for-index="idx" wx:for-item="itemName">
  {{idx}}: {{itemName.message}}
</view>
```

同样的，也可以使用<block>标签，包裹多个标签

```javascript
<block wx:for="{{[1,2,3]}}">
  <view>{{index}}:</view>
  <view>{{item}}</view>
</block>
```

除此之外，还可以使用**wx:key****来标识列表中项目的唯一标识符。**这样就可以对列表的元素或个数进行动态变更。

##### 列表渲染

结合上面循环语句，可以写一个简单的switch组件列表。

.wxml

```javascript
// 一个默认switch控件的数组，显示的是每个item的id
<switch wx:for="{{objectArray}}" wx:key="unique">{{item.id}}</switch>
// 一个默认点击按钮，点击会执行switch函数
<button bindtap="switch"> Switch </button>
// 一个默认点击按钮，点击会执行addToFront函数
<button bindtap="addToFront"> Add to the front</button>

// 一个默认switch控件的数组，显示的是每个item本身
<switch wx:for="{{numberArray}}" wx:key="*this"> {{item}} </switch>
// 一个默认点击按钮，点击会执行addNumberToFront函数
<button bindtap="addNumberToFront"> Add Number to the front</button>
```

.js

```javascript
  data: {
  // 数据里添加两个数组，分别对应上面switch控件的数组
    objectArray: [
      {id: 5, unique: 'unique_5'},
      {id: 4, unique: 'unique_4'},
      {id: 3, unique: 'unique_3'},
      {id: 2, unique: 'unique_2'},
      {id: 1, unique: 'unique_1'},
      {id: 0, unique: 'unique_0'},
    ],
    numberArray: [1,2,3,4]
  },
  
  // switch函数，上面第一个按钮对应的函数。
  switch: function(e) {
    // 获取原始数组长度
    const length = this.data.objectArray.length
    for (let i = 0; i < length; ++i) {
    // Math.floor：返回一个小于或等于一个给定数字的最大整数，向下取整
    // Math.random(): 生成一个0~1的随机数
    // 所以这里x、y都是0~数组长度之间的随机整数
      const x = Math.floor(Math.random() * length)
      const y = Math.floor(Math.random() * length)
      // 下面三句：数值交换
      const temp = this.data.objectArray[x]
      this.data.objectArray[x] = this.data.objectArray[y]
      this.data.objectArray[y] = temp
    }
    // setData用于将数据从逻辑层发送到视图层(异步)，同时改变对应this.data的值(同步)
    this.setData({
      objectArray: this.data.objectArray
    })
  },

  addToFront: function(e) {
    const length = this.data.objectArray.length
    // .concat：将两个数组进行拼接。这里前面是生成一个新的元素
    this.data.objectArray = [{id: length, unique: 'unique_' + length}].concat(this.data.objectArray)
    this.setData({
      objectArray: this.data.objectArray
    })
  },

  addNumberToFront: function(e) {
    this.data.numberArray = [this.data.numberArray.length + 1].concat(this.data.numberArray)
    this.setData({
      numberArray: this.data.numberArray
    })
  }
```

### 模板

所谓模板(template)，就是一个通用型的代码片段，它可以在任意不同的地方调用。它使用name属性，作为模板名字。然后使用is属性，来进行调用。

.js

```javascript
data: {
    item: {
      index: 0,
      msg: 'this is a teemplate',
      time: '2023-04-16'
    }
  },
```

.wxml

```javascript
// 模板里包含一个view，view里是两个文本
<template name="msgItem">
  <view>
    <text>{{index}}:{{msg}}</text>
    <text> time: {{time}}</text>
  </view>
</template>

// 给模板msgItem赋值data
<template is="msgItem" data="{{...item}}"/>

<template name="odd">
  <view> odd </view>
</template>

<template name="even">
  <view> even </view>
</template>

<block wx:for="{{[1,2,3,4,5]}}">
// 模板is属性可进行逻辑运行
  <template is="{{item % 2 == 0 ? 'even' : 'odd'}}" />
</block>
```

#### 引用 import & include

上面说的模板是可供其他地方使用的。使用时，需要将模板文件引用进来

```javascript
<import scr="item.wxml">
<template is="item" data="{{text: 'forabr'}}"/>
```

**注意**：

- import不具有递归特性。比如C引用B，B引用A。在C中，不能使用A定义的模板。

- include则是将整个文件中除了`<template/> <wxs/>` 外的整个代码引入。

### [事件](https://developers.weixin.qq.com/ebook?action=get_post_info&docid=000846df9a03909b0086a50025180a)

上面列表渲染时，绑定了一些事件。它是通过bindtap属性绑定在组件上的。在绑定的事件函数参数中，可以通过获取到一些事件类型和事件对象。

.wxml

```javascript
<view id="outer" catchtap="handleTap">
    <view id="inner">点击事件</view>
</view>
```

.js

```javascript
Page({
    handleTap: function(evt) {
       // evt.target 是inner view组件
       // evt.currentTarget 是绑定了handleTap的outer view组件
       // evt.type == “tap”
       // evt.timeStamp == 1542
       // evt.detail == {x: 270, y: 63}
       // evt.touches == [{identifier: 0, pageX: 270, pageY: 63, clientX: 270, clientY: 63}]
       // evt.changedTouches == [{identifier: 0, pageX: 270, pageY: 63, clientX: 270, clientY: 63}]
    }
})
```


