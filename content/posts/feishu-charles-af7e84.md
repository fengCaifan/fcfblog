---
title: "Charles 拦截网络请求"
date: "2023-08-28"
category: "工程效率与工具"
tags: ["网络与安全","工程效率"]
description: "测试代码如果直接在项目中加，可能会有时机问题，比如无法在代码解析之前修改数据。所以我们 可以利用charles的拦截能力，在请求前拦截request，和请求后拦截response。 这里以拦截response为例 添加断"
feishu_token: "GicOdqzeBoB1UGxZTbnch603nLc"
---

# Charles 拦截网络请求

测试代码如果直接在项目中加，可能会有时机问题，比如无法在代码解析之前修改数据。所以我们 可以利用charles的拦截能力，在请求前拦截request，和请求后拦截response。

这里以拦截response为例

- 添加断点：

在charles的请求列表中选中需要拦截的接口，右键弹出可选项，选中Breakpoints添加断点。

![图片](/images/feishu/feishu-charles-af7e84/VjB0bm9HwoVfRRxgdnkcqTvDnYf.png)

完成之后，可以右键重新拉起选项，发现Breakpoints是勾选中的状态。

- 设置拦截接口数据：
  - 选择Proxy，点击Breakpoints seting。
![图片](/images/feishu/feishu-charles-af7e84/RsmebSmLeo9bWtxH52IcjfUVnRh.png)

  - 在窗口上双击需要设置的接口，会弹出设置窗口，设置对应项（request或response）
![图片](/images/feishu/feishu-charles-af7e84/PvNGb8bKOotcrhxJSHmcAW9ynWf.png)

点击完成后就生效了。

- 编辑返回的数据

重新发起请求，如果是response就会在数据返回后，触发拦截窗口，这里就可以去编辑返回的数据。

![图片](/images/feishu/feishu-charles-af7e84/VMr7bfcm8ofjzJxJMP5cL0Zzn9f.png)

- 点击生效

执行完成后，点击Execute就生效了。


