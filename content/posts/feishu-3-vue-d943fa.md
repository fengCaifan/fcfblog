---
title: "3、第一个Vue组件"
date: "2023-08-28"
category: "前端与小程序"
tags: ["Vue / 前端"]
description: "创建一个ToDoItem组件 在src/components目录下，创建一个ToDoItem.vue文件。 在文件夹中添加template来创建组件的模板部分。 添加一些html元素 在文件夹中添加script来创建导出"
feishu_token: "CFDodaj0ToYOiHxKjgUcqGA6nfc"
---

# 3、第一个Vue组件

## 创建一个ToDoItem组件

- 在src/components目录下，创建一个ToDoItem.vue文件。

- 在文件夹中添加template来创建组件的模板部分。
  - 添加一些html元素
```html
<template>
    <input type="checkbox" id="todo-item" checked="false" />
    <label for="todo-item">My Todo Item</label>
</template>
```

- 在文件夹中添加script来创建导出对象
```html
<script>
    export default {};
</script>
```

#### 在应用程序中使用TodoItem组件

- 打开App.vue文件，
  - 在<script>中引入ToDoItem.vue。
```html
<script>
import ToDoItem from './components/ToDoItem.vue';

export default {
  name: 'App',
  components: {
    ToDoItem,
  }
}
</script>
```

  - 在<template>添加
```html
<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <h1>To-Do List</h1>
  <to-do-item></to-do-item>
</template>
```

## 使用props组件动态化

通过注册props对象，来设置属性。然后在template中使用。

```html
<script>
export default {
    props: {
        label: { required: true, type: String },
        done: { default: false, type: Boolean }
    }
};
</script>
```

使用：

```html
<template>
    <input type="checkbox" id="todo-item" checked="false" />
    <label for="todo-item">{{label}}</label>
</template>
```

注意：**props是一个单向绑定**，也就是可以通过改变props里的属性来变更组件里的值。但是没法通过更组件里的值去变更props里的值。

#### Vue的数据对象

上面说到props是一个单向绑定。但是Vue的data属性是可以进行双向刷新的。

data的语法：

```javascript
data() {
    return {
        key: value
    }
}
```

现在props内已有两个属性：label、done。这两个属性在data中都可以通过this拿到。所以script变成了：

```html
<script>
export default {
    props: {
        label: { required: true, type: String },
        done: { default: false, type: Boolean }
    },
    data() {
        return {
            isDone: this.done,
        }
    }
};
</script>
```

这样isDone就成了一个新的可以被双向绑定的新属性。

现在可以将isDone属性附加到我们的组件中。如果是要将js表达式绑定到HTML元素和组件，可以使用**v-bind**:

```html
<input type="checkbox" id="todo-item" v-bind:checked="isDone" />

// 和上面写法一样效果
<input type="checkbox" id="todo-item" :checked="isDone" />
```

这样checked就与isDone绑定了。

不过，这和label一样，是没有初始值的。所以需要给props中的done属性加一个初始值，这个值可以通过isDone在input中生效。

```html
<to-do-item label="My ToDo Item" :done="true"></to-do-item>
```

## 给Todos组件一个唯一的ID

我们通过使用lodash包的uniqueid()方法来帮助保持索引的唯一性。

- 终止服务，安装uniqueid

```bash
npm install --save lodash.uniqueid
```

- 引入库

```html
<script>
import uniqueId from "lodash.uniqueid";

export default {
    props: {
        label: { required: true, type: String },
        done: { default: false, type: Boolean }
    },
    data() {
        return {
            isDone: this.done,
            id: uniqueId("todo-"),
        }
    }
};
</script>
```

- 将id绑定到input的id属性和label的for属性中

```html
<template>
    <input type="checkbox" id="id" :checked="isDone" />
    <label for="id">{{label}}</label>
</template>
```

至此，有一个可以被重复利用的ToDoItem的组件。


