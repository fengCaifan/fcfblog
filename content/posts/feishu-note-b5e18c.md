---
title: "题12、矩阵中的路径——回溯法(多练)"
date: "2023-11-05"
category: "算法与数据结构"
tags: ["内存管理","网络与安全","剑指Offer","算法与数据结构"]
description: "LCR字母游戏 https://leetcode.cn/problems/ju zhen zhong de lu jing lcof/description/ 单词搜 https://leetcode.cn/proble"
feishu_token: "DpJRdnVQ5oeTw9xooVlcBSFbnjg"
---

# 题12、矩阵中的路径——回溯法(多练)

[LCR字母游戏](https://leetcode.cn/problems/ju-zhen-zhong-de-lu-jing-lcof/description/)

[单词搜](https://leetcode.cn/problems/word-search/description/)索

#### 第一印象题解

首先想到的就是深度优先遍历，

但是还是对深度优先遍历不熟

#### 课本解法

> 在矩阵中任找一个格子作为路径的起点。
> 假设矩阵中某个格子的字符c正好对应目标target的第i个字符，则我们就只需在c的相邻格子（上、下、左、右）寻找第i+1个字符。
> 由于不能重复进入，所以需要一个和矩阵一样大小的数组来存储是否使用的标识。

```swift
class Solution {
    func wordPuzzle(_ grid: [[Character]], _ target: String) -> Bool {
        func hasPath(_ grid: [[Character]],
                     _ target: [Character], 
                     _ row: Int, 
                     _ col: Int, 
                     _ position: inout Int, 
                     _ visited: inout [[Bool]]) -> Bool {
            guard position < target.count else {
                return true
            }
            let cols = grid.first?.count ?? 0
            var finded = false
            if row >= 0, 
                row < grid.count, 
                col >= 0, 
                col < cols,
                grid[row][col] == target[position],
                !visited[row][col] {
                    position += 1
                    visited[row][col] = true
                    let up = hasPath(grid, target, row - 1, col, &position, &visited)
                    let left = hasPath(grid, target, row, col - 1, &position, &visited)
                    let down = hasPath(grid, target, row + 1, col, &position, &visited)
                    let right = hasPath(grid, target, row, col + 1, &position, &visited)
                    finded = up || left || down || right
                    if !finded {
                        position -= 1
                        visited[row][col] = false
                    }
            }
            return finded
        }

        let rows = grid.count
        let cols = grid.first?.count ?? 0
        guard rows > 0,
            cols > 0, 
            !target.isEmpty else {
            return false
        }

        var visited = Array(repeating: Array(repeating: false, count: cols), count: rows)
        var findIndex: Int = 0
        for row in 0 ..< rows {
            for col in 0 ..< cols {
                if hasPath(grid, Array(target), row, col, &findIndex, &visited) {
                    return true
                }
            }
        }
        return false
    }
}
```

单词搜索：

```swift
class Solution {
    func exist(_ board: [[Character]], _ word: String) -> Bool {
        func didFind(_ board: [[Character]],
                    _ words: [Character],
                    _ visited: inout [Bool],
                    _ row: Int,
                    _ col: Int,
                    _ position: inout Int
            ) -> Bool {
                guard position < words.count else {
                    return true
                }
                var finded = false
                let cols = board.first?.count ?? 0
                if row >= 0, 
                    row < board.count,
                    col >= 0,
                    col < cols,
                    board[row][col] == words[position],
                    !visited[row * cols + col] {
                        position += 1
                        visited[row * cols + col] = true
                        let up = didFind(board, words, &visited, row - 1, col, &position)
                        let left = didFind(board, words, &visited, row, col - 1, &position) 
                        let down = didFind(board, words, &visited, row + 1, col, &position) 
                        let right = didFind(board, words, &visited, row, col + 1, &position) 
                        finded = up || left || down || right
                        if finded == false {
                            position -= 1
                            visited[row * cols + col] = false
                        }
                    }
                return finded
        }

        var rows = board.count
        var cols = board.first?.count ?? 0
        var words = Array(word)
        guard rows > 0,
            cols > 0,
            words.count > 0 else {
                return false
            }
        
        var visited = Array(repeating: false, count: rows * cols)
        var position = 0
        for row in 0 ..< rows {
            for col in 0 ..< cols {
                if didFind(board, words, &visited, row, col, &position) {
                    return true
                }
            }
        }
        return false
    }
}
```


