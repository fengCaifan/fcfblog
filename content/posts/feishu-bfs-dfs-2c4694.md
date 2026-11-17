---
title: "队列与BFS & 栈与DFS"
date: "2023-08-12"
category: "算法与数据结构"
tags: ["Swift","算法与数据结构"]
description: "队列Queue FIFO（先进先出） 。 swift中，没有直接的队列结构。可以使用数组来模拟，只要确保一端进，另一端出就行。 循环队列 。 广度优先搜索 广度优先遍历，其实就是一层一层遍历。 先将最外层入队。然后在每一"
feishu_token: "E0G0drYY8o5ofIxjMHlcxoQPneh"
---

# 队列与BFS & 栈与DFS

## 队列Queue

#### **FIFO（先进先出）**。

- swift中，没有直接的队列结构。可以使用数组来模拟，只要确保一端进，另一端出就行。

#### **循环队列**。

#### 广度优先搜索

- 广度优先遍历，其实就是一层一层遍历。
  - 先将最外层入队。然后在每一轮中，逐个处理在队列中的结点，处理的过程中将结点的子节点（或邻居）添加到队列中。
    - 值得注意的是：**这些新添加的节点不会立即处理，而是会在下一轮中处理**。
  - 所以在**广度优先队列中，节点的处理顺序与添加进队列的顺序是完全相同的**。这也是为什么我们要使用队列做BFS的原因。
  - BFS代码模板：
```swift
func BFS(_ root: Node, _ target: Node) -> Int {
    var queue = [Node]()
    var step = 0
    queue.append(root)
    while !queue.isEmpty {
        step += 1
        let size = queue.count
        for i in 0 ..< size {
            let curr = queue.removeFirst()
            if target == curr {
                return step
            }
            for child in curr.childs {
                queue.append(child)
            }
        }
    }
    return -1
}
```

  - 经典题型：[733. 图像渲染 - 力扣（LeetCode）](https://leetcode.cn/problems/flood-fill/description/)
```swift
func floodFill(_ image: [[Int]], _ sr: Int, _ sc: Int, _ color: Int) -> [[Int]] {
        func changeFlood(_ image: inout [[Int]], _ visited: inout [[Bool]], _ sr: Int, _ sc: Int, _ oldColor: Int, _ newColor: Int) {
            guard sr >= 0,
                  sr < image.count,
                  sc >= 0,
                  sc < image[0].count,
                  !visited[sr][sc],
                  image[sr][sc] == oldColor,
                  image[sr][sc] != newColor else {
                return
            }
            visited[sr][sc] = true
            image[sr][sc] = newColor
            changeFlood(&image, &visited, sr - 1, sc, oldColor, newColor)
            changeFlood(&image, &visited, sr + 1, sc, oldColor, newColor)
            changeFlood(&image, &visited, sr, sc - 1, oldColor, newColor)
            changeFlood(&image, &visited, sr, sc + 1, oldColor, newColor)
        }
        guard image.count > 0, image[0].count > 0,
              sr >= 0,
              sr < image.count,
              sc >= 0,
              sc < image[0].count else {
            return []
        }
        var newImage = image
        
        let oldColor = newImage[sr][sc]
        var visited = Array(repeating: Array(repeating: false, count: image[0].count), count: image.count)
        changeFlood(&newImage, &visited, sr, sc, oldColor, color)
        return newImage
    }
```

## 栈Stack

#### LIFO（后进先出）：

- swift中，没有直接的栈结构。也可以使用数组来模拟，只要确保一端进出就行。

#### DFS深度优先搜搜：

- 深度优先搜索，就是沿着一条路径，一直查找下去，直到终点，再回过头来走其他分支。

- 在二叉树中，二叉树的前序、中序、后序遍历，都是使用深度优先遍历。

- DFS递归模板：
  - 这个模板，看起来没有使用栈，但是实际上是应用了系统的函数调用栈。

```swift
func DFS(_ curr: Node, _ target: Int, _ visited: inout [Node]) -> Bool {
    if curr == target {
        return true
    }
    for child in curr.childs {
        if !visited.contains(child) {
            visited.append(child)
            if DFS(child, target, &visited) {
                return true
            }
        }
    }
    return false
}
```

- DFS的非递归模板：
  - 因为递归的话，会一直开辟函数调用栈。所以如果深度太深，可能会存在堆栈溢出的情况。

```swift
func DFS(_ curr: Node, _ target: Int) -> Bool {
    var visited = Set<Node>()
    var stack = [Int]()
    stack.append(curr)
    while !stack.isEmpty {
        let topNode = stack.removeLast()
        if target == topNode {
            return true
        }
        for child in topNode.childs {
             if !visited.contains(child) {
                 stack.append(child)
                 visited.append(child)
             }
        }
    }
    return false
}
```

- 经典题型 [94. 二叉树的中序遍历 - 力扣（LeetCode）](https://leetcode.cn/problems/binary-tree-inorder-traversal/description/)

```swift
func inorderTraversal(_ root: TreeNode?) -> [Int] {
        guard let root = root else {
            return []
        }
        var result = [Int]()
        var stack: [TreeNode] = []
        var node: TreeNode? = root
        while !stack.isEmpty || node != nil {
            if node != nil {
                stack.append(node!)
                node = node!.left
            } else {
                let topEle = stack.removeLast()
                result.append(topEle.val)
                node = topEle.right
            }
        }
        return result
    }
```


