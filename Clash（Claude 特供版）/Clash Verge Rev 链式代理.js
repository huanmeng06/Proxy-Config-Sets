// Define main function (script entry)

// function main(config, profileName) {
//   return config;
// }


// Clash Verge Rev global extend script.
// Keep YepFast proxy-server-nameserver intact so node delay stays close to the official app.
// Campus DNS is only used for captive portal / school / private domains.
// Ordinary DNS follows 🐟 漏网之鱼; Claude DNS follows the selected ISP exit.
// Claude DoH drops TYPE64/SVCB and TYPE65/HTTPS (disable-qtype-64/65 fragment).
// Airport entry is the first hop; explicit 链式 nodes and ISP exits form 🔗 链式节点. ISP entries are always listed last; no chain group means no chain entry group.
// Do not ship or inject any landing SOCKS. If Clash extra proxies has a name containing ISP,
// rewrite it to 🔗🇺🇸 美国 … [ISP] and list ISP entries after explicit 链式 nodes.
// Domain/UDP/fingerprint follow the dedicated routing policy.
// Do not send proxy-server-nameserver through the chain.

function main(config, profileName) {
  // 即使订阅为空也生成拒绝链式出口，避免沿用订阅中的机场直出策略。
  if (!Array.isArray(config.proxies)) config.proxies = [];

  // 全局常量：策略组显示名、测速参数和自维护规则地址集中放这里。
  // 与 YepFast 对齐；HTTP 探针仅用于延迟显示，业务 HTTPS 不受影响。
  const TEST_URL = "http://cp.cloudflare.com/generate_204";
  const INTERVAL = 3600;
  const TOLERANCE = 50;
  const RULES_BASE = "https://raw.githubusercontent.com/huanmeng06/Proxy-Config-Sets/refs/heads/main/Rules";
  // macOS + 校园网 TUN 兼容参数。
  // Wi-Fi 在绝大多数 Mac 上是 en0；如你的机器不同，只改这一行。
  const WIFI_INTERFACE = "en0";
  // 校园网只影响认证页/校内域名的 nameserver-policy，不再覆盖节点 DNS。
  // 节点域名必须继续走订阅自带的 proxy-server-nameserver，否则延迟会明显变高。

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
    "dns.msftncsi.com",
    "neverssl.com"
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
  // ===== 本地自定义分流区：只在这里添加网站规则，不需要改 Rules/ 或同步到 GitHub =====
  // 格式：DOMAIN-SUFFIX,example.com,目标策略组；目标可以是地区组、手动组、链式组或 DIRECT。
  // 例如："DOMAIN-SUFFIX,example.com,🇺🇸 美国节点",
  const LOCAL_CUSTOM_RULES = [
    // 原有本地直连规则：继续放在这里，后续可直接增删或改目标策略组。
    "DOMAIN-SUFFIX,deepl.com,🎯 全球直连",
    "DOMAIN-SUFFIX,ping0.cc,🎯 全球直连",
    "DOMAIN-SUFFIX,tjcn.org,🎯 全球直连",
    // "DOMAIN-SUFFIX,example.com,🇺🇸 美国节点",
  ];

  const GROUP = {
    node: "🚀 节点选择",
    manual: "🚀 手动切换",
    direct: "🎯 全球直连",
    download: "⏬ 下载专用",
    telegram: "📲 电报消息",
    front: "🔗 链式节点",
    domesticAi: "🇨🇳 国内 AI",
    foreignAi: "🌍 国外 AI",
    github: "🐙 GITHUB",
    chatgpt: "🤖 ChatGPT",
    claude: "🧠 Claude",
    gemini: "✨ Gemini",
    grok: "✖️ Grok",
    youtube: "📹 油管视频",
    bahamut: "📺 巴哈姆特",
    bilibili: "📺 哔哩哔哩",
    globalMedia: "🌍 国外媒体",
    domesticMedia: "🌏 国内媒体",
    googleFcm: "📢 谷歌FCM",
    microsoft: "Ⓜ️ 微软服务",
    apple: "🍎 苹果服务",
    games: "🎮 游戏平台",
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
    { emoji: "🇺🇸", regex: /(美[国國]|华盛顿|波特兰|达拉斯|俄勒冈|凤凰城|菲尼克斯|费利蒙|弗里蒙特|硅谷|旧金山|拉斯维加斯|洛杉|圣何塞|圣荷西|圣塔?克拉拉|西雅图|芝加哥|哥伦布|纽约|阿什本|纽瓦克|丹佛|加利福尼亚|弗吉尼亚|马纳萨斯|俄亥俄|得克萨斯|[佐乔]治亚|亚特兰大|佛罗里达|迈阿密|\bUS(?:A)?\b|United States)(?!中[轉转])/i },
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

  // 不自带落地 ISP。只有额外节点/Merge 里原名带 ISP 的 SOCKS 才作为链式出口并改名。
  const LANDING_REGION_BY_FLAG = {
    "🇭🇰": "香港",
    "🇨🇳": "台湾",
    "🇯🇵": "日本",
    "🇸🇬": "狮城",
    "🇰🇷": "韩国",
    "🇲🇾": "马来西亚",
    "🇮🇩": "印尼",
    "🇮🇳": "印度",
    "🇵🇭": "菲律宾",
    "🇹🇭": "泰国",
    "🇻🇳": "越南",
    "🇰🇿": "哈萨克斯坦",
    "🇵🇰": "巴基斯坦",
    "🇬🇧": "英国",
    "🇫🇷": "法国",
    "🇩🇪": "德国",
    "🇧🇪": "比利时",
    "🇳🇱": "荷兰",
    "🇷🇺": "俄罗斯",
    "🇨🇭": "瑞士",
    "🇸🇪": "瑞典",
    "🇮🇹": "意大利",
    "🇪🇸": "西班牙",
    "🇵🇱": "波兰",
    "🇺🇦": "乌克兰",
    "🇦🇹": "奥地利",
    "🇮🇪": "爱尔兰",
    "🇲🇩": "摩尔多瓦",
    "🇺🇸": "美国",
    "🇨🇦": "加拿大",
    "🇦🇷": "阿根廷",
    "🇧🇷": "巴西",
    "🇲🇽": "墨西哥",
    "🇨🇱": "智利",
    "🇹🇷": "土耳其",
    "🇦🇪": "阿联酋",
    "🇮🇱": "以色列",
    "🇸🇦": "沙特",
    "🇿🇦": "南非",
    "🇪🇬": "埃及",
    "🇳🇬": "尼日利亚",
    "🇦🇺": "澳洲",
    "🇳🇿": "新西兰"
  };

  const isGeneratedViaName = (name) => {
    const n = String(name || "");
    return n.startsWith("via ") || n.startsWith("↪ ");
  };
  const isLandingIspName = (name) => {
    const n = String(name || "");
    if (!n || isGeneratedViaName(n)) return false;
    return /ISP/i.test(n);
  };
  const isLandingIspProxy = (proxy) => Boolean(proxy) && isLandingIspName(proxy.name);
  const isExplicitChainProxy = (proxy) => {
    if (!proxy || isLandingIspProxy(proxy)) return false;
    return /链式/.test(String(proxy.name || ""));
  };
  const isGeneratedViaClone = (proxy) => Boolean(proxy) && isGeneratedViaName(proxy.name);

  const formatLandingIspName = (raw) => {
    const original = String(raw || "").trim();
    let matchedRule = null;
    for (const rule of emojiRules) {
      if (!LANDING_REGION_BY_FLAG[rule.emoji]) continue;
      if (original.includes(rule.emoji) || rule.regex.test(original)) {
        matchedRule = rule;
        break;
      }
    }
    const flag = matchedRule ? matchedRule.emoji : "";
    const region = flag ? LANDING_REGION_BY_FLAG[flag] : "";
    let extra = original;
    for (const rule of emojiRules) {
      extra = extra.split(rule.emoji).join(" ");
    }
    extra = extra
      .replace(/[🔗🌟🏠🛬⏬🔰]/g, " ")
      .replace(/\[\s*ISP\s*\]/ig, " ")
      .replace(/ISP/ig, " ")
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\-\.\_]/g, " ");
    if (matchedRule) extra = extra.replace(matchedRule.regex, " ");
    if (region) extra = extra.split(region).join(" ");
    extra = extra.replace(/\s+/g, " ").trim();
    const body = [region, extra].filter(Boolean).join(" ");
    if (flag) return body ? `🔗${flag} ${body} [ISP]` : `🔗${flag} [ISP]`;
    return body ? `🔗 ${body} [ISP]` : "🔗 [ISP]";
  };

  // 清掉上一轮脚本注入的 ↪ / via 克隆，避免再次进入地区组。
  config.proxies = config.proxies.filter(proxy => !isGeneratedViaClone(proxy));

  config.proxies.forEach(proxy => {
    if (isLandingIspProxy(proxy)) {
      proxy.name = formatLandingIspName(proxy.name);
      return;
    }
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
  });

  // 节点名清洗/ISP 格式化后可能碰撞；保留全部节点并追加稳定序号。
  const nameCounts = new Map();
  config.proxies.forEach(proxy => {
    const base = String(proxy.name || "").trim() || "未命名节点";
    const count = (nameCounts.get(base) || 0) + 1;
    nameCounts.set(base, count);
    proxy.name = count === 1 ? base : `${base} (${count})`;
  });

  const landingIsps = (config.proxies || []).filter(isLandingIspProxy);
  landingIsps.forEach((isp) => {
    delete isp["dialer-proxy"];
  });


  // 地区组 / 手动切换只用普通机场节点；ISP 与显式链式节点只进入链式组。
  const explicitChainProxies = config.proxies.filter(isExplicitChainProxy);
  const subscriptionProxies = config.proxies.filter(proxy => !isLandingIspProxy(proxy) && !isExplicitChainProxy(proxy));
  const proxies = subscriptionProxies.map(p => p.name);

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

  // Drop SVCB/HTTPS (TYPE64/65) on our DoH so Claude cannot learn h3/ECH from DNS.
  // Official mihomo syntax is a nameserver URL fragment, NOT dns.disable-qtype-65 at root.
  const QTYPE_DROP = "disable-qtype-64=true&disable-qtype-65=true";
  const withQtypeDrop = (server) => {
    if (typeof server !== "string" || /disable-qtype-6[45]=/.test(server)) return server;
    return server.includes("#") ? `${server}&${QTYPE_DROP}` : `${server}#${QTYPE_DROP}`;
  };


  function createUrlTestGroup(name, groupProxies, options = {}) {
    return {
      name,
      type: "url-test",
      url: options.url ?? TEST_URL,
      interval: options.interval ?? INTERVAL,
      tolerance: options.tolerance ?? TOLERANCE,
      lazy: options.lazy ?? true,
      timeout: options.timeout ?? 3000,
      "expected-status": 204,
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

  // 低倍率下载节点单独测速，方便 GitHub release 等大文件下载场景。
  // 复用上面的 isDownloadNode，保证分组结果和 ⏬ 前缀判断永远一致。
  const downloadProxies = proxies.filter(isDownloadNode);
  if (downloadProxies.length > 0) {
    regionGroups.push(createUrlTestGroup(GROUP.download, downloadProxies, { interval: 600, tolerance: 100 }));
    availableRegionGroupNames.push(GROUP.download);
  }

  // 地区组统一顺序：香港、新加坡、日本、台湾、美国，其他地区最后。
  const REGION_ORDER = ["🇭🇰", "🇸🇬", "🇯🇵", "🇨🇳", "🇺🇸"];
  const regionRank = (name) => {
    const normalizedName = name.replace(/^🏠/, "");
    const flagIndex = REGION_ORDER.findIndex(flag => normalizedName.startsWith(flag));
    const base = flagIndex >= 0 ? flagIndex * 2 : REGION_ORDER.length * 2 + 100;
    return base + (name.includes("家宽") ? 1 : 0);
  };
  availableRegionGroupNames.sort((a, b) => regionRank(a) - regionRank(b));
  regionGroups.sort((a, b) => regionRank(a.name) - regionRank(b.name));

  // 策略组：先放常用服务组，再追加动态地区组。
  const allProxies = proxies.length > 0 ? proxies : ["DIRECT"];
  const proxyGroups = [];
  const hasChainGroup = config.proxies.some(proxy => isExplicitChainProxy(proxy) || isLandingIspProxy(proxy));
  const chainChoice = hasChainGroup ? [GROUP.front] : [];
  const pushSelectGroup = (name, choices) => {
    // 已包含链式节点的组统一排序：节点选择之后、地区节点之前。
    // 调用方已经明确了每个组的顺序；这里仅在没有链式组时移除该选项，
    // 不再把它重新插回组首，避免无链式节点时产生幽灵引用。
    const orderedChoices = choices.filter(choice => choice !== GROUP.front || hasChainGroup);
    proxyGroups.push(createSelectGroup(name, orderedChoices));
  };

  const regionOnlyChoices = availableRegionGroupNames.filter(name => /(?:节点|家宽)$/.test(name));
  const foreignAiRegionChoices = regionOnlyChoices.filter(name => !name.includes("香港"));

  // 默认节点只调整现有候选的顺序，不创建不存在的地区/家宽组。
  const preferFirst = (choices, patterns) => {
    const result = [...choices];
    for (const pattern of patterns) {
      const index = result.findIndex(choice => pattern.test(String(choice)));
      if (index > 0) {
        const [item] = result.splice(index, 1);
        result.unshift(item);
      }
    }
    return result;
  };
  const HK_NODE = "🇭🇰 香港节点";
  const US_NODE = "🇺🇸 美国节点";
  const HK_NODE_RE = /^🇭🇰 香港节点$/;
  const US_NODE_RE = /^🇺🇸 美国节点$/;
  const NEW_YORK_ISP = /(?:纽约|New\s*York).*ISP|ISP.*(?:纽约|New\s*York)/i;
  const HK_CHAIN_ENTRY = /香港\s*0?1.*(?:链式入口|链式)|(?:链式入口|链式).*香港\s*0?1/i;

  // 国外默认组不允许 DIRECT，避免业务走代理而 DNS 却回到校园网。
  const foreignChoices = [...availableRegionGroupNames, GROUP.manual, ...chainChoice];
  pushSelectGroup(GROUP.node, preferFirst(foreignChoices, [HK_NODE_RE]));

  pushSelectGroup(GROUP.manual, preferFirst(allProxies, [HK_CHAIN_ENTRY, /香港\s*0?1/i]));

  // 保留原有的“全球直连”策略组：它是可切换的 DIRECT 包装组，
  // 与 mihomo 内置的 DIRECT 出站不是同一个名称。
  pushSelectGroup(GROUP.direct, ["DIRECT", GROUP.node]);

  // 只有显式“链式”节点或 ISP 节点存在时，才生成链式组和链式前置组。
  const chainExitNames = [
    ...explicitChainProxies.map(proxy => proxy.name),
    ...landingIsps.map(isp => isp.name)
  ];
  const CHAIN_ENTRY = "📡 链式入口";
  const airportNames = subscriptionProxies.map(node => node.name);
  if (hasChainGroup) {
    proxyGroups.push(createSelectGroup(CHAIN_ENTRY, preferFirst(airportNames, [HK_CHAIN_ENTRY, /香港\s*0?1/i])));
    landingIsps.forEach(isp => { isp["dialer-proxy"] = CHAIN_ENTRY; });
    proxyGroups.push(createSelectGroup(GROUP.front, preferFirst(chainExitNames, [NEW_YORK_ISP])));
  }

  const commonChoices = [GROUP.node, ...availableRegionGroupNames, GROUP.manual, GROUP.direct, ...chainChoice];
  const builtInChoices = new Set(["DIRECT", GROUP.node, GROUP.manual, GROUP.direct, ...(hasChainGroup ? [GROUP.front] : [])]);
  const isAvailableChoice = (name) => builtInChoices.has(name) || availableRegionGroupNames.includes(name);

  const getSafeChoices = (preferred) => {
    const safe = preferred.filter(isAvailableChoice);
    return safe.length > 0 ? safe : ["DIRECT"];
  };

  // 常用服务组保持在 UI 前半段，方便日常切换。
  pushSelectGroup(GROUP.telegram, getSafeChoices([HK_NODE, GROUP.node, GROUP.manual, GROUP.direct, ...availableRegionGroupNames, ...chainChoice]));

  const githubChoices = getSafeChoices([
    GROUP.node,
    GROUP.manual,
    "🇭🇰 香港节点",
    "🇸🇬 狮城节点",
    "🇯🇵 日本节点",
    "🇺🇸 美国节点",
    "🇨🇳 台湾节点",
    GROUP.download,
    ...chainChoice
  ]);
  pushSelectGroup(GROUP.github, preferFirst(githubChoices, [HK_NODE_RE]));

  // ChatGPT / Claude / Gemini / Grok 各自独立选择，顺序固定为美国、新加坡、日本、台湾。
  const usFirstAiChoices = preferFirst(getSafeChoices([
    "🇺🇸 美国节点",
    "🏠🇺🇸 美国家宽",
    "🇸🇬 狮城节点",
    "🏠🇸🇬 狮城家宽",
    "🇯🇵 日本节点",
    "🏠🇯🇵 日本家宽",
    "🇨🇳 台湾节点",
    "🏠🇨🇳 台湾家宽",
    GROUP.manual,
    ...chainChoice
  ]), [US_NODE_RE]);
  pushSelectGroup(GROUP.chatgpt, usFirstAiChoices);
  // Claude 只能选择真正设置了 dialer-proxy 的 ISP 落地出口；普通“链式”节点
  // 仍可供手动链式组使用，但不作为 Claude 的出口候选。
  const claudeChoices = landingIsps.length > 0
    ? preferFirst(landingIsps.map(isp => isp.name), [NEW_YORK_ISP])
    : ["REJECT"];
  pushSelectGroup(GROUP.claude, claudeChoices);
  pushSelectGroup(GROUP.gemini, usFirstAiChoices);
  pushSelectGroup(GROUP.grok, usFirstAiChoices);

  // 国内外 AI 组紧跟 Grok，便于在 UI 中连续切换 AI 服务。
  const domesticAiChoices = ["DIRECT", GROUP.direct, ...regionOnlyChoices];
  const foreignAiChoices = [...chainChoice, ...foreignAiRegionChoices];
  proxyGroups.push(createSelectGroup(GROUP.domesticAi, domesticAiChoices));
  proxyGroups.push(createSelectGroup(GROUP.foreignAi, foreignAiChoices.length > 0 ? foreignAiChoices : ["REJECT"]));

  pushSelectGroup(GROUP.youtube, getSafeChoices([HK_NODE, GROUP.node, GROUP.manual, GROUP.direct, ...availableRegionGroupNames, ...chainChoice]));

  pushSelectGroup(GROUP.bahamut, getSafeChoices(["🇨🇳 台湾节点", GROUP.node, GROUP.manual, GROUP.direct]));

  pushSelectGroup(GROUP.bilibili, getSafeChoices([GROUP.direct, "🇨🇳 台湾节点", "🇭🇰 香港节点"]));

  pushSelectGroup(GROUP.globalMedia, getSafeChoices([US_NODE, GROUP.node, GROUP.manual, GROUP.direct, ...availableRegionGroupNames, ...chainChoice]));

  pushSelectGroup(
    GROUP.domesticMedia,
    getSafeChoices([GROUP.direct, "🇭🇰 香港节点", "🇨🇳 台湾节点", "🇸🇬 狮城节点", "🇯🇵 日本节点", GROUP.manual, ...chainChoice])
  );

  const defaultServiceChoices = getSafeChoices([
    HK_NODE,
    GROUP.node,
    "🇺🇸 美国节点",
    "🇭🇰 香港节点",
    "🇨🇳 台湾节点",
    "🇸🇬 狮城节点",
    "🇯🇵 日本节点",
    "🇰🇷 韩国节点",
    GROUP.manual,
    ...chainChoice
  ]);

  pushSelectGroup(GROUP.googleFcm, defaultServiceChoices);
  pushSelectGroup(GROUP.microsoft, defaultServiceChoices);
  pushSelectGroup(GROUP.apple, defaultServiceChoices);
  pushSelectGroup(GROUP.games, defaultServiceChoices);

  pushSelectGroup(GROUP.ads, ["REJECT", "DIRECT"]);
  pushSelectGroup(GROUP.appClean, ["REJECT", "DIRECT"]);
  proxyGroups.push(createSelectGroup(GROUP.fallback, [
    ...chainChoice,
    GROUP.node,
    GROUP.manual,
    ...availableRegionGroupNames,
    GROUP.direct
  ]));

  // 动态地区组放在后面，主服务入口更集中。
  proxyGroups.push(...regionGroups);

  config["proxy-groups"] = proxyGroups;
  config["unified-delay"] = true;
  config["tcp-concurrent"] = true;
  config["keep-alive-idle"] = 30;
  config["keep-alive-interval"] = 30;
  config["disable-keep-alive"] = false;
  config["find-process-mode"] = "always";
  delete config["global-client-fingerprint"];
  const utlsTypes = new Set(["vmess", "vless", "trojan", "anytls"]);
  config.proxies.forEach(proxy => {
    if (!proxy || proxy["client-fingerprint"]) return;
    const type = String(proxy.type || "").toLowerCase();
    if (utlsTypes.has(type) || proxy.tls === true || proxy["reality-opts"]) {
      proxy["client-fingerprint"] = "chrome";
    }
  });
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
    "Reject": `${RULES_BASE}/reject.list`,
    "ChatGPT": `${RULES_BASE}/chatgpt.list`,
    "Claude": `${RULES_BASE}/claude.list`,
    "Gemini": `${RULES_BASE}/gemini.list`,
    "Grok": `${RULES_BASE}/grok.list`,
    "DomesticAI": `${RULES_BASE}/ai-domestic.list`,
    "ForeignAI": `${RULES_BASE}/ai-foreign.list`,
    "GitHub": `${RULES_BASE}/github.list`,
    "GoogleFCM": `${RULES_BASE}/google-fcm.list`,
    "MicrosoftStore": `${RULES_BASE}/microsoft-store.list`,
    "Apple": `${RULES_BASE}/apple.list`,
    "Bing": `${RULES_BASE}/microsoft-bing.list`,
    "Microsoft": `${RULES_BASE}/microsoft.list`,
    "OneDrive": `${RULES_BASE}/microsoft-drive.list`,
    "ProxyMedia": `${RULES_BASE}/global-media.list`,
    "ChinaMedia": `${RULES_BASE}/domestic-media.list`,
    "BilibiliHMT": `${RULES_BASE}/bilibili.list`,
    "Bahamut": `${RULES_BASE}/bahamut.list`,
    "YouTube": `${RULES_BASE}/youtube.list`,
    "Telegram": `${RULES_BASE}/telegram.list`,
    "Games": `${RULES_BASE}/games.list`,
    "ProxyGFWlist": `${RULES_BASE}/proxy.list`,
    "DirectGroup": `${RULES_BASE}/direct.list`
    // END GENERATED RULE PROVIDERS
  };

  const inheritedRuleProviders = config["rule-providers"] && typeof config["rule-providers"] === "object"
    ? config["rule-providers"]
    : {};
  config["rule-providers"] = { ...inheritedRuleProviders };
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
    // Sift fraud SDK suffix; wide sift/datadog keywords live in claude.list.
    "sift.com",
    "siftcience.com",
    // Persona shares Claude US exit. Coffee test sites stay outside business routing.
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

  // 规则顺序很重要：Claude 必须在广告/直连/GFW 通配之前。
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

    // 微信无法区分主程序与小程序；按用户要求，微信及其 Helper 全部直连。
    `PROCESS-NAME,WeChat,DIRECT`,
    `PROCESS-NAME,WeChat Helper,DIRECT`,
    `PROCESS-PATH-REGEX,(?i)/WeChat\\.app/,DIRECT`,
    `DOMAIN-SUFFIX,weixin.qq.com,DIRECT`,
    `DOMAIN-SUFFIX,qq.com,DIRECT`,
    `DOMAIN-SUFFIX,wechat.com,DIRECT`,
    `DOMAIN-SUFFIX,luckincoffeecdn.com,DIRECT`,
    `DOMAIN-SUFFIX,luckincoffee.com,DIRECT`,

    // Browser WebRTC STUN. Google uses stun/stun1-4.l.google.com:19302/19305.
    // Domain names live in reject.list; these ports catch IP-literal STUN after DNS.
    // Do not reject UDP 3478 (Discord / Telegram / games).
    `AND,((NETWORK,udp),(DST-PORT,19302)),REJECT`,
    `AND,((NETWORK,udp),(DST-PORT,19305)),REJECT`,

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
    ...LOCAL_CUSTOM_RULES,

    // 认证域名放在业务进程/专用域名规则之后：Claude 请求认证探测域名时，
    // 仍先按 Claude 进程识别；系统认证进程在上方继续保持 DIRECT。
    ...CAPTIVE_PORTAL_EXACT.map(domain => `DOMAIN,${domain},DIRECT`),
    ...CAPTIVE_PORTAL_SUFFIXES.map(domain => `DOMAIN-SUFFIX,${domain},DIRECT`),

    // 原有 DirectGroup 规则恢复：命中仓库中的 direct.list 后进入可切换的全球直连组。
    `RULE-SET,DirectGroup,${GROUP.direct}`,

    // 商店 / 硬 REJECT 走远端 RULE-SET；UDP AND、进程名、校园认证仍本地。
    `RULE-SET,Reject,REJECT`,
    // `DOMAIN,codex-reset.com,REJECT`,
    `RULE-SET,BanAD,${GROUP.ads}`,
    `RULE-SET,BanProgramAD,${GROUP.appClean}`,
    `RULE-SET,GoogleFCM,${GROUP.googleFcm}`,

    // 商店、Bing、OneDrive 和通用 Microsoft 规则统一进入微软服务组。
    `RULE-SET,MicrosoftStore,${GROUP.microsoft}`,
    `RULE-SET,Bing,${GROUP.microsoft}`,
    `RULE-SET,OneDrive,${GROUP.microsoft}`,
    `RULE-SET,Microsoft,${GROUP.microsoft}`,
    `RULE-SET,Apple,${GROUP.apple}`,
    `RULE-SET,Telegram,${GROUP.telegram}`,
    `RULE-SET,GitHub,${GROUP.github}`,
    `RULE-SET,Gemini,${GROUP.gemini}`,
    `RULE-SET,Grok,${GROUP.grok}`,
    `RULE-SET,DomesticAI,${GROUP.domesticAi}`,
    `RULE-SET,ForeignAI,${GROUP.foreignAi}`,
    `RULE-SET,Games,${GROUP.games}`,
    `RULE-SET,YouTube,${GROUP.youtube}`,
    `RULE-SET,Bahamut,${GROUP.bahamut}`,
    `RULE-SET,BilibiliHMT,${GROUP.bilibili}`,
    `RULE-SET,ChinaMedia,${GROUP.domesticMedia}`,
    `RULE-SET,ProxyMedia,${GROUP.globalMedia}`,
    `RULE-SET,ProxyGFWlist,${GROUP.node}`,
    `GEOIP,CN,${GROUP.direct}`,
    `MATCH,${GROUP.fallback}`
  ];

  // 保留订阅专用节点 DNS；这些 DNS 服务自身的域名用 IP 地址 DoH 启动解析。
  // 普通 DNS 经机场加密解析，只有 Claude DNS 使用落地 ISP。
  // 校园 DNS 只解析认证/内网域名；不强制 mixed/strict-route。
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
    "dns-hijack": unique([
      ...(Array.isArray(inheritedTun["dns-hijack"]) ? inheritedTun["dns-hijack"] : []),
      "any:53", "tcp://any:53"
    ]),
    "route-exclude-address": unique([...inheritedRouteExcludes, ...LAN_ROUTE_EXCLUDES])
  };

  const inheritedDns = config.dns || {};
  const campusDnsServers = getCampusDnsServers().map((server) =>
    withQtypeDrop(/#/.test(server) ? server : `${server}#DIRECT`)
  );
    // 普通查询跟随漏网之鱼当前出口；国内/校园 policy 在后面显式覆盖。
  // Claude 与相关服务仍通过链式 DoH，与落地出口对齐。
  // 节点自身的域名解析仍使用独立 bootstrap DNS，避免代理建立前出现循环依赖。
  const dnsForGroup = (group) => [
    `https://1.1.1.1/dns-query#${group}`,
    `https://8.8.8.8/dns-query#${group}`
  ].map(withQtypeDrop);
  const directChinaDns = [
    "https://223.5.5.5/dns-query#DIRECT",
    "https://1.12.12.12/dns-query#DIRECT"
  ].map(withQtypeDrop);
  const asList = (value) => value == null ? [] : (Array.isArray(value) ? value : [value]);
  const inheritedProxyServerNS = unique(asList(inheritedDns["proxy-server-nameserver"]));
  // 校园网诊断显示专用 HTTPS DNS/8443 会超时，而同一订阅的 TCP/8081 正常。
  // 优先使用 TCP 上游，避免 mihomo 在两个上游之间选到失效的 HTTPS 解析器。
  // 仅当订阅没有 TCP 上游时，才保留原始列表作为兼容回退。
  const campusReachableProxyNS = inheritedProxyServerNS.filter(server => /^tcp:\/\//i.test(server));
  // 未分类国外域名跟随“漏网之鱼”当前选择；截图中选链式节点时，DNS 也走同一条链。
  const ordinaryDns = dnsForGroup(GROUP.fallback);
  const inheritedFakeIpFilter = Array.isArray(inheritedDns["fake-ip-filter"])
    ? inheritedDns["fake-ip-filter"]
    : [];

  // 每个业务组的 DNS 使用同名业务组作为出站选择；业务组已去掉 DIRECT。
  const claudeDns = dnsForGroup(GROUP.claude);
  const claudeNameserverPolicy = Object.fromEntries([
    ...claudeSuffixes.map(domain => [`+.${domain}`, claudeDns]),
    ...claudeExactDomains.map(domain => [domain, claudeDns]),
    ["+.withpersona.com", claudeDns],
    ["+.persona.com", claudeDns],
    ["+.datadoghq.com", claudeDns]
  ]);
  const dnsDomainsByGroup = {
    [GROUP.fallback]: ["geosite:gfw"],
    [GROUP.github]: ["github.com", "+.github.com", "+.githubusercontent.com", "+.githubassets.com", "raw.githubusercontent.com"],
    [GROUP.telegram]: ["telegram.org", "+.telegram.org", "t.me", "telegram.me"],
    [GROUP.chatgpt]: ["chatgpt.com", "+.chatgpt.com", "+.openai.com", "+.oaiusercontent.com"],
    [GROUP.claude]: claudeSuffixes.map(domain => `+.${domain}`).concat(claudeExactDomains),
    [GROUP.gemini]: ["gemini.google.com", "+.gemini.google.com", "ai.google.dev", "+.generativelanguage.googleapis.com"],
    [GROUP.grok]: ["x.ai", "+.x.ai", "x.com", "+.x.com", "+.twitter.com"],
    [GROUP.domesticAi]: ["deepseek.com", "+.deepseek.com", "deepseeksvc.com", "+.deepseeksvc.com", "kimi.com", "+.kimi.com", "platform.kimi.ai", "qwen.ai", "+.qwen.ai", "yuanbao.tencent.com", "+.yuanbao.tencent.com", "bigmodel.cn", "+.bigmodel.cn"],
    [GROUP.foreignAi]: ["perplexity.ai", "+.perplexity.ai", "mistral.ai", "+.mistral.ai", "cursor.com", "+.cursor.com", "cursor.sh", "+.cursor.sh", "api.groq.com", "api.together.xyz"],
    [GROUP.googleFcm]: ["fcm.googleapis.com", "+.googleapis.com", "+.gstatic.com"],
    [GROUP.youtube]: ["youtube.com", "+.youtube.com", "youtu.be", "+.googlevideo.com", "+.ytimg.com", "+.ggpht.com"],
    [GROUP.bahamut]: ["bahamut.com.tw", "+.bahamut.com.tw"],
    [GROUP.globalMedia]: ["spotify.com", "+.spotify.com", "twitch.tv", "+.twitch.tv", "soundcloud.com", "+.soundcloud.com"],
    [GROUP.microsoft]: ["microsoft.com", "+.microsoft.com", "+.microsoftstore.com", "bing.com", "+.bing.com", "onedrive.com", "+.onedrive.com", "live.com", "+.live.com", "+.office.com", "+.office365.com"],
    [GROUP.apple]: ["apple.com", "+.apple.com", "+.icloud.com"],
    [GROUP.games]: ["steampowered.com", "+.steampowered.com", "epicgames.com", "+.epicgames.com"],
    [GROUP.bilibili]: ["bilibili.com", "+.bilibili.com", "+.bilivideo.com", "+.hdslb.com"]
  };
  const serviceDnsPolicy = {};
  for (const [group, domains] of Object.entries(dnsDomainsByGroup)) {
    const resolver = dnsForGroup(group);
    for (const domain of domains) serviceDnsPolicy[domain] = resolver;
  }
  const domesticServiceDnsPolicy = {};
  for (const domain of [
    "bilibili.com", "+.bilibili.com", "+.bilivideo.com", "+.hdslb.com"
  ]) domesticServiceDnsPolicy[domain] = directChinaDns;

  // 校园认证/内网必须走当前 Wi-Fi 的 DHCP DNS + DIRECT，不能进链式节点。
  const campusPolicy = {
    ...Object.fromEntries(CAPTIVE_PORTAL_EXACT.map(domain => [domain, campusDnsServers])),
    ...Object.fromEntries(CAPTIVE_PORTAL_SUFFIXES.map(domain => [`+.${domain}`, campusDnsServers])),
    "geosite:private": campusDnsServers
  };

  // 只剔除会与 Claude 专用 policy 发生域名重叠的继承项；机场其余网站
  // policy 全部保留，避免校园网或订阅的特殊解析策略被误删。
  const inheritedPolicy = inheritedDns["nameserver-policy"] && typeof inheritedDns["nameserver-policy"] === "object"
    ? inheritedDns["nameserver-policy"]
    : {};
  const claudePolicyKeys = [...claudeSuffixes, ...claudeExactDomains].map(domain => String(domain).toLowerCase());
  const policyKeyOverlapsClaude = (key) => {
    const normalized = String(key || "").toLowerCase().replace(/^\+\./, "");
    if (!normalized || normalized.includes(":") || normalized.includes("/")) return false;
    return claudePolicyKeys.some(domain => {
      const candidate = domain.replace(/^\+\./, "");
      return normalized === candidate || normalized.endsWith(`.${candidate}`) || candidate.endsWith(`.${normalized}`);
    });
  };
  const compatibleInheritedPolicy = Object.fromEntries(
    Object.entries(inheritedPolicy).filter(([key]) => !policyKeyOverlapsClaude(key))
  );

  // 本地自定义 DOMAIN / DOMAIN-SUFFIX 必须和流量规则使用同一目标组解析。
  // 其他规则类型（IP-CIDR、PROCESS 等）无法仅凭域名生成 DNS policy，因此不自动转换。
  const customDnsPolicy = {};
  for (const entry of LOCAL_CUSTOM_RULES) {
    const parts = String(entry).split(",").map(part => part.trim());
    const [kind, domain, target] = parts;
    if (!domain || !target || !["DOMAIN", "DOMAIN-SUFFIX"].includes(kind)) continue;
    const policyKey = kind === "DOMAIN-SUFFIX" ? `+.${domain}` : domain;
    customDnsPolicy[policyKey] = target === "DIRECT" ? directChinaDns : dnsForGroup(target);
  }

  config.dns = {
    ...inheritedDns,
    "enable": true,
    "ipv6": false,
    "prefer-h3": false,
    "use-hosts": inheritedDns["use-hosts"] !== false,
    "use-system-hosts": inheritedDns["use-system-hosts"] !== false,
    // DNS 不跟随 DIRECT 规则：否则 Claude/境外域命中直连后会回落到本地/国内 DNS，造成泄漏。
    "respect-rules": false,
    "enhanced-mode": inheritedDns["enhanced-mode"] || "fake-ip",
    "fake-ip-range": inheritedDns["fake-ip-range"] || "198.18.0.1/16",
    "fake-ip-filter-mode": inheritedDns["fake-ip-filter-mode"] || "blacklist",
    // 避免校园网拦截 UDP/53、DoT/853，或系统 TUN 占位 DNS 导致启动解析失败。
    // 这里只解析节点 DNS 服务自身的域名；不承载网站查询。
    "default-nameserver": directChinaDns,
    // 订阅自带的节点 DNS 优先；没有时才用国内 DoH，绝不用校园 DNS 解析节点。
    "proxy-server-nameserver": campusReachableProxyNS.length > 0
      ? campusReachableProxyNS
      : inheritedProxyServerNS.length > 0
      ? inheritedProxyServerNS
      : directChinaDns,
    // 明确覆盖订阅中的普通/直连/fallback DNS，失败也不回退国内或系统 DNS。
    // 官方节点 DNS 不改，不写死历史节点入口 IP。
    "nameserver": ordinaryDns,
    "direct-nameserver": ordinaryDns,
    "direct-nameserver-follow-policy": true,
    "fallback": [],
    "nameserver-policy": {
      ...compatibleInheritedPolicy,
      // 国内域名只走直连国内加密 DNS；更具体的 Claude/业务域名策略随后覆盖。
      "geosite:cn": directChinaDns,
      ...serviceDnsPolicy,
      ...domesticServiceDnsPolicy,
      ...claudeNameserverPolicy,
      ...customDnsPolicy,
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
      "+.srv.nintendo.net",
      "+.igwf.netease.com",
      "stun.qq.com",
      "dns.alidns.com",
      "doh.pub",
      "dns.google",
      "cloudflare-dns.com"
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
  const inheritedSniff = inheritedSniffer.sniff || {};
  config.sniffer = {
    ...inheritedSniffer,
    "enable": true,
    "force-dns-mapping": true,
    "parse-pure-ip": inheritedSniffer["parse-pure-ip"] !== false,
    "override-destination": false,
    "sniff": {
      "HTTP": inheritedSniff.HTTP || {
        "ports": [80, 8080],
        "override-destination": false
      },
      "TLS": inheritedSniff.TLS || {
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
