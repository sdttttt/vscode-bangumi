<h1 align="center">
  Bangumi Open
</h1>

[![Join the chat at https://gitter.im/vscode-bangumi/community](https://badges.gitter.im/vscode-bangumi/community.svg)](https://gitter.im/vscode-bangumi/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://dev.azure.com/shiinazch/Vscode%20Bangumi/_apis/build/status/sdttttt.vscode-bangumi?branchName=master)](https://dev.azure.com/shiinazch/Vscode%20Bangumi/_build/latest?definitionId=4&branchName=master)
[![codebeat badge](https://codebeat.co/badges/cd0a8650-e9e0-42fd-94c7-0aa866878b00)](https://codebeat.co/projects/github-com-sdttttt-vscode-bangumi-master)
[![vsmarketplacebadge](https://vsmarketplacebadge.apphb.com/version/sdttttt.bangumiopen.svg)](https://github.com/sdttttt/vscode-bangumi)
[![downloads](https://vsmarketplacebadge.apphb.com/downloads/sdttttt.bangumiopen.svg)](https://github.com/sdttttt/vscode-bangumi)
[![rating](https://vsmarketplacebadge.apphb.com/rating/sdttttt.bangumiopen.svg)](https://github.com/sdttttt/vscode-bangumi)
[![Known Vulnerabilities](https://snyk.io/test/github/sdttttt/vscode-bangumi/badge.svg?targetFile=package.json)](https://snyk.io/test/github/sdttttt/vscode-bangumi?targetFile=package.json)

> 一款基于 **Vscode** 的番剧插件, 该扩展请配合`Bilibili`食用( ゜- ゜)つロ

![b1](https://raw.githubusercontent.com/sdttttt/vscode-bangumi/master/resources/b1.gif)

![b2](https://raw.githubusercontent.com/sdttttt/vscode-bangumi/master/resources/b2.png)

## Description

**Search:**

使用 BILIBLI 的 API. 
提供的`番剧索引`功能. 以及`新番时间表`🕰.

**Reminder:**

插件有自带提醒的功能.在番剧更新时会以提示窗的形式提醒你. 🎉
如果你喜欢在评论区里快人一步(🛋️)🏁, `BangumiOpen`也提供了能**提前**提醒时间的配置选项`ReminderAheadTime`.

***(提醒功能可以在配置文件中关闭).***

## Functions in testing 🚧

**索引功能终于出来了.**  🎉
目前属于实验阶段.(如果发现`BUG`请向开发者丢锅( ᖛ ̫ ᖛ )ʃ)

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
    "bangumiOpen.DisplayIndexTags": true
```

## Usage 💖

`Ctrl+Shift+P` 调出命令栏后,输入`Open Bangumi`或 `Bangumi Open: Week Bangumi` 即可打开视图. 🕵️‍♂️

使用 `Bangumi Open: Index` 可打开索引. 选中索引后自动触发`Open Bangumi`命令.

> 在一级索引中选中`(恢复默认)`可清除所有已经选中的Tag. 📑

`Next Page` 和 `Back Page` 提供翻页功能.

`Next Page` 可用 `Ctrl+alt+l` 代替

`Back Page` 可用 `Ctrl+alt+k` 代替

> *由于一些不明原因,有的时候快捷键会失灵 ??*

## About i18n 🌍

**At present, not intended to provide i18n. The reasons are as follows:**
- Bilibili does not seem to provide an i18n interface.
- Bilibili's Bangumi seems to be available only in Chinese.

If you are a **non-Chinese user**.
I'm Sorry.(´；ω；‘)

> *If you have any ideas about i18n, you can **issue** me.* 👋

## Contribution ☕

**欢迎PR！ ( ´･∀･｀)**

|  contributer   | cover  |
|  ----  | ----  |
| sdttttt  | ![sdttttt](https://avatars1.githubusercontent.com/u/42728902?s=96&v=4) |

**(゜-゜)つ🍻 干杯~-bilibili**


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fsdttttt%2Fvscode-bangumi.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fsdttttt%2Fvscode-bangumi?ref=badge_large)
