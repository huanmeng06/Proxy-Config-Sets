# 三端共用链式入口

| 项目 | Clash Verge | CMFA | Shadowrocket |
| --- | --- | --- | --- |
| 机场入口 | 📡 链式入口，select | 同左 | 同左 |
| 网站出口 | ISP / 链式节点 | 同左 | 同左；App 内绑定代理通过 |
| 国内/国外 AI | 独立组 | 同左 | 同左 |
| 微软 | 合并为微软服务 | 同左 | 同左 |
| Claude UDP/IP | 域名 UDP 拒绝 + 160.79.104.0/21 | 同左 | 同左；无 GEOSITE |
| 微信 | 进程 + qq.com 直连，位于广告之前 | Android 包名 + 同序域名 | iOS 进程名 + 同序域名 |
| nameserver-policy | 按业务组绑定 DoH | 保留 | 做不到 |
| PROCESS-PATH-REGEX | macOS 路径 | 改为 Android 包名 | 做不到，仅进程名 |
| dialer-proxy | 脚本自动 | 配置写入 | App 手动绑定 |

三端均移除校园认证专用分流和脚本注入的 TUN 网段排除。Clash / CMFA 保留按业务指定 DoH；Shadowrocket 使用直连/代理两类加密 DNS，并关闭系统 DNS 回退，不能表达 Clash 的逐业务 DNS policy。
