# Shadowrocket：共用手动链式入口

所有 ISP 共用一个 `📡 链式入口` select 组。该组只收录机场，不含 ISP 或 DIRECT；手动选择后不自动切换。公开配置不内置节点、订阅、密钥或 MITM 证书。

## 设置

1. 在私有配置或首页添加机场和真实 ISP；真实 ISP 节点名含 `ISP`，大小写不限。不要给普通机场使用 ISP 标识。
2. 在 `📡 链式入口` 选择机场。入口没有机场时拒绝连接。
3. 在每个 ISP 节点详情，将“代理通过”绑定到 `📡 链式入口`；此步骤需在 App 中操作。
4. 在 `🔗 链式节点` 选择美国 ISP；Claude 也可直接选择实际 ISP。网站规则选择实际 ISP 或链式节点，不能选择机场入口组。

实际流量：本机 → 📡 链式入口所选机场 → 🔗 链式节点所选 ISP → 网站。

## 与 Clash Verge 对齐的分流

规则顺序已按 Clash Verge 重写：微信/`qq.com`/瑞幸在广告和 GFW 之前；Claude UDP 域名、`siftscience.com`、`IP-CIDR 160.79.104.0/21`、国内/国外 AI、合并微软组都已同步。`GEOIP,CN` 与自定义直连走 `🎯 全球直连`。Claude / 链式节点默认优先纽约 ISP。

## 做不到的部分

- 没有 `nameserver-policy`，不能按 Claude / 微软 / 国内 AI 分别绑 DNS
- 没有 `dialer-proxy`，ISP 的“代理通过”必须在 App 里手动设置
- 没有 `GEOSITE,anthropic` 和 `PROCESS-PATH-REGEX`
- 不能匹配 macOS 的 Claude Helper GPU / Codex 路径 / WeChat.app 路径

直连查询使用国内加密 DNS，代理主机名使用公共 DoH；关闭系统 DNS 优先与系统 DNS 回退。不再生成 `skip-proxy`、`tun-excluded-routes` 或认证页例外。`close-if-proxy-chain-missing=true`。
