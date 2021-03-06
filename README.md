# Bangumi Open

[![vsmarketplacebadge](https://vsmarketplacebadge.apphb.com/version/sdttttt.bangumiopen.svg)](https://github.com/sdttttt/vscode-bangumi)

> 一款基于 **Vscode** 的番剧插件, 该扩展请配合`Bilibili`食用( ゜- ゜)つロ

## Features 🌈

提供的`番剧索引`. 以及`新番时间表`🕰 的功能.

### Search

![b1](https://raw.githubusercontent.com/sdttttt/vscode-bangumi/master/resources/b1.gif)

### WeekBangumi

![b2](https://raw.githubusercontent.com/sdttttt/vscode-bangumi/master/resources/b2.png)

### Reminder

> 该功能在配置文件中可以被关闭.

**BangumiOpen**会在下面的状态栏处显示下一部即将更新的番剧 _（该状态栏可被关闭）_.
插件有自带提醒的功能. 在番剧更新时会以提示窗的形式提醒你. 🎉
如果你喜欢在评论区里快人一步(🛋️)🏁, **BangumiOpen**也提供了能**提前**提醒时间的配置选项`ReminderAheadTime`.

## Configuration 🛠

```json
    //Default Config

    // 是否显示前六天的番剧更新
    "bangumiOpen.DisplayHistory": false,

    // 是否开启番更新剧提醒
    "bangumiOpen.EnableReminder": true,

    // 更新提醒时间提前 (单位：秒)
    "bangumiOpen.ReminderAheadTime": 0,

    // 使用索引时是否显示已经选中的Tag
    "bangumiOpen.DisplayIndexTags": true,

    // 是否显示状态栏提示
    "bangumiOpen.DisplayStatusBar": true
```

## Quick Usage 🚀

`Ctrl+Shift+P` 调出命令栏后,输入`Open Bangumi`或 `Bangumi Open: Week Bangumi` 即可打开视图. 🕵️‍♂️

使用 `Bangumi Open: Index` 可打开索引. 选中索引后自动触发`Open Bangumi`命令.

> 在一级索引中选中`(恢复默认)`可清除所有已经选中的 Tag. 📑

`Next Page` 和 `Back Page` 提供翻页功能.

`Next Page` 可用 `Ctrl+alt+l` 代替

`Back Page` 可用 `Ctrl+alt+k` 代替

## About i18n 🌍

**At present, not intended to provide i18n. The reasons are as follows:**

-   Bilibili does not seem to provide an i18n interface.
-   Bilibili's Bangumi seems to be available only in Chinese.

If you are a **non-Chinese user**.
I'm Sorry.(´；ω；‘)

> _If you have any ideas about i18n, you can **issue** me._ 👋

## Contribution ☕

**欢迎 PR！ ( ´･∀･｀)**

| contributer | cover                                                                  |
| ----------- | ---------------------------------------------------------------------- |
| sdttttt     | ![sdttttt](https://avatars1.githubusercontent.com/u/42728902?s=96&v=4) |
