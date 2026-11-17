---
title: "题13、机器人的运动范围——回溯法"
date: "2023-11-01"
category: "算法与数据结构"
tags: ["网络与安全","剑指Offer","算法与数据结构"]
description: "机器人的运动范围 https://leetcode.cn/problems/ji qi ren de yun dong fan wei lcof/description/ 地上有一个m行和n列的方格。一个机器人从坐标0,"
feishu_token: "PTBIdvtHpox4pAxW3kOcIHIGnBd"
---

# 题13、机器人的运动范围——回溯法

[机器人的运动范围](https://leetcode.cn/problems/ji-qi-ren-de-yun-dong-fan-wei-lcof/description/)

> 地上有一个m行和n列的方格。一个机器人从坐标0,0的格子开始移动，每一次只能向左，右，上，下四个方向移动一格，但是不能进入行坐标和列坐标的数位之和大于k的格子。 例如，当k为18时，机器人能够进入方格（35,37），因为3+5+3+7 = 18。但是，它不能进入方格（35,38），因为3+5+3+8 = 19。请问该机器人能够达到多少个格子？

这道题需要和[题12、矩阵中的路径——回溯法](https://bhhbdrz3p9.feishu.cn/docx/DpJRdnVQ5oeTw9xooVlcBSFbnjg) 结合起来看。

矩阵中的路径，是从任意点出发查找。所以需要循环每一个点，把所有可能的组合都遍历出来。

机器人的运动范围则是规定了是从0开始出发。

```swift
class Solution {
    func wardrobeFinishing(_ m: Int, _ n: Int, _ cnt: Int) -> Int {
        func check(_ row: Int, _ col: Int, _ cnt: Int) -> Bool {
            func getDigitSum(_ n: Int) -> Int {
                var sum = 0
                var tempN = n
                while tempN > 0 {
                    sum += tempN % 10
                    tempN = tempN / 10
                }
                return sum
            }

            if getDigitSum(row) + getDigitSum(col) <= cnt {
                return true
            } 
            return false
        }
        func countCore(_ m: Int, _ n: Int, _ cnt: Int, _ row: Int, _ col: Int, _ visited: inout [Bool]) -> Int {
            guard row >= 0,
                row < m,
                col >= 0,
                col < n,
                check(row, col, cnt),
                !visited[row * n + col] else {
                    return 0
                }
            visited[row * n + col] = true
            let upCount = countCore(m, n, cnt, row - 1, col, &visited)
            let leftCount = countCore(m, n, cnt, row, col - 1, &visited)
            let downCount = countCore(m, n, cnt, row + 1, col, &visited)
            let rightCount = countCore(m, n, cnt, row, col + 1, &visited)
            return 1 + upCount + leftCount + downCount + rightCount
        }

        guard m > 0, n > 0, cnt >= 0 else {
            return 0
        }
        var visited = Array(repeating: false, count: m * n)
        return countCore(m, n, cnt, 0, 0, &visited)
    }
}
```


