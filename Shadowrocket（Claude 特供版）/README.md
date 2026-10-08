# Shadowrocket：Claude 链式代理脱敏模板

2026-10-08 更新的是 `Shadowrocket Config Claude 链式代理 特供版.conf`。本目录的非链式特供配置保持独立，不被此次发布覆盖。

模板不包含机场节点、订阅链接或真实 ISP 地址/凭据。机场通过自己的订阅在 Shadowrocket 首页导入。

## 填写与绑定

1. 下载链式 `.conf`，填写两个 ISP 节点的 `YOUR_*_HOST.invalid`、`YOUR_*_USER`、`YOUR_*_PASSWORD`，并确认 SOCKS5 端口。
2. 在 Shadowrocket 首页导入自己的机场节点；名字中不要混入配置里的 ISP 出口。
3. 导入并启用配置。“全局路由”使用“配置”；关闭全局“启用回退”，防止随机切换到机场。
4. 两个 `📡 机场前置 → … ISP 1/2` 组默认 REJECT。各自手选一个机场前置。
5. 打开夏延实际出口 `↪ 📡 机场前置 → 🇺🇸 美国 夏延 [ISP]` 的节点详情，将“代理通过”设为夏延前置组。
6. 对纽约实际出口做同样操作，绑定纽约前置组。方向必须是手机 → 机场 → ISP，而不是让机场通过 ISP。
7. 查看代理链确认绑定后，才在 `🧠 Claude` 和 `🔗 链式节点` 里将默认 REJECT 切到实际 ISP 出口。两个业务组不提供机场直出或 DIRECT 选项。
8. 缺少某个 ISP 时，删除对应的节点和两个业务组里的引用。完全没有 ISP 时保留 REJECT。

`close-if-proxy-chain-missing=true` 和不支持 UDP 时 REJECT 已写入；绑定仍需在 App 中完成，配置没有伪造一个 Mihomo 的 dialer-proxy 参数。

## 与 Clash / CMFA 的差异

- 共用远端分流规则、出口和前置组名称。已删除旧落地选择组和泄漏测试站的特殊分流。
- 无法核实 Shadowrocket 的 HTTP 407 指定成功状态配置，因此前置组使用手动 select，不宣称实现了同样的自动测速。配置注释保留相应的未认证探测地址，供填写后检查。
- 前置候选使用首页实际订阅节点，不会批量克隆或自动改成桌面端候选名称。
- DNS-over-PROXY 明确指定纽约实际 ISP 节点，并进行 URL 编码；这是固定 DNS 出口，不是动态绑定到“链式节点”组。若更换 DNS 出口，需要同步修改 General 的 dns-server 和 fallback-dns-server。
- 直连域名使用系统 DNS，不能完整复制 Mihomo 的 geosite DNS policy、fake-IP、sniffer 或进程分流。

默认 REJECT 是刻意设置的保护，未完成绑定前不要解除。iOS 真机导入和连通性需在自己设备上验证。

详见同目录 `Shadowrocket 适配对照表.md`。发布的是脱敏模板；自己的订阅和填写后的配置不要公开上传。
