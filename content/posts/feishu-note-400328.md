---
title: "题9：用两个栈实现队列"
date: "2023-08-12"
category: "算法与数据结构"
tags: ["Swift","剑指Offer","算法与数据结构"]
description: "用两个栈实现队列，请实现它的两个函数appendTail和deleteHead，分别完成在队列尾部插入节点和头部删除节点的功能 第一印象题解 首先，在swift语法中，没有栈这种结构。所以只能暂时用数组代替栈。这里需要注"
feishu_token: "FJUsdL0tKoiEQtx5ST1cMalDnUg"
---

# 题9：用两个栈实现队列

> 用两个栈实现队列，请实现它的两个函数appendTail和deleteHead，分别完成在队列尾部插入节点和头部删除节点的功能

#### 第一印象题解

首先，在swift语法中，没有栈这种结构。所以只能暂时用数组代替栈。这里需要注意的一点是，栈是先进后出的特点，所以这两个数组，都是只能使用insert(x, at: 0)进行入栈，使用removeFirst()进行出栈操作。

```swift
class CQueue {
    private var stackA: [Int] = []
    private var stackB: [Int] = []

    init() {

    }
    
    func appendTail(_ value: Int) {
        
    }
    
    func deleteHead() -> Int {
        
    }
}
```

然后，如果要实现队列的特点：先进先出。则需要分析，出栈的顺序及操作。如果一系列元素先进stackA，然后出stackA，进入stackB，那么在stackB中的元素顺序正好是和入栈的顺序是反着的，而之后元素从stackB中出栈。则出栈的顺序就正好是入栈的顺序，也就达到了先进先出的目的。

其次，如果第一波元素已经从stackA出栈，进入了stackB。这时候对stackB的部分元素进行出栈操作，最终stackB中还残留部分元素。此时，又有元素入队列了。所以要保证出队列时，遗留在stackB的元素和新入队列的元素顺序不变。则应该先清空stackB里的元素，再走上述操作

```swift
class CQueue {
    private var stackA: [Int] = []
    private var stackB: [Int] = []

    init() {

    }
    
    func appendTail(_ value: Int) {
        stackA.insert(value, at: 0)
    }
    
    func deleteHead() -> Int {
        guard stackA.count + stackB.count > 0 else {
            return -1
        }
        if stackB.count > 0 {
            return stackB.removeFirst()
        } else {
            while stackA.count > 0 {
                let num = stackA.removeFirst()
                stackB.insert(num, at: 0)
            }
        }
        return stackB.count > 0 ? stackB.removeFirst(): -1
    }
}
```

#### 书中题解：

和上述方案一致


