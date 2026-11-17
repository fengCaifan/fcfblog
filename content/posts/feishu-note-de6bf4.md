---
title: "1、广告投放安装归因底层逻辑浅析"
date: "2025-11-12"
category: "iOS 与底层"
tags: ["技术笔记"]
description: "Q： 假设我的appA的推广广告在第三方appB的上展示了。假设广告主集成的分析平台是AppsFlyer，广告平台集成的是AppLovin，那么这个流程是什么样的？appA和appB分别集成的是什么？它们底层是否与SKA"
feishu_token: "Wmaxd8xwxohNRmxCuhpcW7w1nMg"
---

# 1、广告投放安装归因底层逻辑浅析

Q：

假设我的appA的推广广告在第三方appB的上展示了。假设广告主集成的分析平台是AppsFlyer，广告平台集成的是AppLovin，那么这个流程是什么样的？appA和appB分别集成的是什么？它们底层是否与SKAdNetwork有关？怎么交互的？

---

## 分析原理：（AppA / AppB / AppLovin / AppsFlyer / Apple / SKAdNetwork）

### 1️⃣ 参与角色

---

### 2️⃣ 广告归因流程

#### 阶段一：广告展示与点击（AppB + AppLovin）

1. 用户在 **AppB（广告展示 App）** 中看到 **AppA 的广告**；该广告由广告网络（如 **AppLovin**）投放； 
  - 展示的广告数据包括 **签名的广告素材 + SKAdNetwork 参数：**
> 这些参数由广告网络提前通过 Apple 的私钥签发，保证合法性。

```json
{
  "ad-network-id": "com.applovin.sdk",
  "campaign-id": 45,
  "source-id": 1234,
  "nonce": "随机数",
  "signature": "Apple签名校验值",
  "fidelity-type": 0
}
```

1. 用户在 **AppB** 中看到并点击广告位。
  - SDK 调用 SKAdNetwork API：
    - `SKAdNetwork.startImpression()` 记录曝光
    - `updateConversionValue()`（可选）更新 conversion value
> Apple 会记录一次“点击”事件，保存签名数据（ad-network-id、campaign-id、nonce、timestamp 等）以便后续归因。

> **关键点**：AppB 只展示广告，触发 SDK 调用，不接收回执。AppLovin SDK 触发 SKAN 注册。

---

#### 阶段二：用户点击广告 → 下载并启动 AppA

1. 用户点击广告 → 跳转 App Store → 下载 **AppA**。

> Apple 系统保存广告点击信息（广告网络 ID + campaign ID）。

1. 用户首次启动 **AppA**：
  - **AppsFlyer SDK** 自动调用 `SKAdNetwork.registerAppForAdNetworkAttribution()` 注册归因
> Apple 会异步生成一个 **加密回执（Postback）**；
> 回执中包含：

  

> **关键点**：AppA 通过 SDK 注册 SKAN，不直接接收回执。Apple 等待安装完成，准备发送 postback。

---

#### 阶段三：Apple 发送 SKAN 回执

1. Apple 把回执（包含 campaign ID、conversion value、source ID 等信息）发送到**MMP**平台【广告主 AppA 在 Info.plist 中配置的**NSAdvertisingAttributionReportEndpoint】**
> **NSAdvertisingAttributionReportEndpoint** 决定回执发往的 URL（AppLovin 服务器）。

1. **回执示例**：

```json
{
  "version": "4.0",
  "ad-network-id": "appLovin-id",
  "campaign-id": 1234,
  "conversion-value": 5,
  "redownload": false,
  "source-app-id": "com.appA",
  "attribution-signature": "ABCDEF123..."
}
```

> **关键点**：SKAN4.x之前 Apple 的 postback 永远只发给广告网络，不发给 MMP 或 AppA。4.x之后发给MMP平台而不是广告网络了。

---

#### 阶段四：MMP → 广告网络 （S2S 转发）

1. **归因平台（AppsFlyer） 接收到来自 Apple 的加密回执**：
  - 1、验证 Apple 签名合法性、解析归因数据；
  - 2、将回执数据通过 **Server-to-Server（S2S）接口** 转发给 广告网络（AppLovin 等）
  - 3、将解析结果展示在广告主后台

1. **广告网络更新统计**：
  - 1、匹配自己记录的点击事件
  - 2、更新该广告系列的安装/转化数据；
  - 3、整个归因闭环完成。

> **关键点**：不是所有广告网络和 MMP 都互通。 只有广告网络和 MMP 之间有合作协议，并开通 S2S 通道，广告网络才会转发 Apple 回执。

---

### 3️⃣ 回答之前的几个关键问题

1. **SKAdNetwork 的回执发给谁？**
  - 发给归因平台（AppsFlyer等）。

1. **广告网络和归因分析平台是如何数据同步的？**
  - 与SKAdNetwork合作的厂商，会建立合作协议并开通 S2S 通道。

1. **AppA / AppB 是否需要处理 SKAdNetwork postback？**
  - ❌ 不需要
  - AppA SDK 上报事件、注册 SKAN
  - AppB 只展示广告

1. **NSAdvertisingAttributionReportEndpoint 的作用**
  - 告诉 Apple 广告网络希望把 postback 发送到哪台服务器

1. **为什么在 AppA 里看不到对 SKAdNetwork 的直接操作？**
  - AppsFlyer SDK 已经封装了注册和事件上报，Apple 回执不会发到 App 层，全部在 SDK 和服务器端处理。

---

### 4️⃣ 核心逻辑总结（带点击阶段）

- 1、广告网络注册为 SKAdNetwork ID。

- 2、广告展示 App（AppB）在用户点击时调用 `SKAdNetwork` API 上报点击。

- 3、Apple 记录点击事件，等待用户安装。

- 4、安装成功 → Apple 生成回执 → 发送到广告主配置的 `NSAdvertisingAttributionReportEndpoint`（通常是 MMP）。

- 5、MMP 解析 → 同步给广告网络 → 完成归因。

## 参考链接：

[SKAdNetwork（SKAN）解决方案指南](https://support.appsflyer.com/hc/zh-cn/articles/360011420698-SKAdNetwork-SKAN-%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88%E6%8C%87%E5%8D%97)


