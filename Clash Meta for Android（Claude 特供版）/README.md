# CMFA：共用手动链式入口

所有 ISP 共用一个 `📡 链式入口` select 组。该组只收录机场，不含 ISP 或 DIRECT；手动选择后不自动切换。公开文件不内置节点、订阅、密钥或待填字段。

## 设置

1. 在私有配置或首页添加机场和真实 ISP；真实 ISP 节点名含 `ISP`，大小写不限。不要给普通机场使用 ISP 标识。
2. 在 `📡 链式入口` 选择机场。入口没有机场时拒绝连接。
3. 在每个私有 ISP 节点设置 `dialer-proxy: 📡 链式入口`。
4. 在 `🔗 链式节点` 选择美国 ISP；Claude 也可直接选择实际 ISP。网站规则选择实际 ISP 或链式节点，不能选择机场入口组。

实际流量：本机 → 📡 链式入口所选机场 → 🔗 链式节点所选 ISP → 网站。Claude 若单独选择 ISP，使用它自己的出口选择，但共用同一机场入口。

缺少或无法连接 ISP 时，链式业务不使用机场或 DIRECT 兜底。入口为 select，不包含自动检测地址、interval、timeout 或 tolerance；其他地区组的测速保留。

## DNS 与平台差异

Clash/CMFA 默认 Cloudflare、Google DoH 经过链式节点组；国内 DNS 与节点 bootstrap 保留原设置。Shadowrocket 保留公共 bootstrap/直连 DNS和代理域名远端解析；私有版指定 DoH 仍绑定实际 ISP，切换 ISP 时需同步指定名称。

Shadowrocket 设置 `close-if-proxy-chain-missing=true`，但首次“代理通过”绑定仍需手动完成。Clash/CMFA 使用 dialer-proxy。运行中旧连接可能继续使用旧路径，应用后需重新建立连接。

三端统一的是入口名称、select 类型和机场 → ISP 的流量路径。手机系统与 DNS 功能仍存在平台差异。已进行静态检查，手机实际链路需设备验证。
