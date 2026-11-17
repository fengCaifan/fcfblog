---
title: "Go语言03——函数式编程"
date: "2022-12-07"
category: "后端与 Go"
tags: ["Go"]
description: "Map Reduce 处理集合元素 Map Reduce实现。 Map Reduce是两部分：Map和Reduce。Map的作用是指映射成一个字典切片，Reduce意思是将多个元素通过迭代处理，减少为一个。 Map映射。"
feishu_token: "XYpzdOwV8or44sxq0ZRcR9ywnzg"
---

# Go语言03——函数式编程

## Map - Reduce

- 处理集合元素

```go
package main

import (
    "fmt"
    "strconv"
)

func ageSum(users map[string]string) int {
    var sum int
    for _, user := range users {
        num, _ := strconv.Atoi(user["age"])
        sum += num
    }
    return sum
}

func main() {
    var users = []map[string]string {
        {
            "name": "李四",
            "age": "22",
        },
        {
            "name": "张三",
            "age": "18",
        },
        {
            "name": "王五",
            "age": "20",
        },
    }
    fmt.Printf("年龄累加：%d\n", ageSum(users))
}
```

- Map-Reduce实现。
  - Map-Reduce是两部分：Map和Reduce。Map的作用是指映射成一个字典切片，Reduce意思是将多个元素通过迭代处理，减少为一个。
    - Map映射。（TODO 支持泛型）
```go
func mapToString(items []map[string]string, f func(map[string]string) string) []string {
    newSlice := make([]string, len(items))
    for _, item := range items {
        newSlice = append(newSlice,f(item))
    }
        return newSlice
}
```

    - Reduce求和。（TODO 支持泛型）
```go
func fieldSum(items []string, f func(string) int) int {
    var sum int
    for _, item := range items {
        sum += f(item)
    }
    return sum
}
```

    - Filter函数，筛选
```go
func itemsFilter(items []map[string]string, f func(map[string]string) bool) []map[string]string {
    newSlice := make([]map[string]string, len(items))
    for _, item := range items {
        if f(item) {
            newSlice = append(newSlice, item)
        }
    }
    return newSlice
}
```

    - 结合
```go
package main

import (
    "fmt"
    "strconv"
)

func main() {
        var users = []map[string]string {
        {
            "name": "李四",
            "age": "22",
        },
        {
            "name": "张三",
            "age": "18",
        },
        {
            "name": "王五",
            "age": "20",
        },
    }
    
    // 筛选符合条件的用户
    validUsers := itemsFilter(users, func(user map[string]string) bool {
        age, ok := user[age]
        if !ok {
            return false
        }
        
        intAge, err := strconv.Atoi(age)
        if err != nil {
            return false
        }
        
        if intAge < 18 || intAge > 35 {
            return false
        }
        return true
    })
    
    // 提取年龄
    ageSlice := mapToString(users, func(user map[string]string) string {
        return user["age"]
    })
    
    // 累加
    sum := fieldSum(ageSlice, func(age string)int {
        intAge, _ = strconv.Atoi(age)
        return intAge
    })
    fmt.Printf("年龄累加：%d\n", sum)
}
```

## 管道技术实现函数流式调用

- TODO [Go 流式编程](https://geekr.dev/posts/go-func-chaining-with-pipeline)


