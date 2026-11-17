---
title: "UniversalLink底层原理与使用说明"
date: "2025-04-30"
category: "iOS 与底层"
tags: ["网络与安全","工程效率"]
description: "原理： 理论核心：URL Handing 权限转移 UniversalLink的核心机制是基于一个思想： iOS 系统会将某个域名上特定URL路径的打开权授权给知道APP 也就是，当App的 Entitlements 声"
feishu_token: "TZvjdYNTsopzSfxc2XZc4T72ntf"
---

# UniversalLink底层原理与使用说明

## 原理：

###### 理论核心：URL Handing 权限转移

UniversalLink的核心机制是基于一个思想：

> **iOS 系统会将某个域名上特定URL路径的打开权授权给知道APP**

也就是，当App的**Entitlements**声明拥有某个域名，并且系统在这个域名上的服务器上获取到了合法的**AASA**文件，iOS就会在系统层级将该域名交由你App处理。

#### Entitlements：

也就是XCode上的域名配置。

- 格式：applinks:域名

- 可以配置多个。也可以用*通配符进行配置。比如：applinks:*.gravity.place。

- 多个域名的话，必须保证每个域名都可以拉取到AASA文件。

#### AASA文件：

也就是我们给到对应域名服务器的apple-app-site-association文件。内容如下：

```json
{
    "applinks": {
        "apps": [],
        "details": [
            {
                "appID": "RYRPKMVKDL.com.hiclub.gravity",
                "paths": [ "/line-auth/*" ]
            }
        ]
    }
}
```

- 这里的appID是由团队ID和bundleID拼接而成。可参考磊哥文档：[通用链接UniversalLink](https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/iki-aVkbF_/cmlXUWMvnp/7VMJW8atQwOozj)

- paths：则是表示app可以处理的路径。

- **合法的AASA**文件需要具备的潜质：
  - 必须能够支持https；

- 系统是在安装时拉取到的AASA，并且会有缓存。
  - 如果配置了多个域名。那么在App第一次安装时，会请求[https://app-site-association.cdn-apple.com](https://app-site-association.cdn-apple.com)，里面拉取到的文件个数就对应我们配置的域名格式

#### 整体流程类型：

整体角色和作用：

![图片](/images/feishu/feishu-universallink-3bd26b/REUfbFPjNod8mcxLhw2cZxzCnWh.png)

- 浏览器：显示网页、发起点击事件，但跳 App 的权力不在它

- iOS操作系统：拦截链接点击，决定是跳转 App 还是继续用浏览器打开

- App（你的应用）：注册 Universal Link 权限，响应跳转

- AASA 文件：一个 JSON 文件，描述 App 拥有的 URL 匹配规则。以便iOS能够拉取到。

- XCode Associated Domains entitlement： 声明App想绑定哪些域名

#### 流程简介：

- **App 注册域名：** 在 Xcode 的 entitlements 中配置 Associated Domains（如：`applinks:example.com`）

- **服务器提供授权文件：** 在 [`https://example.com/.well-known/apple-app-site-association`](https://example.com/.well-known/apple-app-site-association) 部署 JSON 文件，告诉系统：
  - 哪个 App ID 对这个域名有权限
  - 哪些 path 可以触发 Universal Link

- **用户点击链接时：**
  - 系统拦截链接（如果来源可信）
  - 检查是否匹配已注册域名和路径
  - 如果匹配 ✅：**直接打开 App，并传入 URL**
  - 如果不匹配 ❌ 或 App 未安装：打开网页（fallback）

基础知识参考：[苹果官网介绍](https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/UniversalLinks.html#//apple_ref/doc/uid/TP40016308-CH12-SW1)

#### 接口回调

通过universalLink打开app 后。我们可以在App delegate的回调中拿到具体的路径。

```objc
func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    return true
}
```

### 与 URL Scheme 的关键区别


