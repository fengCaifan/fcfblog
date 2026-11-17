---
title: "题4：二维数组中的查找"
date: "2023-07-15"
category: "算法与数据结构"
tags: ["Go","剑指Offer","算法与数据结构","工程效率"]
description: "在一个 n m 的二维数组中，每一行都按照从左到右 非递减 的顺序排序，每一列都按照从上到下 非递减 的顺序排序。请完成一个高效的函数，输入这样的一个二维数组和一个整数，判断数组中是否含有该整数。 示例: 现有矩阵 ma"
feishu_token: "J694dOGQCoj6svx7lCOcSzT1nGg"
---

# 题4：二维数组中的查找

> 在一个 n * m 的二维数组中，每一行都按照从左到右 **非递减 **的顺序排序，每一列都按照从上到下 **非递减 **的顺序排序。请完成一个高效的函数，输入这样的一个二维数组和一个整数，判断数组中是否含有该整数。
> **示例:**
> 现有矩阵 matrix 如下：
> [
  [1,   4,  7, 11, 15],
  [2,   5,  8, 12, 19],
  [3,   6,  9, 16, 22],
  [10, 13, 14, 17, 24],
  [18, 21, 23, 26, 30]
]

#### 第一印象解法

```swift
class Solution {
    func findNumberIn2DArray(_ matrix: [[Int]], _ target: Int) -> Bool {
        guard let first = matrix.first?.first, target >= first else {
            return false
        }
        guard let last = matrix.last?.last, target <= last else {
            return false
        }

        var row = matrix.count - 1
        var column = 0
        while row >= 0, column < (matrix.first?.count ?? 0) {
            let value = matrix[row][column]
            if value == target {
                return true
            } else if value > target {
                row -= 1
            } else if value < target {
                column += 1
            }
        }
        return false
    }
}
```

因为之前做过几次，所以这道题，这次写还有一些印象。

第一印象：肯定是遍历查询。如果是按正常的思维，按二维数组一行一行的顺序查找，肯定是可以的。但是肯定不是最优的。因为它是一个从左上角到右下角有序的二维数组。所以肯定是有技巧可循的。

所以这道题的关键就是起始位置。这里从左下角开始查找，可以在查找的过程中排除一大堆区域。

#### 书中解法

书中的解法，和我的解法是一样的。只是书中是从右上角作为起点。

**题解**：

书中的题解分析非常到位：

- 假设我们优先定位目标值就是二维矩阵中的一个。

- 比这个元素值小的元素区域在它的 左边+上面

- 比这个元素值大的元素区域在它的 右面+下面

#### LeetCode最优解

LeetCode官方提供了3种方式，其中一种Z字形查找就是我们上面写的那种。还有按顺序暴力查找，这个可以忽略，肯定不是最优的。其次还有一个二分查找，可以尝试一下。

- 二分查找

```swift
class Solution {
    func findNumberIn2DArray(_ matrix: [[Int]], _ target: Int) -> Bool {
        // 二分法通用模板
        func findNumByMid(_ rows: [Int], _ begin: Int, _ end: Int, _ target: Int) -> Bool {
            guard begin <= end else {
                return false
            }
            let mid = (begin + end) / 2
            let midValue = rows[mid]
            if midValue == target {
                return true
            } else if midValue > target {
                return findNumByMid(rows, begin, mid - 1, target)
            } else if midValue < target {
                return findNumByMid(rows, mid + 1, end, target)
            }
            return false
        }

        guard let first = matrix.first?.first, target >= first else {
            return false
        }
        guard let last = matrix.last?.last, target <= last else {
            return false
        }

        for rows in matrix {
            let begin = 0
            let end = rows.count - 1
            if findNumByMid(rows, begin, end, target) {
                return true
            }
        }
        return false
    }
}
```

- 二分查找是充分利用了**有序**这个关键词。所以对于本题，有序的二维数组来说，肯定是可行的

- 但是相对来说时间复杂度也不低，因为是每一行都得单独进行查找。相当于是*O*(*n*log*m*)，n是行数，m是列数。

#### 类似题型

[240. 搜索二维矩阵 II - 力扣（LeetCode）](https://leetcode.cn/problems/search-a-2d-matrix-ii/)

#### 总结

- 二维数组的查找，要非常注意代码中下标的逻辑处理。一定要想清楚是否有更好的下标处理技巧。比如这道题，如果是从头到尾查，就更不好处理下标

- 对有序数组或链表的查找，一定要想到二分法这种手段。


