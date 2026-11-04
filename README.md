# Knowledge Video

一个 `knowledge-video` 技能，整理实际制作中使用的知识视频流程：选题、文案、分镜、人物动作、配音、同步、导出与成片验收。当前制作路线是 **PixiJS + JavaScript 画面、原生配音、真实语音时码、逐帧导出**。

说明以中文为主，AI 可按用户语言使用。技能是制作方法与必要辅助脚本，不会在安装时生成视频、下载模型或配置私人音色。

## 安装

使用 [Skills CLI](https://github.com/vercel-labs/skills/blob/main/docs/commands.md) 需要 Node.js/npm：

```bash
# 查看技能；本仓库只有 knowledge-video
npx skills add zhouyuxiang0/knowledge-video --list

# 安装到当前项目，交互选择目标 AI
npx skills add zhouyuxiang0/knowledge-video --skill knowledge-video

# 指定安装到 Codex 和 Claude Code
npx skills add zhouyuxiang0/knowledge-video --skill knowledge-video --agent codex claude-code
```

加 `--global` 可安装到用户级目录；其他受支持的助手由安装器选择。仓库为私有时，安装账号必须有访问权限并已配置 Git 认证。也可先用自己的认证方式克隆，再运行 `npx skills add ./knowledge-video --skill knowledge-video`；不要把令牌写进命令或技能。

**手动安装**：将 `skills/knowledge-video/` 整个目录复制到目标助手的技能目录，例如项目的 `.agents/skills/` 或 `.claude/skills/`，保留其中的引用文档、脚本与许可。已有同名技能时先比较自己的修改。不支持技能发现的 AI，可直接读取 [SKILL.md](skills/knowledge-video/SKILL.md) 后按需读取链接。

## 使用

在 Codex 中可以说：

> 使用 $knowledge-video，为普通成年人策划下一条知识视频。先查看已发布选题，给出不同领域的候选、观看乐趣和知识收获，等我确认再制作。

> 使用 $knowledge-video，按已确认的文案制作 PixiJS 视频。先完成覆盖关键动作与切镜的连续样段，再扩展整片。

> 使用 $knowledge-video，检查这份文稿和 MP4 的解释、人物动作、读音、停顿与字幕同步，保留已确认原声。

其他 AI 使用自身的技能调用方式。工具名称代表能力需求；缺少播放或听音能力时应明确未验收项，不能用抽帧、转写或编码成功代替实际观看和听审。

首次使用时给出受众、题目或原稿、画幅、已有素材及授权范围；已有项目约定优先。可沿用[最小项目记录](skills/knowledge-video/references/project-brief.md)。制作时按[当前流程](skills/knowledge-video/references/production.md)组织输入、样段、配音与导出。

## 配套内容

- 文案与验收：知识前提、解释顺序、娱乐性、历史人物与现代观众的关系、结尾是否真正答完。
- 画面与动作：原画结构、真人动作参考、持物接触、连续动作和原速自然度。
- 声音：读音风险逐次定位、语义停顿、连续生成、低内存阶段运行及原声保护。
- 必要脚本：逐帧导出/静帧、本地预览服务、绑定输入版本的动作验收记录校验。

没有附带通用角色库、整片模板、模型权重、参考人声或自动发布工具。制作项目按现有约定准备素材与配音环境；曾验证的音色和单期画面不等于未来作品自动通过。

## 运行辅助脚本

只做研究、文稿和审查，无需安装脚本依赖。逐帧导出使用 Node.js、Chrome、`ffmpeg` 和 `ffprobe`；在实际技能目录安装固定版本依赖：

```bash
npm --prefix skills/knowledge-video install
```

安装到助手目录后，将路径换成该技能的真实位置。这里安装的是 `playwright-core`，不自动下载浏览器、PixiJS、字体或模型。脚本接口、页面协议及接入例子见[工具说明](skills/knowledge-video/references/tools.md)。

## 验证与维护

在克隆的仓库根目录运行：

```bash
python3 -m unittest discover -s tests -v
node --test tests/*.test.mjs
# 上述渲染依赖准备好后，验证真实短视频导出及失败保护
node scripts/smoke_render.mjs
```

技术检查不能代替成片内容和声画验收。维护规则见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 来源与许可

在原 `knowledge-video` 技能基础上整理实际制作经验，采用 MIT，保留原作者声明。来源与本包改动见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)，许可见 [LICENSE](LICENSE)。素材、字体、模型与外部服务适用各自许可，不随本包分发。
