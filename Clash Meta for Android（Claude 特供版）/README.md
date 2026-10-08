# CMFA：不内置节点的 Claude 链式基础配置

2026-10-08 修订。公开 YAML 不含任何机场节点、ISP 节点、订阅链接、账号密码或待填的示例字段，也不使用回转箭头。

可直接下载并导入，但它本身不提供代理服务。没有私有 ISP 配置时，`🧠 Claude` 和 `🔗 链式节点` 默认 REJECT；地区/机场组没有节点时也拒绝连接，不会用机场代替 ISP。

## 在自己的私有副本中添加

1. 在私有 YAML 中添加自己的机场节点或 `proxy-providers`。普通地区/服务组会筛选已添加的节点与 provider；它们排除 ISP 出口。
2. 添加每个真实 ISP 的实际出口节点，使用 `📡 机场前置 → 国旗 国家 城市 [ISP]` 命名。Claude 和链式节点只动态收录这种格式的节点，不收录普通机场。
3. 为每个 ISP 私下建立一个前置 fallback 组，用 `📡 机场前置 → 国旗 国家 城市 ISP 编号` 命名。将该 ISP 出口的 `dialer-proxy` 指向对应组。
4. 该组只测试机场前置，实际测试地址必须是这个 ISP 的真实 HTTP 端口；group 和 provider 的 health-check 都设置 `expected-status: 407`、1800 秒间隔、8000 ms 超时。fallback 按候选顺序选择首个可用前置，不按延迟排名切换，不设置 tolerance。不要把 ISP 账号密码放进测速请求。
5. 有些 ISP 的 HTTP 与 SOCKS5 同端口，有些分端口；从供应商说明核实，不根据名称猜测。公开文件不提供虚构探测地址。
6. 绑定确认后，才把默认 REJECT 改选为真实 ISP 出口。若有多个 ISP，Claude 和链式节点可以分别选择，但 DNS 出口跟随链式节点组。

业务流量必须指向实际 ISP 节点，不能指向只含机场的前置组。路径应为手机 → 机场前置 → ISP → 网站。若在前置组私下加入 DIRECT，它表示手机 → ISP → 网站，仍然不是机场直出。

HTTP 407 仅证明 ISP HTTP 端口能回应，不保证 SOCKS5 认证或网站成功。单来源 ISP 换前置时可能被旧入口占用影响，因此不保证无中断。真实 ISP 不可用时，不得添加机场或 DIRECT 作为 Claude 的业务兜底。

## DNS 与分流

默认 Cloudflare / Google DoH 经链式节点组当前 ISP，Claude 域名使用同一路径。未设置 ISP 时，此 DNS 路径随 REJECT 关闭。

国内 geosite:cn 使用阿里/腾讯 DoH 直连。认证页和内网使用 Android system DNS；节点解析使用独立公共 bootstrap。机场若有专用解析要求，应只在私有配置里设置。

保留仓库 Rules 域名分流、Android 包名规则和 TCP/UDP 设置，不包含 macOS 接口/进程设置。无旧落地选择组，无泄漏测试站专用分流。

## 校验

无节点版本已通过本机 Mihomo 加载校验，并检查动态入口过滤、REJECT 默认值和所有静态引用。实际 ISP/前置的 407 和链式连通性需在添加私有配置后验证。公开基础配置不声明手机联网 PASS。
