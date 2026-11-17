---
title: "大模型应用开发基础02：大模型调用"
date: "2026-11-04"
category: "AI 与 Agent"
tags: ["AI Agent","工程效率"]
description: "大模型调用： 首先大模型是无法在私人电脑上运行的。普通人只能通过API与厂商的模型对话。但是与大模型对话的流程特别繁琐不是普调的拼接url等就可以完成。于是厂商提供了SDK。 图片 /images/feishu/feis"
feishu_token: "JqgedTz87odY8yx2j39ctBtGnig"
---

# 大模型应用开发基础02：大模型调用

### 大模型调用：

首先大模型是无法在私人电脑上运行的。普通人只能通过API与厂商的模型对话。但是与大模型对话的流程特别繁琐不是普调的拼接url等就可以完成。于是厂商提供了SDK。

![图片](/images/feishu/feishu-note-20b30c/KTIhb6kLloPZxMxW2XBcfVS9n0d.png)

- **API Key与基础配置**
  - API Key：是厂商的访问密钥，每次请求都要带上它，服务验证通过才会响应。
    - 通常长这样：sk-xxxxxxxxxxxxxxxxx
    - 所以API Key 千万不能泄漏，否则泄漏了，费用飙升。最好不要随git提交到代码库。最好的做法就是放到环境变量中，然后通过环境变量读取。api_key = os.environ["OPENAI_API_KEY"]
  - 基础地址：base_url
  - 模型名称：model，比如gpt-5.6、qwen3.8-max

- **请求与响应结构：**
  下面这种格式是 OpenAI的Chat Completions API（对话补全接口）

  - **请求体**：
```json
{
    "model": "gpt-5.6",
    "messages": [
        {
            "role": "user", // 角色
            "content": "xxxx" // 内容
        }
    ]
}
```

    - 这里role一般有3种：
      - System：系统提示词：给模型设定“人设”和规则的。是强烈建议，不是强制约束。
      - User：用户消息。用户说的话，真正的问题或指令
      - Assistant：模型自己的回复
    - 顺序与规则
      - 最重要的约束放到System，把最具体的要求放到User消息末尾
      - 
  - **响应体**：
```json
{
    "choices": [
        {
            "message": {
                "role": "assistant", // 助手角色
                 "content": "API 是程序之间约定好的通信接口" // 模型回答一般都是取choices[0].message.content
             },
            "finish_reson": "stop" // 结束原因
        }
    ],
    "usage": {
        "prompt_tokens": 15, // 输入花销
        "completion_tokens": 12, //输出花销
        "total_tokens": 27
    }
}
```

  还有一种OpenAI的Responses API，它是使用input和output来表示输入输出的

```json
输入
{
    "model": "gpt-5.6",
    "input": "xxxx"
}

输出
{
    "output": [
        {
            "type": "message",
            "role": "assistant", // 助手角色
            "content": [
               {"type":"output_test", "text":"xxxx"}
            ]
        }
    ],
    "usage": {
        "prompt_tokens": 15, // 输入花销
        "completion_tokens": 12, //输出花销
        "total_tokens": 27
    }
}
```

  真实案例 eg: 

```json
 curl "baseUrl/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxx" \
  --data-raw '{
    "model": "gbu-aws-gpt-5.6-terra",
    "input": "什么是 Agent 开发？"
  }'

{
    "id":"resp_4pxkYUNunQvldQTYBs8NS28D7krl_IHB3q_mtM81DMo-Pa9e07epMD_sinszvjA6yHFJBDZPoaKwZPdWRsCV3DOJdMrhEVCB_A8F1yXPBap2JGu-51CuuoD7u2ocEzVN0h-psVc8dTWZs5LzzngpPfdEHWQQcxuHH3jwsDW37u47zoWmgqySnw5ofENGpwHmarKOqp2sRuSQlY1cPpgotDzudyAhN_gra-7a3aKLB-jgDFvH0VubyYWVTBu-qPt8sUWAK6gI_ieNooTj5CwwGqtNZnsqiX4mz7qJ1QZoWwvnHaZFczneVQrYr1xoIeuWtPZ7XOv1NrEN2ardR-m87IJ17xBXi9WY7y05iF9Hzz9cls0eqen8Jthwm9F6E4BxAhANEru3q99BHej20vMR6rDOqh6LVY_ucXjn",
    "created_at":1792668095,
    "error":null,
    "incomplete_details":null,
    "instructions":null,
    "metadata":{},
    "model":"gbu-aws-gpt-5.6-terra",
    "object":"response",
    "output":[
        {
            "type":"reasoning",
            "id":"rs_d1df6827-e4d1-4e62-a9fd-fac1cbbf66b1",
            "status":"completed",
            "role":"assistant",
            "content":[],
            "phase":null,
            "encrypted_content":"[{\"type\":\"redacted_thinking\",\"data\":\"xxxx=\"}]"
        }, {
            "type":"message",
            "id":"msg_2790c76c-fdb0-4f95-ac33-f285a958755f",
            "status":"completed",
            "role":"assistant",
            "content":[{
                    "type":"output_text",
                    "text":"**Agent 开发**，通常指开发“智能代理（AI Agent）”系统：让 AI 不只是回答问题，而是能够**理解目标、规划步骤、调用工具、执行任务、根据结果继续调整**。\n\n简单说：\n\n- 普通聊天机器人：你问一句，它答一句。\n- AI Agent：你给它一个目标，它可以自己拆解任务并行动。\n\n例如你说：\n\n> 帮我查找北京下周末适合亲子的酒店，比较价格和评分，整理成表格并发到邮箱。\n\n一个 Agent 可能会：\n\n1. 理解你的需求和约束（北京、下周末、亲子、价格、评分）。\n2. 调用搜索、酒店预订、地图等工具。\n3. 获取并筛选信息。\n4. 生成对比表格。\n5. 调用邮件工具发送结果。\n6. 如果发现信息不足，再向你追问或调整方案。\n\n---\n\n## Agent 开发的核心能力\n\n一个典型 AI Agent 通常包括以下部分：\n\n### 1. 大语言模型（LLM）\n作为 Agent 的“大脑”，用于理解自然语言、推理、生成计划和决策。\n\n常见模型包括：\n\n- GPT 系列\n- Claude\n- Gemini\n- 通义千问\n- DeepSeek\n- Llama 等\n\n### 2. 工具调用（Tool Calling）\nAgent 需要连接外部能力，才能真正“做事”。\n\n常见工具有：\n\n- 搜索引擎\n- 数据库\n- 文件系统\n- 浏览器自动化\n- Python 代码执行\n- 企业内部 API\n- 邮件、日历、IM 消息\n- CRM、ERP、工单系统等\n\n例如，模型决定调用天气 API：\n\n```json\n{\n  \"tool\": \"get_weather\",\n  \"arguments\": {\n    \"city\": \"上海\",\n    \"date\": \"2025-05-01\"\n  }\n}\n```\n\n### 3. 规划与任务拆解（Planning）\n面对复杂任务时，Agent 会把目标拆成多个步骤。\n\n例如“生成销售周报”可以拆成：\n\n1. 从数据库读取销售数据；\n2. 清洗和统计；\n3. 与上周数据比较；\n4. 分析异常原因；\n5. 生成图表和总结；\n6. 输出 Word、Excel 或发送邮件。\n\n### 4. 记忆（Memory）\nAgent 可以保存上下文和历史信息，例如：\n\n- 用户偏好：喜欢简洁报告、默认使用中文；\n- 业务规则：报销金额超过 5000 元需要审批；\n- 历史任务：上次生成过哪些报告；\n- 当前任务状态：已经执行到哪一步。\n\n记忆通常分为：\n\n- **短期记忆**：当前对话或当前任务上下文；\n- **长期记忆**：长期保存的用户信息、知识和经验。\n\n### 5. 知识库与 RAG\nAgent 常需要基于企业内部文档、产品手册、制度规范来回答和行动。\n\n这通常会用到 **RAG（检索增强生成）**：\n\n1. 先从知识库检索相关内容；\n2. 将检索结果交给大模型；\n3. 由模型根据资料生成回答或决策。\n\n例如企业客服 Agent 可以查询：\n\n- 产品说明书；\n- 售后政策；\n- 订单信息；\n- 常见问题库。\n\n### 6. 工作流与执行控制\n实际生产环境中，Agent 往往不能完全“自由发挥”，需要规定流程、权限和审批。\n\n例如：\n\n```text\n用户提交报销\n  ↓\nAgent 提取发票信息\n  ↓\n检查报销规则\n  ↓\n金额小于 5000：自动提交\n金额大于等于 5000：转人工审批\n  ↓\n通知申请人\n```\n\n这类系统通常结合：\n\n- 工作流引擎；\n- 状态机；\n- 人工审核；\n- 权限控制；\n- 日志与监控。\n\n---\n\n## 常见的 Agent 应用场景\n\n### 企业办公助手\n- 自动写周报、会议纪要；\n- 整理邮件；\n- 查询企业制度；\n- 创建日程、发送通知；\n- 生成 PPT、Excel、报告。\n\n### 智能客服\n- 回答产品和售后问题；\n- 查询订单、物流、退款状态；\n- 自动创建工单；\n- 识别复杂问题并转人工。\n\n### 数据分析 Agent\n- 用自然语言查询数据库；\n- 自动生成 SQL；\n- 分析经营数据；\n- 制作图表和日报；\n- 发现异常指标。\n\n### 编程 Agent\n- 阅读代码仓库；\n- 编写代码；\n- 修复 Bug；\n- 执行测试；\n- 提交代码或生成 PR。\n\n例如 Cursor、GitHub Copilot、Claude Code 等都带有 Agent 特征。\n\n### 浏览器操作 Agent\n- 自动搜索网页；\n- 填写表单；\n- 下载和整理文件；\n- 采集公开数据；\n- 执行网页上的重复操作。\n\n---\n\n## Agent 开发和传统开发的区别\n\n| 对比项 | 传统软件开发 | Agent 开发 |\n|---|---|---|\n| 程序逻辑 | 开发者预先写死 | 模型可根据上下文动态决策 |\n| 输入方式 | 表单、按钮、固定参数 | 自然语言为主 |\n| 流程 | 相对确定 | 可能动态规划和调整 |\n| 输出 | 固定格式或规则生成 | 更灵活，但存在不确定性 |\n| 风险 | 主要是程序 Bug | 还包括幻觉、误操作、越权调用等 |\n\n因此，Agent 开发不是“把大模型接进来”就结束了，而是要重点处理：\n\n- 工具权限；\n- 输出可靠性；\n- 任务失败重试；\n- 人工审核；\n- 数据安全；\n- 成本和响应速度；\n- 可观测性与日志审计。\n\n---\n\n## 常见 Agent 开发框架和平台\n\n常见技术选择包括：\n\n### 代码框架\n- **LangChain / LangGraph**\n- **LlamaIndex**\n- **AutoGen**\n- **CrewAI**\n- **Semantic Kernel**\n- **OpenAI Agents SDK**\n- **Spring AI**（Java 生态）\n\n### 国内常见平台\n- Dify\n- Coze / 扣子\n- FastGPT\n- RAGFlow\n- 阿里云百炼\n- 腾讯云智能体开发平台等\n\n其中：\n\n- 想快速搭原型，可使用 Dify、Coze 等低代码平台；\n- 想构建复杂、可控的企业级 Agent，通常会用 Python/Java + Agent 框架 + 自有工具和数据库。\n\n---\n\n## 一个最简单的 Agent 逻辑\n\n伪代码可以理解为：\n\n```python\ngoal = \"帮用户查询订单状态并通知用户\"\n\nwhile not task_finished:\n    plan = llm.think(goal, current_context, available_tools)\n\n    action = llm.choose_tool(plan)\n\n    result = execute(action)\n\n    current_context.append(result)\n\n    if need_human_approval(result):\n        ask_human()\n```\n\n核心循环就是：\n\n> 理解目标 → 选择工具 → 执行 → 观察结果 → 再决策\n\n这也常被称为 Agent 的“感知—思考—行动”循环。\n\n---\n\n## 总结\n\nAgent 开发就是构建能够自主完成任务的 AI 系统。它通常由：\n\n> **大模型 + 提示词 + 工具调用 + 知识库 + 记忆 + 工作流 + 权限与监控**\n\n组成。\n\n它的目标不是单纯“让 AI 聊天”，而是让 AI 能够在受控、安全、可靠的条件下，帮助用户完成真实业务任务。",
                    "annotations":[]}],
            "phase":null}],
            "parallel_tool_calls":false,
            "temperature":0.0,
            "tool_choice":"auto",
            "tools":[],
            "top_p":null,
            "max_output_tokens":null,
            "previous_response_id":null,
            "reasoning":null,
            "status":"completed",
            "text":{},
            "truncation":null,
            "usage":{"input_tokens":12,"input_tokens_details":{"audio_tokens":null,"cached_tokens":0,"text_tokens":12,"cache_write_tokens":0},"output_tokens":1713,"output_tokens_details":{"audio_tokens":null,"reasoning_tokens":0,"text_tokens":null},"total_tokens":1725,"cost":null},
            "user":null,
            "store":null
}
```

  还有可能是其他厂商原生的。比如Anthropic就和OpenAI是不一样的。

  - 无状态和记忆？
    - 大模型本身的API是没有记忆的，而使用的时候之所以看起来有记忆，是因为将上一轮的输入和输出又做为输入的一部分重新给到大模型。所以看起来是有记忆的。
      - 所以对话不是越长越好。
      - 上下文过长，会使用**摘要压缩**的方法，先将早期对话压缩成简短摘要。然后在此基础上进行新的对话。
![图片](/images/feishu/feishu-note-20b30c/RiR8bJ06mokXjuxVeBUcGB0JneY.png)

### 从接口层面，如何控制模型输出？

### 结构化输出

- json_object

 就是在response_format加上type约束。它的意思就是会返回合法可解析的JSON Model。

```json

curl "baseUrl/v1/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xx" \
  --data-raw '{
    "model": "gbu-aws-gpt-5.6-terra",
    "instructions": "尽量用中文简洁返回",
    "max_output_tokens": 300,
    "temperature": 0.9,
    "input": "什么是 Agent 开发？",
    # responses格式。如果是completions格式就是"response_format": {"type": "json_object"}
    "text": {
        "format": {
            "type": "json_object"
        }
    }
  }'
```

- **JSON Schema**

Json schema则是制定一份返回规范。字段、类型等。

```json
curl "$OPENAI_BASE_URL/responses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xx" \
  --data-raw '{
    "model": "gbu-aws-gpt-5.6-terra",
    "instructions": "你是面向 iOS 工程师的 Agent 开发导师。用中文回答。",
    "max_output_tokens": 300,
    "temperature": 0.9,
    "input": "什么是 Agent 开发？",
    # 这里的text是指response api的最终文本输出配置
    "text": {
      "format": {
        "type": "json_schema",
        "name": "agent_definition", # 输出阅读名字
        "strict": true, # 必须遵守协议
        "schema": {
          "type": "object", # 最外层必须是对象,
          # 表示最终输出应该像这样：
          #  {
          #    "definition": "...",
          #    "components": ["...", "..."],
          #    "ios_example": "..."
          #  }
          "properties": {
            "definition": {
              "type": "string",
              "description": "一句话定义"
            },
            "components": {
              "type": "array", # 表示是数组
              "items": {
                "type": "string" # 表示数组中每个元素必须是string类型
              },
              "description": "核心组成"
            },
            "ios_example": {
              "type": "string",
              "description": "一个 iOS 研发场景示例"
            }
          },
          # 这里表示这3个字段不允许缺失
          "required": [
            "definition",
            "components",
            "ios_example"
          ],
          "additionalProperties": false # 不允许模型随意加字段
        }
      }
    }
  }'
  
  
  // 输出了结果：
  {"id":"resp_xxx","created_at":1792811321,"error":null,"incomplete_details":null,"instructions":null,"metadata":{},"model":"gbu-aws-gpt-5.6-terra","object":"response","output":[{"type":"reasoning","id":"rs_658584f9-767d-4a47-80b8-c644cf815240","status":"completed","role":"assistant","content":[],"phase":null,"encrypted_content":"[{\"type\":\"redacted_thinking\",\"data\":\"xx==\"}]"},{"type":"message","id":"msg_cbb1537d-6448-41eb-afbf-faacafc992af","status":"completed","role":"assistant","content":[{"type":"output_text","text":"{\"definition\": \"Agent \\u5f00\\u53d1\\u662f\\u6784\\u5efa\\u80fd\\u591f\\u7406\\u89e3\\u76ee\\u6807\\u3001\\u8c03\\u7528\\u5de5\\u5177\\u3001\\u6267\\u884c\\u591a\\u6b65\\u4efb\\u52a1\\u5e76\\u6839\\u636e\\u7ed3\\u679c\\u8c03\\u6574\\u884c\\u52a8\\u7684\\u8f6f\\u4ef6\\u7cfb\\u7edf\\u7684\\u8fc7\\u7a0b\\u3002\", \"components\": [\"\\u6a21\\u578b/\\u63a8\\u7406\\u5c42\\uff1a\\u7406\\u89e3\\u81ea\\u7136\\u8bed\\u8a00\\u3001\\u89c4\\u5212\\u4e0e\\u51b3\\u7b56\", \"\\u5de5\\u5177\\u5c42\\uff1aAPI\\u3001\\u6570\\u636e\\u5e93\\u3001\\u6587\\u4ef6\\u3001\\u641c\\u7d22\\u3001\\u4e1a\\u52a1\\u670d\\u52a1\\u4e0e\\u8bbe\\u5907\\u80fd\\u529b\", \"\\u8bb0\\u5fc6\\u4e0e\\u72b6\\u6001\\uff1a\\u4fdd\\u5b58\\u4e0a\\u4e0b\\u6587\\u3001\\u4efb\\u52a1\\u8fdb\\u5ea6\\u548c\\u7528\\u6237\\u504f\\u597d\", \"\\u7f16\\u6392\\u4e0e\\u5b89\\u5168\\uff1a\\u63a7\\u5236\\u5faa\\u73af\\u3001\\u6743\\u9650\\u3001\\u6821\\u9a8c\\u3001\\u76d1\\u63a7\\u3001\\u91cd\\u8bd5\\u548c\\u4eba\\u5de5\\u786e\\u8ba4\", \"\\u4ea4\\u4e92\\u5c42\\uff1a\\u804a\\u5929\\u754c\\u9762\\u3001\\u8bed\\u97f3\\u6216\\u5e94\\u7528\\u5185\\u5de5\\u4f5c\\u6d41\"], \"ios_example\": \"\\u5728 iOS App \\u4e2d\\u505a\\u201c\\u65c5\\u884c\\u52a9\\u624b\\u201d\\uff1a\\u7528\\u6237\\u8bf4\\u201c\\u5e2e\\u6211\\u89c4\\u5212\\u5468\\u672b\\u53bb\\u676d\\u5dde\\u7684\\u884c\\u7a0b\\u5e76\\u63d0\\u9192\\u6211\\u8ba2\\u9152\\u5e97\\u201d\\u3002Agent \\u5c06\\u9700\\u6c42\\u62c6\\u5206\\u4e3a\\u67e5\\u8be2\\u5929\\u6c14/\\u666f\\u70b9\\u3001\\u8c03\\u7528\\u9152\\u5e97\\u548c\\u5730\\u56fe\\u670d\\u52a1\\u3001\\u751f\\u6210\\u884c\\u7a0b\\uff1b\\u6d89\\u53ca\\u4e0b\\u5355\\u6216\\u65e5\\u5386\\u5199\\u5165\\u65f6\\uff0c\\u901a\\u8fc7 App \\u7684\\u786e\\u8ba4\\u9875\\u8bf7\\u6c42\\u7528\\u6237\\u6388\\u6743\\uff0c\\u518d\\u8c03\\u7528\\u540e\\u7aef\\u6216\\u7cfb\\u7edf API \\u5b8c\\u6210\\u64cd\\u4f5c\\u3002\"}","annotations":[]}],"phase":null}],"parallel_tool_calls":false,"temperature":0.0,"tool_choice":"auto","tools":[],"top_p":null,"max_output_tokens":null,"previous_response_id":null,"reasoning":null,"status":"completed","text":{},"truncation":null,"usage":{"input_tokens":100,"input_tokens_details":{"audio_tokens":null,"cached_tokens":0,"text_tokens":100,"cache_write_tokens":0},"output_tokens":254,"output_tokens_details":{"audio_tokens":null,"reasoning_tokens":0,"text_tokens":null},"total_tokens":354,"cost":null},"user":null,"store":null}
  
  解析后的结果大概是：
{
  "definition": "Agent 开发是构建能够理解目标、调用工具、执行多步任务并根据结果调整行动的软件系统的过程。",
  "components": [
    "模型/推理层：理解自然语言、规划与决策",
    "工具层：API、数据库、文件、搜索、业务服务与设备能力",
    "记忆与状态：保存上下文、任务进度和用户偏好",
    "编排与安全：控制循环、权限、校验、监控、重试和人工确认",
    "交互层：聊天界面、语音或应用内工作流"
  ],
  "ios_example": "在 iOS App 中做“旅行助手”……"
}
```

将上面的curl改造成python脚本

```json
# 标准库：无需 pip install。
import json               # JSON 编码、解码与漂亮打印
import os                 # 读取操作系统提供给当前进程的环境变量
import sys                # 向 stderr 打印错误，并设置退出码
import urllib.error       # 处理 HTTPError、URLError
import urllib.request     # 创建并发送 HTTP 请求
from typing import Any    # 用于类型标注，帮助阅读，不改变运行行为

# 这份字典就是我们发给模型的 JSON Schema。
# Python 的 True / False 在 json.dumps() 后会自动变为 JSON 的 true / false。
SCHEMA: dict[str, Any] = {
    "type": "object",  # 最终结果必须是 { ... }，不能直接是字符串或数组
    "properties": {
        "definition": {
            "type": "string",
            "description": "一句话定义",
        },
        "components": {
            "type": "array",          # components 必须是数组 [ ... ]
            "items": {"type": "string"},  # 数组里的每一项都必须是字符串
            "maxItems": 5,              # 最多五项，避免页面/卡片太长
            "description": "核心组成，最多五项",
        },
        "ios_example": {
            "type": "string",
            "description": "一个 iOS 研发场景示例",
        },
    },
    # 三个字段必须都存在。需要“可空”的字段时，后续会写成 ["string", "null"]。
    "required": ["definition", "components", "ios_example"],
    # 不接受模型自造的字段，便于下游 UI 和代码稳定处理。
    "additionalProperties": False,
}

def required_env(name: str) -> str:
    """从环境变量取一个必需值；没找到时给出可理解的错误。"""
    # os.getenv 不会弹窗询问用户；它只读取启动脚本进程时已有的环境变量。
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"缺少环境变量 {name}。请先运行环境加载命令。")
    return value

def get_output_text(response: dict[str, Any]) -> str:
    """从 Responses API 最外层响应中取出最终文本，忽略 reasoning/tool 项。"""
    # response["output"] 内可能同时出现 reasoning、function_call、message 等多种项。
    for item in response.get("output", []):
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if content.get("type") in {"output_text", "text"}:
                text = content.get("text")
                if isinstance(text, str):
                    return text
    raise ValueError("响应中没有找到 output_text。")

def validate_result(result: Any) -> dict[str, Any]:
    """做少量应用侧校验；API Schema 不能替代自己的业务校验。"""
    if not isinstance(result, dict):
        raise ValueError("结构化输出最外层不是对象。")

    # set(result) 是结果字典的所有 key。此处要求它刚好等于预期字段集合。
    expected_keys = {"definition", "components", "ios_example"}
    if set(result) != expected_keys:
        raise ValueError(f"字段不符合预期：实际为 {sorted(result)}")
    if not isinstance(result["definition"], str):
        raise ValueError("definition 必须是字符串。")
    if not isinstance(result["ios_example"], str):
        raise ValueError("ios_example 必须是字符串。")
    if (
        not isinstance(result["components"], list)
        or len(result["components"]) > 5
        or not all(isinstance(item, str) for item in result["components"])
    ):
        raise ValueError("components 必须是最多五项的字符串数组。")
    return result

def main() -> None:
    """组织一次完整请求：读取配置 → 发请求 → 解析两层 JSON → 校验 → 打印。"""
    # .rstrip("/") 防止 base URL 末尾本来就有 / 时，拼出 //responses。
    base_url = required_env("OPENAI_BASE_URL").rstrip("/")
    api_key = required_env("OPENAI_API_KEY")
    model = required_env("OPENAI_MODEL")

    # 这是要发送到 POST /responses 的 Python 字典。
    # json.dumps() 会在真正发请求前，把它序列化为 JSON 字节。
    payload = {
        "model": model,
        "instructions": "你是面向 iOS 工程师的 Agent 开发导师。用中文简洁回答。",
        "max_output_tokens": 300,
        "input": "什么是 Agent 开发？",  # 练习：可以只改这里，重新运行脚本。
        "text": {
            "format": {
                "type": "json_schema",
                "name": "agent_definition_v1",  # 格式版本名，方便日志和后续升级
                "strict": True,
                "schema": SCHEMA,
            }
        },
    }

    # Request 只是构造请求，还没有发送网络请求。
    request = urllib.request.Request(
        url=f"{base_url}/responses",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            # f"..." 是 Python f-string；运行时把 api_key 插入请求头，但不打印它。
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    try:
        # urlopen 此时才真正发起网络请求；timeout=60 表示最多等待 60 秒。
        with urllib.request.urlopen(request, timeout=60) as http_response:
            # 第一层 JSON：整个 API 响应对象。
            response = json.load(http_response)
    except urllib.error.HTTPError as error:
        # HTTP 4xx / 5xx 时可以读取响应正文帮助诊断；不要打印请求头。
        details = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"网关返回 HTTP {error.code}: {details}") from error
    except urllib.error.URLError as error:
        # 常见于网络、DNS、URL 无法访问等问题。
        raise RuntimeError(f"无法连接网关：{error.reason}") from error

    # 即使 HTTP 是 200，也应检查 API 业务状态。
    if response.get("status") != "completed" or response.get("error") is not None:
        raise RuntimeError(
            "请求未完成："
            + json.dumps(
                {"status": response.get("status"), "error": response.get("error")},
                ensure_ascii=False,
            )
        )

    # output_text 是第二层 JSON 的“文本容器”：
    # '{"definition":"...", "components":[...]}'。
    output_text = get_output_text(response)
    # 第二次解析后，才能使用 result["definition"] 这样的方式读取业务字段。
    result = validate_result(json.loads(output_text))

    print("API 请求成功；结构化结果已通过应用侧校验：\n")
    # ensure_ascii=False：中文直接显示，不写成 \u5f00\u53d1。
    # indent=2：每层缩进两格，方便人阅读。
    print(json.dumps(result, ensure_ascii=False, indent=2))

# 直接运行这个文件时 __name__ == "__main__"；被其他 Python 文件 import 时则不会自动发请求。
if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, ValueError, json.JSONDecodeError) as error:
        print(f"错误：{error}", file=sys.stderr)
        sys.exit(1)  # 非 0 退出码表示失败，终端/自动化脚本可据此判断。
```

注意：**json_schema本身也可能是回答最终问题的Prompt**

所以schema需要按下面6条规则写最好：

### 流式、异步调用

之前的调用，都是同步调用。

- 流式调用

- 异步调用


