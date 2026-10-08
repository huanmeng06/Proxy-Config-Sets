# Shadowrocket：共用机场入口的 Claude 链式配置

2026-10-08：链式配置采用一个固定的 `📡 链式代理入口` select 组。公开文件不含节点、订阅、密钥或待填字段；非链式特供版保留。

## 导入和绑定

1. 导入配置并设为当前配置，在首页导入自己的机场订阅和真实 ISP 节点。
2. 实际 ISP 节点名称含 `ISP` 即可，大小写不限，无需特定前缀。它会被收录进 Claude / 链式节点组。只给真实 ISP 出口使用这个标识。
3. `📡 链式代理入口` 自动筛选不含 ISP 的机场节点，排除常见订阅流量和到期提示。不复制节点凭据，复用首页节点池。
4. 在每个实际 ISP 节点详情中，将“代理通过”绑定到 `📡 链式代理入口`。该步骤需在 App 中操作，入组不会自动绑定。
5. 验证代理链后，在 Claude / 链式节点中从 REJECT 改选所需 ISP。实际流向：手机 → 入口组选择的机场 → ISP → 网站。
6. 全局路由使用“配置”，关闭“启用回退”。网站业务组不能选择 `📡 链式代理入口`，否则会跳过 ISP。

默认入口类型为 select，手动选择机场后保持该选择，不自动测速或切换。入口组默认 REJECT；导入后先在该组选择机场，再完成 ISP 的“代理通过”绑定。

入口组没有 DIRECT；Claude / 链式节点只提供 ISP 和 REJECT，默认 REJECT。配置设置 `close-if-proxy-chain-missing=true`，使绑定的中转丢失时拒绝连接。此参数不能替代首次“代理通过”绑定；未绑定的 ISP 节点仍可能直接连接 ISP。

## DNS 与平台差异

General DNS 保留公共 bootstrap/直连 DNS；代理域名使用 Shadowrocket 的远端解析行为。真实 ISP 存在后可私下设置指向实际节点的 DNS-over-PROXY，并 URL 编码节点名称；切换出口时该指定名称需同步更新。

Clash / CMFA 保留各 ISP 的 HTTP 407 专属前置检测。本 Shadowrocket 配置改用共用机场手动选择，不声明能得到相同探测结果。域名分流继续共用仓库 Rules，无泄漏测试站特殊路由。

配置经过静态检查；实际手机导入、代理通过绑定和链路需在设备上确认。

参考：[Shadowrocket 使用手册](https://github.com/LOWERTOP/Shadowrocket/wiki)、[分组配置语法](https://github.com/LOWERTOP/Shadowrocket/blob/main/lazy.conf)。
