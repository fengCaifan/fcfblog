---
title: "Combine2—— Publisher和常见Operator"
date: "2025-07-18"
category: "iOS 与底层"
tags: ["Combine"]
description: "什么是Publisher? 基础Publisher和Operator 最简单Publisher Empty Empty是一个最简单的Publisher，它只在被订阅的时候发布一个完成事件 receive finished"
feishu_token: "Xf5jdsxoVoiGwwxhB5hcwLdSnud"
---

# Combine2—— Publisher和常见Operator

## 什么是Publisher?

## 基础Publisher和Operator

#### 最简单Publisher

- **Empty**

> Empty是一个最简单的Publisher，它只在被订阅的时候发布一个完成事件(receive finished), 不会输出任何output。只能用于表示某个事件已经发生

```swift
Empty<Int, Error>()
    .print() // 也是一个Operator，会把Publisher的流程打印出来
    .sink { _ in } receiveValue: { _ in }
/*
打印结果
receive subscription: (Empty)
request unlimited
receive finished
*/
```

- **Just**

相比Empty多了一个receive value的Output事件。

```swift
Just(1)
    .print()
    .sink{_ in } receiveValue: { _ in }
/*
打印结果：
receive subscription: (Just)
request unlimited
receive value: (1)
receive finished
*/
```

#### 序列Publisher及其操作

**Publisher.Sequence**

```swift
Publishers.Sequence<[Int], Never>(sequence: [1, 2, 3])
    .print()
    .sink { _ in } receiveValue: { _ in }
/*
打印结果
receive subscription: ([1, 2, 3])
request unlimited
receive value: (1)
receive value: (2)
receive value: (3)
receive finished
*/
```

也有更语法糖式的写法：

```swift
[1, 2, 3].publisher
    .print()
    .sink { _ in } receiveValue: { _ in }
```

- **Map **操作元素变形

也就是对数据进行处理，可以使用**Map**这个Operator进行操作。

> map主要是元素进行变形

```swift
[1, 2, 4].publisher
    .map{ $0 * 2} // 这里是对publisher进行map，相当于是一个Operator，也就是说无论这里是否是数组，都可以使用map来对数据进行变形
    .print()
    .sink { _ in } receiveValue: { _ in }
    /*
 receive subscription: ([2, 4, 8])
 request unlimited
 receive value: (2)
 receive value: (4)
 receive value: (8)
 receive finished
 */
```

需要进行区分的是，两者有本质的区别，一个是对数组的map使用，一个是publisher的map。比如，Just也可以map

```swift
[1, 2, 5].map{ $0 * 3} // 这是是对数组进行map，如果不是数组，则无法map
    .publisher
    .print()
    .sink { _ in } receiveValue: { _ in }
/*
 receive subscription: ([3, 6, 15])
 request unlimited
 receive value: (3)
 receive value: (6)
 receive value: (15)
 receive finished
 */
 
// 其他Publisher也可以map
Just(1)
    .map{ $0 * 8 }
    .print()
    .sink { _ in } receiveValue: { _ in }
/*
 receive subscription: (Just)
 request unlimited
 receive value: (8)
 receive finished
 */
```

但是大部分操作普通序列的函数式方法，比如filter、contains，也都是适用于Publisher的。

- **reduce**

> 接收一个初始值和一个操作符，最终所有元素进行操作，返回最终一个结果。

```swift
[1,2,3,4].publisher
    .reduce(0, +)
    .print()
    .sink { _ in
    } receiveValue: { _ in
    }
/*
 receive subscription: (Once)
 request unlimited
 receive value: (10)
 receive finished
 */
```

- **scan**

> 和reduce一样的操作，不过它会记录，每个元素经过操作之后的值。返回一个全新的序列

```swift
[1,2,3,4,5].publisher
    .scan(0, +) // 每个元素都是前面元素之和
    .print()
    .sink { _ in } receiveValue: { _ in }
/*
 receive subscription: ([1, 3, 6, 10, 15])
 request unlimited
 receive value: (1)
 receive value: (3)
 receive value: (6)
 receive value: (10)
 receive value: (15)
 receive finished
 */
```

- **compactMap**

> 实际是Map的变形，它是先在block里进行转换，然后会额外把等于nil的结果剔除。相当于map + filter的组合

```swift
["1", "2", "3", "cat", "5"].publisher
    .compactMap { Int($0) } // 和map一样先进行转换操作，然后结果会将nil元素去除掉
    .print()
    .sink { _ in } receiveValue: { _ in }
/*
 receive subscription: ([1, 2, 3, 5])
 request unlimited
 receive value: (1)
 receive value: (2)
 receive value: (3)
 receive value: (5)
 receive finished
 */
 
 ["1", "2", "3", "cat", "5"].publisher
    .map { Int($0) }
    .filter { $0 != nil }
    .map { $0! } // 这里要将可选项转成非可选型
    .print()
    .sink { _ in } receiveValue: { _ in }
/*
 receive subscription: ([1, 2, 3, 5])
 request unlimited
 receive value: (1)
 receive value: (2)
 receive value: (3)
 receive value: (5)
 receive finished
 */
```

- **flatMap**

> flatMap在数组中是将二维数组铺平一维数组。

```swift
[[1,2,3],[[4, 5]], [[6], [7, 8]]].publisher
    .flatMap {
        $0.publisher 注意这里是个publisher，因为内层也有一个publisher
    }
    .print()
    .sink { _ in } receiveValue: { _ in }
/*
 receive subscription: (FlatMap)
 request unlimited
 receive value: (1)
 receive value: (2)
 receive value: (3)
 receive value: ([4, 5])
 receive value: ([6])
 receive value: ([7, 8])
 receive finished
 */
```

flatMap内层还有一个publisher，所以可以对内网数据进行整合处理：

```swift
["A", "B", "C"].publisher
    .flatMap { letter in
        [1, 2, 3]
            .publisher
            .map { "\(letter)\($0)"}
    }
    .print()
    .sink { _ in } receiveValue: { _ in }
/*
 receive subscription: (FlatMap)
 request unlimited
 receive value: (A1)
 receive value: (A2)
 receive value: (A3)
 receive value: (B1)
 receive value: (B2)
 receive value: (B3)
 receive value: (C1)
 receive value: (C2)
 receive value: (C3)
 receive finished
 */
```

- **removeDuplicates**

> 作用是移除连续重复的元素

```swift
["S", "Sw", "Sw", "Sw", "Swi",
 "Swif", "Swift", "Swift", "Swif"].publisher
    .removeDuplicates()
    .print()
    .sink { _ in
    } receiveValue: { _ in
    }
/*
 receive subscription: (["S", "Sw", "Swi", "Swif", "Swift", "Swif"])
 request unlimited
 receive value: (S)
 receive value: (Sw)
 receive value: (Swi)
 receive value: (Swif)
 receive value: (Swift)
 receive value: (Swif)
 receive finished
 */
```

#### 错误处理

自定义Error

```swift
public enum SampleError: Error {
    case sampleError
}
```

- **Fail**

会发出一个错误Publisher

```swift
Fail<Int, SampleError>(error: .sampleError)
    .print()
    .sink { _ in
    } receiveValue: { _ in
    }
/*
 receive subscription: (Empty)
 request unlimited
 receive error: (sampleError)
 */
```

- **mapError**

在之前课程讲到Subscriber的Input要和Publisher的Output类型一致。而通常我们的的Error会进行自定义，所以当出现不同的Error时，则需要进行类型转换，才能完成订阅

```swift
public enum MyError: Error {
    case myerror
}

Fail<Int, SampleError>(error: .sampleError)
    .mapError({ _ in
        MyError.myError  // 自己的Error
    })
    .print()
    .sink { _ in
    } receiveValue: { _ in
    }
/*
 receive subscription: (Empty)
 request unlimited
 receive error: (myerror)
 */
```

- **tryMap**

trymap会在处理数据时发生的错误转变为标志事件流失败的结束事件，也就是抛出异常，中断后续操作

```swift
["1", "2", "Swift", "4"].publisher
    .tryMap { s -> Int in
        guard let value = Int(s) else {
            throw MyError.myerror
        }
        return value
    }
    .print()
    .sink { _ in
    } receiveValue: { _ in
    }
/*
 receive subscription: (TryMap)
 request unlimited
 receive value: (1)
 receive value: (2)
 receive error: (myerror)
 */
```

- **从错误中恢复**
  - **replaceError**

相当于在上面遇到异常的时候，使用一个默认值来让事件流进行恢复。

## 什么是Operator？

之前说过**Combine的核心工作就是组合各种Operator来生成满足最终逻辑的Publisher**。

但是实际上，我们这两节课发现，我们只能找到Publisher和Subscriber或者Subject的定义，却没有具体的Operator协议。那Operator到底是什么？

**Operator其实就是Publisher的extension中所提供的一些方法，比如，flatMap等，它们都作用于Publisher，并最终返回Publisher**


