---
title: "2、第一个Vue程序"
date: "2023-08-28"
category: "前端与小程序"
tags: ["SwiftUI","Swift","网络与安全","Vue / 前端"]
description: "Vue是什么 Vue是一个用于构建用户界面的js框架。类似swiftUI对于iOS的作用。 它提供了一套声明式的、组件化的编程模型。 vue可以编写完整的单页面应用程序SPA。也可以编写一个完整的项目，及作为库嵌入到其他"
feishu_token: "Q3fzdH9qwoRtryxTe0XcnY8dnAh"
---

# 2、第一个Vue程序

## Vue是什么

Vue是一个用于构建用户界面的js框架。类似swiftUI对于iOS的作用。

它提供了一套声明式的、组件化的编程模型。

vue可以编写完整的单页面应用程序SPA。也可以编写一个完整的项目，及作为库嵌入到其他程序里面。

[Vue环境安装](https://bhhbdrz3p9.feishu.cn/docx/YAiId9pFxob2qpxIwPDcqfvenGb) 

安装完环境后，开始第一个vue项目

## 初始化一个vue项目

```bash
sudo vue create helloworld
```

- 注意：这里也要用sudo，否则也会报错。另外，时间可能会有点长。

### 项目结构

上述命令完成后，就创建了一系列文件和目录，如下：

![图片](/images/feishu/feishu-2-vue-9bfdce/UjeVbdeS2oPQiwxIzG4cmF3tnsc.png)

- package.json：该文件包含项目的依赖项列表，以及一些元数据和eslint配置。

- babel.config.js：Babel的配置文件，可以在开发中使用JS的新特性。（做兼容用的）

- jsconfig.json：这是一份用于VSCode的配置文件，为VSCode提供了关于项目结构的上下文信息，并帮助自动完成。

- public：
  - favicon.ico：项目图标
  - index.html：应用模板文件

- src：Vue应用的核心代码目录
  - main.js：应用的入口文件。目前它会初始化vue应用并指定将应用挂载到index.html文件中的哪个html元素上。通常还会做一些注册全局组件或者添加额外vue库的操作。
  - App.vue：这是Vue应用的根节点组件
  - components：用于存放自定义组件的目录
  - assets：存放资源，css、图片等。

### .vue 文件（单文件组件）

单文件组件：就是通过把模板、相关脚本和css一起整合放在.vue结尾的一个单文件中。

这些文件最终会通过打包工具处理。

#### App.vue

打开App.vue文件，可以看到由<template>、<script>、<style>三部分组成，分别包含了组件的模板、脚本和样式。所有单文件组件都是这种类型的基本结构。

- <template>：
  标记结构和组件的展示逻辑。template可以包含任何合法的html，以及我们接下来要讲的vue特点语法

- <script>：

包含组件中所有非显示逻辑。最重要的<script>标签需要默认导出一个JS对象。在构建阶段，这个包含template模板的对象会被处理和转换成一个有render()函数的Vue组件。

对于app.vue，我们默认导出将组件的名称设置为App，并通过将helloworld组件添加到components属性中来注册它（本地注册）。

```html
<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>
```

- <style>：

存放CSS的样式。

### 本地运行程序

Vue CLI带有内置的开发服务端器。CLI会以npm脚本的形式将serve命令添加到项目的package.json文件中，因此你可以轻松运行它。

```bash
$ npm run serve
```


