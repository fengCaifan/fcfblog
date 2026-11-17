---
title: "FOOM归因方案"
date: "2024-05-21"
category: "性能与稳定性"
tags: ["内存管理","性能与稳定性"]
description: "背景 因线上 FOOM 的数据量太大（目前统计大概在日均700～1000次左右）。所以对目前我们项目统计 FOOM 的方案进行了分析。 同时，结合对微信 matrix 库的调研，发现对 FOOM 的细节处理还是有一小部分"
feishu_token: "YJHGdp8E2o87y6xa6xzcliP4nuc"
---

# FOOM归因方案

#### **背景**

因线上 FOOM 的数据量太大（目前统计大概在日均700～1000次左右）。所以对目前我们项目统计 FOOM 的方案进行了分析。

同时，结合对微信 matrix 库的调研，发现对 FOOM 的细节处理还是有一小部分差异。

所以进行了简单整理，仅供参考：

#### **现状**

当前Gravity是如何判定上一次是否出现FOOM？

1. **App当时在前台运行**

1. **App没有出现crash**

1. **App没有升级**

1. **系统没有升级**

![图片](/images/feishu/feishu-foom-042510/WMIDb3amDoZotExcoGpcyDJgntf.png)

#### **外部方案：Facebook**

Facebook是如何判定上一次是否出现FOOM？

1. **App没有升级**

1. **App没有调用exit()或abort()退出**

1. **App没有出现crash**

1. **用户没有强退App**

1. **系统没有升级/重启**

1. **App当时没有后台运行**

1. **App出现FOOM**

#### **存在的细节case：**

1. 对比上述方案的差异。所以对调用了**exit(0)**函数和使用gravity时发生了**关闭重启**。下一次使用时，也会当作一次FOOM上报上去。

1. 除此差异之外，其他相同的条目，3crash统计依赖于crash捕获组件，6、7依赖于ApplicationState和前后台切换通知。这些东西也会因一些特殊case，而导致数据的差异化。
  1. **ApplicationState不准**
    部分系统会在后台短暂唤起app，ApplicationState是Active，但又不是BackgroundFetch；执行完didFinishLaunchingWithOptions就退出了，也有收到BecomeActive通知，但很快也退出；整个启动过程持续5～8秒不等。

     AI给出的导致在后台被短暂唤醒的case：

![图片](/images/feishu/feishu-foom-042510/V99zb0B8roBOhCxQkb3cCnsxnHd.png)

    解决方法是收到BecomeActive通知一秒后，才认为这次启动是正常的前台启动。这方法只能减少误判概率，并不能彻底解决。

  1. **crash组件是否有统计全crash？**
    这个点，目前我们是使用firebase库对崩溃进行统计的，所以在不确定它内部实现的情况下，不太好下结论。

    这里列出来，只是确实存在这种可能性。 微信举了一个例子：比如，在收到crash信号，crash库写日志时，内存池出现了问题，组件无法正常写入，甚至出现了二次crash。

    这里给出解决方案是：不依赖crash回调，只要本地存在上一次的crashlog（不管是否完整），就认为是crash引起的app重启。

  1. **前台卡死引起系统watchdog强杀**
    如果前台由于线程过多、死锁、CPU使用率过高等，会导致被系统watchdog强杀。这类强杀也是无法被App捕获的。

    这类case可能是比较多的，后期需要关注的。

    解决方案：结合卡顿捕获来处理，如果在前台运行的最后一刻捕获到卡顿，就认为是“APP前台卡顿导致重启”。

#### **结论**

在当前我们的DAU不算多，FOOM数据量太大的情况下，前期可能无须太关心精细化的case，所以当前使用的方案，可以暂时满足当下的需求。后续对大多数内存使用优化完之后，可以考虑用Matrix的方案，尽可能将FOOM的数据校准。


