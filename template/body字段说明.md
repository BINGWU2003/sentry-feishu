文档里没有一份“所有 webhook 统一 data 字段清单”，而是按不同 `Sentry-Hook-Resource` 类型分别定义 `data` 结构。下面只列出文档中明确写出的字段。

---

## 通用结构

所有 webhook 顶层都有：

```json
{
  "action": "...",
  "actor": { ... },
  "data": { ... },
  "installation": { "uuid": "..." }
}
```

`data` 的内容取决于 `Sentry-Hook-Resource`。[[Webhooks 总览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/)]

---

## installation webhook (`installation`)

`data`:

```json
"data": {
  "installation": {
    "status": "pending",
    "organization": { "slug": "test-org" },
    "app": {
      "uuid": "2ebf071f-28df-4989-aca9-c37c763b278f",
      "slug": "webhooks-galore"
    },
    "code": "f3c71b491e3949b6b033ae45312a4fcb",
    "uuid": "a8e5d37a-696c-4c54-adb5-b3f28d64c7de"
  }
}
```  

[[Installation](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/installation/)]

---

## issue webhook (`issue`)

文档只定义了 `data['issue']` 及其 URL 字段，未给出完整 payload 示例：[[Issues](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/issues/)]

- `data['issue']`: object，表示 issue  
  - `data['issue']['url']`: issue 的 API URL  
  - `data['issue']['web_url']`: issue 的 Web URL  
  - `data['issue']['project_url']`: issue 所属项目的 API URL  

其它字段（如 title、status 等）文档中没有展开，只说明“Payload includes additional information about the issue”。

---

## comment webhook (`comment`)

`data`:

```json
"data": {
  "comment": "adding a comment",
  "project_slug": "sentry",
  "comment_id": 1234,
  "issue_id": 100,
  "timestamp": "2022-03-02T21:51:44.118160Z"
}
```  

字段说明：[[Comments](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/comments/)]

- `comment`: 评论内容（字符串）
- `project_slug`: 项目 slug
- `comment_id`: 评论 ID（int）
- `issue_id`: issue ID（int）
- `timestamp`: 创建/更新/删除时间（datetime）

---

## error webhook (`error`)

`data`:

```json
"data": {
  "error": {
    "_ref": 1293919,
    "_ref_version": 2,
    "contexts": { ... },
    "culprit": "...",
    "datetime": "...",
    "dist": null,
    "event_id": "...",
    "exception": { ... },
    "fingerprint": [...],
    "grouping_config": { ... },
    "hashes": [...],
    "issue_url": "https://sentry.io/api/0/issues/1170820242/",
    "issue_id": "1170820242",
    "key_id": "667532",
    "level": "error",
    "location": "/runner",
    "logger": "",
    "message": "",
    "metadata": { ... },
    "platform": "javascript",
    "project": 1,
    "received": 1566248317.391,
    "release": null,
    "request": { ... },
    "sdk": { ... },
    "tags": [...],
    "time_spent": null,
    "timestamp": 1566248317.391,
    "title": "ReferenceError: ...",
    "type": "error",
    "url": "https://sentry.io/api/0/projects/.../events/.../",
    "user": { "ip_address": "..." },
    "version": "7",
    "web_url": "https://sentry.io/organizations/.../issues/.../events/..."
  }
}
```  

并且文档单独说明：[[Errors 概览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/errors/); [Errors payload](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/errors/#payload)]

- `data['error']['url']`: error 的 API URL  
- `data['error']['web_url']`: error 的 Web URL  
- `data['error']['issue_url']`: 关联 issue 的 API URL  
- `data['error']['issue_id']`: issue ID  

---

## issue alert webhook (`event_alert`)

`data`:

```json
"data": {
  "event": {
    "_ref": 1,
    "_ref_version": 2,
    "contexts": { ... },
    "culprit": "...",
    "datetime": "...",
    "dist": null,
    "event_id": "...",
    "exception": { ... },
    "fingerprint": [...],
    "grouping_config": { ... },
    "hashes": [...],
    "issue_url": "https://sentry.io/api/0/issues/1117540176/",
    "issue_id": "1117540176",
    "key_id": "667532",
    "level": "error",
    "location": "<anonymous>",
    "logger": "",
    "message": "",
    "metadata": { ... },
    "platform": "javascript",
    "project": 1,
    "received": 1566248777.677,
    "release": null,
    "request": { ... },
    "sdk": { ... },
    "tags": [...],
    "time_spent": null,
    "timestamp": 1566248777.677,
    "title": "ReferenceError: ...",
    "type": "error",
    "url": "https://sentry.io/api/0/projects/.../events/.../",
    "user": { "ip_address": "..." },
    "version": "7",
    "web_url": "https://sentry.io/organizations/.../issues/.../events/..."
  },
  "triggered_rule": "Very Important Alert Rule!",
  "issue_alert": {
    "title": "Very Important Alert Rule!",
    "settings": [
      { "name": "channel", "value": "#general" }
    ]
  }
}
```  

文档中还单独说明：[[Issue alerts 概览](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/issue-alerts/); [Issue alerts payload](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/issue-alerts/#payload)]

- `data['event']['url']`: 事件 API URL  
- `data['event']['web_url']`: 事件 Web URL  
- `data['event']['issue_url']`: 关联 issue 的 API URL  
- `data['event']['issue_id']`: issue ID  
- `data['triggered_rule']`: 触发的规则名称  
- `data['issue_alert']['title']`: 规则名称  
- `data['issue_alert']['settings']`: 动作 UI 组件保存的配置

---

## metric alert webhook (`metric_alert`)

`data`:

```json
"data": {
  "description_text": "1000 events in the last 10 minutes\nFilter: level:error",
  "description_title": "Resolved: Too many errors",
  "metric_alert": {
    "alert_rule": {
      "aggregate": "count()",
      "created_by": null,
      "dataset": "events",
      "date_created": "2020-09-13T12:26:40.000000Z",
      "date_modified": "2020-09-13T12:26:40.000000Z",
      "environment": null,
      "id": "7",
      "include_all_projects": false,
      "name": "Too many errors",
      "organization_id": "5",
      "projects": ["bar"],
      "query": "level:error",
      "resolution": 1,
      "resolve_threshold": null,
      "status": 0,
      "threshold_period": 1,
      "threshold_type": 0,
      "time_window": 10,
      "triggers": [
        {
          "actions": [
            {
              "settings": [ ... ]   // 仅对 UI 组件
            }
          ]
        }
      ]
    },
    "date_closed": null,
    "date_created": "2020-09-13T12:26:40.000000Z",
    "date_detected": "2020-09-13T12:26:40.000000Z",
    "date_started": "2020-09-13T12:26:40.000000Z",
    "id": "4",
    "identifier": "1",
    "organization_id": "5",
    "projects": ["bar"],
    "status": 2,
    "status_method": 3,
    "title": "Sacred Marmot",
    "type": 2
  },
  "web_url": "https://sentry.io/organizations/baz/alerts/1/"
}
```  

字段说明：[[Metric alerts](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/metric-alerts/); [Alert rule action metric format](https://docs.sentry.io/organization/integrations/integration-platform/ui-components/alert-rule-action/#metric-alert-request-format)]

- `description_text`: 人类可读描述
- `description_title`: 人类可读标题
- `metric_alert`: 触发告警的 incident 对象
  - `alert_rule`: 告警规则（含 `environment`、`triggers`、`actions` 等）
  - 其它 incident 字段如 `id`, `status`, `title` 等
- `web_url`: 该 incident 的 Web URL

---

## seer webhook (`seer`)

`data` 结构取决于 `action`：[[Seer webhooks](https://docs.sentry.io/organization/integrations/integration-platform/webhooks/seer/#event-specific-payloads)]

- `root_cause_started` / `solution_started` / `coding_started`:

  ```json
  "data": {
    "run_id": 12345,
    "group_id": 1170820242
  }
  ```

- `root_cause_completed`:

  ```json
  "data": {
    "run_id": 12345,
    "group_id": 1170820242,
    "root_cause": {
      "description": "...",
      "steps": [
        {
          "title": "...",
          "code_snippet_and_analysis": "...",
          "timeline_item_type": "human_action" | "internal_code" | ...,
          "relevant_code_file": {
            "file_path": "src/app/page.ts",
            "repo_name": "owner/repo"
          },
          "is_most_important_event": true
        }
      ]
    }
  }
  ```

- `solution_completed`:

  ```json
  "data": {
    "run_id": 12345,
    "group_id": 1170820242,
    "solution": {
      "description": "...",
      "steps": [
        { "title": "..." },
        { "title": "..." }
      ]
    }
  }
  ```

- `coding_completed`:

  ```json
  "data": {
    "run_id": 12345,
    "group_id": 1170820242,
    "changes": [
      {
        "repo_name": "my-app",
        "repo_external_id": "12345",
        "title": "fix: ...",
        "description": "...",
        "diff": "<the diff as a string>",
        "branch_name": "seer/fix-this-thing"
      }
    ]
  }
  ```

---

如果你关心的是某一种具体 webhook（比如只关心 `issue` 或 `event_alert`），可以告诉我类型，我可以只展开那一类的 `data` 字段，方便你在代码里做解析。