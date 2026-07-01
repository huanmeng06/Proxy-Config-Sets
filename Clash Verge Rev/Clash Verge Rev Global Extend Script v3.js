// function main(config, profileName) {
//   return config;
// }

function main(config) {
  if (!config.proxies || config.proxies.length === 0) return config;

  // 全局常量：策略组显示名、测速参数和自维护规则地址集中放这里。
  const TEST_URL = "http://www.gstatic.com/generate_204";
  const INTERVAL = 300;
  const TOLERANCE = 50;
  const RULES_BASE = "https://raw.githubusercontent.com/huanmeng06/Proxy-Config-Sets/refs/heads/main/Rules";
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

  function createUrlTestGroup(name, groupProxies, options = {}) {
    return {
      name,
      type: "url-test",
      url: TEST_URL,
      interval: options.interval ?? INTERVAL,
      tolerance: options.tolerance ?? TOLERANCE,
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

  // ChatGPT / Claude / Gemini 各自独立选择，方便按需切换不同地区。
  const usFirstAiChoices = getSafeChoices([
    "🇺🇸 美国节点",
    "🏠🇺🇸 美国家宽",
    "🇯🇵 日本节点",
    "🏠🇯🇵 日本家宽",
    "🇸🇬 狮城节点",
    "🇨🇳 台湾节点",
    GROUP.manual
  ]);
  pushSelectGroup(GROUP.chatgpt, usFirstAiChoices);
  pushSelectGroup(GROUP.claude, usFirstAiChoices);
  pushSelectGroup(GROUP.gemini, usFirstAiChoices);

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

  // 规则集统一走仓库根目录 Rules，确保 Clash 与 QX/Shadowrocket 使用同一批分流。
  const ruleProviderUrls = {
    // BEGIN GENERATED RULE PROVIDERS
    "BanAD": `${RULES_BASE}/ads.list`,
    "BanProgramAD": `${RULES_BASE}/app-clean.list`,
    "ChatGPT": `${RULES_BASE}/chatgpt.list`,
    "Claude": `${RULES_BASE}/claude.list`,
    "Gemini": `${RULES_BASE}/gemini.list`,
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

  // 规则顺序很重要：私有/直连和特殊覆盖在前，泛匹配放后。
  config["rules"] = [
    `DOMAIN-SUFFIX,ipleak.net,${GROUP.node}`,
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
    `RULE-SET,ChatGPT,${GROUP.chatgpt}`,
    `RULE-SET,Claude,${GROUP.claude}`,
    `RULE-SET,Gemini,${GROUP.gemini}`,
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

  // DNS：fake-ip + 加密 DNS，降低 DNS 泄露概率。
  config.dns = {
    "enable": true,
    // 只监听本机回环地址：原来的 0.0.0.0:1053 会对外暴露 DNS 服务，
    // 在部分电脑/网络环境下可能触发防火墙拦截或端口绑定失败，导致整体超时。
    // 如需把这台设备当局域网 DNS 服务器用，把这里改回 "0.0.0.0:1053"。
    "listen": "127.0.0.1:1053",
    "ipv6": false,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    // "system" 是 mihomo 内置的特殊值：追加系统本身已经在用的 DNS 服务器。
    // 不管在哪台电脑、哪个网络下，系统自带 DNS 一定是通的（否则这台电脑本身就没法上网），
    // 用它兜底可以避免写死的公共 DNS IP 在某些网络下连不通导致全局超时。
    "default-nameserver": [
      "system",
      "223.5.5.5",
      "119.29.29.29",
      "1.1.1.1",
      "8.8.8.8"
    ],
    // 用 IP 直连 DoH（阿里 223.5.5.5、DNSPod 1.12.12.12 官方都支持按 IP 访问），
    // 网络允许时有更好的解析质量/防污染效果；system 作为兜底，两边都不通时才会出问题。
    "nameserver": [
      "system",
      "https://223.5.5.5/dns-query",
      "https://1.12.12.12/dns-query"
    ],
    "fallback": [
      "system",
      "https://1.1.1.1/dns-query",
      "https://8.8.8.8/dns-query"
    ],
    "fallback-filter": {
      "geoip": true,
      "geoip-code": "CN",
      "ipcidr": ["240.0.0.0/4"]
    },
    "fake-ip-filter": [
      "*.lan",
      "*.localdomain",
      "*.example",
      "*.invalid",
      "*.localhost",
      "*.test",
      "*.local",
      "*.home.arpa",
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
      "cloudflare-dns.com"
    ]
  };

  // 域名嗅探：配合 fake-ip 还原真实域名，提升规则命中率。
  config.sniffer = {
    "enable": true,
    "force-dns-mapping": true,
    "parse-pure-ip": true,
    "override-destination": true,
    "sniff": {
      "HTTP": {
        "ports": [80, 8080],
        "override-destination": true
      },
      "TLS": {
        "ports": [443, 8443]
      },
      "QUIC": {
        "ports": [443, 8443]
      }
    },
    "skip-domain": [
      "Mijia Cloud",
      "dlg.io.mi.com",
      "+.apple.com"
    ]
  };

  return config;
}


