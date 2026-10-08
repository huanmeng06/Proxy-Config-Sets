# 三端共用链式入口

| 项目 | Clash | CMFA | Shadowrocket |
| --- | --- | --- | --- |
| 机场入口 | 📡 链式入口，select | 同左 | 同左 |
| 机场候选 | 机场节点，不含 ISP / DIRECT | 同左 | 同左 |
| ISP 识别 | 名称含 ISP | 名称含 ISP | 名称含 ISP |
| ISP 绑定 | 脚本自动设置 dialer-proxy | 私有节点设置 dialer-proxy | App 内设置代理通过 |
| 网站出口 | ISP | ISP | ISP |
| 默认 DoH | 经链式节点 | 经链式节点 | 公共基础版远端解析；私有版指定实际 ISP |

没有每 ISP 专属探测组，不复制机场节点凭据。机场入口手动选定后不自动切换。网站组不能直接指向机场入口。
