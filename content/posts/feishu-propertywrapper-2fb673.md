---
title: "属性包装器 @propertyWrapper"
date: "2023-10-09"
category: "iOS 与底层"
tags: ["SwiftUI","Swift","网络与安全","Flutter"]
description: "swift5中新增了一个属性包装器。它可以对一类属性进行统一的包装，减少重复代码的使用。 属性包装器，顾名思义就是对属性进行包装。 在什么情况下，会需要属性包装器呢？只有在对属性进行操作的时候，可能就会存在。比如，传入一"
feishu_token: "doxcnRhUqSE9rbQOtYmkTh1KpVh"
---

# 属性包装器 @propertyWrapper

swift5中新增了一个属性包装器。它可以对一类属性进行统一的包装，减少重复代码的使用。

属性包装器，顾名思义就是对属性进行包装。

在什么情况下，会需要属性包装器呢？只有在对属性进行操作的时候，可能就会存在。比如，传入一个类型的属性，得到另一个类型的属性。

这个过程就可以用属性包装器进行封装。

我们以SwiftUI中的@State（[SwiftUI 学习杂记](https://bhhbdrz3p9.feishu.cn/docx/MAuadIHrTofXSsxc9L4cQSpOnqp) ）为例：

首先，需要用@propertyWrapper修饰的Struct类型，以下是关键部分代码

```objc
@propertyWrapper
public struct State<Value>: DynamicViewProperty, BindingConvertible {
    public init(initialValue value: Value)
    public var value: Value { get nonmutating set }
    public var wrappedValue: Value { get nonmutating set }
    public var projectedValue: Binding<Value> { get }
}
```

更纯粹一点的例子：

```objc
@propertyWrapper struct Converter {
    let from: String
    let to: String
    let rate: Double
    var value: Double
    
    var wrappedValue: String {
        get { "\(from) \(value)" }
        set { value = Double(newValue) ?? -1 }
    }
    
    var projectedValue: String {
        return "\(to) \(value * rate)"
    }
    
    init(initialValue: String, from: String, to: String, rate: Double) {
        self.rate = rate
        self.value = 0
        self.from = from
        self.to = to
        self.wrapperdValue = initialValue
    }
}

// 
@Converter(initialValue: "100", from: "USD", to: "CNY", rate: 6.88) var usd_cny 
var usd_cny

@Converter(initialValue: "100", from: "CNY", to: "EUR", rate: 0.13) var cny_eur 
```

结论：所有依赖getter和setter，并需要多次重复同样代码的地方，都可以用属性包装的方式得到更好的解决方式。

### 举个🌰：

假设要对某一个类的所有属性的设置打印日志。则我们通常用swift是这样写的：

```swift
// ------------------监听打印日志等场景----------------- //
/// 日志监听打印新值。这种情况下，有多少个属性，就需要写多少个set、get
struct LogTest {
    private var _x = 0
    private var _y = 0
    private var _z = 0
    
    var x: Int {
        get { _x }
        set {
            _x = newValue
            print("x new value is \(newValue)")
        }
    }
    
    var y: Int {
        get { _y }
        set {
            _y = newValue
            print("y new value is \(newValue)")
        }
    }
    
    var z: Int {
        get { _z }
        set {
            _z = newValue
            print("z new value is \(newValue)")
        }
    }
}
```

这一看就知道有很多重复的代码。

所以我们考虑用一个范性来对这个类进行包装，使得打印日志的操作集中在一起：

```swift
// 重写
struct LogTest2 {
    private var _x = ConsoleLogged<Int>(wrappedValue: 0)
    private var _y = ConsoleLogged<Int>(wrappedValue: 0)
    private var _z = ConsoleLogged<Int>(wrappedValue: 0)
    
    var x: Int {
        get { _x.wrappedValue }
        set { _x.wrappedValue = newValue }
    }
    
    var y: Int {
        get { _y.wrappedValue }
        set { _y.wrappedValue = newValue }
    }
    
    var z: Int {
        get { _z.wrappedValue }
        set { _z.wrappedValue = newValue }
    }
}

var test = LogTest2()
test.x = 1
test.y = 2
test.z = 3

debugPrint("test2 values: x:\(test.x), y:\(test.y), z:\(test.z)")
```

### 使用**@propertyWrapper**

这种方式其实就和swift的**@propertyWrapper**有点像了。而且**@propertyWrapper更简洁**

```objc
// ---------------使用swift @propertyWrapper重写ConsoleLogged-------------- //
/// 注意⚠️：
/// 1、必须使用@propertyWrapper定义
/// 2、@propertyWrapper 最重要的是一定要有一个var wrappedValue名称的变量
@propertyWrapper
struct ConsoleLogged2<Value> {
    private var value: Value
    init(wrappedValue: Value) {
        self.value = wrappedValue
    }
    
    var wrappedValue: Value {
        get { value }
        set {
            value = newValue
            print("new value is \(newValue)")
        }
    }
}

// 重写
struct LogTest3 {
    @ConsoleLogged2 var x: Int = 0 // 这个初始化和使用init(wrappedValue: 0)效果是一样的
    @ConsoleLogged2(wrappedValue: 0) var y: Int
    @ConsoleLogged2(wrappedValue: 0) var z: Int
}

var testLog = LogTest3()
testLog.x = 1
testLog.y = 2
testLog.z = 3
```

注意⚠️代码中说到的两点：

**1、必须使用@propertyWrapper；**

**2、必须有一个一个var wrappedValue名称的变量；**

来看看最简单的属性包装器：

```objc
// ---------------最简单的属性包装器-------------- //
@propertyWrapper
struct Wrapper<T> {
    var wrappedValue: T
}

struct TestWarpper {
    @Wrapper var x: Int = 0
}

var test2 = TestWarpper()
test2.x = 2
debugPrint(test2.x) // 2
```

### 实战🌰

```objc

// ---------------项目中的实用案例-----------------//
@propertyWrapper
struct UserDefaultValue<T> {
    private let defalutValue: T?
    private let key: String
    // 注意初始化的默认值，不会放到wrappedValue里
    init(defualtValue: T?, key: String) {
        self.defalutValue = defualtValue
        self.key = key
    }
    
    init(key: String) {
        self.init(defualtValue: nil, key: key)
    }
    
    var wrappedValue: T? {
        get {
            return UserDefaults.standard.value(forKey: key) as? T
        }
        
        set {
            UserDefaults.standard.setValue(newValue, forKey: key)
        }
    }
}

struct Test3 {
    @UserDefaultValue(defualtValue: 1, key: "wrapper_testValue")
    var testValue: Int?
}

var test3 = Test3()
test3.testValue = 3

print("test userdefault value: \(test3.testValue ?? 0)")
```

学习from [属性包装器完整指南](https://juejin.cn/post/6844904018121064456)


