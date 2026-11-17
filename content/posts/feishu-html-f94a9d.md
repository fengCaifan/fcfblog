---
title: "HTML基础"
date: "2023-08-20"
category: "前端与小程序"
tags: ["网络与安全","Vue / 前端"]
description: "HTML基础 HTML是什么？ html不是一门编程语言，而是一种用于 定义内容结构的标记语言 。它由一系列 元素 组成。这些元素可以以不同的组合来展示网页的结构，将网页大致框架呈现出来。比如一个段落、一行内容、一个区块"
feishu_token: "DsKJdP5yfoClXQxGzzAc6SDcnAb"
---

# HTML基础

## HTML基础

#### HTML是什么？

html不是一门编程语言，而是一种用于**定义内容结构的标记语言**。它由一系列**元素**组成。这些元素可以以不同的组合来展示网页的结构，将网页大致框架呈现出来。比如一个段落、一行内容、一个区块等。

#### 元素

html的元素也是有一定的规则的。比如一个段落元素

![图片](/images/feishu/feishu-html-f94a9d/UIj7boxqEoQCUuxtV5IcB21nnGe.png)

**元素**主要部分包括：

- 开始标签：

- 结束标签：由开始元素加一斜杠组成。

- 内容：

- 元素：开始标签+内容+结束标签。就是一个完整的元素

元素内也可以包含属性，比如上面的class。class 属性属性名称，为元素提供标识。

**属性**应该包含：

- 属性与元素（或上一个属性）之间使用空格符

- 属性的名称与值使用等号链接

- 属性值使用引号包围。

元素和元素之间可以嵌套，比如：

```html
<p>my car is <strong>very grumpy</strong>.</p>
```

### HTML 文档详解

我们在[一个小网站结构](https://bhhbdrz3p9.feishu.cn/docx/SaAMdxcYQoh4iUxrgFfcUxlCnix) 的index.html中添加以下基础样式

```html
<!DOCTYPE html>
<html lang="en-US">
    <head>
        <meta charset="UTF-8" />
        <mata name="viewport" content="width=device-width" />
        <tittle>my test page</tittle>
    </head>
    <body>
        <img src="images/firefox-icon.jpeg" alt="my test image">
        <h1>主标题</h1>
        <p>这是一个段落</p>
        <h3>子标题</h3>
        <p>这是一个段落3</p>
        <h4>小标题</h4>
        <p>
            At Mozilla, we're a global community of technologists, thinkers, and builders
  working together…
        </p>
        <ul>
            <li>technologists</li>
            <li>thinkers</li>
            <li>builders</li>
        </ul>
        <p>
            At Mozilla, we're a global community of technologists, thinkers, and builders
  working together…At Mozilla, we're a global community of technologists, thinkers, and builders
  working together…At Mozilla, we're a global community of technologists, thinkers, and builders
  working together…At Mozilla, we're a global community of technologists, thinkers, and builders
  working together…
        </p>
        <a href="https://www.mozilla.org/zh-CN/about/manifesto/"">working together</a>
    </body>
</html>
```

- <!DOCTYPE html>：以前用来关联html编写规范，现在仅用于保证文档正常读取。

- <html></html>：根元素。属性lang说明页面主要语种。

- <head></head>：头部元素，里面的内容都不向用户展示，包括后续加的css、字符集声明等等。

- <meta charset="UTF-8" />：指明utf-8编码;

- <mata name="viewport" content="width=device-width" />：确保页面以视口宽度进行渲染。

- <title></title>：标题，比如收藏网页时用到 了它。

- <body></body>：存放让用户看得到的内容。

- <img>：图像元素，src：地址引用。alt：当图片不能被用户看见时就展示

- <a>< /a>：锚，要给文本添加连接。href=是连接，内如就是需要添加连接的文本。

![图片](/images/feishu/feishu-html-f94a9d/E9rJb4uOLoAMhVxnlFKcQOy7n5g.png)


