---
title: "Vue3：10、引入第三方"
date: "2023-09-23"
category: "前端与小程序"
tags: ["网络与安全","Vue / 前端"]
description: "引入第3方组件 引入轮播图：Swiper组件 vue内的 swiper 官方文档：https://swiperjs.com/vue 安装 安装完成后，可以在package.json里的dependencies中看到swi"
feishu_token: "Mi1jdU1UcovsaOxDepwcZTVynvb"
---

# Vue3：10、引入第三方

#### 引入第3方组件

- 引入轮播图：Swiper组件

vue内的**swiper**官方文档：https://swiperjs.com/vue

- 安装

```bash
$ npm install --save swiper
```

 安装完成后，可以在package.json里的dependencies中看到swiper的依赖及版本。

如果要安装指定版本

```bash
$ npm install --save swiper@10.2.0
```

- 引入

```html
<script>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css'

export default {
    name: "swiperComponent",
    components: {
        Swiper,
        SwiperSlide,
    }
}
</script>
```

注意：这里一定需要加上css

- 使用

```html
<template>
    <h3>swiper滚动组件</h3>
    <Swiper>
        <SwiperSlide>
            <img src="../assets/v1.png" alt=""/>
        </SwiperSlide>
        <SwiperSlide>
            <img src="../assets/v2.webp" alt=""/>
        </SwiperSlide>
        <SwiperSlide>
            <img src="../assets/v3.png" alt=""/>
        </SwiperSlide>
    </Swiper>
</template>
```

#### 添加指示器

- 引入指示器

```html
<script>
import { Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';

export default {
    name: "swiperComponent",
    data() {
        return {
            modules: [ Pagination ],
        }
    },
    components: {
        Swiper,
        SwiperSlide,
    }
}
</script>
```

- 使用

```javascript
<Swiper :modules="modules" :pagination="{ clickable: true }">
```

clickable表示是否支持点击。


