# Bangumi Open

[![Build Status](https://travis-ci.com/sdttttt/vscode-bangumi.svg?branch=master)](https://travis-ci.com/sdttttt/vscode-bangumi)
[![Build Status](https://dev.azure.com/shiinazch/Vscode%20Bangumi/_apis/build/status/sdttttt.vscode-bangumi?branchName=master)](https://dev.azure.com/shiinazch/Vscode%20Bangumi/_build/latest?definitionId=4&branchName=master)
[![CodeFactor](https://www.codefactor.io/repository/github/sdttttt/vscode-bangumi/badge/master)](https://www.codefactor.io/repository/github/sdttttt/vscode-bangumi/overview/master)
![Upload Release](https://github.com/sdttttt/vscode-bangumi/workflows/Upload%20Release/badge.svg)

一款基于 **Vscode** 的番剧插件.

![b1](./resources/b1.png)

![b2](./resources/b2.png)

## Description

使用 BILIBLI 的 API.
提供的番剧浏览.

每周新番也可以.

## Functions in testing

**插件有自带提醒的功能.在番剧更新时会提醒你.**

该功能可以在配置文件中关闭.

## Configuration

```json
    //Default Config

    // 是否显示前六天的番剧更新
    "bangumiOpen.DisplayHistory": false,

    // 是否开启番更新剧提醒
    "bangumiOpen.EnableReminder": true,
    
    // 更新提醒时间提前 (单位：秒)
    "bangumiOpen.ReminderAheadTime": 0
```

## Usage

`Ctrl+Shift+P` 调出控制栏后,输入`Open Bangumi`或 `Bangumi Open: Week Bangumi` 即可打开视图.

`Next Page` 和 `Back Page` 提供翻页功能.

`Next Page` 可用 `Ctrl+alt+l` 代替

`Back Page` 可用 `Ctrl+alt+k` 代替

## Future

可能会在将来提供的功能:

- 番剧索引

## Contribution

|  contributer   | cover  |
|  ----  | ----  |
| sdttttt  | ![sdttttt](https://avatars1.githubusercontent.com/u/42728902?s=96&v=4) |

# Enjoy!
