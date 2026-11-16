---
title: "大模型结构化输出（Structured Outputs）与 JSON Schema 约束"
date: '2026-09-20'
category: "AI 与大模型"
description: "对比普通提示词与 JSON Schema strict 模式，确保模型返回可被代码稳定解析的结构化数据。"
tags: ["Structured Outputs", "JSON Schema", "LLM"]
---

## 目标

学习通过 `instructions` 约束模型的角色、语言和输出格式，并理解“自然语言格式约束”与“结构化 JSON 输出”的区别。

---

## 1. `instructions` 是什么

`instructions` 是给模型的高优先级说明，用来规定：

```text
你是谁
如何回答
使用什么语言
输出成什么格式
哪些内容不要输出
```

基础请求中的 `input` 是用户的问题：

```json
{
  "model": "gbu-aws-gpt-5.6-terra",
  "input": "什么是 Agent 开发？"
}
```

加入 `instructions` 后：

```json
{
  "model": "gbu-aws-gpt-5.6-terra",
  "instructions": "你是一位面向 iOS 工程师的 AI 开发导师。使用中文、简洁回答。",
  "input": "什么是 Agent 开发？"
}
```

---

## 2. 练习一：Markdown 格式输出

要求模型固定输出标题、定义和要点：

```bash
curl "https://gw.gburouter.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --data-raw '{
    "model": "gbu-aws-gpt-5.6-terra",
    "instructions": "你是一位面向 iOS 工程师的 AI 开发导师。使用中文回答；严格使用 Markdown 输出，包含且仅包含以下三部分：## 一句话定义、## 核心组成、## iOS 开发者示例。每部分不超过 3 条。",
    "input": "什么是 Agent 开发？"
  }'
```

观察点：

```text
模型是否遵循了三个标题？
每部分是否不超过 3 条？
回答是否变得更短、更适合展示？
```

这种方式适用于给人阅读的内容，例如：问答页面、周报、技术说明、故障分析报告。

---

## 3. 练习二：要求输出 JSON

如果模型输出要交给程序继续处理，JSON 比 Markdown 更合适。

```bash
curl "https://gw.gburouter.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --data-raw '{
    "model": "gbu-aws-gpt-5.6-terra",
    "instructions": "你是一个 JSON 生成器。只输出一个合法 JSON 对象，不要输出 Markdown、解释文字或代码围栏。JSON 必须包含 definition（字符串）、components（字符串数组）和 ios_example（字符串）三个字段。",
    "input": "总结什么是 Agent 开发。"
  }'
```

期望的模型文本示例：

```json
{
  "definition": "Agent 是能够结合模型与外部工具完成任务的应用程序。",
  "components": ["LLM", "工具调用", "任务循环"],
  "ios_example": "让助手检索崩溃日志并生成初步排查结论。"
}
```

注意：这只是通过 Prompt 要求模型输出 JSON，**不保证每一次都严格合法**。模型仍可能：

```text
多输出一句解释
输出 Markdown 代码围栏
字段缺失或类型不正确
```

因此，程序接收后仍要进行 JSON 解析和校验。

---

## 4. 程序如何读取 JSON 文本

Responses API 中，先取得最终文本：

```text
output
→ message
→ content
→ output_text
→ text
```

若 `text` 预期是 JSON，Node.js 中应进行解析：

```js
const result = JSON.parse(text);
console.log(result.definition);
```

必须处理解析失败：

```js
try {
  const result = JSON.parse(text);
  // 使用 result.definition / result.components / result.ios_example
} catch (error) {
  // 模型没有返回合法 JSON：记录原始文本，提示重试或降级为文本展示
  console.error('JSON 解析失败:', error.message);
}
```

---

## 5. 自然语言约束 vs 严格结构化输出

| 方式 | 做法 | 可靠性 | 适用场景 |
|---|---|---|---|
| Prompt 格式约束 | 在 `instructions` 中要求 Markdown / JSON | 一般，需要程序校验 | 原型、面向用户的文本输出 |
| JSON Schema 结构化输出 | 在 API 中定义字段、类型、必填项 | 更高，依赖网关是否支持 | 程序要稳定读取的业务数据 |

本阶段先掌握第一种。后续会学习 JSON Schema：它能让模型按指定字段和类型返回结果，是 Function Calling 的重要前置知识。

---

## 6. 本节结论

```text
input：用户问什么。
instructions：模型应如何回答。

给人看：通常输出 Markdown。
给程序处理：通常要求输出 JSON，并在程序中 JSON.parse() + 校验。
```

## 我的实践记录

- 执行日期：
- Markdown 格式是否符合要求：
- JSON 是否可被解析：
- 我观察到 instructions 对回答的影响：
- 遇到的问题：
