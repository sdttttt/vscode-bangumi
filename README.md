# Bangumi Open

[![Build Status](https://travis-ci.com/sdttttt/vscode-bangumi.svg?branch=master)](https://travis-ci.com/sdttttt/vscode-bangumi)
[![Build Status](https://dev.azure.com/shiinazch/Vscode%20Bangumi/_apis/build/status/sdttttt.vscode-bangumi?branchName=master)](https://dev.azure.com/shiinazch/Vscode%20Bangumi/_build/latest?definitionId=4&branchName=master)
[![CodeFactor](https://www.codefactor.io/repository/github/sdttttt/vscode-bangumi/badge/master)](https://www.codefactor.io/repository/github/sdttttt/vscode-bangumi/overview/master)



一款基于 **Vscode** 的番剧插件.希望能在编码中给你一点点快乐.

![b1](https://raw.githubusercontent.com/sdttttt/vscode-bangumi/master/resources/b1.gif)

![b2](https://raw.githubusercontent.com/sdttttt/vscode-bangumi/master/resources/b2.png)

## Description

使用 BILIBLI 的 API.
提供的`番剧索引`.以及`番剧更新表`.

## Functions in testing

**插件有自带提醒的功能.在番剧更新时会提醒你.**
该功能可以在配置文件中关闭.

**索引功能终于出来了.** 

目前属于实验阶段.

## Configuration

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

## Usage

`Ctrl+Shift+P` 调出命令栏后,输入`Open Bangumi`或 `Bangumi Open: Week Bangumi` 即可打开视图.

使用 `Bangumi Open: Index` 可打开索引. 选中索引后自动触发`Open Bangumi`命令.

在一级索引中选中`(恢复默认)`可清除所有已经选中的Tag.

`Next Page` 和 `Back Page` 提供翻页功能.

`Next Page` 可用 `Ctrl+alt+l` 代替

`Back Page` 可用 `Ctrl+alt+k` 代替

*由于一些不明原因,有的时候快捷键会失灵 ??*

## Contribution

|  contributer   | cover  |
|  ----  | ----  |
| sdttttt  | ![sdttttt](https://avatars1.githubusercontent.com/u/42728902?s=96&v=4) |

# Enjoy!
