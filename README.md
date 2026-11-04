# Bangumi Open

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/sdttttt.bangumiopen.png)](https://marketplace.visualstudio.com/items?itemName=SDTTTTT.bangumiopen)
[![Open VSX](https://img.shields.io/badge/Open%20VSX-SDTTTTT-blue)](https://open-vsx.org/extension/SDTTTTT/bangumiopen)

在 VS Code 里查看番剧时间表与番剧索引，并在番剧更新时提醒你。数据默认来自 [Bangumi（bgm.tv）](https://bgm.tv)，也可以切到 B 站。

## 功能

- **周番表** —— 按星期排布的更新时间表，「今天」那一列标出当前时刻与距下一场更新的倒计时
- **两个数据源** —— 周番表默认使用 Bangumi 每日放送，也可切到 B 站时间表（带播出时刻）
- **番剧索引** —— 可按类型、地区、状态、版权、付费、季度、时间、风格多级筛选
- **更新提醒** —— 状态栏显示下一场更新，更新时弹通知，支持提前提醒
- **今日概览** —— 默认的 Bangumi 数据源下，状态栏显示当天更新的番剧概要

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

| 配置项                          | 默认值    | 说明               |
| ------------------------------- | --------- | ------------------ |
| `bangumiOpen.WeekSource`        | `bangumi` | 周番表的数据源     |
| `bangumiOpen.DisplayHistory`    | `false`   | 显示过去几天的更新 |
| `bangumiOpen.EnableReminder`    | `true`    | 开启更新提醒       |
| `bangumiOpen.ReminderAheadTime` | `0`       | 提前提醒的秒数     |
| `bangumiOpen.IgnoredReminders`  | `[]`      | 不提醒的番剧列表   |
| `bangumiOpen.DisplayIndexTags`  | `true`    | 显示已选标签       |
| `bangumiOpen.DisplayStatusBar`  | `true`    | 显示状态栏提示     |

### 数据源

周番表可以在两个数据源之间切换：

- **`bangumi`（默认）** —— [Bangumi 每日放送](https://api.bgm.tv/calendar)，收录比 B 站全，还带评分与原作名；但它只按星期分组、没有播出时刻，因此**不提供更新提醒**（`EnableReminder` 与 `ReminderAheadTime` 在该模式下不生效）。状态栏改为显示**当日更新的番剧概要**（「今日 N 部番」，悬浮可看完整列表），`DisplayHistory` 对它也不生效，始终展示完整七天。
- **`bilibili`** —— B 站时间表，带具体播出时刻，因此支持更新提醒、状态栏提示与「显示过去的更新」。需要更新提醒时切到这一边。

更新提醒的通知里有两个按钮：「打开周番表」打开周番表，「不再提醒」打开一个下拉菜单，可以逐部选择不再提醒的番剧。同一个时段有多部番剧更新时，菜单里会出现「该时段 N 部都不再提醒」；菜单最后一项「关闭全部番剧的更新提醒」等价于把 `bangumiOpen.EnableReminder` 关掉。

选中的番剧名会记进 `bangumiOpen.IgnoredReminders`（全局设置），每项带一个忽略时间，超过 6 个月的记录会在扩展启动时自动清除。想恢复某部番剧的提醒，把列表里对应的那一项删掉即可。

忽略与关闭都只影响弹窗：状态栏的「下一场更新」与周番表仍然照常显示被忽略的番剧。

周番表顶部的「切换到 bgm.tv」/「切换到 bilibili」按钮可以在**当前面板内**临时换到另一个来源，不会改动上面的配置项；关闭面板后再次打开，仍会回到设置项指定的来源。提醒与状态栏始终按设置项工作。

番剧索引始终使用 B 站的数据，不受该设置影响。

## 贡献

欢迎提交 Issue 与 Pull Request。

![](https://contributors.nn.ci/api?repo=sdttttt/vscode-bangumi)

## 许可证

代码以 **Zero-Clause BSD (0BSD)** 发布，见 [LICENSE](LICENSE)。第三方声明见 [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt)。

图标界面插图为第三方素材，版权归原作者所有，不在本项目授权范围内（`Icon.png`、`resources/` 下的图片）。

数据来自 B 站与 [Bangumi](https://bgm.tv) 的公开接口，本项目与两者均无隶属关系。
