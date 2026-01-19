/**
 * Sentry Webhook 处理函数模块
 * 包含 Error 和 Issue 事件的处理逻辑
 */

/**
 * 格式化日期为中文时区显示
 * @param {string} isoString - ISO 格式的日期字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(isoString) {
  if (!isoString) return new Date().toLocaleString();
  return new Date(isoString).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
  });
}

/**
 * 从 tags 数组中获取指定 key 的值
 * tags 格式为二维数组: [["key1", "value1"], ["key2", "value2"]]
 * @param {Array} tags - Sentry 的 tags 数组
 * @param {string} key - 要查找的 key
 * @returns {string|null} 找到的值或 null
 */
function getTagValue(tags, key) {
  if (!Array.isArray(tags)) return null;
  const tag = tags.find((t) => Array.isArray(t) && t[0] === key);
  return tag ? tag[1] : null;
}

/**
 * 获取环境的中文名称和图标
 * @param {string} env - 环境标识
 * @returns {{name: string, icon: string, color: string}}
 */
function getEnvironmentInfo(env) {
  const envMap = {
    production: { name: "生产环境", icon: "🔴", color: "red" },
    prod: { name: "生产环境", icon: "🔴", color: "red" },
    staging: { name: "预发环境", icon: "🟠", color: "orange" },
    test: { name: "测试环境", icon: "🟡", color: "yellow" },
    testing: { name: "测试环境", icon: "🟡", color: "yellow" },
    development: { name: "开发环境", icon: "🟢", color: "green" },
    dev: { name: "开发环境", icon: "🟢", color: "green" },
  };
  const lowerEnv = (env || "").toLowerCase();
  return (
    envMap[lowerEnv] || { name: env || "未知环境", icon: "⚪", color: "grey" }
  );
}

/**
 * 获取优先级图标
 * @param {string} priority - 优先级
 * @returns {string} 优先级图标
 */
function getPriorityIcon(priority) {
  const priorityMap = {
    high: "🔴",
    medium: "🟡",
    low: "🟢",
  };
  return priorityMap[priority] || "⚪";
}

/**
 * 处理 Error 事件
 * Error 事件来自 Sentry 的 error webhook，包含完整的错误详情
 * @param {Object} errorData - error 数据对象
 * @returns {Object} 处理后的卡片数据
 */
function processError(errorData) {
  const error = errorData;
  const meta = error.metadata || {};
  const tags = error.tags || [];
  const exception = error.exception?.values?.[0] || {};
  const stacktrace = exception.stacktrace?.frames || [];

  // 从 tags 中提取环境信息
  const environment =
    getTagValue(tags, "environment") || error.environment || "unknown";
  const envInfo = getEnvironmentInfo(environment);

  // 从 tags 中提取其他有用信息
  const browser = getTagValue(tags, "browser") || "未知浏览器";
  const os = getTagValue(tags, "os") || "未知系统";
  const handled = getTagValue(tags, "handled");
  const pageUrl = getTagValue(tags, "url") || error.request?.url || "";
  const release = getTagValue(tags, "release") || error.release || "";
  const transaction =
    getTagValue(tags, "transaction") || error.transaction || "";

  // 基础信息
  const project = error.project || "Sentry Project";
  const title = error.title || exception.value || "Unknown Error";
  const url = error.web_url;
  const level = error.level || "error";
  const eventId = error.event_id || "";
  const issueId = error.issue_id || "";
  const time = formatDate(error.datetime);

  // 详细信息
  const errorMessage = exception.value || meta.value || title;
  const errorType = exception.type || meta.type || "Error";
  const culprit = error.culprit || "未知位置";
  const platform = error.platform || "javascript";
  const sdk = error.sdk?.name || "未知SDK";
  const sdkVersion = error.sdk?.version || "";

  // 提取代码位置信息
  let errorLocation = "";
  if (meta.filename) {
    errorLocation = meta.filename;
    if (meta.lineno) {
      errorLocation += `:${meta.lineno}`;
    }
    if (meta.function) {
      errorLocation += ` (${meta.function})`;
    }
  } else if (stacktrace.length > 0) {
    // 从 stacktrace 中获取最后一帧（通常是错误发生位置）
    const lastFrame = stacktrace[stacktrace.length - 1];
    if (lastFrame.filename) {
      errorLocation = lastFrame.filename;
      if (lastFrame.lineno) {
        errorLocation += `:${lastFrame.lineno}`;
        if (lastFrame.colno) {
          errorLocation += `:${lastFrame.colno}`;
        }
      }
      if (lastFrame.function) {
        errorLocation += ` (${lastFrame.function})`;
      }
    }
  }

  if (!errorLocation) {
    errorLocation = "报错行数未知（请检查是否开启 SourceMap）";
  }

  // 是否为未处理的异常
  const isUnhandled =
    handled === "no" || exception.mechanism?.handled === false;

  // 颜色逻辑 - 生产环境使用红色，其他根据 level 判断
  let colorTemplate = "orange";
  if (environment === "production" || environment === "prod") {
    colorTemplate = "red";
  } else if (level === "fatal" || level === "error") {
    colorTemplate = "red";
  }

  // 构建卡片内容数组
  const contentLines = [
    `**${envInfo.icon} 环境:** ${envInfo.name}`,
    `**📦 项目:** ${project}`,
    `**🐛 错误类型:** ${errorType}`,
    `**📝 错误信息:** ${errorMessage}`,
    `**📍 报错位置:** ${culprit}`,
    `**📄 代码行数:** ${errorLocation}`,
  ];

  // 添加版本信息
  if (release) {
    contentLines.push(`**🏷️ 版本:** ${release}`);
  }

  // 添加页面 URL
  if (pageUrl) {
    contentLines.push(`**🔗 页面URL:** ${pageUrl}`);
  }

  // 添加事务/页面信息
  if (transaction) {
    contentLines.push(`**📑 页面/事务:** ${transaction}`);
  }

  // 添加浏览器和系统信息
  contentLines.push(`**💻 环境信息:** ${browser} / ${os}`);

  // 添加状态信息
  if (isUnhandled) {
    contentLines.push(`**⚠️ 状态:** 未处理的异常`);
  }

  // 添加平台和SDK信息
  if (platform || sdk) {
    const techInfo = [platform];
    if (sdk && sdkVersion) {
      techInfo.push(`${sdk}@${sdkVersion}`);
    } else if (sdk) {
      techInfo.push(sdk);
    }
    contentLines.push(`**🔧 技术栈:** ${techInfo.join(" / ")}`);
  }

  // 添加时间
  contentLines.push(`**🕐 发生时间:** ${time}`);

  // 构建卡片元素
  const cardElements = [
    {
      tag: "div",
      text: {
        tag: "lark_md",
        content: contentLines.join("\n"),
      },
    },
  ];

  // 如果没有行号信息，添加 SourceMap 提示
  if (errorLocation.includes("报错行数未知")) {
    cardElements.push({
      tag: "div",
      text: {
        tag: "lark_md",
        content:
          "💡 **提示：** 无法获取具体报错行数，建议检查项目配置：\n- 确保构建时开启了 SourceMap\n- 确保已上传 SourceMap 到 Sentry",
      },
    });
  }

  cardElements.push(
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
  );

  // 构建标题，包含环境标识
  const headerTitle = `${envInfo.icon} Sentry Error [${envInfo.name}]`;

  return {
    msg_type: "interactive",
    card: {
      config: { wide_screen_mode: true },
      header: {
        title: {
          tag: "plain_text",
          content: headerTitle,
        },
        template: colorTemplate,
      },
      elements: cardElements,
    },
  };
}

/**
 * 处理 Issue 事件
 * Issue 事件来自 Sentry 的 issue webhook，包含 issue 的聚合信息
 * @param {Object} issueData - issue 数据对象
 * @returns {Object} 处理后的卡片数据
 */
function processIssue(issueData) {
  const issue = issueData;
  const meta = issue.metadata || {};

  // 基础信息
  const project = issue.project
    ? issue.project.slug || issue.project.name
    : "Sentry Project";
  const title = issue.title;
  const url = issue.web_url || issue.permalink;
  const level = issue.level || "error";
  const shortId = issue.shortId;
  const time = formatDate(issue.firstSeen);

  // 详细信息
  const errorMessage = meta.value || issue.title;
  const errorType = meta.type || "Error";
  const culprit = issue.culprit || "未知位置";
  const platform = issue.platform || "javascript";
  const sdk = meta.sdk?.name_normalized || meta.sdk?.name || "未知SDK";

  // 统计信息
  const count = issue.count || "1";
  const userCount = issue.userCount || 1;
  const priority = issue.priority || "medium";
  const isUnhandled = issue.isUnhandled;
  const status = issue.status;

  // 颜色逻辑
  const colorTemplate =
    level === "fatal" || level === "error" ? "red" : "orange";

  // 优先级图标
  const priorityIcon = getPriorityIcon(priority);

  // 构建卡片内容数组
  const contentLines = [
    `**📦 项目:** ${project}`,
    `**🐛 错误类型:** ${errorType}`,
    `**📝 错误信息:** ${errorMessage}`,
    `**📍 报错位置:** ${culprit}`,
  ];

  // 添加统计信息
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

  // 添加首次出现时间
  contentLines.push(`**🕐 首次出现:** ${time}`);

  // 如果有最后一次出现时间且与首次不同
  if (issue.lastSeen && issue.lastSeen !== issue.firstSeen) {
    contentLines.push(`**🕐 最近出现:** ${formatDate(issue.lastSeen)}`);
  }

  // 构建卡片元素
  const cardElements = [
    {
      tag: "div",
      text: {
        tag: "lark_md",
        content: contentLines.join("\n"),
      },
    },
  ];

  cardElements.push(
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
  );

  return {
    msg_type: "interactive",
    card: {
      config: { wide_screen_mode: true },
      header: {
        title: {
          tag: "plain_text",
          content: `🚨 Sentry Issue [${shortId}]`,
        },
        template: colorTemplate,
      },
      elements: cardElements,
    },
  };
}

/**
 * 处理未知格式的 webhook
 * @param {Object} body - 原始请求体
 * @returns {Object} 处理后的卡片数据
 */
function processUnknown(body) {
  return {
    msg_type: "interactive",
    card: {
      config: { wide_screen_mode: true },
      header: {
        title: {
          tag: "plain_text",
          content: "🚨 Sentry 报警",
        },
        template: "orange",
      },
      elements: [
        {
          tag: "div",
          text: {
            tag: "lark_md",
            content: `收到未知格式的 Sentry webhook\n\n\`\`\`json\n${JSON.stringify(body, null, 2).substring(0, 500)}...\n\`\`\``,
          },
        },
      ],
    },
  };
}

module.exports = {
  processError,
  processIssue,
  processUnknown,
  // 导出工具函数，方便测试或扩展
  formatDate,
  getTagValue,
  getEnvironmentInfo,
  getPriorityIcon,
};
