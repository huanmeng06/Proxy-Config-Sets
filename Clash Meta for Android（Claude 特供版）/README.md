# CMFA：共用手动链式入口

所有 ISP 共用一个 `📡 链式入口` select 组。该组只收录机场，不含 ISP 或 DIRECT；手动选择后不自动切换。仓库里的 YAML 是无密钥模板；含密钥版本只保存在本机桌面。

## 设置

1. 在私有配置或首页添加机场和真实 ISP；真实 ISP 节点名含 `ISP`，大小写不限。不要给普通机场使用 ISP 标识。
2. 在 `📡 链式入口` 选择机场。入口没有机场时拒绝连接。
3. 在每个私有 ISP 节点设置 `dialer-proxy: 📡 链式入口`。
4. 在 `🔗 链式节点` 选择美国 ISP；Claude 只显示已设置 `dialer-proxy: 📡 链式入口` 的 ISP。网站规则选择实际 ISP 或链式节点，不能选择机场入口组。

实际流量：本机 → 📡 链式入口所选机场 → 🔗 链式节点所选 ISP → 网站。Claude 若单独选择 ISP，使用它自己的出口选择，但共用同一机场入口。

## 与 Clash Verge 对齐的分流

公开模板使用当前 Clash Verge 的规则顺序和策略组：`🇨🇳 国内 AI`、`🌍 国外 AI`、合并后的 `Ⓜ️ 微软服务`、Claude UDP/IP、微信/瑞幸直连、远程 `Rules/`。Android 用包名替代 macOS 进程路径。CMFA 可以保留 `nameserver-policy`、`GEOSITE` 和 `dialer-proxy`。

TUN 排除网段为空，不再生成校园 DHCP DNS、认证页规则或旧域名清理逻辑。Claude 继续使用手动 ISP 出口和专用代理 DNS。

## 迁移文件

- 无密钥公开配置：`Clash Meta for Android 链式代理 特供版.yaml` 与 `Clash Meta for Android 链式代理 特供版（不含密钥）.yaml`
- 含密钥私有配置：由当前 Clash Verge 生成，只放本机桌面，不进入仓库。
