---
title: "SwiftUI —— 环境变量"
date: "2023-12-02"
category: "iOS 与底层"
tags: ["SwiftUI","Swift"]
description: "@State @State修饰的值，在SwiftUI内部会被自动转换成一对setter和getter， 对这个属性进行赋值操作将会触发View的刷新 ，它的body会被再次调用，底层渲染引擎会找出界面上被改变的部分，根据"
feishu_token: "O3sCdBhIQoCINhxKnx2clHSDnBs"
---

# SwiftUI —— 环境变量

### @State

@State修饰的值，在SwiftUI内部会被自动转换成一对setter和getter，**对这个属性进行赋值操作将会触发View的刷新**，它的body会被再次调用，底层渲染引擎会找出界面上被改变的部分，根据新的属性值计算出新的view，并进行刷新。

```swift
struct BindingTestView: View {
    @State private var count = 0
    var body: some View {
        Button("Tap count: \(count)") {
            count += 1
        }
    }
}
```

  使用@State需要注意以下两个问题：

- 对于@State修饰的属性的访问，只能发生在body或者body所调用的方法中，它的所有相关操作和状态改变都应该是和**当前view**挂钩的。

- @State对于简单的Bool、String类型，可以迅速应对，但是如果是复杂的多属性和方法类型，就不太合适。

### @Bingding

@State修饰的属性值仅只能在属性本身被设置时会触发UI刷新，但是把这个值在不同对象间传递时，其实是值传递，所以底层对象中对属性的修改，无法让其他层级进行响应。

@Binding就是用来解决这个问题，它做的事情是将值语义的属性转换成引用语义。

```swift
struct BindingSubView: View {
    let title: String
    @Binding var count: Int
    var body: some View {
        Text("\(title) count: \(count)")
        Button("\(title) count: \(count)") {
            count += 1
        }
    }
}
struct BindingTestView: View {
    @State private var count = 0
    var body: some View {
        Text("TestView count: \(count)")
        Button("Tap A count: \(count)") {
            count += 1
        }
        BindingSubView(title: "BindingTest", count: self.$count)
    }
}
```

注意：

- 允许@State类型的属性赋值给@Bingding的类型属性。但是需要使用**$**符号

- 上面的@State和@Binding都是使用到了属性包装器的语法 （TODO：后续整理）

- @Binding不会限于简单类型

### ObservableObject

由于@State只能针对简单的类型，所以对于较大的Model，或者要监听model里的成员的变化去更新UI。则最好使用**Combine的ObservableObject**，它是通过手动objectWillChange来通知各个监听页面进行更新。相当于把@State的自动变成了半自动。

**声明为ObservableObject的类，可以通过 @ObservedObject 或 @EnvironmentObject 来订阅**

```swift
class TestModel: ObservableObject {
    // PassthroughSubject 提供了一个send方法，来通知外界有事件要发生了
    let objectWillChange = PassthroughSubject<Void, Never>()
    var count: Int = 0 {
        willSet {
            objectWillChange.send()
        }
    }
}
struct BindingTestView: View {
    @State private var count = 0
    @ObservedObject var model = TestModel()
    var body: some View {
        Text("TestView count: \(count)")
        Button("Tap A count: \(count)") {
            count += 1
        }
        BindingSubView(title: "BindingTest", count: self.$count)
        Text("TestView model.count: \(model.count)")
        BindingSubView(title: "modelTest",
                       count: self.$model.count)
    }
}
```

但是如果是要监听多个属性的变化，相当于要给每一个属性都加一个willSet。这样写法就会非常复杂。所以Combine提供了**@Published**，这样就可以省去objectWillChange，编译器会自动完成这个事情。

```swift
class TestModel: ObservableObject {
    @Published var count: Int = 0
}
```

### @EnvironmentObject

在正常开发中，我们可能会碰到这种情况：视图A、视图B、视图C，他们依次为前一视图的子视图。这个时候，如果视图A和视图B依赖于某一个属性P更新UI，则通常我们的做法是给A、B、C依次设置一个属性，然后按层级依次传递。然后变更的时候，再依次回调回来。

 SwiftUI则提供了一个环境变量environmentObject，它可以省略中间传递的过程，同时也能够像ObservableObject一样，**数据绑定，变化回调**。

它的作用就是：**它会把某个ObservableObject的值注入到当前View层级及其子层级中去。**

```swift
struct BindingTestView: View {
    @EnvironmentObject var model2: TestModel
    var body: some View {
        Text("Environment model.count: \(model2.count)")
        BindingSubView(title: "Environment modelTest",
                       count: self.$model2.count)
    }
}
struct BindingSubView: View {
    let title: String
    @Binding var count: Int
    var body: some View {
        Text("\(title) count: \(count)")
        Button("\(title) count: \(count)") {
            count += 1
        }
        BindingSub2View(title: "C视图")
    }
}
struct BindingSub2View: View {
    let title: String
    @EnvironmentObject var model2: TestModel
    var body: some View {
        Text("\(title) count: \(model2.count)")
        Button("\(title) count: \(model2.count)") {
            model2.count += 1
        }
    }
}
```

注意：

当对应的View生成时，**不需要手动赋值被@EnvironmentObject标记的属性**，它们会自动去查询view的Environment中是否有符合的类型的值。如果有则使用，**没有则抛出运行时错误**。

// TODO

- **简单使用**：
  - @StateObject、@EnvironmentObject
  - 往contentView中设置一个环境变量
```swift
@main
struct SwiftUI__App: App {
    // @StateObject包装器负责在应用程序的整个生命周期中保持对象处于活动状态。
    // 但是使用了环境变量的包装器的类，必须要实现ObservableObject协议。否则会报错
    // 自我理解：这个协议是用来表明这个类在整个app允许中是被监听的状态
    @StateObject var order = Order()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(order)
        }
    }
}
```

  - 环境变量的类型实现ObservableObject，并设置Publish属性
```swift
// ObservableObject应该是表示当前类是属于被监听的状态
class Order: ObservableObject {
    // 在KVO底层中，如果一个属性变更，需要在willSet或didSet中增加响应方法。
    // 使用 @Published 则省略了这个步骤。如果多个属性被监听变更，则只需要在对应属性中添加，减少每个属性中加willSet或didSet。
    @Published var items = [MenuItem]()
    ... ...
 }
```

  - 变量具体使用的视图
```swift
struct IdineItemDetail: View {
    // @EnvironmentObject 允许变量在代码中没有初始化值，因为它已经在环境变量中设置了。
    // 有了 @EnvironmentObject 标识后，swiftUI会自动在环境列表中查找类型为Order的变量，并将其赋值给当前属性，如果没找到，则会崩溃。
    // 使用了环境变量的UI，监视到对象的任何更改，在publish时及时刷新UI。
    @EnvironmentObject var order: Order
    ... ...    
}
```

- **@State**

@State修饰的值，在SwiftUI内部会被自动转换成一对setter和getter，对这个属性进行赋值操作将会触发View的刷新，它的body会被再次调用，底层渲染引擎会找出界面上被改变的部分，根据新的属性值计算出新的view，并进行刷新。

- **@Binding**

@State修饰的属性值仅只能在属性本身被设置时会触发UI刷新，但是把这个值在不同对象间传递时，其实是值传递，所以底层对象中对属性的修改，无法让其他层级进行响应。

@Binding就是用来解决这个问题，它做的事情是将值语义的属性转换成引用语义。

- **@EnvironmentObject**：

在开发过程中，经常会碰到一种情况，就是视图层级非常多，一些属性需要从最上层，一层一层透传进最底层。

通常做法就是给每一次都声明一个属性变量，然后一层一层赋值传递。但是这些中间层，通常不需要使用这个属性。

这种情况，就可以使用@EnvironmentObject缩短传递链条。**它会把某个ObservableObject的值注入到当前View层级及其子层级中去。**

当对应的View生成时，**不需要手动赋值被@EnvironmentObject标记的属性**，它们会自动去查询view的Environment中是否有符合的类型的值。如果有则使用，**没有则抛出运行时错误**。

```swift
struct ContentView: View {
//    @ObservedObject var model = CalculatorModel()
    @EnvironmentObject var model: CalculatorModel
    ...
}

struct CalculatorButtonRow: View {
//    @Binding var brain: CalculatorBrain
    @EnvironmentObject var model: CalculatorModel
    ...
}
```

另外@EnvironmentObject对象，需要额外添加

```dart
ContentView().environmentObject(CalculatorModel())
```

[@ObservedObject、@State 和 @EnvironmentObject 之间有什么区别？](https://www.hackingwithswift.com/quick-start/swiftui/whats-the-difference-between-observedobject-state-and-environmentobject)

[SwiftUI 计算器 —— 数据状态和绑定](https://bhhbdrz3p9.feishu.cn/docx/DeDld3NtQoJ2hfxd97Vc50ejnQg)


