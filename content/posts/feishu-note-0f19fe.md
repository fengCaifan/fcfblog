---
title: "享元模式"
date: "2022-08-28"
category: "工程架构"
tags: ["内存管理","渲染与UI","性能与稳定性","设计模式"]
description: "享元模式，可以理解为共享某一个“元”。 也就是共享某一个对象。它主要的作用就是减少创建对象的数量，以减少内存使用和提高性能 。 举个🌰 我们iOS开发中，最直接体现享元模式的地方就是对UITableViewCell的使"
feishu_token: "doxcnDhz8Au2RJhyONFZHILjnzh"
---

# 享元模式

享元模式，可以理解为共享某一个“元”。**也就是共享某一个对象。它主要的作用就是减少创建对象的数量，以减少内存使用和提高性能**。

举个🌰

我们iOS开发中，最直接体现享元模式的地方就是对UITableViewCell的使用，减少cell的创建。

**享元模式也是池技术，重用对象必定会有一个缓存池。**

所以主要的步骤分为：

- 尝试复用现有的同类对象

- 如果找到匹配的对象，直接使用匹配的对象

- 如果没有找到匹配的对象，则创建新对象

```swift
/// view重用池
class ViewReusePool {
    // 使用中的池子
    private var usingViewsSet = Set<UIView>()
    // 缓存池子
    private var poolViewSet = Set<UIView>()
    
    // 从缓存池中取一个View
    func dequeueReusableView() -> UIView {
        if let view = poolViewSet.popFirst() {
            usingViewsSet.insert(view)
            return view
        } else {
            let newView = UIView(frame: .zero)
            usingViewsSet.insert(newView)
            return newView
        }
    }
    
    // 重置池子
    func resetPool() {
        while let view = usingViewsSet.popFirst() {
            poolViewSet.insert(view)
        }
    }
}
```

### 总结

- 减少同类对象的创建，降低系统内存，使用享元模式是必须的。


