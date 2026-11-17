---
title: "Vue3：8、组件数据反向回调"
date: "2023-09-23"
category: "前端与小程序"
tags: ["网络与安全","Vue / 前端"]
description: "上节 Vue3：7、组件交互 https://bhhbdrz3p9.feishu.cn/docx/XSrTdhEbVoEUhCxStqNcKqoPnqt 中props中的数据交互是正向传递，也就是从外部向组件内传递数据。"
feishu_token: "LCDWdA8vQoj9dqxZhrbcShGCnsg"
---

# Vue3：8、组件数据反向回调

上节[Vue3：7、组件交互](https://bhhbdrz3p9.feishu.cn/docx/XSrTdhEbVoEUhCxStqNcKqoPnqt) 中props中的数据交互是正向传递，也就是从外部向组件内传递数据。那组件如何向外部回调数据呢？？

#### 自定义事件$emit

- 创建一个新的组件

```html
<template>
    <h2>组件内数据回调</h2>
</template>

<script>
export default {
    name: "myComponent2",
}
</script>

<style scoped>
h2{
    color: blue,
}
</style>
```

- 添加点击事件，事件内向外部传递数据

```html
<template>
    <button @click="sendClickHandler">点击回调数据</button>
</template>
```

```javascript
data() {
        return {
            message: "mycomponent内部数据",
        }
    },
    methods: {
        sendClickHandler() {
            // $emit向外部传递数据
            // 参数1：字符串（理论上是随便的，但是需要具有意义）
            // 参数2：传递的数据
            this.$emit("onEvent", this.message)
        }
    }
```

点击按钮后，在响应函数中，将message作为**$emit**的第二个参数传递出去

- 外部接收显示
  - App.vue中引入新组件
```html
<script>
import MyComponent2 from './components/myComponent2.vue'

export default {
  name: 'App',
  components: {
    MyComponent2,
  },
}
</script>
```

  - 添加接收数据的方法
```javascript
<templete> 
    <my-component2 @onEvent="getDataFromMyCompenent2"></my-component2>
    <p> {{ dataFromMyCompenent2 }}</p>
</templete>
```

```html
<script>
export default {
  data() {
    return {
      dataFromMyCompenent2: ""
    }
  },
  methods: {
    getDataFromMyCompenent2(data) {
      console.log(data);
      this.dataFromMyCompenent2 = data;
    }
  }
}
</script>
```

  -


