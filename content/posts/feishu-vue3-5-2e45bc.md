---
title: "Vue3：5、表单输入绑定"
date: "2023-09-02"
category: "前端与小程序"
tags: ["Vue / 前端"]
description: "监听数据更新 可以使用 v model 指令监听用户 输入事件 来更新数据。比如<input 、<textarea 、<select 等。 同时它可以对数据进行双向绑定。 这里可以看到，在没有输入之前，input输入框内"
feishu_token: "DWf5dCGWgo2dIWxfM10c3ksKnEb"
---

# Vue3：5、表单输入绑定

#### 监听数据更新

可以使用**v-model**指令监听用户**输入事件**来更新数据。比如<input>、<textarea>、<select>等。

同时它可以对数据进行双向绑定。

```html
    <h2>输入绑定</h2>
    <div>
      <input type="text" v-model="username" />
      <input type="text" v-model="password" />
      <p>{{ username }},{{ password }}</p>
      <button @click="clickGetUserName">获取用户名</button>
    </div>
```

```html
<script>
export default {
  data() {
    return {
      username: "xxxx",
      password: "",
    }
  },
  methods: {
    clickGetUserName() {
      console.log(this.username);
    }
  },
}
</script>
```

这里可以看到，在没有输入之前，input输入框内显示的是username的初始值xxxx，在输入的过程中，显示区域也可以一边显示输入内容，这就是双向数据绑定

#### 修饰符

- .lazy

上面看到v-model是双向绑定，而且是及时同步的。.lazy就是要在输入框失去焦点的时候，才开始响应。将上面uusername在失去焦点时才响应

```html
<input type="text" v-model.lazy="username" />
```

- .trim

trim是自动过滤用户输入的首尾空白字符。一旦失去焦点，前后的空格就自动没了。

```html
<input type="text" v-model.trim="password" />
```


