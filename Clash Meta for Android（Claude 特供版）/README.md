# Clash Meta for Android（Claude 链式特供）

对齐电脑端 `Clash Verge Rev 链式代理.js` 的 **完整 YAML**，给 [Clash Meta for Android](https://github.com/MetaCubeX/ClashMetaForAndroid) 用。

CMFA **不能跑 Verge JS**：不会自动改名，也不会给每个机场节点克隆 `↪` SOCKS。链式靠落地 ISP 节点上的 `dialer-proxy: 🔗 链式节点`。

不要拿这份 YAML 去覆盖 Hako / Quantumult X / Shadowrocket / Clash Verge。

## 导入

1. 用文本编辑器打开 `Clash Meta for Android 链式代理 特供版.yaml`。
2. 把 `YOUR_CLASH_SUBSCRIBE_URL` 换成机场的 **Clash YAML** 订阅（和电脑端同一份）。
3. 按下面模板加落地 SOCKS。`proxies:` 必须顶格，行首不能有空格，否则 Clash 会报 `mapping values are not allowed`。**不要把账号提交进 Git。**
4. CMFA → 配置 → 从文件导入这份 YAML。
5. 更新 `Airport` provider。Rule 模式。打开 TUN。
6. `🔗 落地 ISP` 里应出现你的 ISP 节点。没有的话检查节点名是否包含 `ISP`。
7. `🧠 Claude` 应已锁在 `🔗 落地 ISP`。`🚀 节点选择` 第一项也是落地 ISP。
8. **不要**把全局、Home 或 Claude 直接切到 `🔗 链式节点`，那会跳过落地、露出机场 IP。

## 落地 ISP 模板

名字必须带 `ISP`，才会进 `🔗 落地 ISP`，并且被美国节点 / 链式节点排除。

```yaml
proxies:
  - name: 美国 ISP 怀俄明州 夏延市
    type: socks5
    server: YOUR_ISP_HOST
    port: 1080
    username: YOUR_ISP_USER
    password: YOUR_ISP_PASS
    udp: true
    dialer-proxy: 🔗 链式节点
```

州市自己写在节点名里。CMFA 不会请求 ippure，也不会自动改成 `🔗🇺🇸 … [ISP]`。

没有 ISP 节点时，落地组只有 `DIRECT`，配置仍能加载。Claude / 泄漏测试会暂时直连，加上 ISP 后才会走美国家宽出口。

## 分组怎么工作

| 组 | 作用 |
| --- | --- |
| `🔗 落地 ISP` | `select`，`filter: (?i)ISP`。手动选哪条落地。DIRECT 兜底。 |
| `🔗 链式节点` | 机场 `url-test`（排除 ISP / 说明行）。给落地 SOCKS 当 `dialer-proxy`。 |
| `🧠 Claude` | **只挂落地 ISP**。Proton 邮箱跟 Claude 同出口。 |
| `🚀 节点选择` | 落地 ISP 放第一（对标电脑端把链式节点插到最前）。 |
| ChatGPT / Gemini / Grok | 仍美国优先，末尾可选手落地 ISP。 |
| DeepSeek | 同上，再加全球直连。 |

真流量：手机 → 机场（链式节点当前选中的）→ ISP SOCKS → 网站。

测速限制：CMFA 的 url-test 测的是 **手机→机场**，不是电脑那种 **机场→ISP**。`interval: 300`、`timeout: 8000`、`lazy: false`、`tolerance: 50`。地区组 `interval: 3600`、`tolerance: 50`，测速 URL 与 Verge 一样是 `https://www.gstatic.com/generate_204`。

空的地区组 `empty-fallback: COMPATIBLE`，机场缺某个国家时配置不会加载失败。所有 `include-all` 都排除 `ISP`，避免 `美国 ISP 怀俄明州 夏延市` 进美国节点。

## 规则 / DNS

- 域名分流走远端 `Rules/*.list`（ChatGPT 在 Claude 前）。`protonvpn.com` 不进 Claude。
- `Leak`（`1.1.1.1` / dnsleaktest / ipleak / ippure 等）走 `🔗 落地 ISP`。
- 微软商店 RULE-SET 紧挨在 Bing / Microsoft 之前。
- `deepl.com` / `ping0.cc` / `tjcn.org` 仍内联直连。
- Claude / Proton / Stripe 等 UDP AND REJECT，逼回 TCP。
- Android 包名：`com.anthropic.claude`、`ch.protonmail.android` → Claude；`com.openai.chatgpt` → ChatGPT；认证页 `com.android.captiveportallogin` → DIRECT。
- DNS：`respect-rules: false`。默认 DoH `1.1.1.1` / `8.8.8.8` `#🔗 落地 ISP`，并丢掉 qtype 64/65。只有 `geosite:cn`、内网和校园认证走国内 DoH `#DIRECT`。节点解析用现成 YepFast `tcp://121.41.16.76:8081`（可改）。没有 `dhcp://en0`。
- TUN 不写 `stack` / `device`。sniffer 关掉 QUIC。`find-process-mode: always`。

## 相对电脑端做不到的

- 不改名、不克隆 `↪` 节点。
- 不能按「机场→当前 ISP」测延迟；只能按手机→机场选前置。
- 没有 macOS 进程名（`Claude.app` / `Proton Mail Bridge`）。手机靠包名 + 规则集。

## 安全

仓库和这份文件都 **不带** 机场订阅、ISP 账号、token。提交前再搜一遍 `YOUR_` 以外的 host / 密码。
