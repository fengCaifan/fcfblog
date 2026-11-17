---
title: "Vue3：1、模板语法"
date: "2023-09-02"
category: "前端与小程序"
tags: ["网络与安全","Vue / 前端"]
description: "文本 数据绑定最常见的形式是使用 双大括号语法 的文本插值 这里的messsage是一个变量，而变量需要在js的data 中设置 原始HTML 上面说到的变量，只是单纯地解析文字，如果变量值是一个html的字符串，则需要"
feishu_token: "M1x7dfTPUoPAHfxiOBZcIvgbn0f"
---

# Vue3：1、模板语法

#### 文本

数据绑定最常见的形式是使用**双大括号语法**的文本插值

```javascript
<span>Message: {{ message }} </span>
```

这里的messsage是一个变量，而变量需要在js的data()中设置

```bash
export dafault {
    name: 'vue-demo',
    data() {
        return {
            message: "vue-demo 学习"
        }
    }
}
```

#### 原始HTML

上面说到的变量，只是单纯地解析文字，如果变量值是一个html的字符串，则需要通过**v-html指令**来解析HTML。

```html
<p>{{ rawHtml }}</p> // 这种方式只会将html内容当字符串输出
<p v-html="rawHtml"></p> // 会解析html，显示真实内容。
```

```javascript
data() {
    return {
      rawHtml: "<a href='http://www.itbaizhan.com/'>百战</a>"
    }
  }
```

#### Html属性Attribute变量

上面说到的变量，只能在html的内容中使用，不能在html元素的属性中使用。内容和属性的区别，查看：[HTML基础](https://bhhbdrz3p9.feishu.cn/docx/DsKJdP5yfoClXQxGzzAc6SDcnAb) 

属性变量，需要使用**v-bind指令**绑定

```html
<div v-bind:id="dynamicId"></div>
```

可以简写成：

```html
<div :id="dynamicId"></div>
```

```javascript
data() {
    return {
      dynamicId: 10001,
    }
 }
```

保存后可以在网页中查看源码。可以看到id是绑定了的。

![图片](/images/feishu/feishu-vue3-1-d4887e/N32wbOj6xowouUxnxIzcqpBlnuc.png)

#### 使用js表达式

也就是说双括号里可以解析一些js表达式

```html
<p>{{ num + 10 }}</p>
<p>{{ ok ? 'Yes': 'No' }} </p>
<p>{{ message.split('').reverse().join(',') }}</p>
```

```javascript
data() {
    return {
      message: "学习",
      rawHtml: "<a href='http://www.itbaizhan.com/'>百战</a>",
      dynamicId: 10001,
      num: 10,
      ok: false,
    }
  }
```

但是要注意：**每个绑定都只限于单个表达式**，比如下面的是不会生效

```javascript
{{ var a = i }}
{{ if (ok) { return message } }}
```


