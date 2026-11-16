---
title: "路由参数 KVC 注入与控制器私有属性同名导致的崩溃"
date: '2024-08-18'
category: "性能优化与排查"
description: "记录路由通过 setValue:forKey: 注入 url 字符串参数时，意外命中控制器内部 private URL 属性引发的 EXC_BAD_ACCESS 崩溃。"
tags: ["Crash排查", "KVC", "路由"]
---

### 现象：
需要跳转的路由：

[myapp://internal?type=5&ani=1&url=webview?0={"url":"https://mock.example.com/static/wap/activity.html"}](myapp://internal?type=5&ani=1&url=webview?0={"url":"https://mock.example.com/static/wap/activity.html"})

解码之后：

[myapp://internal?type=5&ani=1&url=webview?0={"url":"https://mock.example.com/static/wap/activity.html"}](myapp://internal?type=5&ani=1&url=webview?0={"url":"https://mock.example.com/static/wap/activity.html"})

点击调整崩溃在：

文件是在AppRouted对UIViewController的路由扩展中：

```swift
extension UIViewController: AppRouted, SelfAware {
    ...
    open func setRouteParams() {
        if let ps = self.route?.params {
            for  p in ps {
                self.setValue(p.value, forKey: p.key)
            }
        }
    }
    ...
}
```
### 问题分析与解决：
已有防KVC防crash机制：

* setValue: forKey: 有对未定义的key做处理：重写setNilValueForKey和forUndefinedKey函数。

而崩溃的时候，发现key=“url”，报错：Thread 1: EXC_BAD_ACCESS (code=1, address=0x0)，

此时，还未走到防crash的两个函数中。

通过反复实验发现，BaseWebViewController内有一个名为url的URL类型的属性，但是其是private，

```swift
class BaseWebViewController: BaseViewController {
    private let url: URL
}
```
所以，怀疑是setValue forKey访问到了这个属性，其次因为传入的类型（路由是String类型）不一样，导致的崩溃。

**解决方案**：

将BaseWebViewController里的**url: URL**，重命名为**requestUrl: URL**。

重新允许，不在崩溃，路由里setValue forKey后走了forUndefinedKey兜底逻辑。

### 总结
**路由里的参数，最好不要和目标实例的属性同名，或者同名的情况下，一定要保证类型的一致性，否则通过会通过****setValue forKey访问到。**

疑点：

* 按理说：private权限的属性，setValue forKey是无法访问的，但是不知道为什么现在能访问到了。
* 另外，旧版本不会有这个问题，只有8.5版本会有这个崩溃，不知道是什么原因导致的。
