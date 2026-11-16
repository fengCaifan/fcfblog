---
title: "常用排序算法的 Swift 实现与优化笔记"
date: '2024-02-18'
category: "数据结构与算法"
description: "整理冒泡排序边界优化、归并排序、随机轴点快速排序与原地堆排序的 Swift 代码实现。"
tags: ["排序算法", "Swift", "快速排序", "归并排序", "堆排序"]
---

## 常见排序算法复杂度对比

| 排序算法 | 平均时间复杂度 | 最坏时间复杂度 | 最好时间复杂度 | 空间复杂度 | 稳定性 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 冒泡排序（Bubble Sort） | O(n²) | O(n²) | O(n) | O(1) | 稳定 |
| 选择排序（Selection Sort） | O(n²) | O(n²) | O(n²) | O(1) | 不稳定 |
| 插入排序（Insertion Sort） | O(n²) | O(n²) | O(n) | O(1) | 稳定 |
| 归并排序（Merge Sort） | O(n log n) | O(n log n) | O(n log n) | O(n) | 稳定 |
| 快速排序（Quick Sort） | O(n log n) | O(n²) | O(n log n) | O(log n) | 不稳定 |
| 堆排序（Heap Sort） | O(n log n) | O(n log n) | O(n log n) | O(1) | 不稳定 |

## 1. 冒泡排序与边界收敛优化

普通冒泡排序每轮两两比较相邻元素；当数组尾部已经局部有序时，可以记录最后一次交换的位置，直接缩小下一轮扫描的上界：

```swift
func bubbleSort(_ nums: inout [Int]) {
    guard nums.count > 1 else { return }
    var end = nums.count - 1
    while end > 0 {
        var sortedIndex = 0
        for begin in 1...end {
            if nums[begin] < nums[begin - 1] {
                nums.swapAt(begin, begin - 1)
                sortedIndex = begin - 1
            }
        }
        end = sortedIndex
    }
}
```

## 2. 归并排序（分治）

归并排序将数组不断二分，然后借助左半区辅助数组将两个有序区间合并：

```swift
class MergeSort {
    private var leftArray = [Int]()

    func sort(_ nums: inout [Int]) {
        guard nums.count > 1 else { return }
        leftArray = Array(repeating: 0, count: nums.count >> 1)
        divide(&nums, begin: 0, end: nums.count)
    }

    private func divide(_ nums: inout [Int], begin: Int, end: Int) {
        if end - begin < 2 { return }
        let mid = (begin + end) >> 1
        divide(&nums, begin: begin, end: mid)
        divide(&nums, begin: mid, end: end)
        merge(&nums, begin: begin, mid: mid, end: end)
    }

    private func merge(_ nums: inout [Int], begin: Int, mid: Int, end: Int) {
        var li = 0, le = mid - begin
        var ri = mid, re = end
        var ai = begin

        for i in li..<le {
            leftArray[i] = nums[begin + i]
        }

        while li < le {
            if ri < re && nums[ri] < leftArray[li] {
                nums[ai] = nums[ri]
                ai += 1
                ri += 1
            } else {
                nums[ai] = leftArray[li]
                ai += 1
                li += 1
            }
        }
    }
}
```

## 3. 快速排序（随机轴点分割）

通过随机选择轴点元素，可以避免在输入数组接近有序时退化为 $O(n^2)$：

```swift
class QuickSort {
    func sort(_ nums: inout [Int]) {
        guard nums.count > 1 else { return }
        quickSort(&nums, begin: 0, end: nums.count)
    }

    private func quickSort(_ nums: inout [Int], begin: Int, end: Int) {
        if end - begin < 2 { return }
        let mid = pivotIndex(&nums, begin: begin, end: end)
        quickSort(&nums, begin: begin, end: mid)
        quickSort(&nums, begin: mid + 1, end: end)
    }

    private func pivotIndex(_ nums: inout [Int], begin: Int, end: Int) -> Int {
        let randomIdx = Int.random(in: begin..<end)
        nums.swapAt(begin, randomIdx)
        let pivot = nums[begin]

        var l = begin
        var r = end - 1

        while l < r {
            while l < r {
                if pivot < nums[r] {
                    r -= 1
                } else {
                    nums[l] = nums[r]
                    l += 1
                    break
                }
            }
            while l < r {
                if pivot > nums[l] {
                    l += 1
                } else {
                    nums[r] = nums[l]
                    r -= 1
                    break
                }
            }
        }
        nums[l] = pivot
        return l
    }
}
```

## 4. 堆排序（原地建堆与下滤）

堆排序先通过自下而上的下滤在 $O(n)$ 时间内原地建堆，再依次将堆顶最大值交换至数组末尾并恢复堆性质：

```swift
class HeapSort {
    private var heapSize = 0

    func sort(_ nums: inout [Int]) {
        heapSize = nums.count
        guard heapSize > 1 else { return }

        for i in stride(from: (heapSize >> 1) - 1, through: 0, by: -1) {
            siftDown(&nums, index: i)
        }

        while heapSize > 1 {
            heapSize -= 1
            nums.swapAt(0, heapSize)
            siftDown(&nums, index: 0)
        }
    }

    private func siftDown(_ nums: inout [Int], index: Int) {
        var idx = index
        let element = nums[idx]
        let half = heapSize >> 1

        while idx < half {
            var childIdx = (idx << 1) + 1
            var child = nums[childIdx]
            let rightIdx = childIdx + 1

            if rightIdx < heapSize && nums[rightIdx] > child {
                childIdx = rightIdx
                child = nums[rightIdx]
            }

            if element >= child { break }
            nums[idx] = child
            idx = childIdx
        }
        nums[idx] = element
    }
}
```
