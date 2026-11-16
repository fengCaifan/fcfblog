---
title: "Core Animation 笔记：CALayer、图层树与隐式动画"
date: '2025-02-09'
category: "UIKit 与系统框架"
description: "对比 UIView 与 CALayer 职责，梳理模型树、呈现树与渲染树以及 CATransaction 事务机制。"
tags: ["CoreAnimation", "CALayer"]
---

UIView 动画封装隐式动画与布局；CABasicAnimation 等显式动画直接作用于 layer 属性与 timing。

---

## 3. UIKit 动画

### 3.1 UIView Animation

**基础动画**：

```swift
UIView.animate(withDuration: 0.3) {
    view.alpha = 0.5
    view.frame.origin.x += 100
}
```

**Spring 动画**：

```swift
UIView.animate(withDuration: 0.3, delay: 0, usingSpringWithDamping: 0.7, initialSpringVelocity: 0.5, options: .curveEaseInOut) {
    view.center = CGPoint(x: 200, y: 200)
}
```

**Options**：

```swift
UIView.animate(withDuration: 0.3, delay: 0, options: [.curveEaseInOut, .allowUserInteraction]) {
    // .allowUserInteraction：动画期间允许交互
    // .curveEaseIn：缓入
    // .curveEaseOut：缓出
    // .repeat：重复
    // .autoreverse：反向播放
}
```

### 3.2 CABasicAnimation

**CABasicAnimation**：

```swift
let animation = CABasicAnimation(keyPath: "position.x")
animation.toValue = 100
animation.duration = 0.3
animation.fillMode = .forwards
animation.isRemovedOnCompletion = false

view.layer.add(animation, forKey: "slide")
```

**CAKeyframeAnimation**：

```swift
let animation = CAKeyframeAnimation(keyPath: "position")
animation.values = [
    CGPoint(x: 0, y: 0),
    CGPoint(x: 100, y: 0),
    CGPoint(x: 100, y: 100)
]
animation.keyTimes = [0, 0.5, 1.0]
animation.duration = 1.0

view.layer.add(animation, forKey: "path")
```

---

## 8. 参考资料

### 优质文章
- [iOS 事件传递与响应机制](https://developer.apple.com/documentation/uikit/uievent)
- [Core Animation Programming Guide](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/CoreAnimation_guide/)
- [SwiftUI Tutorials](https://developer.apple.com/tutorials/swiftui/)
- [Human Interface Guidelines - iOS](https://developer.apple.com/design/human-interface-guidelines/ios)

### 官方文档
- [UIKit - Event Handling](https://developer.apple.com/documentation/uikit/uievent)
- [Core Animation](https://developer.apple.com/quartzcore/)
- [SwiftUI](https://developer.apple.com/documentation/swiftui)

---

**最后更新**：2026-04-07
**状态**： 已完成
