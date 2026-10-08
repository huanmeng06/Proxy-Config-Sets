# 2026-10-08 链式配置适配对照

| 项目 | Clash / CMFA | Shadowrocket 链式模板 |
| --- | --- | --- |
| 前置组名称 | 📡 机场前置 → 国家 城市 ISP 1/2 | 相同 |
| 实际出口名称 | ↪ 📡 机场前置 → 国家 城市 [ISP] | 相同 |
| 前置候选命名 | CMFA provider 加前后缀，桌面脚本自动地区改名 | 使用手机首页订阅原名 |
| 无登录筛选前置 | HTTP 407 URLTest，1800 s / 200 ms / 8000 ms | 407 匹配未核实，手动 select |
| ISP 使用所选前置 | dialer-proxy 自动绑定 | 必须在节点详情设置“代理通过” |
| Claude / 链式业务出口 | 只含实际 ISP；无 ISP 时 REJECT | 只含实际 ISP 与 REJECT；默认 REJECT |
| 机场直出回退 | 不设置 | 不设置；手机关闭全局随机回退 |
| 泄漏测试站专用规则 | 已删除 | 已删除 |
| 默认 DNS | Cloudflare / Google DoH，经链式组当前 ISP | DoH 明确绑定纽约节点，换 DNS 出口需手改编码节点名 |
| 国内/内网 DNS | geosite:cn 直连 DoH；Android 内网 system | 直连域名主要使用 system |
| 平台专有设置 | Android 包名、fake-IP、Mihomo 内核设置 | 不写入 macOS/Android 进程或 Mihomo 专有参数 |

两份手机文件都是公开的占位模板。CMFA 从自己的机场订阅构建节点池，Shadowrocket 使用已导入节点；它们不包含任何真实账号或节点快照。

正确方向是手机 → 机场前置 → ISP → 网站。业务流量不能直接指向前置测速组，否则会绕过 ISP。HTTP 407 只证明 ISP 的 HTTP 端口能响应，不保证账户认证、SOCKS5 或网站业务成功。

Shadowrocket 初始 REJECT 不应被解除，直到两个 ISP 的“代理通过”绑定已确认。指定 DNS 节点名必须正确 URL 编码，不能替换为首页默认机场。

配置已做静态结构与引用审查；CMFA YAML 还通过本机 Mihomo 加载校验。占位模板尚不能联网，Shadowrocket 闭源引擎不能在本机编译验证，不声明手机运行 PASS。

参考：[Mihomo expected-status](https://wiki.metacubex.one/config/proxy-groups/#expected-status)、[Shadowrocket App Store](https://apps.apple.com/us/app/shadowrocket/id932747118)、[Shadowrocket 配置说明](https://github.com/LOWERTOP/Shadowrocket/wiki)。
