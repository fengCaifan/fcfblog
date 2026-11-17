---
title: "Vue3：3、列表渲染"
date: "2023-09-02"
category: "前端与小程序"
tags: ["Vue / 前端"]
description: "v for v for可以把数组映射成一组元素。 v for基于一个数组来渲染一个列表，v for指令需要使用 item in items 形式的特殊语法。其中items是源数据指令，而item则是被迭代的数组元素的别名"
feishu_token: "CKtFdPaAJozG5SxEtlscvEcUnuh"
---

# Vue3：3、列表渲染

#### v-for

v-for可以把数组映射成一组元素。

v-for基于一个数组来渲染一个列表，v-for指令需要使用 **item in items** 形式的特殊语法。其中items是源数据指令，而item则是被迭代的数组元素的别名

```html
<script>
export default {
  data() {
    return {
      newsList: [
        {
          id: 1001,
          title: "今日新闻1"
        },
        {
          id: 1002,
          title: "今日新闻2"
        },
        {
          id: 1003,
          title: "今日新闻3"
        }
      ],
    }
  }
}
</script>
```

```html
<h2>列表渲染</h2>
    <ul>
      <li v-for="item in newsList" v-bind:key="item.id"> {{ item }} </li>
    </ul>
```

这里注意：这个for循环，一定需要绑定key，v-bind:key="item.id"。如果不绑定key，VSCode会报错，原因可能跟下面的维护状态有关。

#### 维护状态

v-for渲染列表时，它使用“就地更新策略”，也就是说，假设你现在给上面数组中添加一个新的item，DOM最终只是渲染最新的那个，其他的不会变。解决的方案就是一定要有一个key属性。

一般的key是使用数据的id，如果没有id，则可以使用index

```html
<h2>列表渲染</h2>
    <ul>
      <li v-for="(item, index) in newsList" :key="index"> {{ index + item.title }} </li>
    </ul>
```


