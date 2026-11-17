---
title: "Code Review Check List"
date: "2024-04-23"
category: "工程效率与工具"
tags: ["Swift"]
description: "开发过程中尽量遵循SOLID原则、迪米特原则（最少知道）、KISS原则等设计原则。 让写出的代码更加高内聚低耦合、易读、易维护。 还有一个值得强调的原则是“最小惊奇原则”，尽量不要用不符合常规的方式或方法写代码，这样会容"
feishu_token: "EC9ddTcQUo7mYQxNVdmcXZB9nmh"
---

# Code Review Check List

### **开发过程中尽量遵循SOLID原则、迪米特原则（最少知道）、KISS原则等设计原则。**

让写出的代码更加高内聚低耦合、易读、易维护。

还有一个值得强调的原则是“最小惊奇原则”，尽量不要用不符合常规的方式或方法写代码，这样会容易误导人，可能成为隐式陷阱。

下面是Review时可以作为checklist，慢慢补充

### **1 权限**

在类中写方法或属性时，默认添加private。

尽量遵循最少知道原则，避免以后不了解逻辑的同学滥用对外暴露的接口。

如果需要对外暴露且只读，使用private(set) 或者 let（更具属性是否读写来定）

### **2 命名**

详情请参考Swift代码规范，这里只说下项目中统一约定。

- 根据上下文设置最佳名称，不要写多余的前后缀。如：

```objc
public class UIColor {
  public class var red: UIColor {                // 推荐
    // ...
  }
}
public class UIColor {
  public class var redColor: UIColor {           // 不推荐，因为已经是表示颜色了，不用添加Color这个后缀
    // ...
  }
}
```

还有一些enum的case命名，也一定不要天添加多余的前后缀，直名其意即可。

- 项目约定的常用命名方式：
  - SnpKit的自动布局代码块变量，统一使用make
  - 变量if或guard解包, 统一使用如下方式，临时变量和变量名一样：
    - guard let varName = varName else { return }
    - if let varName = varName else { return }
    - if let varName esle { return }

### **3 函数 **

- 注意函数职责单一

如果函数分支逻辑过多或逻辑过于复杂，则将函数进行功能拆分，拆成更细的功能单元，而原来的函数用于聚合、

这样带来的好处是，可读性好，也可以促进代码重用。

swiftlint有圈复杂度提示，过高的圈复杂度就需要多斟酌下代码逻辑了。

- 合理使用参数名和参数描述。
  - 建议：多看苹果官方库的swift的函数命名方式。

- 函数定义过长，将参数名换行排列。

- 函数参数不要使用过长的元组，可以使用struct封装，用参数名明确定义。

- 函数的参数只能一个方向展示：水平或垂直；

### **4 类**

- 组合优于继承，优先使用组合。对后期代码维护、功能扩展、代码复用有益处。

- 在写类时，除了需要继承官方库的类，其他情况首选struct。

- 写新类，默认不要继承NSObject。在Swift中继承NSObject不是必须的。

- 写业务类默认不支持继承（可以使用final前缀修饰类名）。类属性也不要使用class, 统一使用static。后期可以按需再去修改，但出现修改的情况很少。

- 禁止使用Xib/Storyboard文件来开发。开发的人爽了，但是后期维护就很麻烦，灵活性和复用性不强。

### **5 日志的使用**

> 详情请看：[TPCmdLog日志](https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/pKzJfZczuc/cmlXUWMvnp/2K-1Ew9LzKueP3)

- 日常复杂逻辑记得使用补充日志（TPCmdLog）。

### **6 元组过长警告**

之后写代码不要用过长的元组，过长就需要用struct表示，使用变量名明确每个参数的意思

### **7 回调返回值**

completion中的的返回值 如果有失败和成功以及error信息等参数的话，最好使用Result来当参数，不要写（_ isSuccess: Bool， error: Error?）这种不够明确是否成功还是失败。

### **8 UI相关**

- 禁止使用xib和storyboard。

- UI属性的创建，如无必要则全部使用lazy属性声明，不要使用let声明，尽量将字view的初始化延后。同时主要在使用let 声明的view初始化块中会导致selector在某些场景下无法响应：如下closeButtonAction在某些情况下会无法响应

- 

### **9 网络**

#### **10 条件判断换行**

- if 后面多个条件的时候需要换行写，不要写在一行中，防止case遗漏


