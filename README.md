# 后台批量操作机器人（Midscene）

> 篝火出品 · 收录于篝火 App 应用区 · 基于开源项目 [web-infra-dev/midscene](https://github.com/web-infra-dev/midscene)（MIT）

用大白话告诉它要做什么，它看着屏幕自己点、自己填，把网页后台里重复的操作交给机器：比如逐条录入商品、逐页导出数据、批量检查状态。它靠"看截图"操作，不依赖页面源码，换了页面改版也不用重写规则。

> 使用前提：需要你自己准备一个**支持图片识别的多模态大模型**（见下文），模型调用费用由你自己的账号承担。页面截图会发给你选择的模型服务商。

## 下载

到 [Releases](https://github.com/campfire-code/backend-batch-bot/releases/latest) 下载：

| 电脑 | 文件 |
|---|---|
| Windows 10 / 11 | `backend-batch-bot_版本号_midscene-studio-beta-…-win32-x64-setup.exe`（Studio 桌面版） |
| Mac（Apple 芯片：M1 / M2 / M3 / M4） | `…-darwin-arm64.dmg` |
| Mac（Intel 芯片） | `…-darwin-x64.dmg` |
| 任意电脑的 Chrome 浏览器 | `…-midscene-extension-v1.17.0.zip`（浏览器插件） |

- 安装包来自上游官方发布，篝火没有修改，附 `SHA256SUMS.txt` 可核对。
- 上游还有 Linux 版 Studio 和 Windows / macOS 的免安装 zip，篝火没有转发布，需要的请去[上游发布页](https://github.com/web-infra-dev/midscene/releases/tag/v1.17.0)下载。
- **Studio 目前是上游标注的 Beta（公测）版本**，可能有问题；想先体验推荐用浏览器插件。
- 首次打开 Mac 版若提示"无法验证开发者"，到"系统设置 - 隐私与安全性"里选择仍要打开。

## 先准备大模型

必须使用**多模态、能看图并定位界面元素**的模型。上游文档（`apps/site/docs/en/model-api-setup.mdx`）列出的可用模型系列如下，名称和 `MIDSCENE_MODEL_FAMILY` 要成对填写：

| 模型系列 | `MIDSCENE_MODEL_NAME` 示例 | `MIDSCENE_MODEL_FAMILY` |
|---|---|---|
| 通义千问 Qwen3.x | `qwen3.7-plus` | `qwen3` |
| 豆包 Seed 2.x | `doubao-seed-2-1-turbo-260628` | `doubao-seed` |
| 智谱 GLM-V | `glm-5v-turbo`、`glm-4.6v` | `glm-v` |
| DeepSeek V4 | `deepseek-flash` | `deepseek` |
| Kimi | `kimi-k2.5`、`kimi-k2.6` | `kimi` |
| Gemini 3.x | `gemini-3.5-flash` | `gemini` |
| OpenAI GPT-5 / GPT-6 | `gpt-5.5` | `gpt-5` / `gpt-6` |

以上名称按上游当前文档抄录，服务商改名下线后以上游文档和服务商控制台为准。完整列表与各家接口地址见上游 [Use a model API key](https://midscenejs.com/model-api-setup)。

配置一共四项（接口走 OpenAI 兼容格式）：

```ini
MIDSCENE_MODEL_BASE_URL="服务商的接口地址，例如 https://dashscope.aliyuncs.com/compatible-mode/v1"
MIDSCENE_MODEL_API_KEY="你自己的密钥"
MIDSCENE_MODEL_NAME="qwen3.7-plus"
MIDSCENE_MODEL_FAMILY="qwen3"
```

- 通义千问的接口地址是 `https://dashscope.aliyuncs.com/compatible-mode/v1`；豆包（火山引擎）是 `https://ark.cn-beijing.volces.com/api/v3`，其他服务商查各自文档。
- 密钥只保存在你自己的电脑里，不要发给别人，也不要写进公开的仓库。
- DeepSeek-V4-Pro 不支持图片输入，不能用。

## 怎么用

### 方式一：浏览器插件（推荐先试）

上游正式渠道是 Chrome 应用商店；打不开商店时可以手动安装本页的插件 zip（手动安装不会自动更新）：

1. 把 `…midscene-extension-v1.17.0.zip` 解压到一个固定文件夹，不要删。
2. Chrome 地址栏打开 `chrome://extensions/`，打开右上角"开发者模式"。
3. 点"加载已解压的扩展程序"，选择刚才解压的文件夹。
4. 点浏览器工具栏的拼图图标，打开 Midscene，右侧出现侧边栏。
5. 点侧边栏的设置图标，把上面四行配置整段粘贴进去保存。
6. 打开你要操作的网页后台并保持该页面可见，在侧边栏选 `aiAct`，输入一句话，例如"点开第一条订单，把状态改成已发货"，运行并查看结果。

`aiAssert` 用来检查结果（如"列表第一行状态是已发货"），`aiQuery` 用来把页面上的数据读成 JSON。

### 方式二：Studio 桌面版（Beta）

1. 安装并打开 Studio。
2. 在模型配置处粘贴上面四行配置并保存。
3. 选择要操作的平台（网页、Android、iOS、鸿蒙、电脑桌面均在上游支持范围内），连接后在操作面板输入自然语言指令。

Studio 的细节上游文档很少，遇到问题以上游 Issue 为准。界面以英文为主。

### 在自家后台批量操作：用 YAML 脚本

把要重复的步骤写成脚本文件，用上游命令行工具跑（需要 Node.js 20.19+、22.12+ 或 24+）。下面示例中所有字段（`web`、`tasks`、`flow`、`ai`、`aiInput`、`aiTap`、`aiWaitFor`、`aiQuery`、`aiAssert`、`name`、`sleep`）均来自上游 YAML 文档：

```yaml
# order-ship.yaml：在自家后台给两笔订单填写快递单号并确认发货
web:
  url: https://你家后台的地址/orders
  # 后台需要登录时，先在同一个浏览器里手动登录，或在第一个任务里用 ai 步骤登录

tasks:
  - name: 第一单发货
    flow:
      - ai: 点开订单号为 A1001 的订单详情
      - aiInput: 快递单号输入框
        value: SF0000000001
      - aiTap: 确认发货按钮
      - aiWaitFor: 页面提示发货成功
      - aiAssert: 订单状态显示为已发货

  - name: 第二单发货
    flow:
      - ai: 返回订单列表，点开订单号为 A1002 的订单详情
      - aiInput: 快递单号输入框
        value: SF0000000002
      - aiTap: 确认发货按钮
      - aiWaitFor: 页面提示发货成功

  - name: 导出当前列表
    flow:
      - aiQuery: 订单列表每一行的订单号和状态，返回 {orderNo: string, status: string}[]
        name: orders
```

运行：

```bash
npm i -g @midscene/cli
# 在当前目录新建 .env，写入上面四行模型配置（不要加 export）
midscene ./order-ship.yaml
```

运行结束会生成可视化报告，能逐步回放每一步的截图。YAML 脚本本身没有循环语法，订单多时请用程序生成多个 task，或改用上游的 JavaScript SDK（见上游文档 Integrate with Playwright / Puppeteer）。

**安全提醒**：批量改动数据前，先在测试数据或单条订单上跑通；脚本会按屏幕内容点击，模型偶尔会点错，不要直接对大批量真实订单一次跑完。

## 验收用例

| 操作 | 应得到 |
|---|---|
| 安装插件，粘贴模型配置，打开上游示例页 [TodoMVC](https://todomvc.com/examples/react/dist/#/)，`aiAct` 输入"添加一条名为 Try Midscene 的待办并标记完成" | 页面出现该待办且被勾选 |
| 同页 `aiAssert` 输入"列表里有 Try Midscene，且已完成" | 断言通过 |
| 命令行 `pnpm dlx @midscene/test@latest model verify`（带上 `.env`） | 各项检查显示 PASS，确认模型可用 |

## 和上游的区别

- 仅新增中文说明与篝火发布流程（`tool.json`、`.github/workflows/release.yml`），软件代码与上游一致，安装包原样转发布。
- 移除了上游用于编译、签名的工作流，这些依赖上游的密钥。
- 上游文档、软件界面以英文为主，本页是篝火整理的中文使用说明。

## 归属与许可证

本仓库由**篝火**整理发布，是篝火 App 应用区收录的开源工具之一。软件全部功能与版权归 [web-infra-dev/midscene](https://github.com/web-infra-dev/midscene) 原作者所有，按 MIT 许可证再分发。全部工具目录见 [toolkit-hub](https://github.com/campfire-code/toolkit-hub)。

---

以下为上游原始说明：

<p align="center">
  <img alt="Midscene.js" width="180" src="https://github.com/user-attachments/assets/f60de3c1-dd6f-4213-97a1-85bf7c6e79e4"><br />
  <strong>See interfaces like a human. E2E testing in natural language.</strong><br />
  Bring AI vision to E2E testing with a newly designed test framework for web, mobile, and desktop apps.
</p>

<p align="center">
  <a href="https://midscenejs.com/">Website</a> · English / <a href="./README.zh.md">简体中文</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@midscene/web"><img src="https://img.shields.io/npm/v/@midscene/web?style=flat-square&color=00a8f0" alt="npm version" /></a>
  <a href="https://npm-compare.com/@midscene/web/#timeRange=THREE_YEARS"><img src="https://img.shields.io/npm/dm/@midscene/web.svg?style=flat-square&color=00a8f0" alt="downloads" /></a>
  <a href="https://github.com/web-infra-dev/midscene/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&color=00a8f0" alt="License" /></a>
  <a href="https://trendshift.io/repositories/12524"><img src="https://img.shields.io/badge/GitHub_Trending-featured-00a8f0?style=flat-square&logo=github" alt="Featured on GitHub Trending" /></a>
</p>

## Write a test in natural language

Midscene.js brings AI vision to E2E testing. Describe UI steps and expected results in natural language, then use the visual GUI Agent to carry them out and verify what users see. Organize tests with Midscene Test, or integrate the Agent APIs into your existing testing framework.

### YAML test cases with Midscene Test

After [creating a Midscene Test project](https://midscenejs.com/midscene-test/use) and configuring a model and the Web runtime, write a case like this. Replace the example URL with your app's address:

```yaml
beforeEach:
  - gotoUrl: https://your-shop.example

cases:
  - name: Find headphones under $100
    steps:
      - aiAct: Search for headphones and filter the results to prices under $100
      - aiWaitFor: The filtered search results are visible
      - aiAssert: There are products in the search results, and each costs less than $100
```

### JavaScript with Playwright

You can also use the Agent directly in your existing tests. Configure a model and open your app in a Playwright `page`, then describe the same steps in code:

```javascript
import { PlaywrightAgent } from '@midscene/web/playwright';

const agent = new PlaywrightAgent(page);

await agent.aiAct('Search for headphones and filter the results to prices under $100');
await agent.aiWaitFor('The filtered search results are visible');
await agent.aiAssert('There are products in the search results, and each costs less than $100');
```

Open the generated HTML report to inspect screenshots, actions, and assertion results. Follow the guides for [Midscene Test](https://midscenejs.com/midscene-test/use) or [Playwright](https://midscenejs.com/integrate-with-playwright) for setup and complete examples.

## 👁️ Vision-driven, low-cost testing

Midscene models UI actions and assertions on how people use software: **look at the screen, act on what you see, and check the visible result**.

### Locate and act from screenshots

Midscene locates elements by their appearance and position, then clicks, types, or scrolls to carry out your instructions. You can target icon-only buttons, custom controls, `<canvas>`, and elements inside cross-origin iframes without maintaining selectors or adding semantic annotations.

### Verify what users see

Describe the expected appearance in natural language to check colors, selection highlights, layout, and visual feedback — including content drawn on `<canvas>` or displayed in native apps.

```javascript
await agent.aiAssert('The selected plan has a blue border and a checkmark');
await agent.aiAssert('The error message is visible below the email field');
```

### Choose models for your needs and budget

Screenshot-based UI actions avoid sending large DOM trees to the model. In the reported AppControlBench run, Midscene with Doubao Seed 2.1 Turbo passed **58 of 60 tasks with $0.59 in total model cost**. The [report](https://midscenejs.com/app-control-bench-report) provides per-task costs and comparisons across models.

Midscene supports `Qwen3.x`, `Doubao-Seed-2.1`, `DeepSeek V4 Flash`, `GLM-4.6V`, `gemini-3.5-flash`, and `UI-TARS`, including open-source options you can self-host. See [Model Selection Guide](https://midscenejs.com/model-selection) to choose a model and [Model Configuration](https://midscenejs.com/model-api-setup) to set it up.

## 🌐 One API, across platforms

Use the same Agent APIs to describe actions and assertions across platforms:

| Platform | Integration |
| --- | --- |
| Web | [Playwright](https://midscenejs.com/integrate-with-playwright), [Puppeteer](https://midscenejs.com/integrate-with-puppeteer), or [desktop Chrome](https://midscenejs.com/bridge-mode) |
| Android | [Devices and emulators through ADB](https://midscenejs.com/platforms/android) |
| iOS | [Devices and simulators through WebDriverAgent](https://midscenejs.com/platforms/ios) |
| HarmonyOS | [HarmonyOS NEXT through HDC](https://midscenejs.com/platforms/harmonyos) |
| Desktop | [macOS, Windows, and Linux, with remote RDP support](https://midscenejs.com/platforms/desktop) |
| Custom interfaces | [Provide screenshots and action capabilities](https://midscenejs.com/integrate-with-any-interface) |

## 🧩 Midscene Test: YAML for cases, TypeScript for extensions

[Midscene Test](https://midscenejs.com/midscene-test/overview) (`@midscene/test`) turns GUI automation into a maintainable E2E test project:

- **Describe test cases in YAML.** Combine UI actions, assertions, and business operations to express the flow and expected results.
- **Reuse business capabilities through TypeScript Nodes.** Wrap data preparation, API calls, and cleanup in nodes that different cases can share. A refund test can prepare an order through an API, request a refund through the UI, and verify the result in one workflow.
- **Generate a Node Spec for developers and AI Agents.** Export registered nodes and their parameter schemas as Markdown, so both can discover project capabilities and co-maintain test cases.

Start with [Create and use test projects](https://midscenejs.com/midscene-test/use), then learn how to [Develop custom Nodes](https://midscenejs.com/midscene-test/extend).

## 🧰 Tools for writing and debugging tests

### APIs that fit your existing stack

Use `aiAct` for autonomous flows, `aiTap` and `aiInput` for individual actions, `aiAssert` for assertions, and `aiQuery` for structured data extraction. Combine these [Agent APIs](https://midscenejs.com/reference/#common) with your existing code, fixtures, and assertions through Playwright, Puppeteer, or the JavaScript SDK.

### Replay execution and refine instructions

Interactive HTML reports show screenshots, element locations, the AI decision process, and action and assertion results. Midscene Test also records the inputs, outputs, duration, and status of custom business operations, giving developers and AI Agents context to investigate failures. Use the [Playground](https://midscenejs.com/quick-start) to try and refine instructions against your interface.

### Let AI coding agents operate the UI

[Midscene Skills](https://midscenejs.com/skills) lets AI coding agents operate applications, verify interfaces, and inspect execution results.

## 📊 Benchmarks and showcases

| Benchmark | Pass@1 | Model used in the reported run |
| --- | --- | --- |
| [AndroidWorld](https://midscenejs.com/android-world-benchmark-report) | 93.1% | Gemini-3.5-Flash |
| [MobileWorld](https://midscenejs.com/mobile-world-benchmark-report) | 78.6% | Gemini-3.6-Flash |
| [AppControlBench](https://midscenejs.com/app-control-bench-report) | 96.7% | Doubao Seed 2.1 Turbo |

Each report includes the run configuration and task results; see AndroidWorld's report for its environment and validator adjustments.

Explore [cross-platform showcases](https://midscenejs.com/showcases), from web form validation to mobile workflows and community-built in-vehicle testing.

## 🚀 Get started

- **Write YAML test cases** — [create a Midscene Test project](https://midscenejs.com/midscene-test/use).
- **Add visual capabilities to existing tests** — integrate with [Playwright](https://midscenejs.com/integrate-with-playwright) or [Puppeteer](https://midscenejs.com/integrate-with-puppeteer).
- **Try it before writing tests** — use the [Chrome extension](https://midscenejs.com/quick-start), or launch a [Playground for mobile or desktop](https://midscenejs.com/quick-start#use-midscene-on-other-platforms).
- **Let your AI agent operate the UI** — install [Midscene Skills](https://midscenejs.com/skills).

## 📄 Resources

* Documentation: [https://midscenejs.com](https://midscenejs.com/)
* Sample projects: [midscene-example](https://github.com/web-infra-dev/midscene-example)
* API reference: [https://midscenejs.com/reference/#common](https://midscenejs.com/reference/#common)

## 🤝 Community

* [Discord](https://discord.gg/2JyBHxszE4)
* [Follow us on X](https://x.com/midscene_ai)
* [Lark Group (飞书交流群)](https://applink.larkoffice.com/client/chat/chatter/add_by_link?link_token=693v0991-a6bb-4b44-b2e1-365ca0d199ba)

## 🌟 Awesome Midscene

Community projects that extend Midscene.js capabilities:

* [midscene-ios](https://github.com/lhuanyu/midscene-ios) - iOS Mirror automation support for Midscene
* [midscene-pc](https://github.com/Mofangbao/midscene-pc) - PC operation device for Windows, macOS, and Linux
* [midscene-pc-docker](https://github.com/Mofangbao/midscene-pc-docker) - Docker image with Midscene-PC server pre-installed
* [Midscene-Python](https://github.com/Python51888/Midscene-Python) - Python SDK for Midscene automation
* [midscene-java](https://github.com/Master-Frank/midscene-java) by @Master-Frank - Java SDK for Midscene automation
* [midscene-java](https://github.com/alstafeev/midscene-java) by @alstafeev - Java SDK for Midscene automation


## 📝 Credits

We would like to thank the following projects:

- [Rsbuild](https://github.com/web-infra-dev/rsbuild) and [Rslib](https://github.com/web-infra-dev/rslib) for the build tools.
- [UI-TARS](https://github.com/bytedance/ui-tars) for the open-source agent model UI-TARS.
- [Qwen-VL](https://github.com/QwenLM/Qwen-VL) for the open-source multimodal model Qwen-VL.
- [scrcpy](https://github.com/Genymobile/scrcpy) and [yume-chan](https://github.com/yume-chan) for browser-based Android device control.
- [appium-adb](https://github.com/appium/appium-adb) for its JavaScript bridge to ADB.
- [appium-webdriveragent](https://github.com/appium/WebDriverAgent) for controlling XCTest from JavaScript.
- [YADB](https://github.com/ysbing/YADB) for improving text input performance.
- [libnut-core](https://github.com/nut-tree/libnut-core) for cross-platform native keyboard and mouse control.
- [Puppeteer](https://github.com/puppeteer/puppeteer) for browser automation and control.
- [Playwright](https://github.com/microsoft/playwright) for browser automation, control, and testing.

## 📖 Citation

If you use Midscene.js in your research or project, please cite:

```bibtex
@software{Midscene.js,
  author = {Xiao Zhou, Tao Yu, YiBing Lin},
  title = {Midscene.js: GUI Agent for E2E Testing.},
  year = {2025},
  publisher = {GitHub},
  url = {https://github.com/web-infra-dev/midscene}
}
```

## ✨ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=web-infra-dev/midscene&type=Date)](https://www.star-history.com/#web-infra-dev/midscene&Date)


## 📝 License

Midscene.js is [MIT licensed](https://github.com/web-infra-dev/midscene/blob/main/LICENSE).

---

<div align="center">
  If this project helps you or inspires you, please give us a star
</div>
