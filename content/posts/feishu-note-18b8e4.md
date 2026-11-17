---
title: "题14：剪绳子——动态规划"
date: "2023-11-05"
category: "算法与数据结构"
tags: ["网络与安全","剑指Offer","算法与数据结构"]
description: "LCR 131. 砍竹子 I https://leetcode.cn/problems/jian sheng zi lcof/description/ 书中题解1 —— 动态规划 最大乘积，就是max（f i f n i"
feishu_token: "APBRdk76EoWlUOxd6QHcw5GPnWc"
---

# 题14：剪绳子——动态规划

[LCR 131. 砍竹子 I](https://leetcode.cn/problems/jian-sheng-zi-lcof/description/)

```swift
给一根长度为n的绳子，把绳子剪成m段（m、n都是整数），请返回每段绳子最大长度的乘积
```

#### 书中题解1 —— 动态规划

最大乘积，就是max（f(i) * f(n-i)）,所以从4开始遍历，然后结果从1开始计算。逐渐累积

但是下面题，数组前3的元素的初始化有点看不懂。为什么newBamoos[2] 不是等于 1，newBamoos[3] 不是等于 2？

```swift
class Solution {
    func cuttingBamboo(_ bamboo_len: Int) -> Int {
        if bamboo_len < 2 {
            return 0
        } else if bamboo_len == 2 {
            return 1
        } else if bamboo_len == 3 {
            return 2
        }

        var newBamoos: [Int] = Array(repeating: 0, count: bamboo_len + 1)
        newBamoos[0] = 0
        newBamoos[1] = 1
        newBamoos[2] = 2
        newBamoos[3] = 3

        var max = 0
        for i in 4 ... bamboo_len {
            max = 0
            for j in 1 ... i/2 {
                let re = newBamoos[j] * newBamoos[i-j]
                if max < re {
                    max = re
                }
                newBamoos[i] = max
            }
        }

        max = newBamoos[bamboo_len]
        return max
    }
}
```

#### 书中题解2——贪婪算法

乘积的最大值，按数学分析来说，肯定是越靠近中位数的两个数最大：当n>=5时，则尽可能地剪长度为3的绳子，n==4时，尽可能剪长度为2的绳子

> 数学前提：每个大于4的数一定可以拆分成两个数使乘积大于4。 由于数学前提的存在，所以一定要将数尽量拆成2和3的组合（如果拆出来的子数大于4 那么一定不是最大值，因为数学前提。） 再就是为什么要多拆3而不是拆2的问题。 很简单，举个例子。因为3的平方等于9，而2的三次方等于8，两者都为6拆出来的结果，在要拆的数足够大的情况下，肯定是多拆3最后得到的是最大值。用动态规划或者画图的方式也很好理解。 最后是4的问题，如果最后出现4 那么拆3是小于拆2的（3x1<2x2）。 所以不管绳子多长，最后的答案肯定是3x3x3x3……3x3x2或者3x3x3x3……3x3x2x2

```swift
class Solution {
    func cuttingBamboo(_ bamboo_len: Int) -> Int {
        if bamboo_len < 2 {
            return 0
        } else if bamboo_len == 2 {
            return 1
        } else if bamboo_len == 3 {
            return 2
        }

        var tiemsOf3 = bamboo_len / 3
        if bamboo_len - tiemsOf3 * 3 == 1 {
            tiemsOf3 -= 1 
        }
        let tiemsOf2 = (bamboo_len - tiemsOf3 * 3) / 2
        let sumOf3 = pow(3, tiemsOf3)
        let sumOf2 = pow(2, tiemsOf2)
        let sumOf3Int = Int(truncating: sumOf3 as NSNumber)
        let sumOf2Int = Int(truncating: sumOf2 as NSNumber)
        return sumOf3Int * sumOf2Int
    }
}
```


