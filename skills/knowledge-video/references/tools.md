# 辅助脚本

路径均相对于本技能目录。脚本是可选工具；缺少执行能力时仍可做研究、文稿和分镜，并说明未执行的检查。

| 脚本 | 输入 / 输出 | 依赖 |
|---|---|---|
| `scripts/beats.py` | 音频 → BPM、拍点、小节与强度 JSON | NumPy、ffmpeg |
| `scripts/music_loops.py` | 音频 + 拍点 JSON → 可重复/裁去的小节候选 | NumPy、ffmpeg |
| `scripts/cut_music.py` | 音频 + 同一拍点 JSON + 小节列表 → 剪辑 WAV | NumPy、ffmpeg |
| `scripts/timing.py` | Markdown 编号字幕表 + 拍点 JSON → `plan.json` | Python 标准库 |
| `scripts/sfx.py` | 显式下载音效，或 cue 表 → 音效 WAV | NumPy、ffmpeg；下载时联网 |
| `scripts/qa.py` | 成片 + `plan.json` → 信息与检查图 | ffmpeg、ffprobe；Pillow 可选 |

示例（在自己的项目目录执行，把路径换成实际技能位置）：

```bash
python /path/to/knowledge-video/scripts/beats.py music.wav --meter 4 --json beats.json
python /path/to/knowledge-video/scripts/timing.py subtitles.md beats.json -o plan.json
python /path/to/knowledge-video/scripts/qa.py final.mp4 plan.json -o review
```

`subtitles.md` 的输入形式：

```markdown
## 问题
| 1 | 同一段河道，为什么越来越弯？ |
| 2 | 先固定观察位置，再比较两侧的流动。 |
```

音效 cue 表：

```json
[{"t": 1.2, "file": "sfx/tick.wav", "peak": 0.2}]
```

音效文件路径相对于运行目录；时间单位为秒。将 cue 限于实际视频范围，下载素材前核对来源与授权。所有输出路径应指向本次工作副本。

节拍分析假设速度大致稳定，默认 4/4；换拍号使用 `--meter`。自由速度、弱节拍或静音不适合直接生成机械网格。小节相似度只给剪接候选，剪完要听接缝。`timing.py` 主要用于无旁白、以节拍组织字幕的片子；有旁白时应使用真实语音时码。检查图不证明动作自然或声音正确，仍需看实际连续视频。

旧参考中的 HyperFrames、特定素材包或历史渲染耗时都是可选案例；本包不安装这些工具，也不保证外部素材持续可用。选用某个库或 CLI 时核对它的当前官方文档。
