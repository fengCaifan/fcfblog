---
title: "Combine3—— 响应式编程边界"
date: "2023-11-20"
category: "iOS 与底层"
tags: ["Combine","网络与安全"]
description: "本节主要解决：“从哪里来，到哪里去”的问题。 前两节中，我们学习了一些内置Publisher的使用，比如Empty、Just、Sequences等。这些都是Combine内置的Publisher，但是在现实开发中，很少有"
feishu_token: "QzwcdE24Qoe7SkxQhTRcpobJnBf"
---

# Combine3—— 响应式编程边界

本节主要解决：“从哪里来，到哪里去”的问题。

前两节中，我们学习了一些内置Publisher的使用，比如Empty、Just、Sequences等。这些都是Combine内置的Publisher，但是在现实开发中，很少有机会去使用这些内置的Publisher，所以是否能够创建我们自定义的Publisher是我们本节要掌握的内容，也就是上面提到的从哪里来的问题，

另外，Subscriber也是一样的，我们目前只接触了sink、assign两个订阅。这也是本节要学习到哪里去的问题。

## 从哪里来？

### Subject

在[Combine1——异步编程基础](https://bhhbdrz3p9.feishu.cn/docx/MwIIdiU2ioF09dxa6RlceLbnn8k) 中，有简单介绍Subject协议，遵守该协议的类型也要遵守Publisher协议，所以它也是Publisher。Combine也内置了两种Subject，分别是PassthroughSubject和CurrentValueSubject。PassthroughSubject是简单地将send输入的内容如实反馈，而CurrentValueSubject则保留一个最后的值，并在订阅时将这个值作为事件发送。

##### 时序

Subject有严格地时序性。

> 注意：这里使用了一个let s =持有了最终的Publisher，如果把它去掉，则不会打印print，代码也立即停止了工作，这是因为使用了let s =相当于被Playground持有，如果没有被持有，返回值将会立即释放。后面代码有类似情况也是一样的道理。

```swift
let subject = PassthroughSubject<Int, Never>()
// 这里需要用一个变量持有，否则，后续的print不会打印
let s = subject
    .print()
    .sink { _ in
    } receiveValue: { _ in
    }

delay(1) {
    subject.send(1)
    delay(1) {
        subject.send(2)
        delay(1) {
            subject.send(completion: .finished)
        }
    }
}
/*
 如果不用let s 持有的话，会无法输出。暂时不知道原因
 receive subscription: (PassthroughSubject)
 request unlimited
 receive value: (1)
 receive value: (2)
 receive finished
 */

let subject_example1 = PassthroughSubject<Int, Never>()
let subject_example2 = PassthroughSubject<Int, Never>()

// 这里会产生一个新的Merge Publisher
subject_example1.merge(with: subject_example2)
    .print()
    .sink { _ in
    } receiveValue: { _ in
    }

subject_example1.send(20)
subject_example2.send(1)
subject_example1.send(40)
subject_example1.send(60)
subject_example2.send(1)
subject_example1.send(80)
subject_example1.send(100)
subject_example1.send(completion: .finished)
subject_example2.send(completion: .finished)

/*
 merge后的Publisher，是按1、2的send时序发的
 receive subscription: (Merge)
 request unlimited
 receive value: (20)
 receive value: (1)
 receive value: (40)
 receive value: (60)
 receive value: (1)
 receive value: (80)
 receive value: (100)
 receive finished
 receive cancel
 */
```

##### Zip

将时序上对控制多个Publisher的结果进行类似and和or的合并。

**它会把两个（或多个）Publisher事件序列中在同一index位置上的值进行合并**。如果两个序列中，只有一个序列有事件，则这个事件最终会被忽略。

**时序语义上接近于“当...且...”，当Publisher1发布值，且Publisher2发布值时，将两个值合并，作为新的事件发布出去。**

在实践中，zip经常被用于合并多个异步网络请求，在它们**全部完成**时把结果合并在一起。

```swift
let sub1 = PassthroughSubject<Int, Never>()
let sub2 = PassthroughSubject<String, Never>()

sub1.zip(sub2)
    .print()
    .sink { _ in
    } receiveValue: { _ in
    }
sub1.send(1)
sub2.send("A")
sub1.send(2)
sub2.send("B")
sub2.send("C")
sub2.send("D")
sub1.send(3)
sub1.send(4)
sub1.send(5) // 被忽略了

/*
 receive subscription: (Zip)
 request unlimited
 receive value: ((1, "A"))
 receive value: ((2, "B"))
 receive value: ((3, "C"))
 receive value: ((4, "D"))
 receive cancel
 */
```

##### combineLatest

combineLatest也是将多个Publisher合并的操作。但是**它与zip相反，相当于"当...或..."，当Publisher1发布值，或者Publisher2发布值时，将两个值合并，作为新事件发布出去**。

具体操作是：**当有任意一个Publisher发生了新事件，combineLatest会把新发生的事件值与另一个Publisher中当前的最新值合并，然后发出去**。

在实践中，在用户注册页，有多个TextField，**只要**其中**一个值变动**时，**就**获取**所有**TextField中的值。

```swift
let sub3 = PassthroughSubject<Int, Never>()
let sub4 = PassthroughSubject<String, Never>()

sub3.combineLatest(sub4)
    .print()
    .sink { _ in
    } receiveValue: { _ in
    }
sub3.send(1)
sub4.send("A")
sub3.send(2)
sub4.send("B")
sub4.send("C")
sub4.send("D")
sub3.send(3)
sub3.send(4)
sub3.send(5)

/*
 receive subscription: (CombineLatest)
 request unlimited
 receive value: ((1, "A"))
 receive value: ((2, "A"))
 receive value: ((2, "B"))
 receive value: ((2, "C"))
 receive value: ((2, "D"))
 receive value: ((3, "D"))
 receive value: ((4, "D"))
 receive value: ((5, "D"))
 receive cancel
 */
```

### 响应式和指令式的桥梁

在combine响应式框架中使用指令式API，需要将指令式命令转换为合适的Publisher

##### Future

之前提到的Just publisher，它初始化时接受一个值，被订阅时就把预设值发布出来，相当于订阅和值的发布是同步过程。

如果我们希望**订阅和值的发布是异步行为，不在同一时间发生**的话，可以使用**Future**。

```swift
func loadPage(url: URL, handler: @escaping (Data?, URLResponse?, Error?) -> Void) {
    URLSession.shared.dataTask(with: url) { data, response, error in
        handler(data, response, error)
    }
    .resume()
}

let future = Future<(Data, URLResponse), Error> { promise in
    loadPage(url: URL(string: "https:www.baidu.com")!) { data, response, error in
        if let data = data, let response = response {
            promise(.success((data, response)))
        } else {
            promise(.failure(error!))
        }
    }
}
.print()
.sink { _ in
} receiveValue: { _ in
}

/*
 receive value: ((2443 bytes, <NSHTTPURLResponse: 0x600000203d60> { URL: https://www.baidu.com/ } { Status Code: 200, Headers {
     "Content-Encoding" =     (
         gzip
     );
     "Content-Length" =     (
         1145
     );
     "Content-Type" =     (
         "text/html"
     );
     Date =     (
         "Mon, 20 Nov 2023 10:07:42 GMT"
     );
     Server =     (
         bfe
     );
 } }))
 receive finished
 */
```

使用Subject实现Future类似功能：

```swift
let sub6 = PassthroughSubject<Date, Never>()
Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
    sub6.send(Date())
}

let timer = sub6.print()
    .sink { _ in
    } receiveValue: { _ in
    }
delay(6) {
    // 取消定时器
    sub6.send(completion: .finished)
}
/*
每隔1秒，发送一次
 receive value: (2023-11-20 10:21:58 +0000)
 receive value: (2023-11-20 10:21:59 +0000)
 receive value: (2023-11-20 10:22:00 +0000)
 receive value: (2023-11-20 10:22:01 +0000)
 receive value: (2023-11-20 10:22:02 +0000)
 receive value: (2023-11-20 10:22:03 +0000)
 receive finished
 */
```

### Foundation中的Publisher

##### URLSession Publisher

下面**dataTaskPublisher、decode**都是一系列Operator

```swift
struct Response: Decodable {
    struct Foo: Decodable {
        let foo: String
    }
    let args: Foo?
}

let input = PassthroughSubject<String, Error>()
let s = input.flatMap { text in
    URLSession.shared
        .dataTaskPublisher(for: URL(string: "https://httpbin.org/get?foo=\(text)")!)
        .map { data, _ in data }
        .decode(type: Response.self, decoder: JSONDecoder())
        .compactMap { $0.args?.foo }
    }
    .print()
    .sink { _ in
        } receiveValue: { _ in
        }

input.send("hello")
input.send("world")
input.send(completion: .finished)

/*
 receive subscription: (FlatMap)
 request unlimited
 receive value: (world)
 receive value: (hello)
 receive finished
 */
```

##### Timer Publisher

注意，Timer Publisher 一定需要执行connect()才会触发。

```swift
let timer = Timer.publish(every: 1, on: .main, in: .default)
let temp = check("Timer Connected") {
    timer
}
timer.connect() // 这个Timer.Publisher是一个ConnectablePublisher，它需要明确地调用connect(), 它才会开始发送事件

/*
 这里会开始每一秒打印时间
 */
```

##### Notification Publisher

```swift
NotificationCenter.default.publisher(for: xxx, object: nil)
    .print()
    .sink { _ in
    } receiveValue: { _ in
    }
```

##### @Published （@Published的底层原理）

@Published 其实就是Combine用来把一个class的属性值变成为Publisher，它同时提供了值的存储和对外的Publisher(通过符号$获取)。在被订阅时，当前值页会被发送给订阅者，它的底层其实就是CurrentValueSubject

```swift
class Wrapper {
    @Published var text: String = "hoho"
}

var wrapper = Wrapper()
wrapper.$text
    .print()
    .sink { _ in
    } receiveValue: { _ in
    }

wrapper.text = "123"
wrapper.text = "abc"

/*
 receive subscription: (PublishedSubject)
 request unlimited
 receive value: (hoho)
 receive value: (123)
 receive value: (abc)
 receive cancel
 */
```

## 到哪里去

### 订阅和绑定

#### 通过sink订阅Publisher事件

前面的学习中，我们使用了很多xxpublisher.print()..sink { _ in } receiveValue: { _ in }，其实这是相当于说对先把publisher的所有事件输出到控制台。最后sink负责订阅这个Publisher。如果我们不使用这个print() Operator的话，则需要修改成：

```swift
Just(1).sink { complete in
    switch complete {
    case .failure(let error):
        print("receive error: \(error)")
    case .finished:
        print("receive finished")
    }
} receiveValue: { value in
    print("receive value: \(value)")
}

/*
 receive value: 1
 receive finished
 */
```

#### 通过assign绑定Publisher值

在[Combine1——异步编程基础](https://bhhbdrz3p9.feishu.cn/docx/MwIIdiU2ioF09dxa6RlceLbnn8k) 使用时接触过assign，它是可以通过key path绑定到一个对象的属性上去。在SwiftUI中，通常会是ObservableObject中的属性值。

下面例子中：

Timer Publisher最终绑定到Clock的timeString属性上。所以每一次定时器运行会触发timeString的didSet，打印到控制台上。

**注意**：assign的第一个参数的类型为RefrenceWritableKeyPath。也就是说，**只有class上用var声明的属性才可以通过assign直接赋值**。另外assign的另一个限制是接收的Publisher的Failure必须是Never（这点还不是很理解）。

```swift
class Clock {
    var timeString: String = "--:--:--" {
        didSet {
            print("\(timeString)")
        }
    }
}

let clock = Clock()
let formatter = DateFormatter()
formatter.timeStyle = .medium
let timer = Timer.publish(every: 1, on: .main, in: .default)
var token = timer
    .map { formatter.string(from: $0) }
    .assign(to: \.timeString, on: clock)
timer.connect()
```

#### Publisher的引用共享

下面代码中，如果dataTaskPublisher不加share()，则会出现两次请求，这是因为dataTaskPublisher是struct，在使用assign操作isSuccess和lastestText时，最终订阅的是两个不同的Publisher。

而加上了share()。就是把上游传过来的Publisher包装在class内，使其变成引用类型的class。这样两个assign操作订阅的就是同一个Publisher。

```swift
class LoadingUI {
    var isSuccess: Bool = false {
        didSet {
            print("isSuccess: \(isSuccess)")
        }
    }
    var text: String = "" {
        didSet {
            print("text: \(text)")
        }
    }
}

struct Response: Decodable {
    struct Foo: Decodable {
        let foo: String
    }
    let args: Foo?
}
let dataTaskPublisher = URLSession.shared.dataTaskPublisher(for: URL(string: "https://httpbin.org/get?foo=bar")!)
    .share()

let isSuccess = dataTaskPublisher.map { data, response -> Bool in
    guard let httpRes = response as? HTTPURLResponse else {
        return false
    }
    return httpRes.statusCode == 200
}
    .replaceError(with: false)

let latestText = dataTaskPublisher
    .map { data, _ in data }
    .decode(type: Response.self, decoder: JSONDecoder())
    .compactMap { $0.args?.foo }
    .replaceError(with: "")

let ui = LoadingUI()
var token1 = isSuccess.assign(to: \.isSuccess, on: ui)
var token2 = latestText.assign(to: \.text, on: ui)
```

## 内存管理

对于上面的Timer案例中，执行connect()后得到的结果是一个满足**Cancallabel**协议的对象；使用sink或assgin订阅的Publisher，返回值的类型是**AnyCancellable**。

满足**Cancallabel**协议的对象需要在合适的时候主动调用cancel()来完结，比如停止Timer计时。（如果没有调用cancel，直接将connect的返回值忽略或释放掉，那么这个Timer将永远无法停止）

而**AnyCancellable**协议，它可以管理自己的生命周期，它会在自己deinit的时候直接停止订阅。所以我们一般会把**AnyCancellable**设置为所在实例的存储属性。这样实例释放的时候，**AnyCancellable**的deinit也会被触发，并自动释放资源。


