---
title: "组合模式（⭐️）"
date: "2022-08-21"
category: "工程架构"
tags: ["设计模式"]
description: "组合模式是一个表示整体与部分的结构型设计模式。整体是由多个个体组合而成的。显示中的例子。年级是由班级组成，班级由学生组成。学生脱离班级或年级也可独立存在。 所以组合模式通常可以用树形结构表示。一个节点的子节点可以是另一棵"
feishu_token: "doxcnDbAYWiIIBCXtc6mFZoPrSh"
---

# 组合模式（⭐️）

组合模式是一个表示整体与部分的结构型设计模式。整体是由多个个体组合而成的。显示中的例子。年级是由班级组成，班级由学生组成。学生脱离班级或年级也可独立存在。**所以组合模式通常可以用树形结构表示。一个节点的子节点可以是另一棵树，也可以是叶子节点。**

代码中的表示：

- 有一个表示共有操作的协议，通常用**组件Component**这个词表示；

- **叶节点Leaf**，不包含子项目；

- **容器Container或者组合Composite**，包含叶子节点或其他子容器或组合，通常用数组表示

#### 举个简单的🌰：

```swift
debugPrint("----------简单组合模式------------")

protocol Graphic {
    func print()
}

/// 组合节点
struct CompositeG: Graphic {
    private var childGs = [Graphic]()
    
    mutating func add(graphic: Graphic) {
        childGs.append(graphic)
    }
    
    mutating func add(compositeG: CompositeG) {
        childGs.append(compositeG)
    }
    
    func print() {
        childGs.forEach { g in
            g.print()
        }
    }
}

/// 叶子节点
struct LeafG: Graphic {
    func print() {
        debugPrint("LeafG")
    }
}

struct Demo {
    func test() {
        let g0 = LeafG()
        let g1 = LeafG()
        let g2 = LeafG()
        let g3 = LeafG()
        
        var c0 = CompositeG()
        c0.add(graphic: g0)
        c0.add(graphic: g1)
        
        var c1 = CompositeG()
        c1.add(graphic: g2)
        
        var c2 = CompositeG()
        c2.add(graphic: g3)
        c2.add(compositeG: c0)
        c2.add(compositeG: c1)
        
        c2.print()
    }
}

Demo().test() // 无论加多少遍，最终都是只会把叶子节点打印一遍
```

#### 举个复杂的🌰：

```swift
/*
 iOS中，视图本身就非常符合组合模式的概念。所以如果涉及到对视图的一些操作。可以考试使用组合模式来设计。
 案例：假设给应用换肤：
 * ViewController 需要换背景色
 * UIView需要换背景色
 * UILabel除了背景色还有文本颜色
 * UIButton除了背景色还有title颜色
 */

debugPrint("----------主题------------")
/// 先定制一套主题（与组合无关）
protocol Theme {
    var backgroundColor: UIColor { get }
}

protocol BtnTheme: Theme {
    var textColor: UIColor { get }
    var highlightedColor: UIColor { get }
}

protocol LabelTheme: Theme {
    var textColor: UIColor { get }
}

debugPrint("----------组合模式------------")
// 定义一个协议：组合协议，公有接口
protocol Component {
    // 应用主题
    func accept<T: Theme>(theme: T)
}

// UIView 实现协议
extension UIView: Component {}
// UIView 的默认实现
extension Component where Self: UIView {
    func accept<T: Theme>(theme: T) {
        backgroundColor = theme.backgroundColor
    }
}

// UIViewController 实现协议
extension UIViewController: Component {}
// UIViewController 的默认实现
extension Component where Self: UIViewController {
    func accept<T: Theme>(theme: T) {
        view.accept(theme: theme)
        view.subviews.forEach({ $0.accept(theme: theme) })
    }
}

// UILabel 的默认实现
extension Component where Self: UILabel {
    func accept<T: LabelTheme>(theme: T) {
        backgroundColor = theme.backgroundColor
        textColor = theme.textColor
    }
}

// // UILabel 的默认实现 的默认实现
extension Component where Self: UIButton {
    func accept<T: BtnTheme>(theme: T){
        backgroundColor = theme.backgroundColor
        setTitleColor(theme.textColor, for: .normal)
        setTitleColor(theme.highlightedColor, for: .highlighted)
    }
}

debugPrint("----------使用------------")
/// 实现默认的按钮主题
struct DefaultBtnTheme: BtnTheme {
    var backgroundColor: UIColor = .orange
    var textColor: UIColor = .red
    var highlightedColor: UIColor = .white
    
    var description: String { return "Default Btn Theme" }
}

/// 实现夜间的按钮主题
struct NightBtnTheme: BtnTheme {
    var backgroundColor: UIColor = .black
    var textColor: UIColor = .white
    var highlightedColor: UIColor = .red
    
    var description: String { return "Night Btn Theme" }
}

/// 实现默认的label主题
struct DefaultLabelTheme: LabelTheme {
    var backgroundColor: UIColor = .black
    var textColor: UIColor = .red
    
    var description: String { return "Default Label Theme" }
}

/// 实现默认的label主题
struct NightLabelTheme: LabelTheme {
    var backgroundColor: UIColor = .black
    var textColor: UIColor = .white
    
    var description: String { return "Night Label Theme" }
}

class TestController: UIViewController {
    class ContentView: UIView {
        var titleLabel = UILabel()
        var btn = UIButton()
        
        init() {
            super.init(frame: CGRect(x: 0, y: 0, width: 200, height: 200))
            setUp()
        }
        
        required init?(coder: NSCoder) {
            fatalError("init(coder:) has not been implemented")
        }
        
        func setUp() {
            addSubview(titleLabel)
            addSubview(btn)
            
            titleLabel.frame = CGRect(x: 0, y: 0, width: 200, height: 100)
            btn.frame = CGRect(x: 0, y: 100, width: 200, height: 100)
        }
    }
    
    override func loadView() {
        view = ContentView()
    }
}

struct SwiftTheme {
    func apply<T: Theme>(theme: T, for component: Component) {
        component.accept(theme: theme)
    }
    
    func switchTheme(_ isNight: Bool) {
        if isNight {
            apply(theme: NightLabelTheme(), for: TestController())
            apply(theme: NightBtnTheme(), for: TestController())
        } else {
            apply(theme: DefaultLabelTheme(), for: TestController())
            apply(theme: DefaultBtnTheme(), for: TestController())
        }
    }
}
```

### 总结：

![图片](/images/feishu/feishu-note-b47964/boxcnbaFzLAT5T2IbY0ohyZvabb.png)

- 在子类和父类有共性，且可以形成树形结构的模型中可以考虑使用组合模式；

- 组合模式的技巧在于：组合与单个实例拥有相同的协议处理接口，组合的目的是将对象（单个或小组合）组成树接口以表示部分——整体层次结构，**实现让客户统一对待单个对象和整体对象**。

- 具体实现：Leaf对象和Composite对象定义统一的Component接口。Composite对象则通过向下递归将实现转发给它的子组件。这样使得客户端能够通过Component接口统一处理Leaf对象和Composite对象。

[Swift中的设计模式——组合模式](https://juejin.cn/post/7108199741984342024)

[iOS 组合模式](https://juejin.cn/post/7001873580715671583)


