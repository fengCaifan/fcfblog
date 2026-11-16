---
title: "大模型 API 基础调用与 Responses 接口实验笔记"
date: '2026-09-06'
category: "AI 与大模型"
description: "使用原生 HTTP 请求调用大模型 Responses 接口，理解角色消息结构与 Token 统计。"
tags: ["LLM", "OpenAI API", "Python"]
---

## 本节目标

通过 HTTP 请求调用模型，并能从响应中找到最终回答和 Token 用量。

---

## 1. 调用的接口

```text
POST https://gw.gburouter.com/v1/responses
```

请求需要：

| 内容 | 作用 |
|---|---|
| `Content-Type: application/json` | 声明请求体为 JSON |
| `Authorization: Bearer ...` | 使用 API Key 鉴权 |
| `model` | 指定本次调用的模型 |
| `input` | 提交给模型的问题 |

---

## 2. 最小请求

```bash
curl "https://gw.gburouter.com/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gbu-aws-gpt-5.6-terra",
    "input": "什么是 Agent 开发？"
  }'
```

安全要求：

```text
API Key 不写进命令、代码、笔记、截图或 Git。
使用环境变量：$OPENAI_API_KEY。
```

---

## 3. 请求体说明

```json
{
  "model": "gbu-aws-gpt-5.6-terra",
  "input": "什么是 Agent 开发？"
}
```

| 字段 | 含义 |
|---|---|
| `model` | 本次调用使用的模型 |
| `input` | 用户输入 |

本次请求没有设置 `instructions`、`tools`、多轮上下文或流式输出，因此它只是一次普通的单轮模型调用，还不是 Agent。

---

## 4. 响应中重点看什么

成功响应的核心字段如下：

```json
{
  "object": "response",
  "status": "completed",
  "error": null,
  "model": "gbu-aws-gpt-5.6-terra",
  "output": [
    {
      "type": "message",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "模型最终回答"
        }
      ]
    }
  ],
  "usage": {
    "input_tokens": 12,
    "output_tokens": 1713,
    "total_tokens": 1725
  }
}
```

### 是否成功

```json
"status": "completed"
"error": null
```

同时出现时，表示这次请求已成功完成。

### 最终回答在哪里

读取路径：

```text
output
→ type 为 message 的项
→ content
→ type 为 output_text 的项
→ text
```

也就是：

```text
output[].content[].text
```

`output` 中可能还出现：

```json
{ "type": "reasoning" }
```

它代表模型的推理相关输出。本次返回中含有加密/脱敏内容，不需要解析；面向用户展示时只取 `output_text` 的 `text`。

### Token 用量在哪里

```json
"usage": {
  "input_tokens": 12,
  "output_tokens": 1713,
  "total_tokens": 1725
}
```

| 字段 | 含义 |
|---|---|
| `input_tokens` | 发送给模型的内容所占 Token 数 |
| `output_tokens` | 模型生成内容所占 Token 数 |
| `total_tokens` | 输入与输出 Token 总数 |

本次输入很短、输出很长，所以输入为 12 Token，输出为 1713 Token。

---

## 5. 本次结论

```text
请求：POST /v1/responses
输入：model + input
成功判断：status = completed 且 error = null
最终回答：output 中 output_text 的 text
Token 用量：usage
```

下一步：为请求增加 `instructions`，理解它如何约束模型的角色、语言和输出格式；随后学习 `tools` 与 Function Calling。
