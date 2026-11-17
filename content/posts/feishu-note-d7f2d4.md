---
title: "算法框架"
date: "2022-08-01"
category: "算法与数据结构"
tags: ["内存管理","算法与数据结构"]
description: "框架思维 数据结构存储方式： 数据结构的基础存储方式就是： 数组（顺序存储）和链表（链式存储） 。其他的结构都是在这基础之上发展而来的。 队列、栈 ：既可以用数组实现也可以用链表实现。用数组实现，需要考虑扩容缩容问题，用"
feishu_token: "doxcnwYoqZzEOl8f1WB6cKtquMf"
---

# 算法框架

### 框架思维

#### 数据结构存储方式：

数据结构的基础存储方式就是：**数组（顺序存储）和链表（链式存储）**。其他的结构都是在这基础之上发展而来的。

- **队列、栈**：既可以用数组实现也可以用链表实现。用数组实现，需要考虑扩容缩容问题，用链表实现，需要更多的内存空间来存储节点指针；

- **图**：邻接表就是链表实现，邻接矩阵就是二维数组。

- **散列表**：拉链法就是使用链表实现，线性探索法则使用数组；

- **树**：用数组实现就是堆，链表实现则就是普通的树。堆是一个完全二叉树。在树的基础上又衍生出了很多特殊结构的树：二叉搜索树、AVL树、红黑树、区间树、B树等。

数组随机访问的时间复杂度是O(1)，但扩容、插入、删除都是O(N)。

链表插入删除很方便，时间复杂度O(1)，但是不能随机访问，另外需要额外的空间来存储前向后向指针，会销耗更多存储空间。

#### 数据结构的基本操作：

任何数据结构的基本操作无非就是：遍历+访问。再具体一点就是：增删改查；

- 数组遍历框架：

```plaintext
void traverse(int[] arr) {
    for(int i = 0; i < arr.length; i++) {
        // 迭代访问
    }
}
```

- 链表的遍历结构：

```plaintext
class ListNode {
    int val;
    ListNode next;
}

// 迭代访问
void traverse(ListNode head) {
    ListNode p = head;
    while ( p != null) {
        ... 
        p = p.next
    }
}

// 递归访问
void traverse(ListNode head) {
    if head == null {
        return
    }
    traverse(head.next)
}
```

- 二叉树遍历框架

```plaintext
class TreeNode {
    int val;
    TreeNode left, right;
}

// 递归访问
void traverse(TreeNode root) {
    // 前序位置
    traverse(root.left);
    // 中序位置
    traverse(root.right);
    // 后序位置
}
```

- N叉树的遍历框架

```plaintext
class TreeNode {
    int val;
    TreeNode[] children;
}

void traverse(TreeNode root) {
    for(TreeNode child in root.children) {
        traverse(child);
    }
}
```

#### 算法刷题指南

- 先学习数组、链表这种基本数据结构和算法。比如单链表翻转、前缀和数组、二分搜索等；

- 刷二叉树。不要着急刷回溯、动态规划这类算法；

### 算法心得

#### 数组、单链表系列算法

- 双指针：

- 二分搜索

- 滑动窗口

- 前缀和技巧

- 差分数组技巧

#### 二叉树系列算法

- 回溯算法

- 动态规划

- 分治算法

- BFS


