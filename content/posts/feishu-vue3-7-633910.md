---
title: "Vue3：7、组件数据正向传递"
date: "2023-09-03"
category: "前端与小程序"
tags: ["Vue / 前端"]
description: "之前几节的事件或数据之间的交互，只在单文件内部，这节就是组件之间的交互和事件传递 Prop组件间数据传入 创建一个单文件组件，MyComponent.vue 添加一个需要显示的属性 添加props，内部放一个title，"
feishu_token: "XSrTdhEbVoEUhCxStqNcKqoPnqt"
---

# Vue3：7、组件数据正向传递

之前几节的事件或数据之间的交互，只在单文件内部，这节就是组件之间的交互和事件传递

#### Prop组件间数据传入

- 创建一个单文件组件，MyComponent.vue

```html
<template>
    <h3> 我是单文件组件 </h3>
</template>

<script>
export default {
    name: "MyComponent"
}
</script>

<style scoped>
h3{
    color: red;
}
</style>
```

- 添加一个需要显示的属性

添加props，内部放一个title，用于接收外部参数。

主要这个title一定要有类型。

```html
<template>
    <h3> 我是单文件组件 </h3>
    <p>title = {{ title }}</p>
    <p>age = {{ age }}</p>
    <p>name = {{ name }}</p>
    <ul>
        <li v-for="(item, index) in colors" :key="index">{{ item }}</li>
    </ul>
</template>
```

```html
<script>
export default {
    name: "MyComponent",
    props:{
        title: {
            type: String, 
            default: ""
        },
        age: {
            type: Number,
            default: 0
        },
        name: {
            type: String,
            default: ""
        },
        colors: {
            type: Array,
            // 数组和对象必须使用函数进行返回
            default: function() {
                return []
            }
        }
    }
}
</script>
```

- 3、外部给组件传递值

app.vue中添加一个title数据

```html
<script>
import MyComponent from './components/myComponents.vue'
export default {
  name: 'App',
  data() {
    return {
      title: "我是一个标题",
      age: 20,
      colors: ["red", "yellow", "white"]
    }
  },
  components: {
    MyComponent
  }
}
</script>
```

- 4、给MyComponent组件传值

```html
<template>
  <my-component 
      :title="title" 
      :age="age" 
      name="fcf"
      :colors="colors"></my-component>
</template>
```

这里name并不是绑定到变量中的，所以直接赋值。

#### props类型

props内可以传递任何类型，是没有限制的。


