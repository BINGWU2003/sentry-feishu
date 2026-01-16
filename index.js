const express = require("express");
const axios = require("axios");
const app = express();
const { config } = require("./config");

app.use(express.json());

function formatDate(isoString) {
  if (!isoString) return new Date().toLocaleString();
  return new Date(isoString).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
  });
}

app.post("/sentry", async (req, res) => {
  const { body } = req;
  console.log("⬇️ ================= SENTRY BODY START ================= ⬇️");
  console.log(JSON.stringify(body, null, 2));
  console.log("⬆️ ================= SENTRY BODY END =================== ⬆️");

  let project, title, url, level, shortId, time;
  let errorMessage, errorType, culprit, platform, sdk;
  let count, userCount, priority, isUnhandled, status;

  // 场景 A: Issue Created 事件
  if (body.data && body.data.issue) {
    const issue = body.data.issue;
    const meta = issue.metadata || {};

    // 基础信息
    project = issue.project
      ? issue.project.slug || issue.project.name
      : "Sentry Project";
    title = issue.title;
    url = issue.web_url;
    level = issue.level || "error";
    shortId = issue.shortId;
    time = formatDate(issue.firstSeen);

    // 详细信息
    errorMessage = meta.value || issue.title;
    errorType = meta.type || "Error";
    culprit = issue.culprit || "未知位置";
    platform = issue.platform || "javascript";
    sdk = meta.sdk?.name_normalized || "未知SDK";

    // 统计信息
    count = issue.count || "1";
    userCount = issue.userCount || 1;
    priority = issue.priority || "medium";
    isUnhandled = issue.isUnhandled;
    status = issue.status;
  }
  // 场景 B: Alert Rule 事件
  else {
    project = body.project_name || "My Project";
    title = body.event?.title || "Unknown Error";
    url = body.url;
    level = body.level || "error";
    shortId = "ALERT";
    time = formatDate(new Date().toISOString());
    errorMessage = body.message || title;
    errorType = "Alert";
    culprit = body.event?.culprit || "未知位置";
  }

  // 颜色逻辑
  const colorTemplate =
    level === "fatal" || level === "error" ? "red" : "orange";

  // 优先级图标
  const priorityIcon =
    {
      high: "🔴",
      medium: "🟡",
      low: "🟢",
    }[priority] || "⚪";

  // 构建卡片内容数组
  const contentLines = [
    `**📦 项目:** ${project}`,
    `**🐛 错误类型:** ${errorType}`,
    `**📝 错误信息:** ${errorMessage}`,
    `**📍 报错位置:** ${culprit}`,
  ];

  // 如果有统计信息，添加统计行
  if (count || userCount) {
    const statsLine = [];
    if (count) statsLine.push(`发生 **${count}** 次`);
    if (userCount) statsLine.push(`影响 **${userCount}** 个用户`);
    contentLines.push(`**📊 统计:** ${statsLine.join(" · ")}`);
  }

  // 添加优先级
  if (priority) {
    contentLines.push(`**${priorityIcon} 优先级:** ${priority.toUpperCase()}`);
  }

  // 添加状态信息
  if (isUnhandled) {
    contentLines.push(`**⚠️ 状态:** 未处理的异常`);
  }

  // 添加平台和SDK信息
  if (platform || sdk) {
    const techInfo = [];
    if (platform) techInfo.push(platform);
    if (sdk) techInfo.push(sdk);
    contentLines.push(`**🔧 技术栈:** ${techInfo.join(" / ")}`);
  }

  // 添加时间
  contentLines.push(`**🕐 发生时间:** ${time}`);

  const cardContent = {
    msg_type: "interactive",
    card: {
      config: { wide_screen_mode: true },
      header: {
        title: {
          tag: "plain_text",
          content: `🚨 Sentry 报警 [${shortId}]`,
        },
        template: colorTemplate,
      },
      elements: [
        {
          tag: "div",
          text: {
            tag: "lark_md",
            content: contentLines.join("\n"),
          },
        },
        {
          tag: "hr",
        },
        {
          tag: "action",
          actions: [
            {
              tag: "button",
              text: { tag: "plain_text", content: "🔍 查看详情" },
              url: url,
              type: "primary",
            },
          ],
        },
      ],
    },
  };

  try {
    await axios.post(config.FEISHU_WEBHOOK, cardContent);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Feishu Error", error);
    res.status(500).send("Error");
  }
});

module.exports = app;
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
