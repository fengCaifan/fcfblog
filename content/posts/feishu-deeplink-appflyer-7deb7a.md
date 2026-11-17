---
title: "DeepLink与AppFlyer的回流使用"
date: "2024-07-24"
category: "iOS 与底层"
tags: ["网络与安全"]
description: "DeepLink DeepLink只是一个链接的概念。在web开发中，深度链接是指一个url链接不仅仅打开一个网站，而是直接地打开这个网站的某个具体的页面 。 在移动端，也是完美继承了这个概念：指点击某一个外部链接，不仅"
feishu_token: "Z8kzdTSGCoZ3Gsx4xwwcGD6unye"
---

# DeepLink与AppFlyer的回流使用

## DeepLink

**DeepLink只是一个链接的概念。在web开发中，深度链接是指一个url链接不仅仅打开一个网站，而是直接地打开这个网站的某个具体的页面**。

在移动端，也是完美继承了这个概念：指点击某一个外部链接，不仅仅可以打开app，还可以定位到和h5一样的具有页面。比如，外部的一个H5的商品详情页，点击在app内查看，点击查看后，可以唤起app，并进入到对应的商品详情页。

这样的好处有：

- 在web页面和App页面的切换过程中保留了上下文。比如一个分享出去的商品详情页，点击到app后，也是一样的商品详情页

- app直接地切换也可以保留上下文，实现app之间的参数传递；

- web页更容易被搜索引擎搜到，所以可以通过SEO的访问量提高app的下载；

iOS中可以实现DeepLink的方案，包括**URL Scheme**和**Universal Link**：

#### URL Scheme

Scheme 跟网址差不多，格式类似：scheme://host:port/path 。比如微信weixin://dl/business/?t=123。放到浏览器中，就能打开微信，跳转到相应页面了。

操作步骤：

- 注册一个URL Type。在info.plist里，CFBundleURLTypes对应一个多个字典组成的数组。每个字典定义了当前app支持的一个URL Scheme。其他app也可以通过这个URL Scheme打开自己app。
```plaintext
<dict>
<key>CFBundleTypeRole</key>
<string>Editor</string>
<key>CFBundleURLName</key>
<string>com.szy.seebaby</string>
<key>CFBundleURLSchemes</key>
<array>
    <string>ztjy.parent.applink</string>
</array>
</dict>
```

- 如果app收到一个URL Scheme的跳转，则在app delegate的application:openURL:options:方法中处理。

```objc
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
     sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
     // 解析url
     return true
 }
```

当然，如果是冷启动，也可以直接在application:willFinishLaunchingWithOptions:或application:didFinishLaunchingWithOptions:中获取URL的相关信息，然后决定是否处理：

```swift
if let url = launchOptions?[UIApplication.LaunchOptionsKey.url] as? URL {
   // 解析url
}
```

但是Scheme URL也有一些限制：

- 没有安装app的情况下，无法直接打开。所以通常我们会使用canOpenURL判断一下是否可以跳转

- Scheme 是自己定义的，容易冲突。

- 像第三方平台，比如微信，会屏蔽一些scheme的打开。

#### Universal Link

相对于Scheme，Universal Link本身就是一个Https url。它可以做到：

- 已经安装了的情况下，点击链接后，会直接跳转到app内；

- 没有安装的情况下，则会自动跳转到app store进行下载；

- Universal Links支持从其他app的webview中跳转到目标app。避免被屏蔽的情况。

如何支持Universal Link?

- 添加一个 `apple-app-site-association` 文件到你的网站来描述 URL 和 app 的关联。

- 添加 `com.apple.developer.associated-domains` entitlement 来指定要从哪些域名查询 universal links support。

- 在 `app delegate` 的 `application:continueUserActivity:restorationHandler:` 方法中 handle `userActivity.webpageURL`。

> 注意：当APP在设备上第一次运行时，若已开启Associated Domains功能，那么iOS会自动去获取Domain下的apple-app-site-association文件，iOS会先请求https://domain.com/.well-known/apple-app-site-association 。若此文件请求不到，再去请求https://domain.com/apple-app-site-association 。所以若想要避免服务器接收过多GET请求，可直接把apple-app-site-association放在./well-known/目录下。服务器上apple-app-site-association的更新不会让iOS本地的apple-app-site-association同步更新，即iOS只会在APP第一次启动时请求一次，以后除非APP更新或重新安装否则不会在每次打开时请求apple-app-site-association。

所以Universal Link的安全性更高，它是从服务器上查询到的。因此也不会像Scheme一样产生名字冲突。

#### 注意

- 使用canOpenUrl操作Universal Link，永远返回true。scheme则根据info.plist的配置来返回true或false。

- openUrl 操作Universal Link，如果安装了，则直接打开对应app；如果没有安装，则打开浏览器展示网页。如果操作scheme，没有安装则不会有任何反应。

## Deferred Deep Link

![图片](/images/feishu/feishu-deeplink-appflyer-7deb7a/UopFbqgSvo6wqGxvXBFcyXbtnrh.png)

**Deferred Deep Link  即：延时DeepLink**

**无论是Scheme还是Universal Link，在没有安装app的情况下。iOS能够引导用户去下载app。但是在下载完成启动app后，无法跳转进入到具体页面**。

Deferred Deep Link 就是指可以在安装过程中keep住跳转前的特定页面，在App安装之后在app内进行跳转到目标页的技术。

所谓**延迟，指的就是延迟到用户下载安装完之后，再发挥深度链接到作用**。

客观的有3种方案，可以实现这个效果：

- **剪切板方案**

在点击下载时自动调用剪切板复制当前用户渠道信息，比如：#8283923023#，APP每次启动时调用剪切板内容；然后对内容进行解析后进行逻辑处理。

- **SFSafariViewController**

在iOS9 以上，SFSafariViewController可以和Safari共享沙盒，可以共享cookie，cookie 的sessionid 可以唯一标识。

首次启动App的时候，通过一个隐藏的SFSafariViewController访问server，server通过cookies拿到唯一标示sessionID，从而得知用户之前访问过什么商品，进一步跳转到一个 Universal Links，再进一步打开对应的商品详情页，完成了Deferred DeepLink的流程。

但是它局限于safari，在其他平台无效，比如微信等。

- **“设备指纹”模糊匹配**

通过浏览器打开的 网络，ip,操作系统分辨率，语言等信息和APP拿到的 网络 ip 操作系统 等信息做模糊匹配，某时间段内匹配上则认为是同一个用户。

#### 实现思路：

H5需要上报设备的一些信息到服务器端进行保存，用户下载后，第一次启动也上报设备信息，去服务器端查找是否有匹配的H5页点击行为，如果匹配则进行app内部跳转。

如何提高匹配准确度是关键，所以应该上报什么信息较准确？
a.设备屏幕尺寸

b.设备操作系统版本号

c.ip地址

d.访问时间

e.使用的语言 等等

上述特征都无法完全保证唯一，还需进一步打磨。

[iOS Deep Linkin 和 Deferred Deep Linking](https://juejin.cn/post/6844903503681290248)

[Deferred Deeplink(延展的深度链接)-CSDN博客](https://blog.csdn.net/zzhongcy/article/details/118602343)

## OneLink

OneLink链接可同时具备归因、跳转和深度链接功能，帮助您将自有和付费媒体的用户转化为应用用户，且不受设备、操作系统、流量入口和平台的限制。

OneLink 对DeepLink 和 Deferred Deep Link 进行了深度整合：

- 当用户安装了app时，点击分享页的**打开app按钮**，这时会直接打开app，并跳转到对应的调起页面；

- 当用户未安装app时，点击分享页的**打开app按钮**，**OneLink会迅速识别用户设备类型**，并将用户带到正确的应用商店。接下来**延迟深度链接**发挥作用，当新用户下载应用后，**AppsFlyer会向设备实时传递包括相关的归因信息**，以便App首次打开时自动显示与Campaign信息对应的页。

https://juejin.cn/post/6844903503681290248

#### OneLink如何做到归因？

OneLink可以做到：**用户点击onelink时能够识别设备类型，并将用户重定向到匹配的目的地。**具体会触发的场景包括：

- 会被重定向至AppFlyer服务器

- 如果你选择安装该应用，点击的URL及其参数将保存到该服务器上以备日后使用，以及用于归因和实现深度链接。

- 安装启动后，根据SDK的配置，将立即检测设备类型

在app下载首次启动后，归因数据会从AppFlyer服务器实时发送到刚激活的app。然后，SDK会将该数据保存到应用缓存中。后续的app启动，AppFlyer会从缓存中直接读取归因数据。而不会再向AppFlyer服务器发起请求。is_first_launch就是首次启动缓存的。

每次app启动时，会通过onConversionDataSuccess回调，将归因转化的数据回调回来。所以可以在这个位置实现深度链接跳转到具体页面的。

这里可以看出AppFlyer用的是上面Deferred Deep Link中设备指纹的方案处理的。

其次，AppFlyer与很多公司都有合作，比如Facebook，所以在某些平台的追踪效果表现更好。

[AppsFlyer 研究（三）OneLink平台归因、跳转、深度链接](https://blog.csdn.net/lizhong2008/article/details/117705767)

[AppsFlyer 研究（五）延迟深度链接&客户端获取归因数据](https://blog.csdn.net/lizhong2008/article/details/117706158?spm=1001.2101.3001.6650.11&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-11-117706158-blog-117706065.235%5Ev43%5Epc_blog_bottom_relevance_base5&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-11-117706158-blog-117706065.235%5Ev43%5Epc_blog_bottom_relevance_base5&utm_relevant_index=12)

[产品经理:阳光你来实现一下分享出去的URL链接预览图片、标题和描述。 - 掘金](https://juejin.cn/post/7081462552164565006)

[URL Scheme 、Universal Link、Deep Linking - 掘金](https://juejin.cn/post/7009118606806450206)

## 回流的处理逻辑：

![图片](/images/feishu/feishu-deeplink-appflyer-7deb7a/Ufdjb4OQnoEAjGxWnvBcuxponHb.png)


