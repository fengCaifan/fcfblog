---
title: "Vue3：4、 事件处理"
date: "2023-09-02"
category: "前端与小程序"
tags: ["Vue / 前端"]
description: "监听事件 v on 使用v on指令监听DOM事件，并在触发事件时执行一些js 这个click是单击事件，douleClick是双击事件，还有mousemove鼠标移动等事件 click里的表达式是可以被执行的。coun"
feishu_token: "U9ZndwJZjokakoxdEJNcOk5an7Z"
---

# Vue3：4、 事件处理

#### 监听事件 v-on

使用v-on指令监听DOM事件，并在触发事件时执行一些js

```html
<script>
export default {
  data() {
    return {
      counter: 0,
    }
  }
}
</script>
```

```html
<h2>事件处理</h2>
    <div>
      <button v-on:click="counter += 1"> 点击counter=：{{ counter }} </button>
    </div>
```

- 这个click是单击事件，douleClick是双击事件，还有mousemove鼠标移动等事件

- click里的表达式是可以被执行的。counter += 1

这里，v-on:click同样有快捷方法，使用@click

```html
<div>
    <button @click="counter += 1"> 点击counter=：{{ counter }} </button>
</div>
```

#### 事件处理方法

上述代码，直接把点击事件的逻辑放在了click的属性值里，但是通常的点击事件处理逻辑不可能那么简单，所以通常我们需要额外一个处理函数，然后将这个函数传递给click

```html
<h2>事件处理</h2>
<div>
    <button @click="clickHandle">按钮</button>
    <p>{{ message }}</p>
</div>
```

```html
<script>
export default {
  data() {
    return {
      message: "学习",
    }
  },
  methods: {
    clickHandle(event) {
      // 在事件中，读取data中的属性，是需要使用this.属性
      this.message += "h"
      // 这里能把event正常打印出来
      console.log(event);
    }
  },
}
</script>
```

这里点击按钮，就会在浏览器的控制台中打印出事件。

![图片](/images/feishu/feishu-vue3-4-d34b11/ZGEHbD2z1oWi9SxxR9hcj9qwnZb.png)

#### 事件传递参数

- eg1：

可以直接往数据函数里传递参数。

```javascript
    #添加两个按钮，分别传入两个不同的字符串
    <h2>事件处理</h2>
    <div>
      <button @click="say('hi')">say hi</button>
      <button @click="say('what')">say what</button>
    </div>
```

```html
<script>
export default {
  methods: {
    say(data) {
      console.log(data);
    },
  },
}
</script>
```

这里可以在浏览器控制台查看，点击hi和点击what，会分别打印对应参数

- eg2：

上面的例子中，给函数传入的形参都是固定死的。但是正常开发中，肯定都不是这样的。这里举一个传入动态。

```html
<script>
export default {
  data() {
    return {
      message: "学习",
      names:["iwen","ime","frank"],
    }
  },
  methods: {
    clickNameHandle(item) {
      console.log(item);
      this.message = item;
    },
  },
}
</script>
```

```javascript
<ul>
    <li v-for="(item, index) in names" 
        :key="index" 
        @click="clickNameHandle(item)">{{ item }}</li>
</ul>
```


