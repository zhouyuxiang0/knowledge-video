# 来源与许可

## knowledge-video

- 原项目：[Win-Hao/knowledge-video](https://github.com/Win-Hao/knowledge-video)。
- 本地安装记录将来源标识为该仓库的 `skills/knowledge-video/SKILL.md`。本发行包从后续已维护的技能源包整理，并非声称与某个上游提交完全一致。
- 原许可：MIT，`Copyright (c) 2026 Win-Hao`。原文保存在 [skills/knowledge-video/LICENSE](skills/knowledge-video/LICENSE)。
- 本地演进主要包括：题目初筛与独立文案检查、人物结构和连续动作、原速验收、读音与语义停顿、输入版本绑定、已确认音频保护、低内存处理方法和复盘规则。

## vibe-knowledge-film

- 安装记录中的原地址：`Dave-cc/vibe-knowledge-film`；整理时 GitHub 将它解析到 [HeyChengC/vibe-knowledge-film](https://github.com/HeyChengC/vibe-knowledge-film)。
- 可复用引擎与脚本来自本地保留版本，采用 MIT；原许可保存在 [skills/vibe-knowledge-film/LICENSE](skills/vibe-knowledge-film/LICENSE)。
- 上游明确排除了部分参考片内容的再发布许可。本包没有复制 `analysis.md`、已填好的复刻提示、逐句参考片拆解、`stim_B` / `info_C` 及参考图/GIF。入口与视觉设计指南改为通用方法，示例是本包自建的技术冒烟演示。
- 发布整理还修正了浏览器可移植性、生成器覆盖检查、预览目录边界、渲染失败退出及确定性检查退出状态。

## 字体、媒体与其他工具

`engine/get_fonts.py` 从 Google Fonts 获取 Noto Serif SC、Noto Sans SC、Cormorant Garamond、Lora、JetBrains Mono、Courier Prime。字体不随仓库分发；各字体的 SIL Open Font License 文件保存在 `engine/fonts/`，下载时一并核对。

脚本可按用户指令下载 Kenney 音效；音效文件不随包分发，使用时保留来源与对应许可。文档中的外部作品、图片、录音和服务只是参考入口，MIT 不授予它们的使用权。第三方引擎、Python 包及浏览器继续适用各自许可。
