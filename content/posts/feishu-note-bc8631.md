---
title: "迭代器模式"
date: "2022-09-03"
category: "工程架构"
tags: ["Swift","Objective-C","设计模式","算法与数据结构"]
description: "迭代器就是我们通常代码当中的迭代遍历的意思。像swift数组、字典，都可以直接使用for in来遍历整个集合，这就是使用了迭代器模式来实现的。像数组和字典都可以直接取到first和last，这同样也是迭代器封装的结果。 "
feishu_token: "doxcnsXo54BCESPcXKoxDRGBqtb"
---

# 迭代器模式

迭代器就是我们通常代码当中的迭代遍历的意思。像swift数组、字典，都可以直接使用for-in来遍历整个集合，这就是使用了迭代器模式来实现的。像数组和字典都可以直接取到first和last，这同样也是迭代器封装的结果。

举个🌰：二叉树的前中后序遍历

```swift
class Tree<T> {
    var value: T
    var left: Tree<T>?
    var right: Tree<T>?
    
    init(_ value: T) {
        self.value = value
    }
    
    typealias Block = (T) -> ()
    
    enum IteraionType {
        case inOrder
        case preOrder
        case postOrder
    }
    
    func iterator(_ type: IteraionType) -> AnyIterator<T> {
        var item = [T]()
        switch type {
        case .inOrder:
            inOrder { item.append($0) }
        case .preOrder:
            preOrder { item.append($0) }
        case .postOrder:
            postOrder { item.append($0) }
        }
        
        return AnyIterator(item.makeIterator())
    }
    
    private func inOrder(_ body: Block) {
        left?.inOrder(body)
        body(value)
        right?.inOrder(body)
    }
    
    private func preOrder(_ body: Block) {
        body(value)
        left?.preOrder(body)
        right?.preOrder(body)
    }
    
    private func postOrder(_ body: Block) {
        left?.postOrder(body)
        right?.postOrder(body)
        body(value)
    }
}
 
func clientCode<T>(iterator: AnyIterator<T>) {
    while case let item? = iterator.next() {
        print(item)
    }
}
 
let tree = Tree(1)
tree.left = Tree(2)
tree.right = Tree(3)
 
print("Tree traversal: Inorder")
clientCode(iterator: tree.iterator(.inOrder))
 
print("\nTree traversal: Preorder")
clientCode(iterator: tree.iterator(.preOrder))
 
print("\nTree traversal: Postorder")
clientCode(iterator: tree.iterator(.postOrder))
```


