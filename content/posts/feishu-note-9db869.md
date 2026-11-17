---
title: "双指针技巧"
date: "2022-08-28"
category: "算法与数据结构"
tags: ["Swift","网络与安全","算法与数据结构"]
description: "所谓双指针是指借助两个指针来巧妙地解题。双指针技巧主要分为： 左右指针 和 快慢指针 左右指针：就是两个指针相向而行（从两边往中间）或者向背而行（从中间往两边）。 快慢指针：就是两个指针同向而行，一快一慢。 双指针链表题"
feishu_token: "doxcnUt17STmA935dTNIWlv8wdd"
---

# 双指针技巧

所谓双指针是指借助两个指针来巧妙地解题。双指针技巧主要分为：**左右指针**和**快慢指针**

左右指针：就是两个指针相向而行（从两边往中间）或者向背而行（从中间往两边）。

快慢指针：就是两个指针同向而行，一快一慢。

### 双指针链表题

**链表中的双指针基本是指快慢指针。因为链表的长度、下标是无法确定的，只能知道头结点。**

同时下面的题也用到了一些其他的技巧，比如：**虚拟头节点、快慢指针、优先级队列**

- [21.合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/submissions/)（**虚拟头节点**）

```swift
class ListNode {
    var val: Int
    var next: ListNode?
    
    init(_ val: Int, _ next: ListNode?) {
        self.val = val
        self.next = next
    }
    
    convenience init() {
        self.init(0, nil)
    }
}

/// 注意swift可选型语法
extension ListNode {
    func mergeTwoLists(_ list1: ListNode?, _ list2: ListNode?) -> ListNode? {
        let dummy = ListNode()
        var p: ListNode? = dummy
        var p1 = list1
        var p2 = list2
        
        while p1 != nil && p2 != nil {
            if p1!.val <= p2!.val {
                p = p1!.next
                p1 = p1!.next
            } else {
                p = p2!.next
                p2 = p2!.next
            }
            p = p!.next
        }
        
        if p1 != nil {
            p?.next = p1
        }
        
        if p2 != nil {
            p?.next = p2
        }
        return dummy.next
    }
}
```

- [86.分割链表](https://leetcode.cn/problems/partition-list/submissions/) （这道题要注意子链表要**断开源链表**）

```swift
 /// 分割两个链表
    func partition(_ head: ListNode?, _ x: Int) -> ListNode? {
        var p: ListNode? = head
        let minDummy = ListNode()
        let maxDummy = ListNode()
        var minL: ListNode? = minDummy
        var maxL: ListNode? = maxDummy
        
        while p != nil {
            if p!.val < x {
                minL?.next = p
                p = p!.next
                minL = minL?.next
                minL?.next = nil
            } else {
                maxL?.next = p
                p = p!.next
                maxL = maxL?.next
                maxL?.next = nil
            }
        }
        minL?.next = maxDummy.next
        return minDummy.next
    }
```

- [23.合并K个有序链表](https://leetcode.cn/problems/merge-k-sorted-lists/submissions/) （**使用优先级队列**）

```swift
/// 23 合并k个升序链表 使用最小堆
    /// 使用优先级队列
    func mergeKLists2(_ lists: [ListNode?]) -> ListNode? {
        // 维护队列的优先级
        func enqueue(priority: inout [ListNode], _ element: ListNode) {
            for (index, otherElement) in priority.enumerated() {
                if element.val < otherElement.val {
                    priority.insert(element, at: index)
                    return
                }
            }
            priority.append(element)
        }
        
        // 重新创建链表
        let dummy = ListNode()
        var p: ListNode? = dummy
        
        var priorityArray: [ListNode] = []
        
        for node in lists {
            if let node = node {
                enqueue(priority: &priorityArray, node)
            }
        }
        
        while !priorityArray.isEmpty {
            let fitst = priorityArray.removeFirst()
            p?.next = fitst
            if let next = fitst.next {
                enqueue(priority: &priorityArray, next)
            }
            p = p?.next
        }
        
        return dummy.next
    }
```

- [19.删除链表的倒数第N个节点](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)（**快慢指针**）

```swift
 /// 找出倒数第K个节点，要背
    func findFromEnd(head: ListNode, k: Int) -> ListNode? {
        var fast: ListNode? = head
        var slow: ListNode? = head
        var i = 1
        while fast != nil {
            if i > k {
                fast = fast!.next
                slow = slow!.next
            } else {
                fast = fast!.next
            }
            i += 1
        }
        // 这里不能用等于
        if i > k {
            print(slow!.val)
            return slow
        } else {
            return nil
        }
    }
    
    // 删除链表的倒数第K个节点，先找到第k+1个节点，也就是前一个节点
    func removeNthFromEnd(_ head: ListNode?, _ n: Int) -> ListNode? {
        guard head != nil else {
            return nil
        }
        let pre = findFromEnd(head: head!, k: n + 1)
        if pre != nil {
            pre!.next = pre!.next!.next
            return head
        } else {
            // 没找到就说明是第一个元素
            return head?.next
        }
    }
```

- [876 链表的中间节点](https://leetcode.cn/problems/middle-of-the-linked-list/submissions/) **快慢指针，一倍二倍速**

```swift
/// 876 链表的中间节点（快慢指针）
    func middleNode(_ head: ListNode?) -> ListNode? {
        guard head != nil else {
            return nil
        }
        
        // 小于2个节点的情况
        if head?.next == nil {
            return head
        }
        
        var fast = head
        var slow = head
        while fast != nil && fast?.next != nil {
            fast = fast?.next?.next
            slow = slow?.next
        }
        return slow
    }
```

[剑指Offer || 022.链表中环的入口节点](https://leetcode.cn/problems/c32eOV/)（**快慢指针**）

```swift
w: ListNode? = head
        while fast != nil {
            fast = fast?.next?.next
            slow = slow?.next
            if let fast = fast,
               let slow = slow,
               fast === slow {
                // 相交
                break
            }
        }
        
        if fast == nil || fast?.next == nil {
            return nil
        }
        
        // 慢指针从头开始，与快指针同步移动
        slow = head
        while !(fast! === slow!) {
            fast = fast?.next
            slow = slow?.next
        }
        return slow
    }
```

[83.删除排序链表中的重复元素](https://leetcode.cn/problems/remove-duplicates-from-sorted-list/submissions/)

```swift
    func deleteDuplicates(_ head: ListNode?) -> ListNode? {
        guard head != nil else {
            return nil
        }
        var slow = head
        var fast = head?.next
        while fast != nil {
            if fast!.val != slow!.val {
                slow?.next = fast
                slow = slow?.next
            }
            fast = fast?.next
        }
        slow?.next = nil
        return head
    }
```

### 双指针数组题

- [26.删除有序数组中的重复项](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/)（**快慢指针**）

```swift
func removeDuplicates(_ nums: inout [Int]) -> Int {
        guard nums.count > 0 else {
            return 0
        }
        var slow = 0
        var fast = 1
        while fast < nums.count {
            if nums[slow] == nums[fast] {
                fast += 1
            } else {
                slow += 1
                if slow != fast {
                    (nums[slow], nums[fast]) = (nums[fast], nums[slow])
                }
                fast += 1
            }
        }
        return slow + 1
    }
```

[27.移除元素](https://leetcode.cn/problems/remove-element/)（**快慢指针**）

```swift
func removeElement(_ nums: inout [Int], _ val: Int) -> Int {
    guard nums.count > 0 else {
        return
    }
    var slow = 0
    var fast = 0
    while fast < nums.count {
        if nums[fast] != val {
            nums[slow] = nums[fast]
            slow += 1
        }
        fast += 1
    }
    return slow
 }
```

[283.移动零](https://leetcode.cn/problems/move-zeroes/)（**快慢指针**）

```swift
func moveZeroes(_ nums: inout [Int]) {
    guard nums.count > 0 else {
        return
    }
    var slow = 0
    var fast = 0
    while fast < nums.count {
        if nums[fast] != 0 {
            (nums[slow], nums[fast]) = (nums[fast],nums[slow])
            slow += 1
        }
        fast += 1
    }
}
```

[167.两数之和||](https://leetcode.cn/problems/two-sum-ii-input-array-is-sorted/)（**只要数组有序就应该想到双指针技巧**）（**左右指针**）

```swift
func twoSum(_ numbers: [Int], _ target: Int) -> [Int] {
        guard numbers.count > 0 else {
            return []
        }
        var left = 0
        var right = numbers.count - 1
        while left < right {
            let sum = numbers[left] + numbers[right]
            if sum == target {
                return [left + 1, right + 1]
            } else if sum < target {
                left += 1
            } else if sum > target {
                right -= 1
            }
        }
        return []
    }
```

[344.反转字符串](https://leetcode.cn/problems/reverse-string/)（**左右指针**）

```swift
func reverseString(_ s: inout [Character]) {
        guard s.count > 0 else {
            return
        }
        var left = 0
        var right = s.count - 1
        while left < right {
            (s[left], s[right]) = (s[right], s[left])
            left += 1
            right -= 1
        }
    }
```

[5.最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/)

题解1（不够优，会超出时间限制）

```swift
/// 5.最长回文子串(策略不行，会超出时间)
func longestPalindrome(_ s: String) -> String {
    func checkIsPalindrome(_ sArr: [Character]) -> Bool {
        guard sArr.count > 0 else {
            return false
        }
        var left = 0
        var right = sArr.count - 1
        while left < right {
            if sArr[left] != sArr[right] {
                return false
            }
            left += 1
            right -= 1
        }
        return true
    }
    
    let sArr = Array(s)
    var resultArr = [Character]()
    var left = 0
    var right = sArr.count - 1
    while left <= right {
        let subArr = Array(sArr[left...right])
        debugPrint("left:\(left), right:\(right) subArr:\(String(subArr))")
        if subArr.count <= resultArr.count {
            left += 1
            right = sArr.count - 1
            continue
        }
        if checkIsPalindrome(subArr) {
            resultArr = subArr
            left += 1
            right = sArr.count - 1
            continue
        }
        right -= 1
        if left > right {
            left += 1
            right = sArr.count - 1
        }
    }
    debugPrint(String(resultArr))
    return String(resultArr)
}
```

题解2：用双指针，从中心向两边开始查找

```plaintext

```


