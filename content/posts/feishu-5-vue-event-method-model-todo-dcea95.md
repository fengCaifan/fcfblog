---
title: "5、使用Vue event、method和model添加一个新的todo表单"
date: "2023-08-28"
category: "前端与小程序"
tags: ["网络与安全","Vue / 前端"]
description: "前几节创建了一个todo组件 渲染组件列表 https://bhhbdrz3p9.feishu.cn/docx/OlTfdRfwZoaiQuxrN4jc8FyTn0b 。这节，我们给列表添加新的单元 创建新的代办事项表单"
feishu_token: "XWqudbvcVo9TqNxm71mcaWjfn5f"
---

# 5、使用Vue event、method和model添加一个新的todo表单

前几节创建了一个todo组件[渲染组件列表](https://bhhbdrz3p9.feishu.cn/docx/OlTfdRfwZoaiQuxrN4jc8FyTn0b) 。这节，我们给列表添加新的单元

## 创建新的代办事项表单

- 新建一个ToDoForm vue组件
  包含一个label、一个输入框、一个button

```html
<template>
    <form>
        <label for="new-todo-input">What need to be done? </label>
        <input type="text" id="new-todo-input" name="new-todo" :autocomplete="off" />
        <button type="submit"> Add </button>
    </form>
</template>

<script>
    export default {};
</script>
```

- 将其添加到App.vue里

```html
<template>
  <div id="app">
    <h1>My To-Do List</h1>
    <to-do-form></to-do-form>
    <ul>
      <li v-for="item in ToDoItems" :key="item.id">
        <to-do-item :label="item.label" :done="item.done" :id="item.id"></to-do-item>
      </li>
    </ul>
  </div>
</template>

<script>
import ToDoItem from './components/ToDoItem.vue';
import ToDoForm from './components/ToDoForm.vue';
import uniqueId from "lodash.uniqueid";

export default {
  name: 'App',
  components: {
    ToDoItem, ToDoForm,
  },
  data() {
    return {
      ToDoItems: [
        {id: uniqueId("todo-"), label: "Learn Vue", done: false},
        {id: uniqueId("todo-"), label: "Create a Vue project with the CLI", done: true},
        {id: uniqueId("todo-"), label: "Have Fun", done: true},
        {id: uniqueId("todo-"), label: "Create a to-do list", done: false},
      ]
    }
  }
}
</script>
```

届时，网页显示如下

![图片](/images/feishu/feishu-5-vue-event-method-model-todo-dcea95/QSApbMp8coyFeDxR6X2cyulanwb.png)

## 使用v-on给按钮添加事件，并绑定

#### 给<script>添加方法

前几节，我们知道<script>内有props属性、data()数据。

而**methods**其实是和它们同等位置同等重要的成员。

methods内包含我们可能需要在组件中调用的任何方法。

```html
<script>
    export default {
        methods: {
            onSubmit() {
                console.log("form submitted");
            }
        },
    };
</script>
```

#### 使用**v-on**绑定方法。

在[3、第一个Vue组件](https://bhhbdrz3p9.feishu.cn/docx/CFDodaj0ToYOiHxKjgUcqGA6nfc) 中，我们使用了v-bind将属性与html进行绑定。

而**v-on**指令就是通过**v-on:event="method"**语法来绑定事件处理的。另外它有一个简单的语法糖**@event="method"**。

#### 使用v-model来绑定数据输入

- 1、收到给组件添加一个label属性

```html
<script>
    export default {
        data() {
            return {
                label: "",
            }
        },
        methods: ...,
    };
</script>
```

- 将输入附加到label

**v-model**绑定数据属性与<input>保持同步。

v-model适用于所有不同的输入类型，包括复选框、单选框和选择输入。

```html
<input 
    type="text" 
    id="new-todo-input" 
    name="new-todo" 
    autocomplete="off"
    v-model.lazy.trim="label" />
```

这里lazy和trim都是v-model的修饰符

#### 将事件数据传递给父级

- 使用this.$emit("")发射数据

```html
<script>
    export default {
        data() {
            return {
                label: "",
            }
        },
        methods: {
            onSubmit() {
                console.log('Label value: ', this.label);
                if (this.label === "") {
                    return;
                }
                this.$emit('todo-added', this.label);
                this.label = "";
            }
        },
    };
</script>
```

- 在app.vue中添加方法接收数据
```html
<script>
import ToDoItem from './components/ToDoItem.vue';
import ToDoForm from './components/ToDoForm.vue';
import uniqueId from "lodash.uniqueid";

export default {
  name: 'App',
  components: {
    ToDoItem, ToDoForm,
  },
  data() {
    return {
      ToDoItems: [
        {id: uniqueId("todo-"), label: "Learn Vue", done: false},
        {id: uniqueId("todo-"), label: "Create a Vue project with the CLI", done: true},
        {id: uniqueId("todo-"), label: "Have Fun", done: true},
        {id: uniqueId("todo-"), label: "Create a to-do list", done: false},
      ],
    };
  },
  methods: {
    addToDo(toDoLabel) {
      this.ToDoItems.push({id:uniqueId("todo-"), label:toDoLabel, done:false})
    },
  },
}
</script>
```

  - 这里收到数据后，将数据添加进ToDoItems里，这样数据就会变更。

- 在app.vue中，将addToDo绑定到to-do-form组件中

```html
<to-do-form @todo-added="addToDo"></to-do-form>
```


