---
title: "题11：旋转数组的最小数字——二分法"
date: "2023-10-17"
category: "算法与数据结构"
tags: ["网络与安全","剑指Offer","算法与数据结构","工程效率"]
description: "153. 寻找旋转排序数组中的最小值 https://leetcode.cn/problems/find minimum in rotated sorted array/description/ 第一印象题解： 因为是旋"
feishu_token: "EOI7d2M5oo40MnxQzFrc52vAnYW"
---

# 题11：旋转数组的最小数字——二分法

[153. 寻找旋转排序数组中的最小值](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/description/)

#### 第一印象题解：

因为是旋转数组，所以前面序列的第一个数字一定大于后面序列的最后一个数字。

```swift
func findMin(_ nums: [Int]) -> Int {
        guard nums.count > 0 else {
            return -1
        }
        var first = 0
        var last = nums.count - 1
        if nums[last] > nums[first] {
            return nums[first]
        }
        while first < last {
            let mid = (first + last) / 2
            if nums[mid] < nums[first] {
                last = mid
                continue
            } else if nums[mid] > nums[first] {
                first = mid
                continue
            } else if last == first + 1 {
                break
            }
        }
        return nums[last]
    }
```

这个代码对leetcode有效，因为leetcode里的题型写了一定是升序。

但是这个例子对 [1,0,1,1,1]这种序列没有效果。所以还需要进一步优化。

[154. 寻找旋转排序数组中的最小值 II](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array-ii/description/)

#### 书中方案

对于正常的升序，书中方案一致，但是 [1,0,1,1,1]这种序列，也有额外处理，使用了顺序查找的方式。

```swift
class Solution {
    func findMin(_ nums: [Int]) -> Int {
        // 顺序查找
        func minInOrder(_ nums: [Int], index1: Int, index2: Int) -> Int {
            var result = nums[index1]
            for index in (index1 + 1) ... index2 {
                if result > nums[index] {
                    result = nums[index]
                }
            }
            return result
        }
        guard nums.count > 0 else {
            return -1
        }
        var first = 0
        var last = nums.count - 1
        var mid = first
        while nums[first] >= nums[last] {
            if last - first <= 1 {
                mid = last
                break
            }
            mid = (first + last) / 2
            // 如果3个数相等，则进行顺序查找
            if nums[first] == nums[last] && nums[first] == nums[mid] {
                return minInOrder(nums, index1: first, index2: last)
            }

            if nums[mid] >= nums[first] {
                first = mid
            } else if nums[mid] <= nums[last] {
                last = mid
            }
        }
        return nums[mid]
    }
}
```


