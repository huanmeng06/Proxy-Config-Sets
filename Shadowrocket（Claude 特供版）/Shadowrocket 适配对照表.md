# 不内置节点的手机链式基础配置

2026-10-08：公开配置没有节点、订阅、示例凭据、待填字段或回转箭头。实际节点及供应商信息只在用户的私有配置中添加。Shadowrocket 的共用入口组已预先定义。

| 项目 | CMFA | Shadowrocket |
| --- | --- | --- |
| 私有机场节点 | 本地 proxies 或私有 provider | 首页导入订阅 |
| 私有实际 ISP 命名 | 📡 机场前置 → 国旗 国家 城市 [ISP] | 名称含 ISP 即可 |
| Claude / 链式入口 | 动态筛选上述 ISP 节点，默认 REJECT | 按 ISP 关键词筛选，默认 REJECT |
| 未添加 ISP | 拒绝连接 | 拒绝连接 |
| 添加前置组 | 私有 fallback 组，真实 HTTP 地址和 407 成功状态 | 已定义共用机场 select 组，手动选择 |
| ISP 使用前置 | 私下配置 dialer-proxy | 在节点详情设置“代理通过” |
| 前置组名称 | 📡 机场前置 → 国旗 国家 城市 ISP 编号 | 📡 链式代理入口 |
| 默认 DNS | 经链式组；没有 ISP 时该路径拒绝 | 公共 bootstrap/直连 DNS，代理域名远端解析 |
| 经 ISP 的指定 DoH | 配置已指向链式组 | 真实节点存在后私下配置 DNS-over-PROXY |
| 平台差异 | Android 包名、fake-IP 与 Mihomo 设置 | iOS 域名分流，不能复制进程/sniffer/geosite DNS 行为 |

Clash/CMFA 前置组按候选顺序故障切换，不使用延迟排名或 tolerance。Clash/CMFA 的检查间隔 1800 秒，超时 8000 ms；Shadowrocket 共用入口为 select，不自动测速或切换。

前置候选只含机场。不要把 Claude 或网站规则指向前置组，否则会绕过 ISP；应选择实际 ISP 节点，再由其使用前置。HTTP 407 表示未认证响应，不等同于实际网站连通性。

无节点的 CMFA YAML 通过了本机 Mihomo 加载校验，两份配置都检查了引用与 REJECT 默认选择。添加真实私有配置之后的手机运行不在此次静态验证范围内。

参考：[Mihomo expected-status](https://wiki.metacubex.one/config/proxy-groups/#expected-status)、[Shadowrocket 配置说明](https://github.com/LOWERTOP/Shadowrocket/wiki)。
