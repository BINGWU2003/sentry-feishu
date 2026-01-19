我需要先说明：文档里**没有给出 issue webhook 的完整字段列表**，只给了部分字段示例和说明；下面我只能把文档中明确出现的字段全部列出来，超出部分无法保证。

---

## 1. 顶层结构（所有 issue webhooks 通用）

Issue webhook 的整体结构与其他集成平台 webhooks 一致：[[Webhooks 总览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/)]

```json
{
  "action": "created | resolved | assigned | archived | unresolved",
  "installation": {
    "uuid": "..."
  },
  "data": {
    "issue": { ... }   // 见下文
  },
  "actor": {
    "type": "user | application",
    "id": "...",
    "name": "..."
  }
}
```

- `action`：`created` / `resolved` / `assigned` / `archived` / `unresolved`[[Issues 概览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/issues/)]
- `installation.uuid`：安装实例的 UUID[[Webhooks 总览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/)]
- `data.issue`：issue 对象（下面详细列出）
- `actor`：触发这次变更的主体（用户 / 应用 / Sentry 本身）[[Webhooks 总览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/)]

---

## 2. `data.issue` 中文档明确列出的字段

### 2.1 URL 相关字段（文档属性说明）

在 issue webhook 文档中，明确列出了 3 个 URL 字段：[[Issues 概览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/issues/)]

- `data['issue']['url']`：  
  - 类型：string  
  - 含义：issue 的 API URL

- `data['issue']['web_url']`：  
  - 类型：string  
  - 含义：issue 的 Web URL

- `data['issue']['project_url']`：  
  - 类型：string  
  - 含义：issue 所属项目的 API URL

---

### 2.2 官方示例 payload 中的字段（`issue.created`）

在 “issueCategory & issueType” 小节中，文档给出了一个完整的 `issue.created` 示例，其中 `data.issue` 包含的字段如下：[[issueCategory & issueType](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/issues/#issuecategory--issuetype)]

```json
"data": {
  "issue": {
    "url": "https://sentry.io/api/0/organizations/example-org/issues/1234567890/",
    "web_url": "https://example-org.sentry.io/issues/1234567890/",
    "project_url": "https://example-org.sentry.io/issues/?project=4509877862268928",
    "id": "1234567890",
    "shareId": null,
    "shortId": "PYTHON-Y",
    "title": "Error generated with event_id: ...",
    "culprit": "test-transaction-0-...",
    "permalink": "https://example-org.sentry.io/issues/1234567890/",
    "logger": "edge-function",
    "level": "fatal",
    "status": "unresolved",
    "statusDetails": {},
    "substatus": "new",
    "isPublic": false,
    "platform": "javascript",
    "project": {
      "id": "112313123123134",
      "name": "python",
      "slug": "python",
      "platform": "python"
    },
    "type": "default",
    "metadata": {
      "title": "Error generated with event_id: ...",
      "sdk": {
        "name": "edge-function",
        "name_normalized": "other"
      },
      "severity": 1,
      "severity_reason": "log_level_fatal",
      "initial_priority": 75
    },
    "numComments": 0,
    "assignedTo": null,
    "isBookmarked": false,
    "isSubscribed": false,
    "subscriptionDetails": null,
    "hasSeen": false,
    "annotations": [],
    "issueType": "error",
    "issueCategory": "error",
    "priority": "high",
    "priorityLockedAt": null,
    "seerFixabilityScore": null,
    "seerAutofixLastTriggered": null,
    "isUnhandled": false,
    "count": "3",
    "userCount": 3,
    "firstSeen": "2025-11-10T20:56:00.679000+00:00",
    "lastSeen": "2025-11-10T20:56:00.738000+00:00"
  }
}
```

从这个示例可以整理出以下字段（仅列出文档中出现的，不保证这是所有可能字段）：

- 标识与链接
  - `url`
  - `web_url`
  - `project_url`
  - `id`
  - `shareId`
  - `shortId`
  - `permalink`

- 基本属性
  - `title`
  - `culprit`
  - `logger`
  - `level`
  - `platform`
  - `type`

- 状态相关
  - `status`（如 `unresolved`）
  - `substatus`（如 `new`）
  - `statusDetails`（对象）
  - `isPublic`（bool）
  - `isUnhandled`（bool）

- 项目信息（嵌套对象）
  - `project.id`
  - `project.name`
  - `project.slug`
  - `project.platform`

- metadata（嵌套对象）
  - `metadata.title`
  - `metadata.sdk.name`
  - `metadata.sdk.name_normalized`
  - `metadata.severity`
  - `metadata.severity_reason`
  - `metadata.initial_priority`

- 交互与订阅
  - `numComments`
  - `assignedTo`
  - `isBookmarked`
  - `isSubscribed`
  - `subscriptionDetails`
  - `annotations`（数组）

- issue 分类与优先级
  - `issueType`（如 `error`）
  - `issueCategory`（如 `error`）
  - `priority`（如 `high`）
  - `priorityLockedAt`
  - `seerFixabilityScore`
  - `seerAutofixLastTriggered`

- 统计与时间
  - `count`（字符串形式的计数）
  - `userCount`
  - `firstSeen`
  - `lastSeen`

---

## 3. 其它 action（resolved / assigned / archived / unresolved）

文档只对 `issue.created` 给出了完整示例，对 `resolved` / `assigned` / `archived` / `unresolved` 没有单独示例；但说明了这些 webhook 也是通过 `data.issue` 传递 issue 信息，并且会包含 `status` / `substatus` / `statusDetails` 等字段，用于描述状态变化：[[Issues 概览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/issues/)]

因此可以确定：

- 顶层结构相同（`action` 不同）
- `data.issue` 至少包含：
  - 标识字段（`id` 等）
  - 状态相关字段（`status` / `substatus` / `statusDetails`）
  - 以及示例中展示的其它 issue 属性中的一部分或全部

但文档**没有**给出这些 action 的完整 payload，所以无法保证字段完全一致或是否有额外字段。

---

## 4. 总结

- 文档明确的 issue webhook 字段主要来自：
  - 通用 webhook 结构（`action` / `installation` / `actor` / `data.issue`）[[Webhooks 总览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/)]
  - Issues 文档中对 `url` / `web_url` / `project_url` 的属性说明[[Issues 概览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/issues/)]
  - `issue.created` 示例 payload 中的完整 `issue` 对象[[issueCategory & issueType](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/issues/#issuecategory--issuetype)]
- 对于是否还存在其他未在示例中展示的字段，知识源中没有说明，我无法给出保证。

如果你需要在代码里做解析，建议以上面示例中的字段为主，并在接收端对 `data.issue` 做“宽松解析”（允许出现额外字段），以兼容未来可能的扩展。