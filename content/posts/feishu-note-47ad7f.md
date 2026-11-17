---
title: "递归算法核心笔记"
date: "2023-08-05"
category: "算法与数据结构"
tags: ["算法与数据结构"]
description: "一直觉得递归很难，因为碰到问题不知道怎么下手，尤其不知道怎么结束递归，其实这还是对递归算法的本质理解不是很清楚导致的。 其次，递归算法有一个很难的点是，我们无法在大脑里模拟某一步的过程，在代码执行过程中，就算是用断点调试"
feishu_token: "CIRVdWJqwoPQQvxLSsEcYIytn7g"
---

# 递归算法核心笔记

一直觉得递归很难，因为碰到问题不知道怎么下手，尤其不知道怎么结束递归，其实这还是对递归算法的本质理解不是很清楚导致的。

其次，递归算法有一个很难的点是，我们无法在大脑里模拟某一步的过程，在代码执行过程中，就算是用断点调试都是懵逼的。

## 递归三要素

虽然我们无法模拟递归算法的关键步骤，那怎么去理解递归过程呢？

递归算法，都有其共性：

- **1、一个问题的解可以分解为几个子问题的解**

- **2、这个问题与分解之后的子问题，除了数据规模不同，求解思路完全一样**

- **3、存在递归终止条件**

对于大问题拆解为若干个子问题的思路，其实用到了分治算法的思想：

- **1、找出基线条件，这种条件必须尽可能简单**

- **2、不断将问题分解（或者说缩小规模），直到符合基线条件**

所以，递归的三要素：

#### 第一要素：明确函数想要干什么

这一步是非常重要的，其实平时碰到一个题，你不知道应该构建一个怎样的递归函数，其原因就是你不是很明确你这个递归函数到底要干什么。所以也不知道函数的参数和返回值。

#### 第二要素：寻找基线条件

基线条件指的是函数不再调用自己，从而避免形成无限循环条件。也可以理解为终止递归的条件

#### 第三要素：寻找递归条件

递归条件也就是等价关系式。利用分治思想，把大问题拆分为小问题，不断缩小参数范围。

### 递归套路

- **递归三要素**

- **写递归代码的关键就是找到如何将大问题分解为小问题的规律，并且基于此写出递推公式，然后再推敲终止条件，最后将递推公式和终止条件翻译成代码。（代码是基于三要素翻译出来的，不是直接写出来的）**

- **需要注意的是，我们平时写代码都会尝试试图搞清楚计算机每一步都是怎么执行的。对于递归代码，这种试图想清楚整个递和归过程的做法，实际是进入了一个思维误区。**

- **如果一个问题A可以分解为若干个子问题B、C、D，我们可以假设子问题B、C、D已经解决，在此基础上思考如何解决问题A。**

## 案例分析：

忘记所有可能的公式，尽可能用递归三要素解决。

### 初级

#### 1、阶乘问题

**eg：求6的阶乘**

**第一步，明确函数干什么**

> 计算任意一个整数的阶乘

```swift
func factorial(_ n: Int) -> Int {
    
}
```

6的阶乘就是：factorial(6)

**第二步，找出基线条件**

1的阶乘为1

2的阶乘为2

所以：

```swift
func factorial(_ n: Int) -> Int {
    if n == 1 {
        return 1
    }
    if n == 2 {
        return 2
    }
}

也就是
func factorial(_ n: Int) -> Int {
    if n <= 2 {
        return n
    }
}
```

**第三步，利用分治思想，缩小问题的规模，也就是寻找等价关系**

> 6！= 6 * 5 * 4 * 3 * 2 * 1
> 5！ =  5 * 4 * 3 * 2 * 1

等价关系：

> factorial(6) = 6 * factorial(5)
> factorial(n) = n * factorial(n-1)

所以最终代码：

```swift
func factorial(_ n: Int) -> Int {
    if n <= 2 {
        return n
    }
    return n * factorial(n-1)
}
```

#### 2、斐波那契数列

**eg：1、1、2、3、5、8、13、21、34.... 前两项之和等于后一项。求第n项的值**

**第一步，明确函数干什么**

> 求解任意一项的值

```swift
func fibonacci(_ n: Int) -> Int {
}
```

**第二步，找出基线条件**

fibonacci(1) = 1

fibonacci(2) = 1

```swift
func fibonacci(_ n: Int) -> Int {
    if n <= 2 {
        return 1
    }
}
```

**第三步，找出等价条件**

> fibonacci(7) = fibonacci(5) + fibonacci(6)
> fibonacci(n) = fibonacci(n-1) + fibonacci(n-2)

所以

```swift
func fibonacci(_ n: Int) -> Int {
    if n <= 2 {
        return 1
    }
    return fibonacci(n-1) + fibonacci(n-2)
}
```

#### 3、分地问题（欧几里得算法）

**示例：长宽分别为 1680m，640m的地，均匀分成方块，且分出的方块尽可能大。**

> 该问题等同于求最大公约数问题，使用欧几里得算法。
> 欧几里得算法就是求两个数的最大公约数的过程：
> 两个数A、B相%，得到的结果C，再用更小的数B与结果C相%。直到可以完全整除，最后那个就是最大公约数
> 1680 % 640 = 400
> 640 % 400 = 240
> 400 % 240 = 160
> 240 % 160 = 80
> 160 % 80 = 0
> 所以最终得到的最大方块是80平方

**第一步，明确函数干什么**

> 相当于于求两个数的最大公约数

```swift
func gcd(a: Int， b: Int) -> Int {

}
```

**第二步，找出基线条件**

从上面对欧几里得的算法可以看到，能够整除就是结束条件，且最大公约数就是除数

```swift
func gcd(a: Int， b: Int) -> Int {
    if a % b == 0 {
        return b
    }
}
```

**第三步，找出等价条件**

> gcd(1680, 640) = gcd(640, 400)
> gcd(a, b) = gcd(b, a % b)

```swift
func gcd(a: Int， b: Int) -> Int {
    if a % b == 0 {
        return b
    }
    return gcd(b, a % b)
}
```

### 中级

#### 4、反转链表

[《从尾到头打印链表》](https://leetcode.cn/problems/cong-wei-dao-tou-da-yin-lian-biao-lcof/description/?envType=study-plan-v2&envId=coding-interviews)

反转链表的递归写法非常有难度，之前经常写不出来，尤其是基线条件不好判断

**第一步，明确函数干什么：**

> **反转单链表函数**。参数是链表的第一个节点，返回新链表的第一个结点

```swift
func reverseList(_ head: ListNode?) -> ListNode? {
    
}
```

**第二步，找出基线条件**

> 当链表为空，或者链表只有一个节点，返回链表本身即可

```swift
func reverseList(_ head: ListNode?) -> ListNode? {
    if head?.next == nil {
        return head
    }
}
```

**第三步，找出等价条件**

前面例子，等价关系直接就可以通过公式推导出来。这个可能需要逐步拆解。用分治思想，把大问题拆小：

reverseList(1->2->3->4) 拆分成1和reverseList(2->3->4) 的问题：

所以，就变成了当前节点和新链表之间的问题。

```swift
func reverseList(_ head: ListNode?) -> ListNode? {
    if head?.next == nil {
        return head
    }
    var newList = reverseList(head.next)
    
}
```

这里用图拆一下：

从上面分析，reverseList函数变成了处理新链表和当前节点的问题，所以就类似：

> 此时，head指向第一个节点，newList是新链表的头节点。所以还是得从head的角度进行处理：
> 节点1是head；节点2是head.next。
> 所以第一步，要将节点2的next改成节点1：head.next.next = head
> 第二步，将节点1的next从节点2中移除，指向nil：head.next = nil

所以，做法就是：

```swift
func reverseList(_ head: ListNode?) -> ListNode? {
    if head?.next == nil {
        return head
    }
    var newList = reverseList(head.next)
    head.next.next = head
    head.next = nil
    return newList    
}
```

总结：这道题就是如果单纯代码角度来梳理或者理解，真的很难，逻辑会有点乱。

#### 5、多叉树的前序遍历（深度优先遍历）

二茶树的先序遍历，先遍历树根，然后左子树，然后右子树

给出一个多叉树：

**第一步，明确函数干什么：**

传入多叉树的root节点

```go
func preOrderTree(root: TreeNode?)  {

}
```

**第二步，找出基线条件**

对于多叉树，前序遍历，就是一直往子节点遍历，就是一直到叶子节点

```go
func preOrderTree(root: TreeNode?) {
    if root?.children == nil {
        return
    }
}
```

**第三步，找出等价条件**

对于多叉树而言，就是一个根节点+n个子孩子。我们假设它的孩子问题已解决，所以只需要处理根节点就好了

```go
func preOrderTree(root: TreeNode?) {
    debugPrint(root.value)
    if root?.children == nil {
        return
    }
    for child in root?.children {
        preOrderTree(child)
    }
}
```

#### 6、多叉树的层序遍历（广度优先遍历）

**第一步，明确函数干什么：**

传入一层的节点

```go
func levelOrderTree(nodes: [TreeNode]?) {

}
```

**第二步，找出基线条件**

结束条件就是最后一层为空，就结束

```go
func levelOrderTree(nodes: [TreeNode]?) {
    if nodes.count == 0 {
        return
    }
}
```

**第三步，找出等价条件**

假设第2层的节点的问题已经解决，我们来处理第一层节点的问题。那么我们只需要遍历第一层节点，然后打印他们：

```go
func levelOrderTree(nodes: [TreeNode]?) {
    if nodes.count == 0 {
        return
    }
    for item in  nodes {
        deugPrint(item.value)
    }
}
```

而在遍历的时候，已经打印了第一层，则只需要通过第一层，获取到第二层的节点就行。

```go
func levelOrderTree(nodes: [TreeNode]?) {
    if nodes.count == 0 {
        return
    }
    var nextLevel = [TreeNode]()
    for item in  nodes {
        deugPrint(item.value)
        if item.children != nil {
            nextLevel += item.children
        }
    }
    levelOrderTree(nextLevel)
}
```

参考：https://jerrymei.cn/algorithm-recursion-kata/


