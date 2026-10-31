# Bangumi Open

[![vsmarketplacebadge](https://img.shields.io/visual-studio-marketplace/v/sdttttt.bangumiopen.png)](https://marketplace.visualstudio.com/items?itemName=SDTTTTT.bangumiopen)

> 一款基于 **Vscode** 的番剧插件, 数据来自 B 站.

## 功能

提供的`番剧索引`. 以及`新番时间表` 的功能.

![b2](https://raw.githubusercontent.com/sdttttt/vscode-bangumi/master/resources/b2.png)

### 更新提醒

> 该功能在配置文件中可以被关闭.

**BangumiOpen**会在下面的状态栏处显示下一部即将更新的番剧 _（该状态栏可被关闭）_, 形如 `17:00 2部番` 或 `明日 09:00 财神窦占龙`. 鼠标悬停可以看到后续几部番剧的完整名称, 点击可直接打开周番表.
插件有自带提醒的功能. 在番剧更新时会以提示窗的形式提醒你. 同一时间更新的多部番剧会合并为一条提醒.
如果你喜欢在评论区里快人一步, **BangumiOpen**也提供了能**提前**提醒时间的配置选项`ReminderAheadTime`.

提醒只在整个周番表上维持一个定时器, 并会在每天零点后自动刷新时间表, 因此长期开着的窗口不会停留在昨天的信息上. 修改相关配置后立即生效, 无需重载窗口.

## 快速上手

`Ctrl+Shift+P` 调出命令栏后, 输入`番剧时间表：打开番剧列表`或 `番剧时间表：打开周番表` 即可打开视图.

周番表会在「今天」那一列标出当前时间, 形如金色的 `▶ 你在这里~ 还有 38 分钟`, 插在已经开播与还没开播的时间组之间, 随时间自动下移. 后面的时间是**距下一场更新的倒计时**: 不足一小时按分钟显示, 更长则显示小时与分钟; 当天全部播完显示`今日已播完`, 没有更新显示`今日没有更新`.

使用 `番剧时间表：打开筛选索引` 可打开索引. 选中索引后自动触发`番剧时间表：打开番剧列表`命令.

> 在一级索引中选中`(恢复默认)`可清除所有已经选中的标签.

`番剧时间表：下一页` 和 `番剧时间表：上一页` 提供翻页功能.

`番剧时间表：下一页` 可用 `Ctrl+alt+l` 代替

`番剧时间表：上一页` 可用 `Ctrl+alt+k` 代替

## 配置

```json
"bangumiOpen.DisplayHistory": false,  // 是否显示前六天的番剧更新
"bangumiOpen.EnableReminder": true,   // 是否开启番更新剧提醒
"bangumiOpen.ReminderAheadTime": 0,   // 更新提醒时间提前 (单位：秒)
"bangumiOpen.DisplayIndexTags": true, // 使用索引时是否显示已经选中的标签
"bangumiOpen.DisplayStatusBar": true  // 是否显示状态栏提示
```

## 贡献

![](https://contributors.nn.ci/api?repo=sdttttt/vscode-bangumi)
