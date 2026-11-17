---
title: "Vue3：6、组件基础"
date: "2023-09-02"
category: "前端与小程序"
tags: ["Vue / 前端"]
description: "单文件组件 Vue单文件组件（也就是.vue文件，缩写SFC）是一种特殊的文件格式，它允许将Vue组件的模板、逻辑、样式封装在单个文件中。 创建一个.vue文件，通常是以下模块组成 这里：template：模板；js存放"
feishu_token: "YvGhdnhMfoIys4xRrS2c6Oz2nsf"
---

# Vue3：6、组件基础

#### 单文件组件

Vue单文件组件（也就是.vue文件，缩写SFC）是一种特殊的文件格式，它允许将Vue组件的模板、逻辑、样式封装在单个文件中。

创建一个.vue文件，通常是以下模块组成

```html
<template>
    <h3> 我是单文件组件 </h3>
</template>

<script>
export default {
    name: "MyComponent"
}
</script>

<style>
h3{
    color: red;
}
</style>
```

这里：template：模板；js存放逻辑；style存放样式。template不可以缺失，另外两个可以没有。

另外：这里<style>给的h3的样式会整个项目生效，如果想要整个样式只在当前文件中生效，则添加一个scoped属性

```html
<style scoped>
h3{
    color: red;
}
</style>
```

#### 加载组件流程

- 1、引入组件
```javascript
import MyComponent from './components/myComponents.vue'
```

- 2、挂载组件

```javascript
components: {
    MyComponent
  }
```

- 3、显示组件

这里可以直接使用组件名加载，另外也可以使用单词-单词的形式，这也是vue推荐的形式。

```html
<template>
  <MyComponent />
  <my-component></my-component>
</template>
```

#### 组件的组织

一个应用会以一棵嵌套的**组件树**的形式来组织。

所以任何一个组件出现问题，不会影响其他组件。

这也是为什么Vue是组件化开发。


