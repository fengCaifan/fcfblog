---
title: "装饰器模式（⭐️）"
date: "2022-08-27"
category: "工程架构"
tags: ["设计模式"]
description: "装饰器模式，是一种动态地在原有 类的行为基础上添加新的行为 的设计模式。 通常我们写代码，想要给某个类添加某个功能，可能最直接的做法是： 1、在原类上增加函数，然后与就的行为函数进行调用； 2、写个子类继承一下，在子类中"
feishu_token: "doxcnadSWFkZI3fmkJV5iMblipd"
---

# 装饰器模式（⭐️）

装饰器模式，是一种动态地在原有**类的行为基础上添加新的行为**的设计模式。

通常我们写代码，想要给某个类添加某个功能，可能最直接的做法是：

- 1、在原类上增加函数，然后与就的行为函数进行调用；

- 2、写个子类继承一下，在子类中重写或调用旧的行为函数。

但是这些方式都不是最理想的，方案1会破坏原有类的代码，违反开闭原则；方案2则相当于直接加了一个类型，但是行为可能不止一个，后续可能会出现很多类似的情况。难道要一直添加子类么？肯定也是不完美的。

举个🌰：

假设原本有个Shape协议是用于定制形状的，里面有个draw方法进行绘制；

然后有两个实现了Shape的具体类型：Rectangle和Circle。它们现在都是可以独自绘制各自的形状。

```swift
protocol Shape {
    func draw()
}
 
class Rectangle: Shape {
    func draw() {
        debugPrint("绘制矩形")
    }
}
 
class Circle: Shape {
    func draw() {
        debugPrint("绘制圆形")
    }
}
 
Rectangle().draw()
Circle().draw()
```

现在来了个新的需求，要在原有图形绘制上添加绘制边框。那我们应该怎么做呢？

```swift
/// 装饰器
protocol ShapeBorderDecorator: Shape {
    var shape: Shape { get }
    
    func setBorder(_ color: UIColor)
}
 
/// 红色边框装饰器
class RedShapeBorderDecorator: ShapeBorderDecorator {
    var shape: Shape
    
    init(_ shape: Shape) {
        self.shape = shape
    }
    
    func setBorder(_ color: UIColor) {
        debugPrint("是红色的边框")
    }
    
    func draw() {
        shape.draw()
        setBorder(.red)
    }
}
 
/// 绿色边框装饰器
class GreenShapeBorderDecorator: ShapeBorderDecorator {
    var shape: Shape
    
    init(_ shape: Shape) {
        self.shape = shape
        shape.draw()
        setBorder(.red)
    }
    
    func draw() {
        shape.draw()
        setBorder(.green)
    }
    
    func setBorder(_ color: UIColor) {
        debugPrint("是绿色的边框")
    }
}
 
// 绘制一个单纯的圆
let circle = Circle()
circle.draw()
 
/// 绘制一个红色把边框的圆
let redCircle = RedShapeBorderDecorator(circle)
redCircle.draw()
 
// 绘制一个绿色边框的矩形
GreenShapeBorderDecorator(Rectangle()).draw()
```

### 总结

- 新的装饰器，需要持有旧的对象，这样才能调用旧的方法；

- 尽可能使用协议进行扩展。这样不会对旧的类型有任何的破坏。

- 从代码层面上看，装饰器模式和适配器模式非常像，框架也非常类型。但是其实侧重点是不一样的。
  - **适配器，就将旧的属性或方法进行包装，以适配新的接口。所以在新的协议或结构中，主要是对旧的东西进行修改；**
  - **装饰器，则是在已有功能基础上添加新的功能。在新的协议或结构中，主要是添加新的功能，进行扩展。**


