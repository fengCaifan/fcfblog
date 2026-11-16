---
title: "队列、双端队列与滑动窗口最大值总结"
date: '2023-10-15'
category: "数据结构与算法"
description: "梳理普通队列、双端队列、优先级队列以及单调队列求解滑动窗口最值。"
tags: ["队列", "单调队列", "滑动窗口"]
---

### 队列和栈

#### 队列
##### 队列广度优先遍历模板

伪代码 Java
```
int BFS(Node root, Node target) {
    // 准备一个队列缓存节点
    Queue<Node> queue;
    int step = 0;
    // 根节点入队
    add root to queue;
    // 
    while (queue is not empty) {
        step += 1;
        //迭代队列中已经存在的节点
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            Node cur = the first node in queue;
            return step if cur is target;
            for (Node next : the neighbors of cur) {
                add next to queue;
            }
            remove the first node frome queue;
        }
    }
    return -1;
}
```
