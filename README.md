# Knowledge Video Skills

把知识做成观众愿意看、看得懂的视频。这里整理了实际制作与返修中使用的选题、文稿、分镜、角色动作、配音、同步和成片验收方法，采用标准 `SKILL.md` 目录，可交给不同 AI 编程助手使用。

**Choose `knowledge-video` for the full production workflow, or `vibe-knowledge-film` for narration-free Canvas films.** Instructions are primarily in Chinese; an agent can apply them in the user's language. No model weights, voice samples or account credentials are required to read and use the skills.

## 安装

需要 Node.js/npm 才能使用下面的 Skills CLI；只阅读或手动安装技能不需要 Node.js。

```bash
# 查看可安装的技能
npx skills add zhouyuxiang0/knowledge-video --list

# 安装完整制作流程；交互选择目标 AI
npx skills add zhouyuxiang0/knowledge-video --skill knowledge-video

# 同时安装两个技能到当前项目的 Codex 和 Claude Code
npx skills add zhouyuxiang0/knowledge-video --skill knowledge-video vibe-knowledge-film --agent codex claude-code
```

加 `--global` 安装到用户级目录。也可通过 CLI 选择 Cursor 等受支持的助手；具体目录由安装器处理。命令以 [Skills CLI 文档](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)为准。

**私有仓库**：安装者必须已获得本仓库权限，并配置 Git 凭据、GitHub CLI 或 SSH。可以先用自己的认证方式克隆，再执行 `npx skills add ./knowledge-video --skill knowledge-video`。不要把访问令牌写进命令、技能或项目文件。

**手动安装**：下载或克隆仓库，把 `skills/knowledge-video/` 整个文件夹复制到目标助手的技能目录，例如项目的 `.agents/skills/` 或 `.claude/skills/`。可同样复制 `vibe-knowledge-film/`。保留 `references/`、`scripts/`、`engine/` 和许可文件；已有同名技能时先比较，不直接覆盖自己的修改。不能原生发现技能的 AI，也可先读取该目录的 `SKILL.md`，再按需读取关联文件。

## 选择与调用

| 技能 | 用途 | 配套内容 |
|---|---|---|
| [knowledge-video](skills/knowledge-video/SKILL.md) | 科普、历史、机制讲解；有声或无旁白；选题、制作、返修、验收 | 文案与动作指南、声音检查、低内存工作方式、节拍/剪辑/检查图脚本 |
| [vibe-knowledge-film](skills/vibe-knowledge-film/SKILL.md) | 明确选择无旁白、字幕驱动的横屏知识短片 | Canvas 引擎、空工程生成器、确定性导出、事件音效、技术演示 |

在 Codex 中可以直接说：

> 使用 $knowledge-video，为普通成年人制作一条解释「为什么河流会弯曲」的视频。先给选题切入点和资料依据，再写文稿与分镜。沿用本项目的画幅和工具。

> 使用 $knowledge-video，检查这份文稿的解释是否跳步，并检查现有 MP4 的动作、停顿和字幕同步。先保留已确认原声。

> 使用 $vibe-knowledge-film，把这份已确认的分镜做成没有旁白的横屏短片，先完成能检验关键机制与切镜的连续样段。

其他助手使用自己的技能调用方式，或明确让它读取相应 `SKILL.md`。技能中的工具名称是能力需求；没有同名工具时用等效能力，无法观看或听音时保留对应验收缺口。

## 首次使用

1. 给 AI 受众、题目或原稿、预期观看收获、画幅、已有素材和当前授权范围。可参考[最小项目记录](skills/knowledge-video/references/project-brief.md)。
2. 先让文案和解释成立，再制作能代表主导风格与难点的样段，检查通过后扩展。
3. 交付时区分文件生成、技术检查、实际声画观看、用户接受和发布状态。

本项目不绑定某个账号、品牌、音色或付费服务。配音模型、图像服务、PixiJS、Three.js、Remotion 等按现有项目选择；它们不是安装技能的必需依赖。第三方 Remotion 技能继续从[原项目](https://github.com/remotion-dev/skills)按需安装，没有复制到这里。

## 可选脚本环境

纯文案、研究、分镜和审查无需安装 Python 依赖。实际运行脚本时，建议 Python 3.10+，按选用的技能创建环境：

```bash
python3 -m venv .venv
# Windows 使用 .venv\Scripts\python；以下示例为 macOS/Linux
.venv/bin/python -m pip install -r skills/knowledge-video/requirements.txt
```

音视频脚本还需要系统 PATH 中有 `ffmpeg`、`ffprobe`。用法、输入格式和局限见[工具说明](skills/knowledge-video/references/tools.md)。

无旁白引擎另需 Playwright、浏览器和字体：

```bash
.venv/bin/python -m pip install -r skills/vibe-knowledge-film/requirements.txt
.venv/bin/python -m playwright install chromium
.venv/bin/python skills/vibe-knowledge-film/engine/get_fonts.py
.venv/bin/python skills/vibe-knowledge-film/scripts/new_film.py ./my-film --world C
.venv/bin/python skills/vibe-knowledge-film/engine/render.py ./my-film --serve
```

这些下载仅在执行对应命令时发生。安装后的路径不同，请把 `skills/<名称>` 换成实际技能目录。新工程是空骨架；由 AI 按自己的分镜填入画面。只想检查环境，可先运行[技术演示](skills/vibe-knowledge-film/examples/smoke/README.md)。引擎提供事件音和氛围合成，**不包含 AI 歌曲或演唱模型**。

## 维护与验证

```bash
python3 -m unittest discover -s tests -v
# 已安装可选依赖及 ffmpeg 后，执行真实音视频辅助工具检查
python3 scripts/smoke_helpers.py
# 已装浏览器和字体后，执行 2 秒实际渲染、事件音与合片检查
python3 scripts/smoke_render.py
```

前两类检查不能代替成片的实际观看和听审。维护方法见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 来源与许可

本项目是在上游技能基础上，整合实际项目改进后的独立发行包，非上游官方版本。代码与方法文档使用 MIT，保留原作者声明，详见 [LICENSE](LICENSE) 和 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。本仓库不分发参考作品的视频、逐句复刻示例、私人参考人声、模型权重或账号资料；字体按需下载并保留 OFL 许可。
