---
title: "Vue3：13、状态管理"
date: "2023-10-05"
category: "前端与小程序"
tags: ["网络与安全","Vue / 前端"]
description: "Vue状态管理：Vuex 状态管理可以理解成更方便地管理组件与组件之间的数据交互。 之前我们学过组件属性props来进行组件之间的数据交互。 Vue3：7、组件数据正向传递 https://bhhbdrz3p9.feis"
feishu_token: "IOeRdRmtVoiocMxhbLbcj14nnIc"
---

# Vue3：13、状态管理

## Vue状态管理：Vuex

状态管理可以理解成更方便地管理组件与组件之间的数据交互。

之前我们学过组件属性props来进行组件之间的数据交互。[Vue3：7、组件数据正向传递](https://bhhbdrz3p9.feishu.cn/docx/XSrTdhEbVoEUhCxStqNcKqoPnqt) 

但是这个是基于父子容器这样的关系来做的。假设现在由于页面嵌套，组件之间可能会存在非常多的中间组件，如果这两个组件需要进行交互，就需要一层一层传递过去，如果中间某一个组件出现了问题，则就无法继续传递下去了。Vuex就是作为一个中间件过渡组件，对组件之间的数据交互提供一个集中式的管理方案。

## 引入Vuex

- 安装Vuex

```bash
npm install --save vuex
```

- 配置Vuex文件

同样的，先配置一个store的文件夹，里面创建一个index.js文件

```javascript
import { createStore } from "vuex"

// vuex的核心作用就是帮我们管理组件之间的状态的
export default createStore({
    // 所有的状态（数据）都放在这里
    state: {
        counter: 3
    }
})
```

然后在main.js中引入

```javascript
import store from './store'

// 将 axios 挂载到全局
const app = createApp(App)
app.config.globalProperties.$axios = axios
app.use(store),
app.mount('#app')
```

## 使用

在任意位置，使用$store.state进行读取

```html
<p>counter = {{ $store.state.counter }}</p>
```

如果一个组件中，有多个读取vuex里的数据，则可以在当前组件里声明一个快捷读取方式。

```html
<script>
import { mapState } from 'vuex';

export default {
    name: "newsView",
    // 专门用来读取vuex数据
    computed: {
        ...mapState(["counter"])
    }
}
</script>

// 使用
<p>{{ counter }}</p>
```

## Vuex状态管理核心

vuex的主要核心就是对数据进行修改，其他组件自动响应

#### state

state就是上面用到的，用来存储数据的

#### getters

getters则是对Vuex中的数据进行过滤。

```bash
export default createStore({
    // 所有的状态（数据）都放在这里
    state: {
        counter: 3
    },
    getters: {
        getCounter(state) {
            return state.counter > 0 ? state.counter: "counter数据异常"
        }
    },
})
```

使用的地方，同样也有快捷方式

```html
<script>
import { mapState } from 'vuex';
import { mapGetters } from 'vuex';

export default {
    name: "newsView",
    computed: {
        ...mapState(["counter"]),
        ...mapGetters(["getCounter"])
    }
}
</script>

// 使用
<p>getcounter = {{ getCounter }}</p>
```

#### Mutation

上面说的getters是对数据进行过滤。其实和state一样，是读取。如果要对state里的数据进行更改，则需要使用mutation

```bash
export default createStore({
    // 所有的状态（数据）都放在这里
    state: {
        counter: 3
    },
    ...
    mutations: {
        addCounter(state, num) {
            state.counter += num
        }
    },
})
```

使用：

当counter发生变化时，所有引用了counter的地方都会立即刷新。

```javascript
methods: {
    addClickHandler() {
        // 固定调用方式
        this.$store.commit("addCounter", 10)
    }
}
```

快捷使用方案

```html
<script>
import { mapState, mapGetters, mapMutations } from 'vuex';

export default {
    name: "newsView",
    computed: {
        ...mapState(["counter"]),
        ...mapGetters(["getCounter"])
    },
    methods: {
        ...mapMutations(["addCounter"]),
        addClickHandler() {
            // 固定调用方式
            this.addCounter(20)
            // this.$store.commit("addCounter", 10)
        }
    }
}
</script>
```

#### Action

action类似mutation，不同在于

- action提交的是mutation，而不是直接变更操作

- action可以包含任意异步操作

所以，相当于是异步的时候才会有action

```javascript
import { createStore } from "vuex"
import api from "../api/index"

// vuex的核心作用就是帮我们管理组件之间的状态的
export default createStore({
    // 所有的状态（数据）都放在这里
    state: {
        counter: 3
    },
    ...
    // 为异步操作所准备的
    actions: {
        asyncAddCounter({ commit}) {
            api.generator().then( res => {
                console.log(res.data);
                commit("addCounter", res.data[0])
            })
        }
    }
})
```

使用：

```javascript
<button @click="addAsyncClickHandler">异步增加</button>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';

export default {
    name: "newsView",
    computed: {
        ...mapState(["counter"]),
        ...mapGetters(["getCounter"])
    },
    methods: {
        ...mapMutations(["addCounter"]),
        addClickHandler() {
            // 固定调用方式
            this.addCounter(20)
            // this.$store.commit("addCounter", 10)
        },
        addAsyncClickHandler() {
           // 注意这里要使用dispatch调用
            this.$store.dispatch("asyncAddCounter")
        }
    }
}
</script>
```


