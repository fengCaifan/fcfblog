---
title: "CSS基础"
date: "2023-08-20"
category: "前端与小程序"
tags: ["网络与安全","Vue / 前端"]
description: "CSS基础 css是什么？ css是一门样式语言，它来选择性地为HTML添加样式。 举例子：给段落中的字体红色 我们在 一个小网站结构 https://bhhbdrz3p9.feishu.cn/docx/SaAMdxcY"
feishu_token: "J67jdJzTHoE7W1x8GdKcSAXqnJ1"
---

# CSS基础

## CSS基础

#### css是什么？

css是一门样式语言，它来选择性地为HTML添加样式。

举例子：给段落中的字体红色

```css
p {
    color: red;
}
```

我们在[一个小网站结构](https://bhhbdrz3p9.feishu.cn/docx/SaAMdxcYQoh4iUxrgFfcUxlCnix) 中的styles文件夹下新建一个style.css文件。

然后我们需要将style.css应用到html中。在index.html（[HTML基础](https://bhhbdrz3p9.feishu.cn/docx/DsKJdP5yfoClXQxGzzAc6SDcnAb) ）的head中加入下面代码：

```javascript
<link href="styles/style.css" rel="stylesheet" />
```

保存刷新后，页面变成这样：

![图片](/images/feishu/feishu-note-c689b2/QFi2b4KyzoOegDx9UvvckLvZnAh.png)

### “CSS规则集”详解

分析上述css的段落是怎么工作的:

![图片](/images/feishu/feishu-note-c689b2/JcbvbgcmUof5Z6xUgwPcizDGnbb.png)

#### 选择器Selector：

html元素名称位于规则集的开始，它选择了一个或多个需要添加样式的元素（这里是p元素）。给不同元素添加样式，只需要更改选择器。

#### 声明Declaration：

一个单独的规则，比如：color: red；

- **属性：属性值;** ：一个声明中包含一个属性及其对应的属性值。属性与属性值用:隔开，以；结尾。

一个规则集里，可以同时多个属性：

```javascript
p {
    color: red;
    width: 500px;
    border: 1px solid black;
}
```

#### 多个元素共享样式

```javascript
li,h1 {
    color: yellow;
}
```

#### 不同类型的选择器

常用选择器，选择器可以有多种形式。非常灵活

| **选择器名称** | **选择的内容** | **示例** |
| --- | --- | --- |
| **元素选择器**（也称作标签或类型选择器） | 所有指定类型的**HTML元素** | P 所有<p>元素里的内容都能生效 |
| **ID选择器** | 具有**特定ID的元素**。单一HTML页面中，每个ID只对应一个元素，一个元素只对应一个ID | #my-id 比如 <p id="my-id"> 或 <a id="my-id"> 则这两个都会生效 |
| **类选择器** | 具有特定**类的元素**。单一页面中，一个类可以有多个实例 | .my-class 比如 <p class="my-class"> 或 <a class="my-class"> 则这两个都会生效 |
| 属性选择器 | 拥有特定属性的元素 | img[src] 比如 <img src="imgname.png"> 和 单纯<img> 则这里只有<img src="imgname.png">能生效。 |
| 伪类选择器 | 特定状态下的特定元素（比如鼠标指针悬停于链接之上） | a:hover 选择仅在鼠标指针悬停的<a>元素 |

更详细参考：[选择器指南](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Building_blocks/Selectors)

### 字体和文本

了解上面css基础后，我们可以把更多样式规则和信息添加到style.css中，

- 1、将一个新的样式表添加到html的head中

```javascript
<link
  href="https://fonts.googleapis.com/css?family=Open+Sans"
  rel="stylesheet" />
```

- 2、将旧的style.css里的内容删除，重新定制样式

```css
html {
    font-size: 10px;
    font-family: "Open Sans", sans-serif;
}
```

这个规则定义了一个全局的基本字体和字体大小。

这是因为html是整个页面的父元素，它里面的所有元素都继承自相同的font-size和font-family。

- 3、定制页面其他元素

```css
h1 {
    font-size: 60px;
    text-align: center;
}

p,
li {
    font-size: 16px;
    line-height: 2;
    letter-spacing: 1px;
}
```

## CSS: 一切皆盒子

css布局主要是基于盒子模型，在页面上占用空间的每个盒子都有下面属性：

- padding(内边距)：指内容周围的空间；

- border(边框)：紧接着内边距的线；

- margin(外边距)：围绕元素边界外侧的空间；

![图片](/images/feishu/feishu-note-c689b2/ByTjbWUtGozxCExPhuAcjcmDnOh.png)

- width：元素宽度

- background-color：元素内容和内边距底下的颜色

- color：元素内容的颜色

- text-shadow：元素内的文本阴影

- display：元素的显示模式

#### 变更

```css
html {
    font-size: 10px;
    font-family: "Open Sans", sans-serif;
    background-color: #00539f;
}

body {
    width: 600px;
    margin: 0 auto;
    background-color: #ff9500;
    padding: 0 20px 20px 20px;
    border: 5px solid black;
}

h1 {
    margin: 0;
    padding: 20px 0;
    color: #00539f;
    font-size: 60px;
    text-align: center;
    text-shadow: 3px 3px 1px black;
}

p,
li {
    font-size: 16px;
    line-height: 2;
    letter-spacing: 1px;
}

img {
    display: block;
    margin: 0 auto;
}
```

- html设置了整个背景色

- body：
  - width：强制宽度只有600px
  - margin：这种**设置两个值，则第一个值影响上下，第二个值影响左右方向**。
  - padding：这种设置**四个值，是以上、右、下、左的顺序排列**。
  - border：这三个值分别为边框宽度、样式、颜色。

- h1：
  - padding：设置了两个值，和body的margin一样的作用
  - text-shadow：对元素文本添加阴影。四个值依次表示：
    - 阴影与文本的水平偏移量：横移的距离
    - 阴影与文本的垂直偏移量：向下移动的距离
    - 模糊半径
    - 阴影基色

- img：
  - display：行为级别为块级。因为body是**块级元素**。意味着它占据了页面空间并且能够赋予外边距和其他改变间距的值，而图片是**行级元素**，不具备块级元素的一些功能。所以为了使图像有外边距，必须使用display:block 给与img块级行为。

最终效果：

![图片](/images/feishu/feishu-note-c689b2/IsBzbojHLo9Ytmxgzv4c7Lbzn0e.png)


