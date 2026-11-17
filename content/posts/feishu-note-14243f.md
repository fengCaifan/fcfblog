---
title: "桥接模式（⭐️）"
date: "2022-08-20"
category: "工程架构"
tags: ["设计模式"]
description: "桥接模式是将抽象和实现分离，使他们都可以独立变化 。 🌰栗子：点奶茶 奶茶有：大杯、小杯； 口味有：芒果、草莓； 最垃圾代码： 这种写法是最初级的，也是最垃圾的。如果新增一个类型，岂不是要累死。更有甚者，枚举都不用了。"
feishu_token: "doxcnatlwzDJjNCCYy4v9PfL4Bc"
---

# 桥接模式（⭐️）

**桥接模式是将抽象和实现分离，使他们都可以独立变化**。

🌰栗子：点奶茶

奶茶有：大杯、小杯；

口味有：芒果、草莓；

最垃圾代码：

```swift
// 杯子
enum Cap {
    case big // 大杯
    case small // 小杯
}

// 口味
enum Taste {
    case mango // 芒果
    case strawberry // 草莓
}

class Milktea {
    // 点奶茶
    func orderMilktea(_ cap: Cap, _ taste: Taste) {
        switch cap {
        case .big:
            switch taste {
            case .mango:
                debugPrint("点了一杯大杯芒果")
            case .strawberry:
                debugPrint("点了一杯大杯草莓")
            }
        case .small:
            switch taste {
            case .mango:
                debugPrint("点了一杯小杯芒果")
            case .strawberry:
                debugPrint("点了一杯小杯草莓")
            }
        }
    }
}

let customer = Milktea()
customer.orderMilktea(.big, .mango) // "点了一杯大杯芒果"
customer.orderMilktea(.small, .strawberry) // "点了一杯小杯草莓"
```

这种写法是最初级的，也是最垃圾的。如果新增一个类型，岂不是要累死。更有甚者，枚举都不用了。直接用if-else！WTF！

进一步优化一下

```swift
debugPrint("--------------点奶茶，初步优化---------------")

/// 抽象一个奶茶味
protocol MilkTea {
    func orderMilktea(_ cap: Cap)
}

/// 实现一个芒果口味奶茶
struct MangoMilkTea {
    func orderMilktea(_ cap: Cap) {
        switch cap {
        case .big:
            debugPrint("点了一杯大杯芒果")
        case .small:
            debugPrint("点了一杯小杯芒果")
        }
    }
}

/// 实现一个草莓口味奶茶
struct StrawberryMilkTea {
    func orderMilktea(_ cap: Cap) {
        switch cap {
        case .big:
            debugPrint("点了一杯大杯草莓")
        case .small:
            debugPrint("点了一杯小杯草莓")
        }
    }
}

MangoMilkTea().orderMilktea(.big) // "点了一杯大杯芒果"
StrawberryMilkTea().orderMilktea(.small) // "点了一杯小杯草莓"

```

这里虽然优化了一下。但是每个具体的口味还是有很多switch-case代码。如果这个时候再加一个中杯、最大杯。岂不是又腐化了？

使用**桥接模式**优化一下：

```swift
/// 对具体容器进行抽象
protocol CupInterfase {
    func orderaCap() -> String
}

/// 实现一个大杯
struct BigCap: CupInterfase {
    func orderaCap() -> String {
        return "点了一杯大杯"
    }
}

/// 实现一个小杯
struct SmallCap: CupInterfase {
    func orderaCap() -> String {
        return "点了一杯小杯"
    }
}

///------------------------------------
/// 抽象一个奶茶味
protocol MilkTeaProtocol {
    var cap: CupInterfase { get set }
    func orderMilktea()
}

/// 实现一个芒果味
struct MangoMilkTea1: MilkTeaProtocol {
    internal var cap: CupInterfase
    
    init(cap: CupInterfase) {
        self.cap = cap
    }
    
    func orderMilktea() {
        debugPrint(cap.orderaCap() + "芒果")
    }
}

/// 实现一个草莓味
struct StrawberryMilkTea1: MilkTeaProtocol {
    internal var cap: CupInterfase
    
    init(cap: CupInterfase) {
        self.cap = cap
    }
    
    func orderMilktea() {
        debugPrint(cap.orderaCap() + "草莓")
    }
}

MangoMilkTea1(cap: BigCap()).orderMilktea() // "点了一杯大杯芒果"
StrawberryMilkTea1(cap: SmallCap()).orderMilktea() // "点了一杯小杯草莓"
```

后续，如果要再一个中杯、或者再加一个葡萄味，就变得非常方便：

```swift

/// 实现一个中杯
struct MidCap: CupInterfase {
    func orderaCap() -> String {
        return "点了一杯中杯"
    }
}

/// 实现一个葡萄味
struct GrapeMilktea: MilkTeaProtocol {
    var cap: CupInterfase
    init(cap: CupInterfase) {
        self.cap = cap
    }
    
    func orderMilktea() {
        debugPrint(cap.orderaCap() + "葡萄")
    }
}

GrapeMilktea(cap: MidCap()).orderMilktea() // "点了一杯中杯葡萄"
```

### 总结

从上述🌰中，可以大概概括一下桥接模式：

1. 有两个协议，其中一个包含另一个的引用。正好对应上述定义的抽象和实现两部分，即分别用一个协议来定义抽象和实现。

1. 根据具体需要来扩展抽象的实例和实现的实例。使两个分支的实例互不想干；

1. 优点：对扩展性非常好。缺点：代码难度增加；

[swift设计模式——桥接模式](https://www.jianshu.com/p/5708c838b7a9)

[桥接模式在项目中的应用](https://juejin.cn/post/6970183473935958029)


