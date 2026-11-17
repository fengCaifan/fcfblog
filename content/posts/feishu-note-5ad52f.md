---
title: "题23 —— 链表中环的入口结点"
date: "2023-11-18"
category: "算法与数据结构"
tags: ["网络与安全","剑指Offer","算法与数据结构"]
description: "题解 自己只能做到判断是否有环。入口结点没有思路。 最关键的点，在于拿到环的结点个数。 第一步：用快慢指针判断是否有环 第二步：从快慢指针相遇的结点开始，绕着环走一圈，重新回到相遇结点位置即为环的个数 第三步：假设一共有"
feishu_token: "ENA0dv8b6oLiTxxg21WcWYk3nif"
---

# 题23 —— 链表中环的入口结点

#### 题解

自己只能做到判断是否有环。入口结点没有思路。

最关键的点，在于拿到环的结点个数。

- 第一步：用快慢指针判断是否有环

- 第二步：从快慢指针相遇的结点开始，绕着环走一圈，重新回到相遇结点位置即为环的个数

- 第三步：假设一共有8个结点，环中有5个结点，则环之前是不是就只有3个结点？所以这里又使用前后指针：前指针走5步（结点个数的），然后后指针跟着前指针一起走，则相遇的结点就是入口结点。

[142. 环形链表 II](https://leetcode.cn/problems/linked-list-cycle-ii/submissions/)

```swift
class Solution {
    func detectCycle(_ head: ListNode?) -> ListNode? {
        guard head != nil else {
            return head
        }
        var slow = head
        var fast = head
        var meetNode: ListNode?
        while fast != nil {
            fast = fast?.next?.next
            slow = slow?.next
            if fast === slow {
                meetNode = slow // 相遇结点
                break
            }
        }

        guard meetNode != nil else {
            return nil // 没有环
        }

        // 计算环中结点个数
        var numOfCycle = 1
        slow = slow?.next
        while slow !== meetNode {
            slow = slow?.next
            numOfCycle += 1
        }

        // 前后结点：某个结点先走numOfCycle步
        fast = head
        while numOfCycle > 0 {
            fast = fast?.next
            numOfCycle -= 1
        }

        slow = head
        while slow !== fast {
            slow = slow?.next
            fast = fast?.next
        }
        return slow
    }
}
```

[判断是否回文链表](https://leetcode.cn/problems/aMhZSa/description/)

```swift
class Solution {
    func isPalindrome(_ head: ListNode?) -> Bool {
        func revertList(_ head: ListNode?) -> ListNode? {
            guard head?.next != nil else {
                return head
            }
            let revertL = revertList(head?.next)
            head?.next?.next = head
            head?.next = nil
            return revertL
        }

        guard head != nil else {
            return false
        }

        var slow: ListNode? = head
        var fast: ListNode? = head
        // 注意找中间结点的条件，两个一起判断就可以覆盖奇偶数个数的链表
        while fast?.next != nil, fast?.next?.next != nil {
            slow = slow?.next
            fast = fast?.next?.next
        }
        var newList = slow?.next
        newList = revertList(newList)

        slow = head
        while slow != nil, newList != nil {
            if slow!.val != newList!.val {
                return false
            }
            slow = slow?.next
            newList = newList?.next
        }
        return true
    }
}
```

#### 总结：

- 链表中，经常用快慢指针，找第n个结点或者中间结点，找环的相遇结点；

- 也经常用前后指针，找倒数第几个结点，这里找入口结点也是前后指针，因为入口结点正好是链表结点个数-环的结点个数。

- 经常用虚拟头结点，返回新的列表，所以通常涉及到改变链表顺序、插入删除都需要优先考虑。

- 另外经常用到链表反转，比如倒叙插入什么的。所以一定要记到最后结点反转的图。参考[递归算法核心笔记](https://bhhbdrz3p9.feishu.cn/docx/CIRVdWJqwoPQQvxLSsEcYIytn7g) 中反转链表的图


