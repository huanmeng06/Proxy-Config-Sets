# Shadowrocket：共用手动链式入口

所有 ISP 共用一个 `📡 链式入口` select 组。该组只收录机场，不含 ISP 或 DIRECT；手动选择后不自动切换。公开配置不内置节点、订阅、密钥或 MITM 证书。

## 设置

1. 在私有配置或首页添加机场和真实 ISP；真实 ISP 节点名含 `ISP`，大小写不限。不要给普通机场使用 ISP 标识。
2. 在 `📡 链式入口` 选择机场。入口没有机场时拒绝连接。
3. 在每个 ISP 节点详情，将“代理通过”绑定到 `📡 链式入口`；此步骤需在 App 中操作。
4. 在 `🔗 链式节点` 选择美国 ISP；Claude 也可直接选择实际 ISP。网站规则选择实际 ISP 或链式节点，不能选择机场入口组。

实际流量：本机 → 📡 链式入口所选机场 → 🔗 链式节点所选 ISP → 网站。Claude 若单独选择 ISP，使用它自己的出口选择，但共用同一机场入口。

缺少或无法连接 ISP 时，链式业务不使用机场或 DIRECT 兜底。入口为 select，不包含自动检测地址、interval、timeout 或 tolerance；其他地区组的测速保留。

## DNS 与平台差异

Clash/CMFA 默认 Cloudflare、Google DoH 经过链式节点组；国内 DNS 与节点 bootstrap 保留原设置。Shadowrocket 保留公共 bootstrap/直连 DNS和代理域名远端解析；私有版指定 DoH 仍绑定实际 ISP，切换 ISP 时需同步指定名称。

Shadowrocket 设置 `close-if-proxy-chain-missing=true`，但首次“代理通过”绑定仍需手动完成。Clash/CMFA 使用 dialer-proxy。运行中旧连接可能继续使用旧路径，应用后需重新建立连接。

三端统一的是入口名称、select 类型和机场 → ISP 的流量路径。手机系统与 DNS 功能仍存在平台差异。已进行静态检查，手机实际链路需设备验证。

当前配置已尽量按 Clash 脚本实现相同功能：国内/国外 AI、统一微软服务、游戏规则、WebRTC UDP 19302/19305 拒绝、校园认证和远程 Rules 均已同步。代理 DNS 使用加密 DoH，直连与校园认证使用系统/DHCP DNS。

仍无法一比一实现的部分：Shadowrocket 没有 Clash 的 `nameserver-policy`，所以不能按 Claude、Microsoft、国内 AI 等业务组分别绑定 DNS；没有 `PROCESS-PATH-REGEX`，只能使用进程名；没有 `dialer-proxy` 配置字段，ISP 的“代理通过”必须在 Shadowrocket 界面手动设置。其余行为由代理组、远程规则集、进程规则和 UDP 拒绝规则实现。
