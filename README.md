# Bangumi Open

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/sdttttt.bangumiopen.png)](https://marketplace.visualstudio.com/items?itemName=SDTTTTT.bangumiopen)
[![Open VSX](https://img.shields.io/badge/Open%20VSX-SDTTTTT-blue)](https://open-vsx.org/extension/SDTTTTT/bangumiopen)

在 VS Code 里查看 B 站番剧时间表与番剧索引，并在番剧更新时提醒你。

## 功能

- **周番表** —— 按星期排布的更新时间表，「今天」那一列标出当前时刻与距下一场更新的倒计时
- **两个数据源** —— 周番表可在 B 站时间表与 Bangumi 每日放送之间切换，后者收录更全
- **番剧索引** —— 可按类型、地区、状态、版权、付费、季度、时间、风格多级筛选
- **更新提醒** —— 状态栏显示下一场更新，更新时弹通知，支持提前提醒
- **今日概览** —— 切到 Bangumi 数据源时，状态栏改为显示当天更新的番剧概要

![周番表](https://raw.githubusercontent.com/sdttttt/vscode-bangumi/master/resources/b2.png)

## 使用

`Ctrl+Shift+P` 调出命令栏，输入：

| 命令                     | 快捷键（Windows / macOS）  |
| ------------------------ | -------------------------- |
| 番剧时间表：打开周番表   |                            |
| 番剧时间表：打开番剧列表 |                            |
| 番剧时间表：打开筛选索引 |                            |
| 番剧时间表：下一页       | `Ctrl+Alt+L` / `Cmd+Alt+L` |
| 番剧时间表：上一页       | `Ctrl+Alt+K` / `Cmd+Alt+K` |
| 番剧时间表：跳转到指定页 |                            |

## 配置

| 配置项                          | 默认值     | 说明               |
| ------------------------------- | ---------- | ------------------ |
| `bangumiOpen.WeekSource`        | `bilibili` | 周番表的数据源     |
| `bangumiOpen.DisplayHistory`    | `false`    | 显示过去几天的更新 |
| `bangumiOpen.EnableReminder`    | `true`     | 开启更新提醒       |
| `bangumiOpen.ReminderAheadTime` | `0`        | 提前提醒的秒数     |
| `bangumiOpen.DisplayIndexTags`  | `true`     | 显示已选标签       |
| `bangumiOpen.DisplayStatusBar`  | `true`     | 显示状态栏提示     |

### 数据源

周番表可以在两个数据源之间切换：

- **`bilibili`** —— B 站时间表，带具体播出时刻，因此支持更新提醒、状态栏提示与「显示过去的更新」。
- **`bangumi`** —— [Bangumi 每日放送](https://api.bgm.tv/calendar)，收录比 B 站全，还带评分与原作名；但它只按星期分组、没有播出时刻，因此**不提供更新提醒**（`EnableReminder` 与 `ReminderAheadTime` 在该模式下不生效）。状态栏改为显示**当日更新的番剧概要**（「今日 N 部番」，悬浮可看完整列表），`DisplayHistory` 对它也不生效，始终展示完整七天。

番剧索引始终使用 B 站的数据，不受该设置影响。

## 贡献

欢迎提交 Issue 与 Pull Request。

![](https://contributors.nn.ci/api?repo=sdttttt/vscode-bangumi)

## 许可证

代码以 **Zero-Clause BSD (0BSD)** 发布，见 [LICENSE](LICENSE)。第三方声明见 [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt)。

图标与界面插图为《日常》的同人素材，版权归原作者所有，不在本项目授权范围内（`Icon.png`、`resources/` 下的图片、`resources/b2.png`）。

数据来自 B 站与 [Bangumi](https://bgm.tv) 的公开接口，本项目与两者均无隶属关系。
