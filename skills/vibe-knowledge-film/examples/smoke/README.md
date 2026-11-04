# 两秒技术演示

这只是环境检查：色块按绝对时间移动，显示一行文字，并触发一个事件音。它不是完成的科普样片，也不证明中文阅读、美术质量或声音听感通过。

安装本技能依赖、Playwright Chromium、ffmpeg 和字体后，在技能目录运行：

```bash
python engine/render.py examples/smoke --det
python engine/render.py examples/smoke
python engine/render.py examples/smoke --events
python engine/audio.py examples/smoke
```

最终文件为 `examples/smoke/renders/final.mp4`。仓库根目录的 `scripts/smoke_render.py` 会复制示例到临时目录再验证，避免给已安装技能写入测试产物。
