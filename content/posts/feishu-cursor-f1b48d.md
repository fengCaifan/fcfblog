---
title: "Cursor使用实践"
date: "2025-05-22"
category: "AI 与 Agent"
tags: ["AI Agent","工程效率"]
description: "工具界面： 样式修改：安装Xcode + theme 快捷键 cmd + I : 先选中代码，可以在AI界面提问。打开AI节目 cmd + k : 先选中代码，编辑输入要求。打开当前代码编辑框 cmd + L : 打开A"
feishu_token: "BRwNdR6Twoj9iRxrGpEcOvOsnnd"
---

# Cursor使用实践

**工具界面：**

- 样式修改：安装Xcode + theme

**快捷键**

- cmd + I : 先选中代码，可以在AI界面提问。打开AI节目

- cmd + k : 先选中代码，编辑输入要求。打开当前代码编辑框

- cmd + L : 打开AI界面。打开当前代码编辑框

- tab 键（表格键）：// 后输入要求，按回车键，然后按tab键是否使用生成代码

- 修改后的代码需要command+s保存后，才能同步到Xcode

**模型选择：**

**@类型实践**

1

**rules实践**

rules的本质就是减少沟通次数，用配置来规范沟通

1、创建rules

![图片](/images/feishu/feishu-cursor-f1b48d/KxahbxuoGoEvpQxqAOjcDZqtnjd.png)

![图片](/images/feishu/feishu-cursor-f1b48d/RDwBb2kObokyJUx9OBicoL4fnef.png)

rule的名称，都是小写。

2、rule type

![图片](/images/feishu/feishu-cursor-f1b48d/UymEbeiZBonKWVxCaZ1couHHnLd.png)

- Always：所有对话都遵循的规则。比如使用中文回答。任何模式都会生效

- Auto Attached：会固定文件生效，比如针对.js文件生效，针对.swift生效。（前端项目比较适用）

- Agent Requested：只有在使用Agent时才会生效

- Manual：则需要在聊天框中@对应的mdc规则文件。

通用型rules：

https://github.com/PatrickJS/awesome-cursorrules

自定义rules：

例子：

1、接口规范：

注意要always才能@出来。

![图片](/images/feishu/feishu-cursor-f1b48d/HNRrbe57DoxOb8xXAMlcn7Orn2c.png)

![图片](/images/feishu/feishu-cursor-f1b48d/Eox5b0zXeoXWE3x75NAc3UkWn5d.png)

结果：

![图片](/images/feishu/feishu-cursor-f1b48d/GbuJbgIRNo9hxJxT3OQcwGgUnWb.png)

![图片](/images/feishu/feishu-cursor-f1b48d/EFDmbCWDNooeC6xuiuLc41AvnTg.png)

碰到的问题：

![图片](/images/feishu/feishu-cursor-f1b48d/Z799b80E3ocH6dxPwTecRGmynwe.png)


