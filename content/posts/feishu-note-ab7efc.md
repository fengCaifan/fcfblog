---
title: "堆"
date: "2022-09-20"
category: "算法与数据结构"
tags: ["算法与数据结构"]
description: "重要性质：任何节点的值总是 =（大顶堆） 或<=（小顶堆）子节点的值 二叉堆 二叉堆的底层一般使用数组实现。元素都是从左到右、从上到下存放 。 索引i的规律： 如果i=0，它是根节点 如果i 0，它的父节点下标是： i "
feishu_token: "doxcnUE8tVtXbtv91pFB0sXSsle"
---

# 堆

重要性质：任何节点的值总是>=（大顶堆） 或<=（小顶堆）子节点的值

#### 二叉堆

**二叉堆的底层一般使用数组实现。元素都是从左到右、从上到下存放**。

##### 索引i的规律：

- 如果i=0，它是根节点

- **如果i>0，它的父节点下标是：(i - 1) / 2**

- 如果2i + 1 <= n - 1， 它的左子节点编号是2i+1，右子节点下标是2i+2

- 如果2i + 1 > n - 1，它无左子节点；如果2i + 2 > n - 1，它无右子节点；

- **第一个非叶子节点下标： size / 2 - 1**

##### 上虑 siftUp（时间复杂度logn）

步骤：

- 循环执行以下操作：
  - 如果node > 父节点： 与父节点交换位置
  - 如果node <= 父节点，或者node没有父节点：退出循环

```swift
// 让index位置的元素上虑
func shiftUp(inout array: [Int], index: Int) {
    let element = array[index]
     while index > 0 { // 非根节点开始
         let parentIndex = (i - 1) >> 1
         let parent = array[parentIndex]
         if element <= parent { return }
         // 交换子父节点
         let temp = array[index]
         array[index] = parent
         array[parentIndex] = temp
         
         index = parentIndex
     }
}

// 优化
func shiftUp1(inout array: [Int], index: Int) {
    let element = array[index]
     while index > 0 {
         let parentIndex = (index - 1) >> 1
         let parent = array[parentIndex]
         if element <= parent { break }
         // 将父元素存储在index位置
         array[index] = parent
         index = parentIndex
     }
     array[index] = element
}
```

eg：添加用上虑

- 将元素添加到末尾，然后进行上虑

```plaintext
func add(element: Int) {
    array[size++] = element
    siftUp(size - 1)
}
```

##### 下虑 siftDown（时间复杂度logn）

步骤

- 循环执行以下操作
  - 如果node < 子节点：与最大节点交换位置
  - 如果node >= 子节点，或者node没有子节点：退出循环

```swift

// 让index中元素进行下虑 大顶堆
func siftDown(inout array: [Int], index: Int, size: Int) {
    let element = array[index]
    let half = size / 2
    // 第一个叶子节点的索引 == 非叶子节点的数量
    // index < 第一个叶子节点的索引
    // 必须保证index位置是非叶子节点
    while index < half { // index必须是非叶子节点(小于第一个叶子节点的索引)
        // index的节点有两种情况：
        // 1、只有左子节点
        // 2、同时有左右子节点

        // 默认为左子节点索引
        let childIndex = index * 2 + 1
        let child = array[childIndex]
        // 获取最大子节点(右子节点存在，且比左子节点大)
        let rightIndx = childIndex + 1
        if rightIndx < size && array[rightIndex] > child {
            childIndex = rightIndx
            child = array[rightIndex]
        }
        
        // 当前元素比左右最大子节点都要大，就不用交换，否则就交换
        if element >= child { break }
        
        // 将子节点存放在index位置
        array[index] = child
        // 重新设置index
        index = childIndex
    }
    array[index] = element
}
```

eg: 删除使用下虑

- 用最后一个节点覆盖根节点，删除最后一个节点。然后进行下虑

```swift

func remove() -> Int? {
    let root = nil
    if array.count > 0 {
        root = array[0]
         array[0] = array[size - 1]
         array[size - 1] = nil
         siftDown(0)
    }
    return root
}
```

eg：替换使用下虑

- 用新元素替换堆顶元素，然后进行下虑

```swift
// 用替换堆顶元素，返回堆顶元素
func replace(newElement: Int) -> Int? {
    var root = nil
    if array.count == 0 {
        array.append(newElement)
    } else {
        root = array[0]
        array[0] = newElement
        siftDown(0)
    }
    return root
}
```

#### 批量建堆

- 上虑建堆，时间复杂度是O(nlogn）

- 下虑建堆，时间复杂度是O(n)

所以批量建堆使用下虑：

```swift
struct Heap {
    // 批量建小顶堆
    func buildHeap(array: [Int]) {
        // 下虑，小顶堆
        func shiftDown(array: inout [Int], index: Int, size: Int) {
            let element = array[index]
            var index = index
            while index < size / 2 { // size / 2是非叶子节点的个数，所以index要小于count
                var childIndex = index * 2 + 1
                var child = array[childIndex]
                let rightIndx = childIndex + 1
                // 小顶堆，取左右最小的子节点在上面
                if rightIndx < size && array[rightIndx] < child {
                    childIndex = rightIndx
                    child = array[rightIndx]
                }
                
                // 当前节点比子节点中最小的还要小，就不用交换，否则就要交换，来满足二叉堆的性质
                guard element > child else {
                    break
                }
                
                array[index] = child
                index = childIndex
            }
            array[index] = element
        }
        
        guard array.count > 0 else { return }
        var array = array
        var index = array.count / 2 - 1 // 从第一个非叶子节点开始下虑建堆
        while index >= 0 {
            shiftDown(array: &array, index: index, size: array.count)
            index -= 1
        }
        print(array)
    }
}

Heap().buildHeap(array: [1,4,5,1,3,4,2,6])
```


