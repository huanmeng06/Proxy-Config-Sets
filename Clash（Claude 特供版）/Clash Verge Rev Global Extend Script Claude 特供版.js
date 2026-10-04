// Clash Verge Rev — Claude 特供版
// Do NOT overwrite profiles/Script.js. Use this as a separate profile script.
// If the global Script.js already enhanced the config, this only adds Sift/Datadog.
// If it has not, this runs the full enhance (same as Script.js) plus Sift/Datadog.

// Clash Verge Rev global extend script.
// Keep YepFast proxy-server-nameserver intact so node delay stays close to the official app.
// Campus DNS is only used for captive portal / school / private domains.
// Claude: US-only exits (Anthropic blocks CN/HK/MO), keep that IP still, force Claude onto TCP, and send Claude DNS through the proxy.
// Stripe/hCaptcha checkout must share that US exit, otherwise the upgrade page presents SGD.


function isClaudeAlreadyEnhanced(config) {
  const rules = Array.isArray(config.rules) ? config.rules : [];
  return rules.some(rule =>
    typeof rule === "string" && (
      rule.includes("DOMAIN-SUFFIX,anthropic.com,🧠 Claude") ||
      rule.includes("RULE-SET,Claude,🧠 Claude")
    )
  );
}

function addSiftDatadog(config) {
  const group = "🧠 Claude";
  const protonSuffixes = [
    "proton.me",
    "protonmail.com",
    "protonmail.ch",
    "pm.me",
    "protonweb.com",
    "protonstatus.com",
    "protontech.ch",
    "simplelogin.io",
    "simplelogin.co",
    "simplelogin.com",
    "simplelogin.fr",
    "slmail.me",
    "passmail.com",
    "passmail.net",
    "passinbox.com",
    "passfwd.com",
    "aleeas.com",
    "silomails.com",
    "slmails.com",
    "dralias.com"
  ];
  const extraUdp = [
    `AND,((DOMAIN-SUFFIX,sift.com),(NETWORK,udp)),REJECT`,
    `AND,((DOMAIN-SUFFIX,siftcience.com),(NETWORK,udp)),REJECT`,
    `AND,((DOMAIN-KEYWORD,datadoghq),(NETWORK,udp)),REJECT`,
    ...protonSuffixes.map(domain => `AND,((DOMAIN-SUFFIX,${domain}),(NETWORK,udp)),REJECT`)
  ];
  const rules = Array.isArray(config.rules) ? config.rules.slice() : [];
  const missing = line => !rules.includes(line);

  function insertAfter(matcher, lines) {
    const toAdd = lines.filter(missing);
    if (toAdd.length === 0) return;
    let idx = -1;
    for (let i = 0; i < rules.length; i += 1) {
      if (matcher(rules[i])) idx = i;
    }
    if (idx >= 0) rules.splice(idx + 1, 0, ...toAdd);
    else rules.unshift(...toAdd);
  }

  insertAfter(
    rule => typeof rule === "string" && rule.includes("GEOSITE,anthropic") && rule.includes("NETWORK,udp"),
    extraUdp
  );
  insertAfter(
    rule => typeof rule === "string" && rule === `PROCESS-NAME,Claude Code,${group}`,
    [`PROCESS-NAME,Proton Mail,${group}`, `PROCESS-NAME,Proton Mail Bridge,${group}`]
  );
  config.rules = rules;

  const dns = config.dns && typeof config.dns === "object" ? { ...config.dns } : {};
  const policy = dns["nameserver-policy"] && typeof dns["nameserver-policy"] === "object"
    ? { ...dns["nameserver-policy"] }
    : {};
  const claudeDns = ["https://1.1.1.1/dns-query", "https://8.8.8.8/dns-query"];
  ["+.sift.com", "+.siftcience.com", "+.datadoghq.com", ...protonSuffixes.map(domain => `+.${domain}`)].forEach(key => {
    if (!policy[key]) policy[key] = claudeDns;
  });
  dns["nameserver-policy"] = policy;
  config.dns = dns;
  return config;
}


function addGrokDeepSeek(config) {
  const grok = "✖️ Grok";
  const deepseek = "🐋 DeepSeek";
  const geminiName = "✨ Gemini";
  const direct = "🎯 全球直连";
  const rulesBase = "https://raw.githubusercontent.com/huanmeng06/Proxy-Config-Sets/refs/heads/main/Rules";
  const groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"].slice() : [];
  const gemini = groups.find(group => group && group.name === geminiName);
  const geminiProxies = gemini && Array.isArray(gemini.proxies) ? gemini.proxies.slice() : [
    "🇺🇸 美国节点",
    "🏠🇺🇸 美国家宽",
    "🇯🇵 日本节点",
    "🏠🇯🇵 日本家宽",
    "🇸🇬 狮城节点",
    "🇨🇳 台湾节点",
    "🚀 手动切换"
  ];
  const deepseekProxies = geminiProxies.includes(direct) ? geminiProxies.slice() : [...geminiProxies, direct];

  function insertGroupAfter(afterName, name, proxies) {
    if (groups.some(group => group && group.name === name)) return;
    const entry = { name, type: "select", proxies };
    const idx = groups.findIndex(group => group && group.name === afterName);
    if (idx >= 0) groups.splice(idx + 1, 0, entry);
    else groups.push(entry);
  }

  insertGroupAfter(geminiName, grok, geminiProxies);
  insertGroupAfter(grok, deepseek, deepseekProxies);
  config["proxy-groups"] = groups;

  const providers = config["rule-providers"] && typeof config["rule-providers"] === "object"
    ? { ...config["rule-providers"] }
    : {};
  const providerTemplate = (name, file) => ({
    type: "http",
    behavior: "classical",
    format: "text",
    path: `./rulesets/Proxy-Config-Sets/${name}.list`,
    url: `${rulesBase}/${file}`,
    interval: 86400
  });
  if (!providers.Grok) providers.Grok = providerTemplate("Grok", "grok.list");
  if (!providers.DeepSeek) providers.DeepSeek = providerTemplate("DeepSeek", "deepseek.list");
  config["rule-providers"] = providers;

  const rules = Array.isArray(config.rules) ? config.rules.slice() : [];
  const extra = [
    `RULE-SET,Grok,${grok}`,
    `RULE-SET,DeepSeek,${deepseek}`
  ];
  const missing = extra.filter(line => !rules.includes(line));
  if (missing.length > 0) {
    let idx = -1;
    for (let i = 0; i < rules.length; i += 1) {
      if (rules[i] === `RULE-SET,Gemini,${geminiName}`) idx = i;
    }
    if (idx >= 0) rules.splice(idx + 1, 0, ...missing);
    else rules.unshift(...missing);
  }
  config.rules = rules;
  return config;
}

function main(config, profileName) {
  if (!config.proxies || config.proxies.length === 0) return config;
  if (isClaudeAlreadyEnhanced(config)) return addGrokDeepSeek(addSiftDatadog(config));

  // 全局常量：策略组显示名、测速参数和自维护规则地址集中放这里。
  const TEST_URL = "http://cp.cloudflare.com/generate_204";
  // Match YepFast official url-test cadence so region groups do not churn exits.
  const INTERVAL = 86400;
  const TOLERANCE = 50;
  const RULES_BASE = "https://raw.githubusercontent.com/huanmeng06/Proxy-Config-Sets/refs/heads/main/Rules";
  // macOS + 校园网 TUN 兼容参数。
  // Wi-Fi 在绝大多数 Mac 上是 en0；如你的机器不同，只改这一行。
  const WIFI_INTERFACE = "en0";
  // 校园网只影响认证页/校内域名的 nameserver-policy，不再覆盖节点 DNS。
  // 节点域名必须继续走订阅自带的 proxy-server-nameserver，否则延迟会明显变高。
  const CAMPUS_MODE = true;

  // 默认留空：优先让 mihomo 通过 DHCP 读取校园网 DNS。
  // 如果 dhcp://en0 在你的 macOS 上取值异常，可把
  // `ipconfig getpacket en0` 输出中的 domain_name_server IP 填到这里。
  // 例如：const CAMPUS_DNS_IPS = ["10.x.x.x", "10.y.y.y"];
  const CAMPUS_DNS_IPS = [];

  // Clash Verge 开 TUN 时会把系统 DNS 写成 114.114.114.114 作为 fake-ip 劫持占位，这是客户端行为，不是路由器下发。
  // 114 / 1.1.1.1 这类手动 DNS 会让 captive.apple.com 从代理“成功”，校园网/星巴克认证页就不弹了。
  // 系统 Wi-Fi DNS 必须保持空/DHCP。连未认证 Wi-Fi 前先关 TUN，认证完成后再开。
  const CAPTIVE_PORTAL_EXACT = [
    "captive.apple.com",
    "netctscan.apple.com",
    "detectportal.firefox.com",
    "connectivitycheck.gstatic.com",
    "www.msftconnecttest.com",
    "ipv6.msftconnecttest.com",
    "dns.msftncsi.com",
    "neverssl.com",
    "securelogin.arubanetworks.com"
  ];
  const CAPTIVE_PORTAL_SUFFIXES = [
    "arubanetworks.com",
    "arubanetworks.cc",
    "bnbu.edu.cn",
    "uic.edu.cn",
    "msftconnecttest.com"
  ];

  const LAN_ROUTE_EXCLUDES = [
    "10.0.0.0/8",
    "100.64.0.0/10",
    "169.254.0.0/16",
    "172.16.0.0/12",
    "192.168.0.0/16",
    "224.0.0.0/4"
  ];

  const getCampusDnsServers = () =>
    CAMPUS_DNS_IPS.length > 0
      ? CAMPUS_DNS_IPS.map(ip => `udp://${ip}#DIRECT`)
      : [`dhcp://${WIFI_INTERFACE}`];
  const GROUP = {
    node: "🚀 节点选择",
    manual: "🚀 手动切换",
    direct: "🎯 全球直连",
    download: "⏬ 下载专用",
    telegram: "📲 电报消息",
    github: "🐙 GITHUB",
    ai: "💬 Ai平台",
    chatgpt: "🤖 ChatGPT",
    claude: "🧠 Claude",
    gemini: "✨ Gemini",
    grok: "✖️ Grok",
    deepseek: "🐋 DeepSeek",
    youtube: "📹 油管视频",
    netflix: "🎥 奈飞视频",
    netflixNode: "🎥 奈飞节点",
    bahamut: "📺 巴哈姆特",
    bilibili: "📺 哔哩哔哩",
    globalMedia: "🌍 国外媒体",
    domesticMedia: "🌏 国内媒体",
    googleFcm: "📢 谷歌FCM",
    microsoftStore: "Ⓜ️ 微软商店",
    microsoftBing: "Ⓜ️ 微软Bing",
    microsoftDrive: "Ⓜ️ 微软云盘",
    microsoft: "Ⓜ️ 微软服务",
    apple: "🍎 苹果服务",
    games: "🎮 游戏平台",
    netease: "🎶 网易音乐",
    ads: "🛑 广告拦截",
    appClean: "🍃 应用净化",
    fallback: "🐟 漏网之鱼"
  };

  // 过滤订阅说明、流量统计、到期提醒等非代理节点。
  const excludeRegex = /(Data Left|Remain:|Traffic:|Expir[ey]|Reset|(\d[\d.]*\s*[MG]B[^\dA-Za-z]+|[:：]\s*)\d[\d.]*\s*GB(?![\dA-Za-z])|剩[余餘]流量|流量：|[到过過效]期|[时時][间間]|重置|分割线|残り使用容量|残りデータ通信量|有効期限|リセット|🔰 (ID|HSD|SNI):|📝 Gói:|最新[网網][站址]|官[网方]|获取|地址|群|更新)/i;
  config.proxies = config.proxies.filter(p => !excludeRegex.test(p.name));

  // 家宽节点单独分组，避免和普通节点混在同一个测速组里。
  // ISP 缩写仅用起始 \b + 结尾禁跟字母，避免 "HKBN01" 这类紧跟数字/符号的命名匹配不到。
  const homeBroadbandRegex = /(🏠|家[宽寬]|家庭|住宅|民用|宽[带帶]|\bBroadband(?![A-Za-z])|\bResidential(?![A-Za-z])|\bHome(?![A-Za-z])|\bHKBN(?![A-Za-z])|\bHGC(?![A-Za-z])|\bWTT(?![A-Za-z])|\bNTT(?![A-Za-z])|\bOCN(?![A-Za-z])|\bNURO(?![A-Za-z])|\bHiNet(?![A-Za-z])|\bComcast(?![A-Za-z])|\bXfinity(?![A-Za-z])|\bSpectrum(?![A-Za-z])|\bVerizon(?![A-Za-z])|\bFrontier(?![A-Za-z])|\bCenturyLink(?![A-Za-z])|\bTelstra(?![A-Za-z])|\bOptus(?![A-Za-z]))/i;

  function isHomeBroadbandNode(name) {
    return homeBroadbandRegex.test(name);
  }

  // 低倍率/下载节点判定：和下面 "⏬ 下载专用" 分组用同一套正则，
  // 避免前缀 Emoji 判断和实际分组结果对不上。
  const downloadNodeRegex = /(下[载載]|download|省流|低倍率?|大流量|0\.[0-9]+\s*[xX×]|\.[0-9]+\s*[xX×]|0\.[0-9]+\s*倍)/i;

  function isDownloadNode(name) {
    return downloadNodeRegex.test(name);
  }

  // 节点名归一化：按地区识别并补上统一 Emoji。
  const emojiRules = [
    // 亚洲地区
    { emoji: "🇭🇰", regex: /(香港|\bHK\b|Hong Kong|深港|沪港|京港)(?!中[轉转])/i },
    { emoji: "🇨🇳", regex: /([台臺][湾灣北]|新[北竹]|彰化|高雄|\bTW\b|Taiwan)(?!中[轉转])/i },
    { emoji: "🇯🇵", regex: /(日本|东京|大阪|名古屋|埼玉|福冈|\bJP\b|Japan|川日|泉日|沪日|深日)(?!中[轉转])/i },
    { emoji: "🇸🇬", regex: /(新加坡|[狮獅]城|\bSG\b|Singapore)(?!中[轉转])/i },
    { emoji: "🇰🇷", regex: /(朝[鲜鮮]|[韩韓][国國]|首尔|春川|\bKR\b|Korea)(?!中[轉转])/i },
    { emoji: "🇲🇾", regex: /(马来西亚|大马|吉隆坡|Malaysia|\bMY\b)(?!中[轉转])/i },
    { emoji: "🇮🇩", regex: /(印尼|印度尼西亚|雅加达|\bID\b|Indonesia)(?!中[轉转])/i },
    { emoji: "🇮🇳", regex: /(印度(?!尼西亚)|孟买|新德里|\bIN\b|India)(?!中[轉转])/i },
    { emoji: "🇵🇭", regex: /(菲律宾|马尼拉|\bPH\b|Philippines)(?!中[轉转])/i },
    { emoji: "🇹🇭", regex: /(泰国|曼谷|\bTH\b|Thailand)(?!中[轉转])/i },
    { emoji: "🇻🇳", regex: /(越南|胡志明|河内|\bVN\b|Vietnam)(?!中[轉转])/i },
    { emoji: "🇰🇿", regex: /(哈萨克斯坦|阿拉木图|阿斯塔纳|\bKZ\b|Kazakhstan)(?!中[轉转])/i },
    { emoji: "🇵🇰", regex: /(巴基斯坦|伊斯兰堡|\bPK\b|Pakistan)(?!中[轉转])/i },

    // 欧洲地区
    { emoji: "🇬🇧", regex: /(英[国國]|英格兰|伦敦|加的夫|曼彻斯特|伯克郡|\bUK\b|United Kingdom|Great Britain)(?!中[轉转])/i },
    { emoji: "🇫🇷", regex: /(法[国國]|巴黎|马赛|斯特拉斯堡|\bFR\b|France)(?!中[轉转])/i },
    { emoji: "🇩🇪", regex: /(德[国國]|法兰克福|柏林|杜塞尔多夫|\bDE\b|Germany)(?!中[轉转])/i },
    { emoji: "🇧🇪", regex: /(比利时|布鲁塞尔|\bBE\b|Belgium)(?!中[轉转])/i },
    { emoji: "🇳🇱", regex: /(荷兰|尼德兰|阿姆斯特丹|\bNL\b|Netherlands)(?!中[轉转])/i },
    { emoji: "🇷🇺", regex: /(俄[国國]|俄[罗羅]斯|莫斯科|圣彼得堡|西伯利亚|伯力|哈巴罗夫斯克|\bRU\b|Russia)(?!中[轉转])/i },
    { emoji: "🇨🇭", regex: /(瑞士|苏黎世|日内瓦|\bCH\b|Switzerland)(?!中[轉转])/i },
    { emoji: "🇸🇪", regex: /(瑞典|斯德哥尔摩|\bSE\b|Sweden)(?!中[轉转])/i },
    { emoji: "🇮🇹", regex: /(意大[利里]|米兰|罗马|\bIT\b|Italy)(?!中[轉转])/i },
    { emoji: "🇪🇸", regex: /(西班牙|马德里|\bES\b|Spain)(?!中[轉转])/i },
    { emoji: "🇵🇱", regex: /(波兰|华沙|\bPL\b|Poland)(?!中[轉转])/i },
    { emoji: "🇺🇦", regex: /(乌克兰|基辅|\bUA\b|Ukraine)(?!中[轉转])/i },
    { emoji: "🇦🇹", regex: /(奥地利|维也纳|\bAT\b|Austria)(?!中[轉转])/i },
    { emoji: "🇮🇪", regex: /(爱尔兰|都柏林|\bIE\b|Ireland)(?!中[轉转])/i },
    { emoji: "🇲🇩", regex: /(摩尔多瓦|基希讷乌|\bMD\b|Moldova)(?!中[轉转])/i },

    // 美洲地区
    { emoji: "🇺🇸", regex: /(美[国國]|华盛顿|波特兰|达拉斯|俄勒冈|凤凰城|菲尼克斯|费利蒙|弗里蒙特|硅谷|旧金山|拉斯维加斯|洛杉|圣何塞|圣荷西|圣塔?克拉拉|西雅图|芝加哥|哥伦布|纽约|阿什本|纽瓦克|丹佛|加利福尼亚|弗吉尼亚|马纳萨斯|俄亥俄|得克萨斯|[佐乔]治亚|亚特兰大|佛罗里达|迈阿密|\bUSA\b|United States)(?!中[轉转])/i },
    { emoji: "🇨🇦", regex: /(加拿大|[枫楓][叶葉]|多伦多|蒙特利尔|温哥华|卡尔加里|\bCA\b|Canada)(?!中[轉转])/i },
    { emoji: "🇦🇷", regex: /(阿根廷|布宜诺斯艾利斯|Argentina|\bAR\b)(?!中[轉转])/i },
    { emoji: "🇧🇷", regex: /(巴西|圣保罗|里约|\bBR\b|Brazil)(?!中[轉转])/i },
    { emoji: "🇲🇽", regex: /(墨西哥|\bMX\b|Mexico)(?!中[轉转])/i },
    { emoji: "🇨🇱", regex: /(智利|圣地亚哥|\bCL\b|Chile)(?!中[轉转])/i },

    // 中东及非洲地区
    { emoji: "🇹🇷", regex: /(土耳其|伊斯坦布尔|Turkey|\bTR\b)(?!中[轉转])/i },
    { emoji: "🇦🇪", regex: /(阿联酋|迪拜|阿拉伯联合酋长国|\bAE\b|United Arab Emirates|Dubai)(?!中[轉转])/i },
    { emoji: "🇮🇱", regex: /(以色列|特拉维夫|耶路撒冷|\bIL\b|Israel)(?!中[轉转])/i },
    { emoji: "🇸🇦", regex: /(沙特|利雅得|\bSA\b|Saudi Arabia)(?!中[轉转])/i },
    { emoji: "🇿🇦", regex: /(南非|约翰内斯堡|\bZA\b|South Africa)(?!中[轉转])/i },
    { emoji: "🇪🇬", regex: /(埃及|开罗|\bEG\b|Egypt)(?!中[轉转])/i },
    { emoji: "🇳🇬", regex: /(尼日利亚|拉各斯|阿布贾|\bNG\b|Nigeria)(?!中[轉转])/i },

    // 大洋洲地区
    { emoji: "🇦🇺", regex: /(澳大利亚|澳洲|悉尼|墨尔本|\bAU\b|Australia)(?!中[轉转])/i },
    { emoji: "🇳🇿", regex: /(新西兰|奥克兰|\bNZ\b|New Zealand)(?!中[轉转])/i },

    // 特殊节点
    { emoji: "🆘", regex: /(防失联)(?!中[轉转])/i },
    { emoji: "🌍", regex: /(Anycast|\bBGP\b|Global)/i }
  ];

  config.proxies.forEach(proxy => {
    const cleanName = proxy.name
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\-\.\_\(\)\[\]\|\u00d7]/g, "")
      .trim();

    const isHome = isHomeBroadbandNode(cleanName);
    const isDownload = isDownloadNode(cleanName);
    let countryEmoji = "";

    for (const rule of emojiRules) {
      if (rule.regex.test(cleanName)) {
        countryEmoji = rule.emoji;
        break;
      }
    }

    // 家宽 🏠、地区旗帜、下载 ⏬ 三个前缀互不冲突，按需叠加。
    const badges = `${isHome ? "🏠" : ""}${countryEmoji}${isDownload ? "⏬" : ""}`;
    proxy.name = badges ? `${badges} ${cleanName}` : cleanName;
    proxy["ip-version"] = "ipv4";
    proxy.udp = proxy.udp !== false;
  });

  const proxies = config.proxies.map(p => p.name);

  function getProxiesByRegex(regexStr) {
    return proxies.filter(p => new RegExp(regexStr, "i").test(p));
  }

  function getRegionNormalProxies(regexStr) {
    const regex = new RegExp(regexStr, "i");
    return proxies.filter(p => regex.test(p) && !isHomeBroadbandNode(p));
  }

  function getRegionHomeProxies(regexStr) {
    const regex = new RegExp(regexStr, "i");
    return proxies.filter(p => regex.test(p) && isHomeBroadbandNode(p));
  }

  const unique = (items) => [...new Set((items || []).filter(item => item != null && item !== ""))];

  function createUrlTestGroup(name, groupProxies, options = {}) {
    return {
      name,
      type: "url-test",
      url: TEST_URL,
      interval: options.interval ?? INTERVAL,
      tolerance: options.tolerance ?? TOLERANCE,
      lazy: true,
      timeout: options.timeout ?? 3000,
      "max-failed-times": 3,
      proxies: groupProxies
    };
  }

  function createSelectGroup(name, groupProxies) {
    return { name, type: "select", proxies: groupProxies };
  }

  // 地区组按实际节点动态生成；普通节点和家宽节点分开测速。
  const regionDefs = [
    // 亚洲
    { name: "🇭🇰 香港节点", homeName: "🏠🇭🇰 香港家宽", regex: "(香港|\\bHK\\b|Hong Kong|HongKong|hongkong|深港|沪港|京港)" },
    { name: "🇨🇳 台湾节点", homeName: "🏠🇨🇳 台湾家宽", regex: "(台|新北|彰化|高雄|\\bTW\\b|Taiwan)" },
    { name: "🇯🇵 日本节点", homeName: "🏠🇯🇵 日本家宽", regex: "(日本|川日|东京|大阪|名古屋|泉日|埼玉|福冈|沪日|深日|\\bJP\\b|Japan)" },
    { name: "🇸🇬 狮城节点", homeName: "🏠🇸🇬 狮城家宽", regex: "(新加坡|坡|狮城|\\bSG\\b|Singapore)" },
    { name: "🇰🇷 韩国节点", homeName: "🏠🇰🇷 韩国家宽", regex: "(\\bKR\\b|Korea|\\bKOR\\b|首尔|春川|韩|韓)" },
    { name: "🇲🇾 马来西亚节点", homeName: "🏠🇲🇾 马来西亚家宽", regex: "(马来西亚|大马|吉隆坡|Malaysia|\\bMY\\b)" },
    { name: "🇮🇩 印尼节点", homeName: "🏠🇮🇩 印尼家宽", regex: "(印尼|印度尼西亚|雅加达|\\bID\\b|Indonesia)" },
    { name: "🇮🇳 印度节点", homeName: "🏠🇮🇳 印度家宽", regex: "(印度(?!尼西亚)|孟买|新德里|\\bIN\\b|India)" },
    { name: "🇵🇭 菲律宾节点", homeName: "🏠🇵🇭 菲律宾家宽", regex: "(菲律宾|马尼拉|\\bPH\\b|Philippines)" },
    { name: "🇹🇭 泰国节点", homeName: "🏠🇹🇭 泰国家宽", regex: "(泰国|曼谷|\\bTH\\b|Thailand)" },
    { name: "🇻🇳 越南节点", homeName: "🏠🇻🇳 越南家宽", regex: "(越南|胡志明|河内|\\bVN\\b|Vietnam)" },
    { name: "🇰🇿 哈萨克斯坦节点", homeName: "🏠🇰🇿 哈萨克斯坦家宽", regex: "(哈萨克斯坦|阿拉木图|阿斯塔纳|\\bKZ\\b|Kazakhstan)" },
    { name: "🇵🇰 巴基斯坦节点", homeName: "🏠🇵🇰 巴基斯坦家宽", regex: "(巴基斯坦|伊斯兰堡|\\bPK\\b|Pakistan)" },

    // 欧洲
    { name: "🇬🇧 英国节点", homeName: "🏠🇬🇧 英国家宽", regex: "(英[国國]|英格兰|伦敦|加的夫|曼彻斯特|伯克郡|\\bUK\\b|United Kingdom|Great Britain)" },
    { name: "🇫🇷 法国节点", homeName: "🏠🇫🇷 法国家宽", regex: "(法[国國]|巴黎|马赛|斯特拉斯堡|\\bFR\\b|France)" },
    { name: "🇩🇪 德国节点", homeName: "🏠🇩🇪 德国家宽", regex: "(德[国國]|法兰克福|柏林|杜塞尔多夫|\\bDE\\b|Germany)" },
    { name: "🇧🇪 比利时节点", homeName: "🏠🇧🇪 比利时家宽", regex: "(比利时|布鲁塞尔|\\bBE\\b|Belgium)" },
    { name: "🇳🇱 荷兰节点", homeName: "🏠🇳🇱 荷兰家宽", regex: "(荷兰|尼德兰|阿姆斯特丹|\\bNL\\b|Netherlands)" },
    { name: "🇷🇺 俄罗斯节点", homeName: "🏠🇷🇺 俄罗斯家宽", regex: "(俄[国國]|俄[罗羅]斯|莫斯科|圣彼得堡|西伯利亚|伯力|哈巴罗夫斯克|\\bRU\\b|Russia)" },
    { name: "🇨🇭 瑞士节点", homeName: "🏠🇨🇭 瑞士家宽", regex: "(瑞士|苏黎世|日内瓦|\\bCH\\b|Switzerland)" },
    { name: "🇸🇪 瑞典节点", homeName: "🏠🇸🇪 瑞典家宽", regex: "(瑞典|斯德哥尔摩|\\bSE\\b|Sweden)" },
    { name: "🇮🇹 意大利节点", homeName: "🏠🇮🇹 意大利家宽", regex: "(意大[利里]|米兰|罗马|\\bIT\\b|Italy)" },
    { name: "🇪🇸 西班牙节点", homeName: "🏠🇪🇸 西班牙家宽", regex: "(西班牙|马德里|\\bES\\b|Spain)" },
    { name: "🇵🇱 波兰节点", homeName: "🏠🇵🇱 波兰家宽", regex: "(波兰|华沙|\\bPL\\b|Poland)" },
    { name: "🇺🇦 乌克兰节点", homeName: "🏠🇺🇦 乌克兰家宽", regex: "(乌克兰|基辅|\\bUA\\b|Ukraine)" },
    { name: "🇦🇹 奥地利节点", homeName: "🏠🇦🇹 奥地利家宽", regex: "(奥地利|维也纳|\\bAT\\b|Austria)" },
    { name: "🇮🇪 爱尔兰节点", homeName: "🏠🇮🇪 爱尔兰家宽", regex: "(爱尔兰|都柏林|\\bIE\\b|Ireland)" },
    { name: "🇲🇩 摩尔多瓦节点", homeName: "🏠🇲🇩 摩尔多瓦家宽", regex: "(摩尔多瓦|基希讷乌|\\bMD\\b|Moldova)" },

    // 美洲
    { name: "🇺🇸 美国节点", homeName: "🏠🇺🇸 美国家宽", regex: "(美|华盛顿|波特兰|达拉斯|俄勒冈|凤凰城|菲尼克斯|费利蒙|弗里蒙特|硅谷|旧金山|拉斯维加斯|洛杉|圣何塞|圣荷西|圣塔?克拉拉|西雅图|芝加哥|哥伦布|纽约|阿什本|纽瓦克|丹佛|加利福尼亚|弗吉尼亚|马纳萨斯|俄亥俄|得克萨斯|[佐乔]治亚|亚特兰大|佛罗里达|迈阿密|\\bUSA\\b|United States)" },
    { name: "🇨🇦 加拿大节点", homeName: "🏠🇨🇦 加拿大家宽", regex: "(加拿大|[枫楓][叶葉]|多伦多|蒙特利尔|温哥华|卡尔加里|\\bCA\\b|Canada)" },
    { name: "🇦🇷 阿根廷节点", homeName: "🏠🇦🇷 阿根廷家宽", regex: "(阿根廷|布宜诺斯艾利斯|Argentina|\\bAR\\b)" },
    { name: "🇧🇷 巴西节点", homeName: "🏠🇧🇷 巴西家宽", regex: "(巴西|圣保罗|里约|\\bBR\\b|Brazil)" },
    { name: "🇲🇽 墨西哥节点", homeName: "🏠🇲🇽 墨西哥家宽", regex: "(墨西哥|\\bMX\\b|Mexico)" },
    { name: "🇨🇱 智利节点", homeName: "🏠🇨🇱 智利家宽", regex: "(智利|圣地亚哥|\\bCL\\b|Chile)" },

    // 中东及非洲
    { name: "🇹🇷 土耳其节点", homeName: "🏠🇹🇷 土耳其家宽", regex: "(土耳其|伊斯坦布尔|Turkey|\\bTR\\b)" },
    { name: "🇦🇪 阿联酋节点", homeName: "🏠🇦🇪 阿联酋家宽", regex: "(阿联酋|迪拜|\\bAE\\b|United Arab Emirates|Dubai)" },
    { name: "🇮🇱 以色列节点", homeName: "🏠🇮🇱 以色列家宽", regex: "(以色列|特拉维夫|耶路撒冷|\\bIL\\b|Israel)" },
    { name: "🇸🇦 沙特节点", homeName: "🏠🇸🇦 沙特家宽", regex: "(沙特|利雅得|\\bSA\\b|Saudi Arabia)" },
    { name: "🇿🇦 南非节点", homeName: "🏠🇿🇦 南非家宽", regex: "(南非|约翰内斯堡|\\bZA\\b|South Africa)" },
    { name: "🇪🇬 埃及节点", homeName: "🏠🇪🇬 埃及家宽", regex: "(埃及|开罗|\\bEG\\b|Egypt)" },
    { name: "🇳🇬 尼日利亚节点", homeName: "🏠🇳🇬 尼日利亚家宽", regex: "(尼日利亚|拉各斯|阿布贾|\\bNG\\b|Nigeria)" },

    // 大洋洲
    { name: "🇦🇺 澳洲节点", homeName: "🏠🇦🇺 澳洲家宽", regex: "(澳大利亚|澳洲|悉尼|墨尔本|\\bAU\\b|Australia)" },
    { name: "🇳🇿 新西兰节点", homeName: "🏠🇳🇿 新西兰家宽", regex: "(新西兰|奥克兰|\\bNZ\\b|New Zealand)" }
  ];

  const availableRegionGroupNames = [];
  const regionGroups = [];

  for (const def of regionDefs) {
    const normalProxies = getRegionNormalProxies(def.regex);
    if (normalProxies.length > 0) {
      availableRegionGroupNames.push(def.name);
      regionGroups.push(createUrlTestGroup(def.name, normalProxies));
    }

    const homeProxies = getRegionHomeProxies(def.regex);
    if (homeProxies.length > 0) {
      availableRegionGroupNames.push(def.homeName);
      regionGroups.push(createUrlTestGroup(def.homeName, homeProxies));
    }
  }

  // 防失联节点只做手动选择，不参与测速。
  const fallbackProxies = getProxiesByRegex("(防失联|备用)");
  if (fallbackProxies.length > 0) {
    regionGroups.push(createSelectGroup("🆘 防失联组", fallbackProxies));
    availableRegionGroupNames.push("🆘 防失联组");
  }

  // 奈飞专线如果存在，就额外提供一个快捷选择组。
  const netflixProxies = getProxiesByRegex("(NF|奈飞|解锁|Netflix|NETFLIX|Media)");
  if (netflixProxies.length > 0) {
    regionGroups.push(createSelectGroup(GROUP.netflixNode, netflixProxies));
  }

  // 低倍率下载节点单独测速，方便 GitHub release 等大文件下载场景。
  // 复用上面的 isDownloadNode，保证分组结果和 ⏬ 前缀判断永远一致。
  const downloadProxies = proxies.filter(isDownloadNode);
  if (downloadProxies.length > 0) {
    regionGroups.push(createUrlTestGroup(GROUP.download, downloadProxies, { interval: 600, tolerance: 100 }));
    availableRegionGroupNames.push(GROUP.download);
  }

  // 策略组：先放常用服务组，再追加动态地区组。
  const allProxies = proxies.length > 0 ? proxies : ["DIRECT"];
  const proxyGroups = [];
  const pushSelectGroup = (name, choices) => {
    proxyGroups.push(createSelectGroup(name, choices));
  };
  pushSelectGroup(GROUP.node, [...availableRegionGroupNames, GROUP.manual, "DIRECT"]);

  pushSelectGroup(GROUP.manual, allProxies);

  pushSelectGroup(GROUP.direct, ["DIRECT", GROUP.node]);

  const commonChoices = [GROUP.node, ...availableRegionGroupNames, GROUP.manual, "DIRECT"];
  const builtInChoices = new Set(["DIRECT", GROUP.node, GROUP.manual, GROUP.direct]);
  const isAvailableChoice = (name) => builtInChoices.has(name) || availableRegionGroupNames.includes(name);

  const getSafeChoices = (preferred) => {
    const safe = preferred.filter(isAvailableChoice);
    return safe.length > 0 ? safe : ["DIRECT"];
  };

  // 常用服务组保持在 UI 前半段，方便日常切换。
  pushSelectGroup(GROUP.telegram, commonChoices);

  const githubChoices = getSafeChoices([
    GROUP.node,
    GROUP.manual,
    "🇭🇰 香港节点",
    "🇸🇬 狮城节点",
    "🇯🇵 日本节点",
    "🇺🇸 美国节点",
    "🇨🇳 台湾节点",
    GROUP.download,
    GROUP.direct
  ]);
  pushSelectGroup(GROUP.github, githubChoices);

  const aiChoices = getSafeChoices([
    "🇺🇸 美国节点",
    "🏠🇺🇸 美国家宽",
    "🇯🇵 日本节点",
    "🏠🇯🇵 日本家宽",
    "🇸🇬 狮城节点",
    "🏠🇸🇬 狮城家宽",
    "🇨🇳 台湾节点",
    "🏠🇨🇳 台湾家宽",
    GROUP.manual
  ]);
  pushSelectGroup(GROUP.ai, aiChoices);

  // ChatGPT / Gemini / Grok 偏美国；Claude 只保留美国节点，避免 CN/HK/MO 出口。
  // DeepSeek 同源候选，额外提供 🎯 全球直连。
  const usFirstAiChoices = getSafeChoices([
    "🇺🇸 美国节点",
    "🏠🇺🇸 美国家宽",
    "🇯🇵 日本节点",
    "🏠🇯🇵 日本家宽",
    "🇸🇬 狮城节点",
    "🇨🇳 台湾节点",
    GROUP.manual
  ]);
  const deepseekChoices = getSafeChoices([...usFirstAiChoices, GROUP.direct]);
  // Anthropic 不向中国大陆 / 香港 / 澳门提供服务，Claude 出口只保留美国节点。
  // 不用 url-test 组当默认，避免五个美国节点来回切 IP。
  const claudePinnedNodes = unique([
    ...getRegionHomeProxies("(美国|\\bUSA\\b|United States)"),
    ...getRegionNormalProxies("(美国|\\bUSA\\b|United States)")
  ]);
  const claudeChoices = unique([
    ...claudePinnedNodes,
    ...getSafeChoices([
      "🏠🇺🇸 美国家宽",
      GROUP.manual
    ])
  ]);
  pushSelectGroup(GROUP.chatgpt, usFirstAiChoices);
  pushSelectGroup(GROUP.claude, claudeChoices);
  pushSelectGroup(GROUP.gemini, usFirstAiChoices);
  pushSelectGroup(GROUP.grok, usFirstAiChoices);
  pushSelectGroup(GROUP.deepseek, deepseekChoices);

  pushSelectGroup(GROUP.youtube, commonChoices);

  const netflixChoices = netflixProxies.length > 0 ? [GROUP.netflixNode, ...commonChoices] : commonChoices;
  pushSelectGroup(GROUP.netflix, netflixChoices);

  pushSelectGroup(GROUP.bahamut, getSafeChoices(["🇨🇳 台湾节点", GROUP.node, GROUP.manual, "DIRECT"]));

  pushSelectGroup(GROUP.bilibili, getSafeChoices([GROUP.direct, "🇨🇳 台湾节点", "🇭🇰 香港节点"]));

  pushSelectGroup(GROUP.globalMedia, commonChoices);

  pushSelectGroup(
    GROUP.domesticMedia,
    getSafeChoices(["DIRECT", "🇭🇰 香港节点", "🇨🇳 台湾节点", "🇸🇬 狮城节点", "🇯🇵 日本节点", GROUP.manual])
  );

  const defaultServiceChoices = getSafeChoices([
    "DIRECT",
    "🚀 节点选择",
    "🇺🇸 美国节点",
    "🇭🇰 香港节点",
    "🇨🇳 台湾节点",
    "🇸🇬 狮城节点",
    "🇯🇵 日本节点",
    "🇰🇷 韩国节点",
    GROUP.manual
  ]);

  pushSelectGroup(GROUP.googleFcm, defaultServiceChoices);

  const microsoftStoreChoices = getSafeChoices([
    "🚀 节点选择",
    "🇭🇰 香港节点",
    "🇯🇵 日本节点",
    "🇸🇬 狮城节点",
    "🇨🇳 台湾节点",
    "🇺🇸 美国节点",
    GROUP.manual,
    "DIRECT"
  ]);
  pushSelectGroup(GROUP.microsoftStore, microsoftStoreChoices);

  [GROUP.microsoftBing, GROUP.microsoftDrive, GROUP.microsoft, GROUP.apple, GROUP.games].forEach(name => {
    pushSelectGroup(name, defaultServiceChoices);
  });

  const neteaseProxies = getProxiesByRegex("(网易|音乐|解锁|Music|NetEase)");
  const neteaseChoices = ["DIRECT", GROUP.node];
  if (neteaseProxies.length > 0) neteaseChoices.push(...neteaseProxies);
  pushSelectGroup(GROUP.netease, neteaseChoices);

  // 收尾策略组：广告/净化/漏网之鱼。
  pushSelectGroup(GROUP.ads, ["REJECT", "DIRECT"]);
  pushSelectGroup(GROUP.appClean, ["REJECT", "DIRECT"]);
  pushSelectGroup(GROUP.fallback, [GROUP.node, "DIRECT", ...availableRegionGroupNames, GROUP.manual]);

  // 动态地区组放在后面，主服务入口更集中。
  proxyGroups.push(...regionGroups);

  config["proxy-groups"] = proxyGroups;
  config["unified-delay"] = true;
  config["tcp-concurrent"] = true;
  config["keep-alive-idle"] = 30;
  config["keep-alive-interval"] = 30;
  config["disable-keep-alive"] = false;
  config["find-process-mode"] = "always";
  config["global-client-fingerprint"] = "chrome";
  config.profile = {
    ...(config.profile || {}),
    "store-selected": true,
    "store-fake-ip": true
  };

  // 规则集统一走仓库根目录 Rules，确保 Clash 与 QX/Shadowrocket 使用同一批分流。
  const ruleProviderUrls = {
    // BEGIN GENERATED RULE PROVIDERS
    "BanAD": `${RULES_BASE}/ads.list`,
    "BanProgramAD": `${RULES_BASE}/app-clean.list`,
    "ChatGPT": `${RULES_BASE}/chatgpt.list`,
    "Claude": `${RULES_BASE}/claude.list`,
    "Gemini": `${RULES_BASE}/gemini.list`,
    "Grok": `${RULES_BASE}/grok.list`,
    "DeepSeek": `${RULES_BASE}/deepseek.list`,
    "AI": `${RULES_BASE}/ai.list`,
    "GitHub": `${RULES_BASE}/github.list`,
    "GoogleFCM": `${RULES_BASE}/google-fcm.list`,
    "Apple": `${RULES_BASE}/apple.list`,
    "Bing": `${RULES_BASE}/microsoft-bing.list`,
    "Microsoft": `${RULES_BASE}/microsoft.list`,
    "OneDrive": `${RULES_BASE}/microsoft-drive.list`,
    "ProxyMedia": `${RULES_BASE}/global-media.list`,
    "ChinaMedia": `${RULES_BASE}/domestic-media.list`,
    "BilibiliHMT": `${RULES_BASE}/bilibili.list`,
    "Bahamut": `${RULES_BASE}/bahamut.list`,
    "NetEaseMusic": `${RULES_BASE}/netease-music.list`,
    "Netflix": `${RULES_BASE}/netflix.list`,
    "YouTube": `${RULES_BASE}/youtube.list`,
    "Telegram": `${RULES_BASE}/telegram.list`,
    "Games": `${RULES_BASE}/games.list`,
    "DirectGroup": `${RULES_BASE}/direct.list`,
    "ProxyGFWlist": `${RULES_BASE}/proxy.list`
    // END GENERATED RULE PROVIDERS
  };

  config["rule-providers"] = {};
  const getRuleProviderPath = (name) => `./rulesets/Proxy-Config-Sets/${name}.list`;

  for (const [name, url] of Object.entries(ruleProviderUrls)) {
    config["rule-providers"][name] = {
      type: "http",
      behavior: "classical",
      format: "text",
      path: getRuleProviderPath(name),
      url: url,
      interval: 86400
    };
  }

  const claudeSuffixes = [
    "anthropic.com",
    "claude.ai",
    "claude.com",
    "clau.de",
    "claudemcpclient.com",
    "claudemcpcontent.com",
    "claudeusercontent.com",
    "sentry.io",
    "statsigapi.net",
    "intercom.io",
    "intercomcdn.com",
    // Stripe checkout geolocates currency from this IP. Keep it on Claude's US exit.
    "stripe.com",
    "stripecdn.com",
    "stripe.network",
    "link.com",
    "hcaptcha.com",
    // Proton Mail / SimpleLogin hide-my-email: same US exit as Claude.
    "proton.me",
    "protonmail.com",
    "protonmail.ch",
    "pm.me",
    "protonweb.com",
    "protonstatus.com",
    "protontech.ch",
    "simplelogin.io",
    "simplelogin.co",
    "simplelogin.com",
    "simplelogin.fr",
    "slmail.me",
    "passmail.com",
    "passmail.net",
    "passinbox.com",
    "passfwd.com",
    "aleeas.com",
    "silomails.com",
    "slmails.com",
    "dralias.com",
    // Sift fraud SDK (suffix, not coffee's wide keyword "sift")
    "sift.com",
    "siftcience.com",
    // coffee / Persona share Claude US exit
    "ip.net.coffee",
    "net.coffee",
    "withpersona.com",
    "persona.com"
  ];
  const claudeExactDomains = [
    "servd-anthropic-website.b-cdn.net",
    "anthropic.com.cdn.cloudflare.net",
    "anthropic.auth0.com",
    "anthropic-com.ghost.io",
    "browser-intake-us5-datadoghq.com",
    "cdn.usefathom.com"
  ];
  const claudeProcessNames = [
    "Claude",
    "Claude Helper",
    "Claude Helper (GPU)",
    "Claude Helper (Plugin)",
    "Claude Helper (Renderer)",
    "claude",
    "Claude Code",
    "Proton Mail",
    "Proton Mail Bridge"
  ];
  // ChatGPT.app 内置 Codex CLI，进程名是 Codex/codex。
  // 进程规则优先于域名，不能把 Codex 塞进 Claude，否则 chatgpt.com 会被整进程劫持。
  const chatgptProcessNames = [
    "ChatGPT",
    "ChatGPT Helper",
    "ChatGPT Helper (GPU)",
    "ChatGPT Helper (Plugin)",
    "ChatGPT Helper (Renderer)",
    "Codex",
    "codex"
  ];
  const claudeDnsServers = [
    "https://1.1.1.1/dns-query",
    "https://8.8.8.8/dns-query"
  ];
  const claudeNameserverPolicy = Object.fromEntries([
    ...claudeSuffixes.map(domain => [`+.${domain}`, claudeDnsServers]),
    ...claudeExactDomains.map(domain => [domain, claudeDnsServers]),
    ["+.withpersona.com", claudeDnsServers],
    ["+.persona.com", claudeDnsServers]
  ]);

  // 规则顺序很重要：Claude 必须在广告/直连/GFW 通配之前，避免被 REJECT 或切到其他出口。
  config["rules"] = [
    `IP-CIDR,10.0.0.0/8,DIRECT,no-resolve`,
    `IP-CIDR,100.64.0.0/10,DIRECT,no-resolve`,
    `IP-CIDR,127.0.0.0/8,DIRECT,no-resolve`,
    `IP-CIDR,169.254.0.0/16,DIRECT,no-resolve`,
    `IP-CIDR,172.16.0.0/12,DIRECT,no-resolve`,
    `IP-CIDR,192.168.0.0/16,DIRECT,no-resolve`,
    `PROCESS-NAME,captiveagent,DIRECT`,
    `PROCESS-NAME,Captive Network Assistant,DIRECT`,
    `PROCESS-NAME,WebSheet,DIRECT`,

    // 校园网/星巴克认证必须走当前 Wi-Fi 的 DHCP DNS + DIRECT，不能进代理。
    ...CAPTIVE_PORTAL_EXACT.map(domain => `DOMAIN,${domain},DIRECT`),
    ...CAPTIVE_PORTAL_SUFFIXES.map(domain => `DOMAIN-SUFFIX,${domain},DIRECT`),

    // Claude/Anthropic: UDP/QUIC 强制失败回落到 TCP；进程规则只覆盖 Claude，不覆盖 ChatGPT/Codex。
    ...claudeSuffixes.map(domain => `AND,((DOMAIN-SUFFIX,${domain}),(NETWORK,udp)),REJECT`),
    ...claudeExactDomains.map(domain => `AND,((DOMAIN,${domain}),(NETWORK,udp)),REJECT`),
    `AND,((GEOSITE,anthropic),(NETWORK,udp)),REJECT`,
    `AND,((DOMAIN-KEYWORD,sift),(NETWORK,udp)),REJECT`,
    `AND,((DOMAIN-KEYWORD,datadoghq),(NETWORK,udp)),REJECT`,
    `AND,((DOMAIN-KEYWORD,datadog),(NETWORK,udp)),REJECT`,
    `PROCESS-PATH-REGEX,(?i)/Claude\\.app/,${GROUP.claude}`,
    `PROCESS-PATH-REGEX,(?i)/ChatGPT\\.app/,${GROUP.chatgpt}`,
    ...claudeProcessNames.map(name => `PROCESS-NAME,${name},${GROUP.claude}`),
    ...chatgptProcessNames.map(name => `PROCESS-NAME,${name},${GROUP.chatgpt}`),
    // ChatGPT / Claude 域名走远端 RULE-SET，避免规则页再展开几十条 DomainSuffix。
    // UDP REJECT、进程名、nameserver-policy 仍由本脚本生成。
    `RULE-SET,ChatGPT,${GROUP.chatgpt}`,
    `GEOSITE,anthropic,${GROUP.claude}`,
    `RULE-SET,Claude,${GROUP.claude}`,


    // 国内中转会把 Claude Code 标成中国用户，直接拦掉。
    `DOMAIN-SUFFIX,huanling.icu,REJECT`,

    // 浏览器 WebRTC STUN 走 REJECT，避免 UDP 泄露真实 IP；游戏主机 STUN 仍留在 fake-ip-filter。
    `DOMAIN-SUFFIX,stun.l.google.com,REJECT`,
    `DOMAIN-SUFFIX,stun.cloudflare.com,REJECT`,
    `DOMAIN,stun.services.mozilla.com,REJECT`,

    `IP-CIDR,1.1.1.1/32,${GROUP.node},no-resolve`,
    `IP-CIDR,8.8.8.8/32,${GROUP.node},no-resolve`,

    `DOMAIN-SUFFIX,podcasts.apple.com,${GROUP.apple}`,
    `DOMAIN-SUFFIX,dnsleaktest.com,${GROUP.node}`,
    `DOMAIN-SUFFIX,deepl.com,${GROUP.direct}`,
    `DOMAIN-SUFFIX,ping0.cc,${GROUP.direct}`,
    `DOMAIN-SUFFIX,tjcn.org,${GROUP.direct}`,
    `RULE-SET,DirectGroup,${GROUP.direct}`,
    `RULE-SET,BanAD,${GROUP.ads}`,
    `RULE-SET,BanProgramAD,${GROUP.appClean}`,
    `RULE-SET,GoogleFCM,${GROUP.googleFcm}`,

    // 商店和更新域名要先于通用 Microsoft 规则匹配。
    `DOMAIN-SUFFIX,mp.microsoft.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,store.microsoft.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,storeedgefd.dsx.mp.microsoft.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,displaycatalog.mp.microsoft.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,purchase.md.mp.microsoft.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,licensing.mp.microsoft.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,store-images.microsoft.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,storecatalogrevocation.storequality.microsoft.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,dl.delivery.mp.microsoft.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,delivery.mp.microsoft.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,prod.do.dsp.mp.microsoft.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,windowsupdate.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,login.live.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,account.live.com,${GROUP.microsoftStore}`,
    `DOMAIN-SUFFIX,auth.gfx.ms,${GROUP.microsoftStore}`,

    `RULE-SET,Bing,${GROUP.microsoftBing}`,
    `RULE-SET,OneDrive,${GROUP.microsoftDrive}`,
    `RULE-SET,Microsoft,${GROUP.microsoft}`,
    `RULE-SET,Apple,${GROUP.apple}`,
    `RULE-SET,Telegram,${GROUP.telegram}`,
    `RULE-SET,GitHub,${GROUP.github}`,
    `RULE-SET,Gemini,${GROUP.gemini}`,
    `RULE-SET,Grok,${GROUP.grok}`,
    `RULE-SET,DeepSeek,${GROUP.deepseek}`,
    `RULE-SET,AI,${GROUP.ai}`,
    `RULE-SET,NetEaseMusic,${GROUP.netease}`,
    `RULE-SET,Games,${GROUP.games}`,
    `RULE-SET,YouTube,${GROUP.youtube}`,
    `RULE-SET,Netflix,${GROUP.netflix}`,
    `RULE-SET,Bahamut,${GROUP.bahamut}`,
    `RULE-SET,BilibiliHMT,${GROUP.bilibili}`,
    `RULE-SET,ChinaMedia,${GROUP.domesticMedia}`,
    `RULE-SET,ProxyMedia,${GROUP.globalMedia}`,
    `RULE-SET,ProxyGFWlist,${GROUP.node}`,
    `GEOIP,CN,${GROUP.direct}`,
    `MATCH,${GROUP.fallback}`
  ];

  // DNS / TUN：保留订阅节点 DNS，只补校园网认证需要的策略。
  // 延迟相关原则：
  // 1. YepFast 用专用 proxy-server-nameserver 解析 *.cloud.we-tencent.click。
  //    一旦改成校园 DHCP/公共 DNS，节点会解析到更差的 IP，延迟从几十毫秒变成几百毫秒。
  // 2. 订阅的 nameserver / fake-ip-filter / fake-ip-range 一并保留，只追加校内域名策略。
  // 3. 不开启 strict-route。tun.stack 由 Clash Verge 应用设置接管，脚本写入会被丢弃并弹黄条。
  config.ipv6 = false;

  const inheritedTun = { ...(config.tun || {}) };
  delete inheritedTun.stack;
  const inheritedRouteExcludes = Array.isArray(inheritedTun["route-exclude-address"])
    ? inheritedTun["route-exclude-address"]
    : [];

  config.tun = {
    ...inheritedTun,
    "auto-route": inheritedTun["auto-route"] !== false,
    "auto-detect-interface": inheritedTun["auto-detect-interface"] !== false,
    "strict-route": false,
    "ipv6": false,
    "dns-hijack": Array.isArray(inheritedTun["dns-hijack"]) && inheritedTun["dns-hijack"].length > 0
      ? inheritedTun["dns-hijack"]
      : ["any:53", "tcp://any:53"],
    "route-exclude-address": unique([...inheritedRouteExcludes, ...LAN_ROUTE_EXCLUDES])
  };

  const inheritedDns = config.dns || {};
  const campusDnsServers = getCampusDnsServers();
  const directChinaDns = [
    "https://223.5.5.5/dns-query#DIRECT",
    "https://1.12.12.12/dns-query#DIRECT"
  ];
  const inheritedProxyServerNS = unique(inheritedDns["proxy-server-nameserver"]);
  const inheritedNameserver = unique(inheritedDns.nameserver);
  const inheritedDefaultNS = unique(inheritedDns["default-nameserver"]);
  const inheritedFakeIpFilter = Array.isArray(inheritedDns["fake-ip-filter"])
    ? inheritedDns["fake-ip-filter"]
    : [];
  const inheritedPolicy = inheritedDns["nameserver-policy"] && typeof inheritedDns["nameserver-policy"] === "object"
    ? inheritedDns["nameserver-policy"]
    : {};

  const campusPolicy = {
    ...Object.fromEntries(CAPTIVE_PORTAL_EXACT.map(domain => [domain, campusDnsServers])),
    ...Object.fromEntries(CAPTIVE_PORTAL_SUFFIXES.map(domain => [`+.${domain}`, campusDnsServers])),
    "geosite:private": campusDnsServers
  };

  config.dns = {
    ...inheritedDns,
    "enable": true,
    "ipv6": false,
    "prefer-h3": false,
    "use-hosts": inheritedDns["use-hosts"] !== false,
    "use-system-hosts": inheritedDns["use-system-hosts"] !== false,
    "respect-rules": true,
    "enhanced-mode": inheritedDns["enhanced-mode"] || "fake-ip",
    "fake-ip-range": inheritedDns["fake-ip-range"] || "198.18.0.1/16",
    "fake-ip-filter-mode": inheritedDns["fake-ip-filter-mode"] || "blacklist",
    "default-nameserver": inheritedDefaultNS.length > 0
      ? inheritedDefaultNS
      : ["223.5.5.5", "223.6.6.6", "119.29.29.29", "system"],
    // 订阅自带的节点 DNS 优先；没有时才用国内 DoH，绝不用校园 DNS 解析节点。
    "proxy-server-nameserver": inheritedProxyServerNS.length > 0
      ? inheritedProxyServerNS
      : directChinaDns,
    // 普通查询走代理内 DoH，避免出现“连接在海外、DNS 在大陆”的风控特征。
    // 国内域名仍直连国内 DoH；节点域名继续只用订阅自带 proxy-server-nameserver。
    "nameserver": claudeDnsServers,
    "nameserver-policy": {
      ...inheritedPolicy,
      "geosite:cn": directChinaDns,
      ...claudeNameserverPolicy,
      ...campusPolicy
    },
    "fake-ip-filter": unique([
      ...inheritedFakeIpFilter,
      "*.lan",
      "*.localdomain",
      "*.example",
      "*.invalid",
      "*.localhost",
      "*.test",
      "*.local",
      "*.home.arpa",
      ...CAPTIVE_PORTAL_EXACT,
      ...CAPTIVE_PORTAL_SUFFIXES.flatMap(domain => [domain, `*.${domain}`]),
      "time.*.com",
      "time.*.gov",
      "time.*.edu.cn",
      "time.*.apple.com",
      "time-ios.apple.com",
      "time1.*.com",
      "time2.*.com",
      "time3.*.com",
      "time4.*.com",
      "time5.*.com",
      "time6.*.com",
      "time7.*.com",
      "ntp.*.com",
      "ntp.*.org",
      "pool.ntp.org",
      "stun.*.*",
      "stun.*.*.*",
      "+.stun.*.*",
      "+.stun.*.*.*",
      "+.stun.*.*.*.*",
      "+.srv.nintendo.net",
      "+.igwf.netease.com",
      "stun.qq.com",
      "dns.alidns.com",
      "doh.pub",
      "dns.google",
      "cloudflare-dns.com",
      "www.gstatic.com",
      "gstatic.com"
    ]).filter(item => {
      const value = String(item);
      const isStun = /(^|\.)stun\./i.test(value);
      const keepGameStun = /nintendo|playstation|xbox|qq\.com|igwf\.netease/i.test(value);
      if (isStun && !keepGameStun) return false;
      return true;
    })
  };

  const inheritedSniffer = config.sniffer || {};
  const inheritedSkipDomain = Array.isArray(inheritedSniffer["skip-domain"])
    ? inheritedSniffer["skip-domain"]
    : [];
  config.sniffer = {
    ...inheritedSniffer,
    "enable": true,
    "force-dns-mapping": true,
    "parse-pure-ip": inheritedSniffer["parse-pure-ip"] !== false,
    "override-destination": false,
    "sniff": inheritedSniffer.sniff || {
      "HTTP": {
        "ports": [80, 8080],
        "override-destination": false
      },
      "TLS": {
        "ports": [443, 8443]
      },
      "QUIC": {
        "ports": []
      }
    },
    "skip-domain": unique([
      ...inheritedSkipDomain,
      "Mijia Cloud",
      "dlg.io.mi.com",
      "+.apple.com",
      "+.gstatic.com",
      "www.gstatic.com"
    ])
  };

  return config;
}
