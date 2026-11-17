---
title: "Combine1——异步编程基础"
date: "2023-11-20"
category: "iOS 与底层"
tags: ["SwiftUI","Combine","Swift","性能与稳定性"]
description: "在以往的开发过程中，为了避免用户界面卡住，对本身耗时的操作进行异步操作是不可避免的。比如： 请求某个网络接口，并获取返回的JSON数据 等待用户点击某个按钮 网络图片下载并缓存 UI动画结束后触发刷新等 通常异步会以下面"
feishu_token: "MwIIdiU2ioF09dxa6RlceLbnn8k"
---

# Combine1——异步编程基础

在以往的开发过程中，为了避免用户界面卡住，对本身耗时的操作进行异步操作是不可避免的。比如：

请求某个网络接口，并获取返回的JSON数据

等待用户点击某个按钮

网络图片下载并缓存

UI动画结束后触发刷新等

通常异步会以下面的形式出现：

- 闭包回调

- Delegate

- Notification：

#### 响应式异步编程模型

- 异步编程的本质是响应未来发生的事件流

- SwiftUI作为声明式UI，用户界面本质上只是一个状态函数，即: View = f(State)。
  - 所以UI是在“被动地”响应状态变化。所以状态变化也可以作为事件来看待。“状态变化”可以看作是被发布出来的异步操作的事件，订阅了事件的View根据更新后的状态进行绘制。 —— SwiftUI的核心逻辑

## Combine

Combine意思是组合，它是指SwiftUI中对异步事件的操作进行组合。所以Combine对异步编程提供了统一的实现，将“**一个事件及其对应数据被发布出来，中间也许需要进行变形操作，到最后被订阅者消化和使用**”。进行了封装，这些步骤正好对应下面3种角色：

3种重要角色：

- **Publisher**：负责发布事件

- **Subscriber**：负责订阅事件

- **Operator**：负责转换事件和数据

这些角色，底层都是通过一系列协议来实现的。

### **Publisher**

Publisher协议：

```swift
Public protocol Publisher {
    associatedtype Output
    associatedtype Failure: Error
    func receive<S>(subscriber: S) where 
        S: Subscriber,
        Self.Failure == S.Failure,
        Self.Output == S.Input
}
```

从上面代码知道，Publisher可以**发布**三种事件：

- 类型为**Output**的新值：这代码事件流中出现了新值。

- 类型为**Failure**的错误：说明事件流发生了错误，事件流到此终止。

- 完成事件**Finished**：说明事件流中所有元素已经发布结束，事件流到此终止。

对于Output的新值，Publisher会**直接将新值发布出来**，后两种事件则**需要Subscriber.Completion**来描述。

Completion是一个Enum，它只有两个类型：

```swift
enum Subscriber.Completion {
    case failure(Failure)
    case finished
}
```

##### 有限事件流和无限事件流

因为上面Publisher事件有说到它可以发布三种事件，但是每个都并不是一定会发布的：比如可以发送一个或多个Output，也可能一个都不发出；Publisher有可能永远不会停止，也可能通过Failure或Finshed终止。所以

- 最终会终结的事件流称为**有限事件流**
  - 比如网络请求，一次请求无论成功失败，最终肯定都是会返回的

- 永远不会发出Failure或Finshed事件的称为**无限事件流**
  - 比如：按钮点击，只要UI还存活，按钮就可能一直被点击。所以iOS中，大部分UI事件，只要相应的控件和UI还存活，它就是真正的无限事件流。

### Operator

有很多事件，它所带的数据或者根本不带数据，与我们最终要更新的结果相差甚远，所以就需要Operator进行转换。

比如，按钮点击事件，每次按钮点击，只是发送Output事件，但是它不带任何数据。如果我们想记录下按钮点击次数，那就需要对output进行统计。

- **Scan**：

在Combine中，使用scan来进行累加的工作。可以给定一个初始值，然后每次执行都会在闭包中给出，并更新它。最终会得到一个包含累加值的**新的Publisher**

```swift
let buttonClicked: AnyPublisher<Void, Never>
buttonClicked
    .scan(0) { value _ in value + 1 }
```

- **Map**：

同样的最终显示的是一个String类型。所以可以同Map对scan后的Publisher再进行变更，最后map返回的也是一个**新的Publisher**

```swift
let buttonClicked: AnyPublisher<Void, Never>
buttonClicked
    .scan(0) { value _ in value + 1 }
    .map{ String($0) }
```

上面这种**对数据进行处理，然后返回一个新的Publisher的操作函数，它们担任的就是Operator的角色。**Combine种类似的操作数据和事件的函数还有很多。但是每个Operator都是一样的行为模式：

**使用上游的Publisher所发布的数据作为输入，以此产生新的数据，然后自身成为新的Publisher，并将这些新数据作为输出，发布给下游。**

通过这样一系列的Operator变换，得到我们想要的可以直接驱动UI状态的事件和数据。最终终端的消费者可以使用这些准备好的数据，而终端消费者的角色就是Subscriber担任

### Subscriber

[Combine3—— 响应式编程边界](https://bhhbdrz3p9.feishu.cn/docx/QzwcdE24Qoe7SkxQhTRcpobJnBf) 内有sink和assign的详解

Subscriber协议

```swift
public protocol Subscriber {
    associatedtype Input
    associatedtype Failure: Error
    
    func receive(subscription: Subscription)
    func receive(_ input: Self.Input) -> Subscribers.Demand
    func receive(completion: Subscribers.Completion<Self.Failure>)
}
```

Subscriber协议想要订阅某个Publisher，它的Input和Failure必须与Publisher的Output和Failure类型一致。

Combine也实现了一些比较常用的Subscriber，比如：

- **Sink**

Sink会终结事件，然后将结果转到闭包中使用。所以此时，就需要在闭包中调用SwiftUI进行使用

```swift
let buttonClicked: AnyPublisher<Void, Never>
buttonClicked
    .scan(0) { value, _ in value + 1 }
    .map { String($0) }
    .sink { print("按钮被点击了\($0)次") }
```

- **Assign**

与sink不同的是，assign接收一个**class对象**以及对象类型上的某个键路径，所以当Ouput事件到来时，可以直接设置到对应的属性上去。这样事件值就直接绑定到具体的属性上了。所以那些实现了ObservableObject接口的class，与assign结合是最常用的。

```swift
class Foo {
    var bar: String = ""
}

let foo = Foo()
let buttonClicked: AnyPublisher<Void, Never>
buttonClicked
    .scan(0) { value, _ in vvalue + 1 }
    .map { String($0) }
    .assign(to: \.bar, on: foo)
```

### 其他角色

Publisher、Operator、Subscriber是事件发布、变换、订阅的完整链条，是Combine的基础框架

此外，还有两个比较重要的概念，Subject和Scheduler。

#### Subject

Subject本身也是一个Publisher

```swift
publish protocol Subject：Anybject, Publisher {
    func send(_ value: Self.Output)
    func send(completion: Subscribers.Completion<Self,Failure>)
}
```

~~它可以将异步API里的事件和信号转换到响应式的世界中去。~~

Combine内置的两个常用Subject类型

- **PassthroughSubject**

```swift
let publisher1 = PassthroughSuject<Int, Never>()
publisher1.sink { complete in
                print(complete)
            } receiveValue: { value in
                print(value)
            }
publisher1.send(1)
publisher1.send(2)
publisher1.send(completion: .finished)
```

PassthroughSubject不会保留值，订阅开始后，才会监听并响应事件。所以上面的**sink订阅一定要在send之前**。如果将send(1)放到sink之前，则sink只能响应到send(2)的事件。

- **CurrentValueSubject**

```swift
let publisher2 = CurrentValueSubject<Int, Never>(0)
publisher1.sink { complete in
                print(complete)
            } receiveValue: { value in
                print(value)
            }
publisher2.value = 1
publisher2.value = 2
publisher2.send(completion: .finished)
```

CurrentValueSubject则正好补齐了保留值的做法，sink订阅设置好后，就立即响应了为0的初始值。

- 练习

```swift
let publisher = PassthroughSubject<Int, Never>()
publisher.send(1)
publisher.send(2)
publisher.send(completion: .finished)
print("开始订阅1")
publisher.sink { complete in
    print(complete)
} receiveValue: { value in
    print("sink:\(value)")
}
publisher.send(3)
publisher.send(completion: .finished)

/*
 答案：
 开始订阅1
 finished
 */

let publisher2 = CurrentValueSubject<Int, Never>(0)

print("开始订阅2")
publisher2.value = 1
publisher2.value = 2
publisher2.send(completion: .finished)
publisher2.sink { complete in
    print(complete)
} receiveValue: { value in
    print("sink2:\(value)")
}

/*
 答案：
 开始订阅2
 finished
 */

let publisher2_1 = CurrentValueSubject<Int, Never>(0)
print("开始订阅2_1")
publisher2_1.value = 1
publisher2_1.value = 2
publisher2_1.sink { complete in
    print(complete)
} receiveValue: { value in
    print("sink2_1:\(value)")
}
publisher2_1.send(3)
publisher2_1.send(completion: .finished)
/*
 答案
 开始订阅2_1
 sink2_1:2 // sink之前，1会把0覆盖，2会把1覆盖。
 sink2_1:3
 finished
 */

let publisher3 = CurrentValueSubject<Int, Never>(0)
print("开始订阅3")
publisher3.sink { complete in
    print(complete)
} receiveValue: { value in
    print("sink3:\(value)")
}
publisher3.value = 1
publisher3.value = 2
publisher3.send(3)
publisher3.send(completion: .finished)

/*
 答案：
 开始订阅3
 sink3:0
 sink3:1
 sink3:2
 sink3:3
 finished
 */
```

#### Scheduler

Publisher觉得了怎么发布事件流，那Schedule就是要解决两个问题：**什么地方（where）、什么时候（when）**发布事件和执行代码

- **where**

比如，刷新UI的操作必须在**主线程**，Combine提供了receive(on:options:)来让下游在指定的线程中接收事件

```swift
URLSession.shared
    .dataTaskPublisher(for: URL(string: "xxx.com")!)
    .compachMap{ String(data: $0.data, encoding: .utf8) }
    .receive(on: RunLoop.main)
    .sink { _ in
    
        } receiveValue: { value in
            textView.text = $0
        }
```

- **when**

通常事件都是希望越快传递的，但是也存在有些延时的情况。比较常见的两种操作就是delay和debounce


