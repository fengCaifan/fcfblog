---
title: "二叉树刷题技巧"
date: "2022-10-11"
category: "算法与数据结构"
tags: ["网络与安全","算法与数据结构"]
description: "理论知识，先看 二叉树及其衍生结构 https://bhhbdrz3p9.feishu.cn/docx/doxcnKYqHSnMXw86RMrfS4XJ4PO 二叉树递归遍历框架 注意 ：任何递归函数，如果层级过深，则调"
feishu_token: "doxcnTJicBTt3tijhsuLSNtfQAi"
---

# 二叉树刷题技巧

理论知识，先看[二叉树及其衍生结构](https://bhhbdrz3p9.feishu.cn/docx/doxcnKYqHSnMXw86RMrfS4XJ4PO) 

**二叉树递归遍历框架**

```swift
func traverse(_ root: TreeNode?) {
    guard root != nil else { return }
    // 前序
    traverse(root!.left)
    // 中序
    traverse(root!.right)
    // 后序
}
```

**注意**：任何递归函数，如果层级过深，则调用堆栈可能太多，从而导致堆栈溢出。所以二叉树的算法，很多需要考虑非递归的使用方法。

[104.二叉树最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

每个节点的深度 = 左右子树最大深度值 + 1

![图片](/images/feishu/feishu-note-9d033c/boxcnG3cc3RHfu3UvgCTmMzsWBe.png)

```swift
func maxDepth(_ root: TreeNode?) -> Int {
        guard root != nil else {
            return 0
        }
        let leftH = maxDepth(root!.left)
        let rightH = maxDepth(root!.right)
        return max(leftH, rightH) + 1
 }
```

这个算法这里看似简单，但是其实是用到了**DFS：深度优先遍历的思想**。沿着树的深度遍历树的节点，尽可能深地搜索树的分支。

比如这个二叉树，DFS的访问顺序是a-b-d-e-c-f-g。和**二叉树的前序遍历是一样的。**

非递归的DFS算法：

```swift
/// DFS
func dfsTraverse(_ root: TreeNode?) -> [TreeNode] {
    guard root != nil else { return [] }
    var res = [TreeNode]()
    var stack = [TreeNode]() // 栈
    stack.insert(root!, at: 0)
    while !stack.isEmpty {
        let node = stack.removeFirst()
        res.append(node)
        if node.right != nil {
            stack.insert(node.right!, at: 0)
        }
        if node.left != nil {
            stack.insert(node.left!, at: 0)
        }
    }
    return res
}
```

**DFS算法最重要的思想就是先右后左压入数据，因为我们需要将先访问的数据后压入****栈****中。****整体入栈的顺序是：根——右——左，数组的话，每次都插入第一位，压子结点的时候，先弹出第一位。**

二叉树的层次遍历

二叉树的层次遍历，顾名思义也就是一层一层遍历。用上图的遍历顺序是：a-b-c-d-e-f-g。

而这也正好是**BFS：广度优先遍历的思想**。

这里主要用到了**队列**。通过**消耗尾部、插入头部**的方式完成BFS

```swift
// 层次遍历
func levelOrder(_ root: TreeNode?) -> [TreeNode] {
    guard root != nil else { return [] }
    var res = [[TreeNode]]()
    var queue = [TreeNode]()
    queue.insert(root!, at: 0)
    
    while !queue.isEmpty {
        var levels = [TreeNode]()
        let size = queue.count
        for _ in 0..<size {
            let node = queue.removeLast()
            levels.append(node)
            if let left = node.left {
                queue.insert(left, at: 0)
            }
            if let right = node.right {
                queue.insert(right, at: 0)
            }
        }
        res.append(levels)
    }
    return res.flatMap({ $0 })
}
```

98判断一棵树是否为有效的二叉搜索树 ***搜索二叉树***

二叉搜索树是一个有序的树，所有左子节点的值都小于根节点，所有右子节点的值都大于根节点。

```swift
// 判断是否是一个有效二叉树
func isValidST(_ root: TreeNode?, min: Int = Int.min, max: Int = Int.max) -> Bool {
    guard let root = root else {
        return true
    }
    
    if min >= root.value || max <= root.value {
        return false
    }
    
    return isValidST(root.left, min: min, max: root.value) && isValidST(root.right, min: root.value, max: max)
}
```

[700 ](https://leetcode.cn/problems/search-in-a-binary-search-tree/)[二叉搜索树](https://leetcode.cn/problems/search-in-a-binary-search-tree/)[中的搜索](https://leetcode.cn/problems/search-in-a-binary-search-tree/) ***搜索二叉树***

```swift
func searchBST(_ root: TreeNode?, _ val: Int) -> TreeNode? {
    guard let root = root else {
        return nil
    }
    
    if val < root.value {
        return searchBST(root.left, val)
    } else if val > root.value {
        return searchBST(root.right, val)
    } else if val == root.value {
        return root
    }
    return nil
}
```

[450.删除二叉树中的节点](https://leetcode.cn/problems/delete-node-in-a-bst/) ***搜索二叉树***

```swift
/// 删除二叉树的节点
func deleteNode(_ root: TreeNode?, _ key: Int) -> TreeNode? {
    guard let root = root else {
        return nil
    }
    
    if key < root.value {
        root.left = deleteNode(root.left, key)
        return deleteNode(root.left, key)
    } else if key > root.value {
        root.right = deleteNode(root.right, key)
    } else {
        // 删除节点。
        if let head = root.right {
            // 返回以右节点为根节点的新树
            var node = head
            while node.left != nil {
                node = node.left!
            }
            node.left = root.left
            return head
        } else {
            return root.left
        }
    }
    return root
}
```

[110.平衡二叉树](https://leetcode.cn/problems/balanced-binary-tree/) ***平衡二叉树***

```swift
func isBalanced(_ root: TreeNode?) -> Bool {
    func maxHeight(_ root: TreeNode?) -> Int {
        guard let root = root else {
            return 0
        }
        
        return max(maxHeight(root.left), maxHeight(root.right)) + 1
    }
    
    guard let root = root else {
        return true
    }
    
    let leftH = maxHeight(root.left)
    let rightH = maxHeight(root.right)
    if abs(leftH - rightH) > 1 {
        return false
    }
    
    return isBalanced(root.left) && isBalanced(root.right)
}
```

[完全二叉树的节点数](https://leetcode.cn/problems/count-complete-tree-nodes/)

如果不强调完全二叉树，那么就很简单递归求解。但这里强调了完全二叉树，所以肯定不是这样做

```swift
 
func countNodes0(_ root: TreeNode?) -> Int {
    guard let root = root else {
        return 0
    }
    
    return countNodes0(root.left) + countNodes0(root.right) + 1
}
```

方法2；因为是完全二叉树，所以存在两种情况：左子树是完全二叉树，右子树是满二叉树；右子树是完全二叉树，左子树是满二叉树。如果左右的子树的层级是一样的，说明右子树是完全二叉树，左子树是满二叉树。另外满二叉树的所有节点个数是：2^H - 1。

```swift
func countNodes(_ root: TreeNode?) -> Int {
    // 计算层级
    func countLevel(_ root: TreeNode?) -> Int {
        var root = root
        var level = 0
        while root != nil {
            level += 1
            root = root?.left
        }
        return level
    }
       
    guard let root = root else {
        return 0
    }
    
    let lLevel = countLevel(root.left)
    let rLevel = countLevel(root.right)
    if lLevel == rLevel {
        // 层级相等，则右子树为完全二叉树，左子树为满二叉树，满二叉树的节点个数 = 2^h-1个节点 也就是 （1<<h - 1）
        return countNodes(root.right) + (1 << lLevel)
    } else {
        return countNodes(root.left) + (1 << rLevel)
    }
}
```

**剪枝**

[144. 二叉树的前序遍历](https://leetcode.cn/problems/binary-tree-preorder-traversal/)(递归)

```swift
func preorderTraversal(_ root: TreeNode?) -> [Int] {
        func traversal(_ root: TreeNode?, _ nodes: inout [Int]) {
            guard root != nil else {
                return
            }
            nodes.append(root!.val)
            traversal(root!.left, &nodes)
            traversal(root!.right, &nodes)
        }
        var nodes = [Int]()
        traversal(root, &nodes)
        return nodes
    }
```

[543. 二叉树的直径](https://leetcode.cn/problems/diameter-of-binary-tree/)

```swift
func diameterOfBinaryTree(_ root: TreeNode?) -> Int {
        func depth(_ root: TreeNode?, _ maxD: inout Int) -> Int {
            guard root != nil else {
                return 0
            }
            let leftH = depth(root!.left, &maxD)
            let rightH = depth(root!.right, &maxD)
            let newMaxD = leftH + rightH
            maxD = max(maxD, newMaxD)
            return max(leftH, rightH) + 1
        }

        guard root != nil else {
            return 0
        }
        var maxD = 0
        _ = depth(root, &maxD)
        return maxD
    }
```

[二叉树刷题](https://zhuanlan.zhihu.com/p/136758152)

[二叉树面试](https://juejin.cn/post/6844903669326954504)


