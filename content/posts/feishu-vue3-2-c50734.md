---
title: "Vue3：2、条件渲染"
date: "2023-09-02"
category: "前端与小程序"
tags: ["Vue / 前端"]
description: "v if指令 v if指令用于条件性地渲染一块内容，这块内容只会在指令的表达式返回值为true的时候才会被渲染。 这里为false，所以不会显示。改成true就显示了。 v else v else是if分支的else块 "
feishu_token: "UWyLdEvQ0o77GVxAy2WcGBoDnPh"
---

# Vue3：2、条件渲染

#### v-if指令

v-if指令用于条件性地渲染一块内容，这块内容只会在指令的表达式返回值为true的时候才会被渲染。

```html
<p v-if="flag">我是孙猴子</p>
```

```html
<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      flag: false,
    }
  }
}
</script>
```

这里为false，所以不会显示。改成true就显示了。

#### v-else

v-else是if分支的else块

```html
<p v-if="flag">我是孙猴子</p>
<p v-else>你是傻猴子</p>
```

#### v-show

v-show是另一个用于条件展示元素的选项

```html
<p v-show="flag">你真是那只孙猴子?</p>
```

#### v-if和v-show的区别

- v-if是真正的条件渲染，因为它会确保在切换过程中，条件块内的事件监听器和子组件适当地被销毁和重建

- v-if也是惰性的，如果在初始渲染时条件为假，则什么也不做，直到条件第一次为真时，才会渲染条件块。而v-show则不管初始条件是什么，元素总是会被渲染，并且只是简单地基于CSS进行切换。（v-if那个元素根本不会存在于源码中，而v-show的元素会存在）

- 一般来说，v-if有更高的切换开销，v-show有更高的初始渲染开销。因此，如果需要非常频繁地切换，则使用v-show较好，如果运行条件很少改变，则使用v-if较好。


