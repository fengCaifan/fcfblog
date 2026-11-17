---
title: "JavaScript基础"
date: "2023-08-20"
category: "前端与小程序"
tags: ["网络与安全","Vue / 前端"]
description: "JS js是一门真正的编程语言。 简单测试 1、在scripts文件夹中创建一个main.js的文件。 2、在 HTML基础 https://bhhbdrz3p9.feishu.cn/docx/DsKJdP5yfoClX"
feishu_token: "KVvOdG2EMoGfbZxYX20cqzF8n8c"
---

# JavaScript基础

## JS

js是一门真正的编程语言。

#### 简单测试

- 1、在scripts文件夹中创建一个main.js的文件。

- 2、在[HTML基础](https://bhhbdrz3p9.feishu.cn/docx/DsKJdP5yfoClXQxGzzAc6SDcnAb) 网站上引入js。和css一样，将js的代码作用于html之上。

```html
<script src="scripts/main.js" defer></script>
```

- 3、添加以下代码，然后刷新网页
```javascript
let myHeading = document.querySelector("h1");
myHeading.textContent = "hello world!";
```

  -  querySelector()含税获取到了标题的引用，并把它存储在myheading变量中，然后把它的大小给改了。

得到的**结果是将h1中的内容替换成了"hello world!"**

## JavaScript快速入门

#### 变量

使用let或var声明。

#### 数据类型

- String：字符串。let myVaribale = “xxx”

- Number：数字

- Bookean： 布尔值

- Array：数组

- Object：对象、

#### 条件

- if ... else 

#### 函数

- 关键字：function

```javascript
function multiply(num1, num2) {
    let result = num1 * num2;
    return result;
}

multiply(4, 7);
```

#### 事件

```javascript
document.querySelector("html").addEventListener("click", function () {
    alert("别戳我，我怕疼。");
});
```

function也可以省略，写成闭包。

```javascript
document.querySelector("html").addEventListener("click", () => {
    alert("别戳我，我怕疼。");
});
```

- querySelector获取整个html元素。

- addEventListener将事件名称'click'与回调函数进行了绑定。

#### 其他：

- 分号结束当前语句。

- 对大小写敏感

- 注释：单行: //；多行: /**/

## 完善示例网页

### 添加一个图像切换器

```javascript
let myImage = document.querySelector("img");
myImage.onclick = function () {
    let myScr = myImage.getAttribute("src");
    if (myScr === "images/firefox-icon.jpeg") {
        myImage.setAttribute("src", "images/swift-icon.png");
    } else {
        myImage.setAttribute("src", "images/firefox-icon.jpeg");
    }
};
```

- 获取元素img；

- 添加点击事件

- 获取img的src属性值。

- 根据属性值，重新设置src属性值。

### 添加个性化欢迎消息

添加欢迎消息，将网站标题改成欢迎消息。

同时名字信息会由 web storage api保存下来。后续页面关闭重新打开，仍可得到之前信息。

##### 给html中加一个按钮

```javascript
<button>切换用户</button>
```

##### 添加弹窗，输入名字

```javascript
function setUserName() {
    let myName = prompt("请输入你的名字：");
    localStorage.setItem("name", myName);
    myHeading.textContent = "Mozilla 酷比了。" + myName;
};
```

- prompt() 函数与alert()类似，会弹出一个对话框，但是这个是可以输入数据的对话框。最终输入的数据会返回到变量中。

- localStorage是存储类，和document一样可以全局获取。

- setItem("name", myName);就是localStorage的api，可以通过键值对进行缓存。

- 字符串可以使用+连接

##### 页面启动就判断是否有缓存名字

```javascript
if (!localStorage.getItem("name")) {
    setUserName();
} else {
    let storedName = localStorage.getItem("name");
    myHeading.textContent = "Mozilla 酷比了。" + storedName;
}
```

##### 给按钮添加点击事件

```javascript
let myButton = document.querySelector("button");
myButton.onclick = function () {
    setUserName();
};
```

##### 名字为null

上面的prompt()弹窗有一个取消按钮，如果不输入东西，直接点击取消。发现最终名字变成了"null".

这个null，是js的一个特殊值，表示引用不存在。

所以这里需要加一个判断。

```javascript
function setUserName() {
    let myName = prompt("请输入你的名字：");
    if (!myName) {
        setUserName()
    } else {
        localStorage.setItem("name", myName);
        myHeading.textContent = "Mozilla 酷比了。" + myName;
    }
};
```


