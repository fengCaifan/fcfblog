---
title: "题20—— 表示数值的字符串"
date: "2023-11-12"
category: "算法与数据结构"
tags: ["网络与安全","剑指Offer"]
description: "LCR 138. 有效数字 https://leetcode.cn/problems/biao shi shu zhi de zi fu chuan lcof/description/ 有效数字 （按顺序）可以分成以下几"
feishu_token: "IhW9dazv6oCCm5xgVRacpKTlnnd"
---

# 题20—— 表示数值的字符串

[LCR 138. 有效数字](https://leetcode.cn/problems/biao-shi-shu-zhi-de-zi-fu-chuan-lcof/description/)

> **有效数字**（按顺序）可以分成以下几个部分：
> 若干空格
> 一个 **小数** 或者 **整数**
> （可选）一个 `'e'` 或 `'E'` ，后面跟着一个 **整数**
> 若干空格
> **小数**（按顺序）可以分成以下几个部分：
> （可选）一个符号字符（`'+'` 或 `'-'`）
> 下述格式之一：
> **整数**（按顺序）可以分成以下几个部分：
> （可选）一个符号字符（`'+'` 或 `'-'`）
> 至少一位数字
> 部分有效数字列举如下：`["2", "0089", "-0.1", "+3.14", "4.", "-.9", "2e10", "-90E3", "3e+7", "+6e-1", "53.5e93", "-123.456e789"]`
> 部分无效数字列举如下：`["abc", "1a", "1e", "e3", "99e2.5", "--6", "-+3", "95a54e53"]`
> 给你一个字符串 `s` ，如果 `s` 是一个 **有效数字** ，请返回 `true` 。

#### 自我解法

没什么技巧，硬解，各种条件补丁。

主要的问题是，各种测试用例，比如

- 前后空格" 1 ", 需要去除空格。需要记住api挺难：trimmingCharacters(in: .whitespaces)

- 带小数点"."：小数点前面可以没有数字

- 带"e\E"：如果是小数，e只能在小数部分

```swift
class Solution {
    func validNumber(_ s: String) -> Bool {
        // 是否完全是合法数字
        func validIntegertNum(_ chars: [Character]) -> Bool {
            guard !chars.isEmpty else {
                return false
            }
            let baseNumStr = "0123456789"
            for char in chars {
                if baseNumStr.contains(String(char)) {
                    continue
                } else {
                    return false
                }
            }
            return true
        }

        // 将带e、E的前后进行处理
        func vaildBigNums(_ s: String) -> Bool {
            guard !s.isEmpty else {
                return false
            }
            if !s.contains("e") && !s.contains("E") {
               return validIntegertNum(Array(s))
            }
            let components = s.components(separatedBy: CharacterSet(charactersIn: "eE"))
            // e 前后必须有值, 但是e右侧的值可以带"+"、"-"
            if components.count == 2 {
                let firstS = components[0]
                let firstChars = Array(firstS)
                guard validIntegertNum(firstChars) else {
                    return false
                }

                let secondS = components[1]
                let secondChars = Array(secondS)
                return validIntegertNum(benginCheck(secondChars))
            } else {
                return false
            }
        }

        // 处理包含小数点的数值，有且只允许有一个
        func validDecimalNums(_ relChars: [Character]) -> Bool {
            guard !s.isEmpty else {
                return false
            }
            let newS = String(relChars)
            let components = newS.components(separatedBy: ".")
            if components.count == 1 {
                // 没有整数
                let first = components[0]
                return vaildBigNums(first)
            } else if components.count == 2 {
                // 整数和小数部分，但是两个部分，只能有一个e
                // （123. or 12）或没有整数部分（.123）
                let first = components[0]
                var second = components[1]
                if first == "" {
                    // 纯小数 .123
                    return vaildBigNums(second)
                }
                // 整数和小数部分都有数值
                // 则 整数部分不能有e, 4e3.也不行
                if first.contains("e") || first.contains("E") {
                    return false
                }
                if second == "" {
                    // 纯整数 123.
                    return vaildBigNums(first)
                }

                // 小数部分可以有e，但是如果是.e或.E的情况，则先把e、E剔除
                var secA = Array(second)
                if let secFirst = secA.first, 
                    secFirst == "e" || secFirst == "E" {
                   secA = Array(secA[1...])
                   second = String(secA)
                   // 无须再处理e了，直接判断
                   return validIntegertNum(Array(first)) && validIntegertNum(benginCheck(secA))
                }
                return vaildBigNums(first) &&
                     vaildBigNums(second)
            } else {
                return false
            }
            return false
        }

        // 包含正负值的判断, 返回移除了"+"、"-"的新结果
        func benginCheck(_ chars: [Character]) -> [Character] {
            if let firstChar = chars.first, 
                firstChar == "+" || firstChar == "-" {
                return Array(chars[1...])
            } else {
                return chars
            }
        }

        let newS = s.trimmingCharacters(in: .whitespaces)
        guard !newS.isEmpty, 
            newS != ".", 
            newS != "e", 
            newS != "E" else {
            return false
        }
        let chars = Array(newS)
        return validDecimalNums(benginCheck(chars))
    }
}
```

#### 书中题解

将数值分成几部分：A[.[B]][e|EC]或者.B[e|EC]，其中A和B都是整数(可以有正负号，也可以没有)，B是一个无符号整数。然后按字符串下表，一个字符一个字符判断。

```swift
class Solution {
    func validNumber(_ s: String) -> Bool {
        // 是否可以转成无符号整数，从当前位置一直查询到非整数位置位置。再返回去判断。
        func scanUnsignedInteger(_ sArr: [Character], _ index: inout Int) -> Bool {
            guard !sArr.isEmpty else {
                return false
            }
            let before = index
            let baseStr = "0123456789"
            while index < sArr.count, baseStr.contains(String(sArr[index])) {
                index += 1
            }
            return index > before
        }
        // 是否可以转成整数, 返回（是否能转成整数，当前位置下标）
        func scanInteger(_ sArr: [Character], _ index: inout Int) -> Bool {
            if index < sArr.count {
                if sArr[index] == "+" || sArr[index] == "-" {
                    index += 1
                }
                return scanUnsignedInteger(sArr, &index)
            } else {
                return false
            }
        }
        guard !s.isEmpty else {
            return false
        }
        let newS = s.trimmingCharacters(in: .whitespaces)
        var sArr = Array(newS)
        var index = 0
        var numeric = scanInteger(sArr, &index)
        print("numeric:\(numeric), index: \(index)")
        if index < sArr.count,
            sArr[index] == "." {
            index += 1
            numeric = scanUnsignedInteger(sArr, &index) || numeric
        }
        if index < sArr.count,
            sArr[index] == "e" || sArr[index] == "E" {
            index += 1
            numeric = numeric && scanInteger(sArr, &index)
        }
        return numeric && index == sArr.count
    }
}
```


