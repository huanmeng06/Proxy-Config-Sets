# CMFA：共用手动链式入口

所有 ISP 共用一个 `📡 链式入口` select 组。该组可选机场或 `🎯 全球直连`，不含 ISP；手动选择后不自动切换。仓库里的 YAML 是无密钥模板；含密钥版本只保存在本机桌面。

## 设置

1. 在私有配置或首页添加机场和真实 ISP；真实 ISP 节点名含 `ISP`，大小写不限。不要给普通机场使用 ISP 标识。
2. 在 `📡 链式入口` 选择机场或 `🎯 全球直连`。入口默认仍为 `REJECT`；若选 `🎯 全球直连` 且其当前选项为 `DIRECT`，则跳过机场，直接连 ISP 落地节点。为避免回环，`🎯 全球直连` 的代理备选是仅含普通机场节点的 `🚀 手动切换`。
3. 在每个私有 ISP 节点设置 `dialer-proxy: 📡 链式入口`。
4. `🔗 链式节点` 和 `🧠 Claude` 按节点名筛选 ISP；未找到 ISP 时回退 `REJECT`。请为私有 ISP 完成上一步配置后再选择它，网站规则不要指向机场入口组。

实际流量：本机 → 📡 链式入口所选前置（全球直连为 `DIRECT` 则跳过） → 🔗 链式节点所选 ISP → 网站。Claude 若单独选择 ISP，使用它自己的出口选择，但共用同一机场入口。

## 与 Clash Verge 对齐的分流

公开模板与其他客户端统一共享规则顺序，并保留原有策略组：`🇨🇳 国内 AI`、`🌍 国外 AI`、合并后的 `Ⓜ️ 微软服务`、Claude UDP/IP、微信/瑞幸直连、远程 `Rules/`。Android 用包名替代 macOS 进程路径。CMFA 可以保留 `nameserver-policy`、`GEOSITE` 和 `dialer-proxy`。

本地规则之后，ChatGPT / Claude 有意放在共享规则最前。广告 / 净化、专用 AI 和媒体组先于 `direct.list`；哔哩哔哩、巴哈姆特和油管先于通用媒体组。部分原来直连的国内 App 统计或广告域名将被拦截。

TUN 排除网段为空，不再生成校园 DHCP DNS、认证页规则或旧域名清理逻辑。Claude 继续使用手动 ISP 出口和专用代理 DNS。

## 第三方国内兜底

直接引用 blackmatrix7 ChinaMax 作为国内兜底，顺序在 `proxy.list` 之后、`GEOIP,CN` 之前，命中进 `🎯 全球直连`。如果 ChinaMax 不可用，流量回到原有的 GEOIP 和最终兜底规则。

DNS 层的 `rule-set:ChinaMaxDomain` 使用与 `geosite:cn` 相同的国内 DoH，放在明确的业务 DNS 策略之后。

## 迁移文件

- 无密钥公开配置：`Clash Meta for Android.yaml`。
- 含密钥私有配置：由当前 Clash Verge 生成，只放本机桌面，不进入仓库。
