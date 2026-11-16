---
title: "字典转模型阶段同步打印日志导致页面卡顿的排查"
date: '2024-07-14'
category: "性能优化与排查"
description: "通过 Time Profiler 定位列表页进场耗时过高的原因：JSON 解析库在字段类型不匹配时高频调用 NSLog。"
tags: ["卡顿排查", "Instruments", "JSON解析"]
---

### 一、 整体卡顿数据
FirebasePerformance控制台显示卡顿数据如下：

PS：『冻结的帧』定义：

[冻结的帧](https://firebase.google.com/docs/perf-mon/screen-traces?hl=zh-cn#frozen-frames) - 衡量呈现时间超过 700 毫秒的屏幕实例所占的百分比。

应用中的缓慢或冻结的帧可能会导致设备性能不佳，也称为卡顿或延迟。

出现冻结的帧，也就意味着出现了卡顿。

### 二、选取TopicRoomListViewController，排查其卡顿原因
TopicRoomListViewController的卡顿率为20%，表明该页面的20％的帧**要加载700毫秒以上的时间。**

#### 1.直接体验
将App切到线上环境，搜索hashtag--『#20代』进入hashtag详情页，点击语音房列表tab

尝试进入该页面、上下滑动列表，并没有感知到明显的卡顿

#### 2.Instrument分析
可见在进入语音房列表页时，有大量耗时操作，查看堆栈发现很大一部分耗时操作在FastJsonMapper内，即字典转model。

此时Xcode控台台大量打印FastJsonMapper转换失败的日志

**搜索源码发现FastJsonMapper中有以下日志输出，结合已知NSLog是耗时操作，尤其是在字典转json中进行大量打印，并且线上数据返回很多，会导致更加耗时。**

### 三、验证
如下验证代码，在线上测试发现该model转换耗时约86ms，已经远远超过16ms的一帧时长。

注释掉FastJsonMapper库的NSLog输出后，字典转model时长为49ms，耗时减小50%。

### 参考文档：
[https://firebase.google.com/docs/perf-mon/screen-traces?hl=zh-cn&platform=ios](https://firebase.google.com/docs/perf-mon/screen-traces?hl=zh-cn&platform=ios)
