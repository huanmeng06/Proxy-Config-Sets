# Clash Script.js → iOS Shadowrocket 适配对照表

对照源：

- 电脑端链式：`Clash Verge Rev 链式代理.js`（当前满意的这份，已同步到 Clash Verge `profiles/Script.js`）
- iOS 链式产出：`Shadowrocket Config Claude 链式代理 特供版.conf`
- iOS 非链式特供（钉美国 05）：`Shadowrocket Config Claude 特供版.conf`
- 官方语法：用户提供的 Shadowrocket `default.conf`（2026-10-02）、[Shadowrocket/config default.conf](https://github.com/Shadowrocket/config/blob/master/default.conf)、[wirecatllc manual](https://github.com/wirecatllc/shadowrocket-rules/blob/main/docs/manual.md)
- 同项目经验：`Quantumult X Config Claude.conf`、`Clash for iOS/` Hako 方案、`Claude防封全面指南与本机审查报告.md`、线程 `codex://threads/01a0f05b-7670-7b22-8faf-72f8e2a01618`、`01a0ee3d-c69e-7261-827a-9c3a6e0fb581`、`01a0f0a9-af31-7902-8598-ad0ba33b25a6`

完成度总评：**路由 / Claude 严格分流 / 校园网直连 / DNS 防泄漏 ≈ 85%**。进程绑定、DHCP 接口 DNS、YepFast `proxy-server-nameserver`、fake-ip 精细过滤、sniffer、动态删空组做不到。这些和 QX / Hako 是同一类 iOS 限制，不是漏写。

图例：✅ 完美或等价　⚠️ 部分 / 换写法　❌ 引擎做不到

---

## 0. 链式代理怎么对应

Clash 不能在 Shadowrocket 里复制 `dialer-proxy` 克隆，所以**同名组的用法不一样**：

| Clash | Shadowrocket 链式特供 | 说明 |
|---|---|---|
| `🔗 链式节点` url-test（`↪ 机场节点` 克隆，测 机场→ISP） | `🔗 链式节点` url-test（机场节点，给 ISP「代理通过」用） | iOS 测的是 本机→机场，不是 机场→ISP |
| `🔗 落地 ISP` 手动选 ISP | `🔗 落地 ISP` 正则收录名字带 ISP 的本地节点 | 两边都是 ISP 选择器。SR 用 `^.*ISP.*`，排除 ↪ / via / 组名本身 |
| 额外节点原名带 ISP → 自动改成 `🔗🇺🇸 美国 怀俄明州 夏延市 [ISP]` | 不能改名；名字里有 ISP 就会进落地组 | 本地节点请自己写成带 ISP。可选手动改成 Clash 同款 |
| Claude / 泄漏 / 节点选择走 **链式节点** | Claude / 泄漏 / 节点选择走 **落地 ISP** | SR 必须选落地，ISP 节点再「代理通过」链式节点，才会出美国 ISP |
| 克隆前缀 `↪ 日本 02` | 无克隆 | 配置文件写不了 per-node 代理通过 |

导入链式特供后：自己加落地 SOCKS（**名字里必须带 `ISP`**），「代理通过」选 `🔗 链式节点`。配置不自带美国 ISP。不要把 Home / Claude 直接切到 `🔗 链式节点`，那会跳过落地。

Shadowrocket **不能自动改名**（没有 Clash 那种 JS）。落地组靠 `policy-regex-filter=(?i)^.*ISP.*` 收录本地节点。旧写法 `(?i)ISP` 在 SR 里是整名匹配，只会命中就叫 `ISP` 的节点，所以 `美国 ISP 怀俄明州 夏延市` 进不了组。重新导入后，落地组里应出现这个本地节点；若还留着旧占位 `🔗🇺🇸 美国 ISP`，删掉它，再手动选城市那条。想和电脑同款显示，可把本地节点改成 `🔗🇺🇸 美国 怀俄明州 夏延市 [ISP]`，不是必须。

地区组测速已改成和 Clash 一样：`http://www.gstatic.com/generate_204`，`interval=3600`，`tolerance=50`。链式节点组 `interval=300`，`tolerance=50`。



---

## 1. 策略组

| Clash Script.js | Shadowrocket | 完成度 | 原因 |
|---|---|---|---|
| `🚀 节点选择` select，成员=实际存在的地区组 | 同名 select，预置常用地区 + 手动 + 直连 | ⚠️ | iOS 不能按订阅动态删空组。没节点的地区组会空着，用 `🚀 手动切换` 兜底 |
| `🚀 手动切换` = 过滤后的全部节点 | `policy-regex-filter` 排除流量/到期说明行 | ⚠️ | 不能在导入时改节点名或从订阅里删节点，只能正则隐藏 |
| 节点名加 🇭🇰🏠⏬ 前缀 | 无 | ❌ | Shadowrocket 不能改订阅节点显示名。正则按原始机场名匹配 |
| 落地 ISP 原名带 ISP 则自动改名并进组 | 落地组 `^.*ISP.*` 收录本地节点，不改名 | ⚠️ | 必须重新导入。名字带 ISP 即可进组；想 Clash 同款显示请手动改名 |
| 过滤 Data Left / 到期 / 分割线 | 手动组正则排除 | ⚠️ | 节点仍在订阅列表里，只是不进手动组 |
| 地区组 `url-test`，`interval=3600`，`tolerance=50`，`url=gstatic generate_204` | 链式特供已改成 3600 / gstatic | ✅ | 旧 SR 用 86400 + cloudflare，已跟上 Clash |
| 家宽与普通节点拆开测速 | 香港/台湾/日本/狮城/美国家宽独立 url-test | ⚠️ | 常用地区已拆。印尼/欧洲等冷门地区请走手动组，避免几十个空组 |
| `🆘 防失联组` select | 同名 + 正则 `(防失联\|备用)` | ✅ | |
| `🎥 奈飞节点` 有节点才建 | 同名 select + 正则，可能空 | ⚠️ | 空组仍显示 |
| `⏬ 下载专用` url-test interval 600 | 同 | ✅ | |
| `🧠 Claude` 锁链式出口，不用 url-test | 链式特供锁 `🔗 落地 ISP`；非链式特供仍钉 `🇺🇸 美国 05` | ✅ | SR 选落地 = Clash 选链式节点。导入后仍要给 ISP 设一次「代理通过」 |
| Claude 排除港/澳/日/新 | 正则负向排除香港/日本/狮城/新加坡/台湾/韩国/马来 | ✅ | Anthropic 不服务 CN/HK/MO |
| `🤖 ChatGPT` / `✨ Gemini` / `✖️ Grok` 美国优先 | 同顺序的 select | ✅ | |
| `🐋 DeepSeek` | 与 Gemini/Grok 相同，末尾多 `🎯 全球直连` | ✅ | 默认仍是美国节点 |
| `💬 Ai平台` | 写成 `💬 Ai平台`（Clash 原名） | ✅ | 旧 SR 文件叫 `💬 AI平台`，导入后组名会变，需重新选一次 |
| Telegram / GitHub / YouTube / Netflix / 巴哈 / B 站 / 国内外媒体 / FCM / 微软* / 苹果 / 游戏 / 网易云 / 广告 / 净化 / 漏网之鱼 | 均有对应组 | ✅ | 补回了旧 SR 缺失的 `Ⓜ️ 微软商店`、`🏠🇺🇸 美国家宽`、`🏠🇸🇬 狮城家宽`、`🇰🇷 韩国节点` |
| `🎯 全球直连` = DIRECT + 节点选择 | 同 | ✅ | |
| `unified-delay` / `tcp-concurrent` / keep-alive / `global-client-fingerprint: chrome` | 无配置键 | ❌ | 客户端内核参数，Shadowrocket 配置文件写不进去 |
| `find-process-mode: always` | 无 | ❌ | iOS 没有进程元数据 |
| `profile.store-selected` | App 自己会记住上次选择 | ⚠️ | 换配置文件后要重新钉一次 05 |

---

## 2. Claude 严格分流

ChatGPT / Claude / Grok / DeepSeek **域名分流**已收到远端 `Rules/*.list`。商店 / 泄漏测试 / 硬 REJECT 也走规则集。本地只留 UDP AND REJECT、局域网/认证页、dns.google 等规则集做不到的条目。RULE-SET 行没有 per-domain `force-remote-dns`，代理策略仍在节点上解析。

| Clash | Shadowrocket | 完成度 | 原因 |
|---|---|---|---|
| `PROCESS-NAME` / `PROCESS-PATH-REGEX` 绑死 Claude.app / ChatGPT.app / Codex | 无 | ❌ | iOS Packet Tunnel 看不到进程名。官方 Claude App 靠域名走 `🧠 Claude`。未列出的 CDN 要补规则集 |
| ChatGPT 规则集写在 Claude 规则集前面 | 同顺序 | ✅ | 避免 `claude` 关键字误伤 |
| `DOMAIN-SUFFIX` anthropic/claude/clau.de/mcp/usercontent | 远端 `claude.list` | ✅ | 不再在 conf 里展开 |
| Stripe / stripecdn / stripe.network / link.com / hcaptcha | 进 `claude.list` | ✅ | 电脑端结账同出口；旧 SR 没有 |
| Persona `withpersona.com` / `persona.com` | 进 `claude.list` | ✅ | |
| Proton 邮箱 `proton.me` / `protonmail.com` / `pm.me` / SimpleLogin | 进 `claude.list` + UDP REJECT | ✅ | 不含 `protonvpn.com`；`proton.me` 会顺带 Drive/Pass/VPN API |
| Exact CDN：b-cdn / cloudflare / auth0 / ghost / datadog / fathom | 进 `claude.list` | ✅ | |
| `DOMAIN-KEYWORD` anthropic / claude / sift / datadog | 进 `claude.list` | ✅ | |
| `GEOSITE,anthropic` | 无 | ❌ | Shadowrocket 没有 geosite 数据库。核心域已用 list 覆盖 |
| `IP-CIDR 160.79.104.0/21` | 进 `claude.list` `no-resolve` | ✅ | |
| `IP-CIDR6 2607:6bc0::/32` | 进 `claude.list` | ⚠️ | 总开关 `ipv6=false`，这条基本不会命中，留着防以后开 IPv6 |
| `IP-ASN,399358` | 进 `claude.list` | ⚠️ | 官方 default.conf 未列出 ASN。若导入报错从 list 删这一行即可 |
| `RULE-SET` claude.list / chatgpt.list / grok.list / deepseek.list | 同一 GitHub raw URL | ✅ | 域名分流只走规则集 |
| `ip.net.coffee` / `net.coffee` | 进 `claude.list` | ✅ | 检测页跟 Claude 同出口 |
| `AND,(DOMAIN),(NETWORK,udp),REJECT` | `AND,((DOMAIN-SUFFIX,...),(PROTOCOL,UDP)),REJECT` | ✅ | Shadowrocket 用 `PROTOCOL,UDP`（见官方 default.conf 注释）。**必须写在 RULE-SET 前面**，否则 UDP 会进 Claude 组而不是丢弃 |
| `AND,(GEOSITE,anthropic),(NETWORK,udp)` | 无 geosite | ⚠️ | 已对每个 Claude/Stripe 域写了 UDP REJECT |
| 不全局丢 UDP/443 | 没有 `AND,(PROTOCOL,UDP),(DEST-PORT,443)` | ✅ | 游戏 / YouTube QUIC 不受伤。旧 v2 配置有全局丢，已去掉 |
| `huanling.icu` REJECT | `reject.list`（含浏览器 STUN） | ✅ | 国内中转；UDP/进程/认证仍本地 |
| 钉死美国 05，不要 url-test | `policy-select-name=🇺🇸 美国 05` | ✅ | 导入后仍要在 UI 里确认勾上 05 |

---

## 3. DNS / 防泄漏

| Clash | Shadowrocket | 完成度 | 原因 |
|---|---|---|---|
| `dns.enable` + fake-ip + `dns-hijack any:53` | App 开连接即接管；`hijack-dns=8.8.8.8,1.1.1.1,...` | ⚠️ | 没有 fake-ip-range / filter-mode 可写 |
| 默认 `nameserver` = `1.1.1.1` / `8.8.8.8` DoH | **不**把全局 DNS 设成这对 DoH | ⚠️ | QX 实测：全局 1.1.1.1 DoH 在隧道起来前会死锁断网。Shadowrocket 官方注释：代理策略默认在远程节点解析。Claude 域加了 `force-remote-dns`，解析发生在美国 05 上，效果接近「海外连接 + 海外 DNS」 |
| `nameserver-policy geosite:cn` → 阿里/腾讯 DoH `#DIRECT` | `GEOIP,CN` + `dns-direct-system=true` → 系统/国内 bootstrap DNS | ⚠️ | 没有 geosite:cn 逐域 DoH。国内 IP 直连并用系统 DNS |
| Claude 域 nameserver-policy → 1.1.1.1/8.8.8.8 | 代理策略默认远程解析；RULE-SET 无 per-domain `force-remote-dns` | ⚠️ | 不是本机再打一次 Cloudflare DoH。对防「连接在美、DNS 在大陆」通常足够 |
| `proxy-server-nameserver` 继承 YepFast（`*.cloud.we-tencent.click`） | 无此键 | ❌ | 这是电脑延迟接近官方 App 的关键。iOS 节点域名由 Shadowrocket 自己解析，延迟可能比 Mac 高，**不是分流错误** |
| `default-nameserver` 223.5.5.5 / 223.6.6.6 / 119.29.29.29 / system | `dns-server` 写成这四个 | ✅ | 未认证校园网也能解析 |
| `respect-rules: true` | 代理远程解析 + DIRECT 用系统 DNS | ⚠️ | 语义接近，不是同一实现 |
| `ipv6: false` / `prefer-h3: false` | `ipv6=false`；H3 无开关 | ⚠️ | QUIC 只对 Claude 域 REJECT |
| DoH `disable-qtype-64/65` 丢掉 SVCB/HTTPS | 无 | ❌ | SR 没有 TYPE64/TYPE65 过滤。关 IPv6 + Claude UDP REJECT **不等于**丢掉 HTTPS 记录里的 h3/ECH |
| `use-hosts` / `use-system-hosts` | `[Host] localhost` | ⚠️ | |
| fake-ip-filter：lan/local/captive/ntp/stun 游戏例外 | `skip-proxy` + `tun-excluded-routes` + captive DIRECT + DST-PORT 123 | ⚠️ | 没有 fake-ip 黑名单语法。`always-real-ip` 不是用户这份 default.conf 的键，未写 |
| STUN 浏览器 REJECT，游戏 STUN 保留 | `reject.list` 三条浏览器 STUN | ✅ | 没有写 `stun.*.*` 全拦，避免误伤游戏 |
| `1.1.1.1/32` `8.8.8.8/32` → 链式节点 | 链式特供 `leak.list` + dns.google 走 `🔗 落地 ISP` | ✅ | 硬编码 DNS 不直连大陆；SR 落地组会再经链式节点出 ISP |
| `private-ip-answer` | `true` | ✅ | false 会把校园门户 10.x 当成污染并强制代理 |
| Chrome 安全 DNS / iCloud Private Relay | 配置管不了 | ❌ | 必须手关 Private Relay；否则绕过 Shadowrocket |

---

## 4. 校园网 / TUN / 路由

| Clash | Shadowrocket | 完成度 | 原因 |
|---|---|---|---|
| `CAMPUS_MODE` + `dhcp://en0` nameserver-policy | `dns-direct-system=true` + captive/校园域 DIRECT | ⚠️ | iOS 读不到 `dhcp://en0`。DIRECT 域改走系统 DNS，认证前请先关 App |
| `CAMPUS_DNS_IPS` 手填校园 DNS | 无 | ❌ | 把 Wi-Fi DNS 保持自动即可 |
| captive 精确域 9 条 | 全部写入，并补 `captive.apple.com.cn` | ✅ | Hako/QX 手机端补丁 |
| suffix：aruba / bnbu / uic / msftconnecttest | 同 | ✅ | |
| 运营商认证：cmpassport / jegotrip / icitymobile / id6.me | 已写 | ✅ | 电脑脚本没有，Hako 有，手机需要 |
| `skip-proxy` 含 captive / bnbu / uic / `*.edu.cn` | 已写 | ✅ | HTTP 代理模式也不拦认证页 |
| `tun.auto-route` / `auto-detect-interface` | App 自己的 VPN | ⚠️ | |
| `strict-route: false` | 无此键；`tun-excluded-routes` 排除 RFC1918/CGNAT | ⚠️ | |
| 不写 `tun.stack` | 本来就没有 | ✅ | |
| `route-exclude-address` LAN | `tun-excluded-routes` 对齐 | ✅ | |
| `PROCESS-NAME` captiveagent / CNA / WebSheet DIRECT | 无 | ❌ | 用域名 DIRECT + 先关 VPN 认证代替 |
| 系统 DNS 保持空/DHCP，不要 114 | 配置里没有 114 | ✅ | **手机 Wi-Fi DNS 仍须「自动」** |
| 认证流程：关 TUN → 认证 → 开 TUN | README 写明 | ✅ | iOS 一样 |

---

## 5. 规则集与杂项规则

| Clash | Shadowrocket | 完成度 | 原因 |
|---|---|---|---|
| 同一批 `rule-providers` → GitHub `Rules/*.list` | 同 URL 的 `RULE-SET`（含商店 / 泄漏 / REJECT） | ✅ | UDP AND、进程、认证仍本地 |
| 规则顺序：Direct → BanAD → FCM → 微软商店域 → Bing/OneDrive/Microsoft/Apple/Telegram/GitHub/Gemini/Grok/DeepSeek/AI/网易/游戏/YT/NF/巴哈/B站/国内媒体/国外媒体/GFW → GEOIP CN → MATCH | 同序 | ✅ | 旧 SR 把 ddgksf2013 AI yaml、anti-AD 放在 Claude 附近，已删除，避免误伤 |
| `GEOIP,CN,全球直连` | 同 | ✅ | 需 Shadowrocket GeoIP 数据（App 自带） |
| `MATCH,漏网之鱼` | `FINAL,🐟 漏网之鱼` | ✅ | |
| Microsoft 商店域名优先于通用 Microsoft | `microsoft-store.list`，紧挨在 Bing/Microsoft 之前 | ✅ | 旧 SR 没有商店组 |
| `codexradar.com` → ChatGPT | 同 | ✅ | |
| `podcasts.apple.com` → 苹果 | 由 `apple.list` 覆盖，不再单写 | ✅ | |
| `deepl.com` / `ping0.cc` / `tjcn.org` DIRECT | 同，仍本地内联 | ✅ | 电脑端 ping0 已改为直连，旧 SR 还在走代理 |
| `yep.top` → 节点选择 | 同 | ✅ | |
| `oyunfor.com` → 土耳其 | 同 | ✅ | |
| sniffer TLS/HTTP，跳过 apple/gstatic/米家 | 无 sniffer 段 | ❌ | Shadowrocket 用 MITM/嗅探实现不同。未给 Claude 开 MITM |
| `override-destination: false` | 无 | ❌ | |
| Google CN → google.com 302 | `[URL Rewrite]` 同官方 default.conf | ✅ | |
| 广告组默认 REJECT | `policy-select-name=REJECT` | ✅ | |
| iOS 更新屏蔽 | 保留 | ✅ | 电脑脚本没有，手机有用 |
| 游戏广告 / Applovin / chinaliftoff REJECT | 保留 | ✅ | |
| MITM 不解 Claude / Anthropic / App Store | hostname 名单不含这些 | ✅ | 证书留在手机，不进文件 |

---

## 6. 防封指南对照（电脑 + 手机线程）

| 指南要求 | 这份 SR 配置 | 完成度 |
|---|---|---|
| Claude 只走美国 ISP 链，不 url-test | 链式特供锁 `🔗 落地 ISP` | ✅ 导入后设一次「代理通过」 |
| Stripe 结算跟 Claude 同 IP，避免 SGD | stripe/hcaptcha/link 进 Claude | ✅ |
| 不要港/澳/大陆出 Claude | 正则排除 | ✅ |
| IPv6 关 | `ipv6=false` | ✅ |
| 不要全局关 UDP | 只拒 Claude 域 UDP | ✅ |
| WebRTC STUN 拦浏览器，不影响游戏 | `reject.list` 三条 STUN | ✅ |
| DNS 不要手填 114 / 1.1.1.1 | 配置不用 114；全局不用 1.1.1.1 DoH | ✅ 系统 Wi-Fi 仍须自动 |
| 校园网先关代理再认证 | skip-proxy + DIRECT + README | ⚠️ 仍要手动关一次 App |
| 泄漏测试走代理 | `leak.list` | ✅ |
| 不用中转 `huanling.icu` | `reject.list` | ✅ |
| MITM 不解 claude.ai | 已排除 | ✅ |
| 时区 Los Angeles / English first / 关 Private Relay | 配置做不到 | ❌ 系统手改 |
| 只用官方 Claude App，不要 Safari 再登一份 | 配置做不到 | ❌ 使用习惯 |
| 蜂窝国内直出 Claude | 没开 VPN 时配置无效 | ❌ 开着 Shadowrocket 再用 |
| Apple 礼品卡：苹果服务可临时改美国 05 | `🍎 苹果服务` 默认直连，组里有美国节点可切 | ✅ |

---

## 7. 旧 Shadowrocket Claude.conf 修了什么

上一份（2026-09-29）相对当前 Clash 脚本的缺口，这次都补上了：

1. 全局 `dns-server = https://1.1.1.1/dns-query` → 改成国内 bootstrap + 系统 DNS（避免校园/未认证断网）
2. Claude UDP 规则写在 DOMAIN **后面** → 挪到前面（否则 UDP 拦不住）
3. 缺少 Stripe / hCaptcha / link.com / intercom / sentry
4. 校园认证域不全（没有 apple.com.cn / aruba / 运营商门户）
5. `ping0.cc` 误走代理
6. 地区测速 60 秒 → 86400 秒
7. Claude 只匹配 `美国 0[1-5]`，06 或改名会丢 → 改为全部美国节点、默认选 05
8. 没有美国家宽 / 微软商店 / 韩国 / 狮城家宽 / 防失联 / 奈飞节点
9. 顶部 `ddgksf2013` AI yaml + anti-AD 可能误伤，已去掉
10. 漏网之鱼默认改回节点选择（对齐 Clash）

---

## 8. 导入与验收

链式特供（当前和电脑对齐的这份）：

1. Shadowrocket 里备份当前配置。
2. 隔空投送 `Shadowrocket Config Claude 链式代理 特供版.conf`，用 **Shadowrocket** 打开。
3. 订阅节点如果丢了，从旧配置把订阅拷回来。
4. 自己加落地 SOCKS，**名字里要有 ISP**（例如 `美国 ISP 怀俄明州 夏延市`）。Shadowrocket 不会自动改名。不要用仓库占位节点。
5. 打开该节点 →「代理通过」→ `🔗 链式节点` → 保存。
6. 打开 `🔗 落地 ISP`，应看到这条本地节点。若还在选旧的 `🔗🇺🇸 美国 ISP`，删掉那条占位，改选城市名那条。
7. 确认 `🧠 Claude` 和 `🚀 节点选择` 是 `🔗 落地 ISP`。不要直接选 `🔗 链式节点`。
8. Wi-Fi DNS = 自动。Private Relay 关。时区 Los Angeles。English (US) 第一。

家里（代理开着）：

- 微信 / 百度 / 淘宝正常 → bootstrap DNS 没死锁
- 官方 Claude App 能聊，策略显示 `🧠 Claude` / `🔗 落地 ISP`
- YouTube 能播（没全局丢 QUIC）
- 游戏能联机
- coffee / 泄漏测试应看到美国 ISP，不是机场出口

校园网：

- 先关 Shadowrocket → 认证页 → 再开，Claude 仍是落地 ISP
- 认证页不弹：确认系统 DNS 是自动，不要手填 1.1.1.1

---

## 9. 数字完成度（按电脑脚本条目加权）

| 块 | 条目 | ✅ | ⚠️ | ❌ | 块完成度 |
|---|---:|---:|---:|---:|---|
| 策略组 | 16 | 10 | 5 | 1 | ~80% |
| Claude 分流 | 18 | 13 | 3 | 2 | ~85% |
| DNS / 泄漏 | 16 | 6 | 7 | 3 | ~65% |
| 校园网 / TUN | 12 | 6 | 4 | 2 | ~70% |
| 规则集 / 杂项 | 20 | 16 | 1 | 3 | ~85% |
| 防封指南（配置能做的） | 12 | 10 | 1 | 1 | ~88% |
| **合计（配置层）** | **94** | **61** | **21** | **12** | **约 82–85%** |

「配置做不到、必须手改」的系统项（时区、语言、Private Relay、官方 App）不算进配置完成度，但用 Claude 时必须做。
