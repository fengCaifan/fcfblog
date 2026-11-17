---
title: "题3：数组中重复的数字（一维数组中的查找）"
date: "2023-07-15"
category: "算法与数据结构"
tags: ["内存管理","Go","剑指Offer","算法与数据结构"]
description: "找出数组中重复的数字 在一个长度为 n 的数组 nums 里的所有数字都在 0～n 1 的范围内。数组中某些数字是重复的，但不知道有几个数字重复了，也不知道每个数字重复了几次。请找出数组中任意一个重复的数字。 第一印象解"
feishu_token: "W7DGdLrePoMgBOxvHeCcZ26ynYd"
---

# 题3：数组中重复的数字（一维数组中的查找）

> 找出数组中重复的数字
> 在一个长度为 n 的数组 nums 里的所有数字都在 0～n-1 的范围内。数组中某些数字是重复的，但不知道有几个数字重复了，也不知道每个数字重复了几次。请找出数组中任意一个重复的数字。

#### 第一印象解法

```swift
class Solution {
    func findRepeatNumber(_ nums: [Int]) -> Int {
        var map = [Int: Int]()
        for (i, num) in nums.enumerated() {
            if map[num] == nil {
                map[num] = i
            } else {
                return num
            }
        }
        return -1
    }
}
```

- 缺点：使用map，会多出一个内存使用

- 优点：如果是查找所有的重复元素或每个重复元素的个数，使用map更方便

结果：

- 时间：236ms

- 空间：17.8MB

#### 书中解法

###### 题解：

- 书中第一想法是对数组进行排序。从排序的数组中查找重复数字很容易。

- 因为题中强调，是0~n-1的数字在一个长度为n的数组中。所以得出的结论是：下标为i的元素内容，应该是i。如果不是，就把它的位置放到元素值的位置。正常来说，一次完整地调整，是可以查找到一个重复元素的。

```swift
class Solution {
    func findRepeatNumber(_ nums: [Int]) -> Int {
        guard !nums.isEmpty else {
            return -1
        }
        var i = 0
        var nums = nums
        while i < nums.count {
            if i != nums[i] {
                debugPrint("i:\(i), num:\(nums[i])")
                while i != nums[i] {
                    if nums[i] == nums[nums[i]] {
                        return nums[i]
                    }
                    (nums[i], nums[nums[i]]) = (nums[nums[i]], nums[i])
                }
            }
            i += 1 
        }
        return -1
    }
}
```

- 注意这里不能用for循环，因为交换元素后，需要使用交换后的值，for循环会导致交换后的值在原数组中不生效。因为for循环本意是不允许改变的。

- 这个解法利用了，数组元素值在0~n-1这个范围内这一点。然后边比较边排序。

结果：

- 时间：228ms

- 空间：17.35MB。因为LeetCode不能修改函数入参，如果将nums改成inout 应该空间还能节省不少。

#### LeetCode 最优解

- 哈希表算法，和上述第一种一致。

- 原地交换，和书中解法一致。

#### 类似题型

无

#### 总结：

- 数组相关的考题，一定要考虑到数组本身的特点，即下标。

- 数组元素的查找通常用到的方法就是：
  - 排序：
    - 如果元素的大小在有限范围内，使用排序是可行的，最多遍历一次。
    - 排序好的数组适合做很多事，而且根据下标就可以很高效地拿到值
    - 排序好的数组适合使用二分法等高效的查找算法
  - 哈希表


