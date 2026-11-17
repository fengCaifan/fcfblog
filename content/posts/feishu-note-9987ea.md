---
title: "题7：重建二叉树"
date: "2023-08-12"
category: "算法与数据结构"
tags: ["网络与安全","Go","剑指Offer","算法与数据结构"]
description: "输入某二叉树的前序遍历和中序遍历的结果，请重建该二叉树。假设输入的前序遍历和中序遍历的结果中都不含重复的数字。例如，输入的前序遍历序列{1,2,4,7,3,5,6,8}和中序遍历序列{4,7,2,1,5,3,8,6}，则"
feishu_token: "JPJadRUmao7pLhxEijxcJDdSnxc"
---

# 题7：重建二叉树

> 输入某二叉树的前序遍历和中序遍历的结果，请重建该二叉树。假设输入的前序遍历和中序遍历的结果中都不含重复的数字。例如，输入的前序遍历序列{1,2,4,7,3,5,6,8}和中序遍历序列{4,7,2,1,5,3,8,6}，则重建如图2.6所示的二叉树并输出它的头结点。

#### 解题思路

首先需要了解二叉树的几种遍历特点。前序遍历是中-左-右，中序遍历是左-中-右。而重建二叉树最重要的点就是先找到根节点，然后确定左子树和右子树。而每个左子树和右子树，又是这个逻辑。

这是一个递归的过程。

所以，[递归算法核心笔记](https://bhhbdrz3p9.feishu.cn/docx/CIRVdWJqwoPQQvxLSsEcYIytn7g) 

第一步：明确函数要做什么

首先，根据题目描述，输入的是两个数组，前序数组和中序数组

```swift
func buildTree(_ preorder: [Int], _ inorder: [Int]) -> TreeNode? {
    
}
```

第二步：寻找基线条件

如果数组没有元素，或者两个数组的元素个数不相等，则退出去

```swift
func buildTree(_ preorder: [Int], _ inorder: [Int]) -> TreeNode? {
    guard preorder.count > 0 && preorder.count == inorder.count else {
        return nil
    }
    guard var rootVal = preorder.first else {
        return nil
    }
    
    var root = TreeNode(rootVal)
    return root
}
```

第三步：寻找等价关系

等价关系就是每棵子树的创建，和主树的创建是一样的过程。

```swift
func buildTree(_ preorder: [Int], _ inorder: [Int]) -> TreeNode? {
    guard preorder.count > 0 && preorder.count == inorder.count else {
        return nil
    }
    guard var rootVal = preorder.first else {
        return nil
    }
    
    var root = TreeNode(rootVal)
    var leftPreorder: [Int] = [] // 左子树的前序遍历数组
    var rightPreorder: [Int] = [] // 右子树的前序遍历数组
    var leftInorder: [Int] = [] // 左子树的中序遍历数组
    var rightInorder: [Int] = [] // 右子树的中序遍历数组
        
    // 先用根节点在中序遍历数组中，获取左右子树的中序遍历数组
    var didFindRoot = false
    for item in inorder {
        if item == rootVal {
            didFindRoot = true
            continue
        }
        if didFindRoot {
            rightInorder.append(item)
        } else {
            leftInorder.append(item)
        }
    }

    // 再根据左右中序遍历数组，获取左右子树的前序遍历数组
    for (index, item) in preorder.enumerated() {
        if item == rootVal {
            continue
        }
        if leftPreorder.count < leftInorder.count {
            leftPreorder.append(item)
        } else {
            rightPreorder.append(item)
        }
    }

    root.left = buildTree(leftPreorder, leftInorder)
    root.right = buildTree(rightPreorder, rightInorder)
    return root
}
```

#### 书中最优解

也是和上面一样的解法。


