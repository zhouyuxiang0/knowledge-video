# HyperFrames pitfalls

Check here first when a render fails, the picture is off, something vanishes or the sound is wrong. All hit in a tested video (2025-10).

- **Two tweens on the same element and property must not overlap in time** (e.g. a push-in still running when the reset starts): a snapshot jumps to one moment and looks fine, but a render plays forward and the earlier tween wins. End one before the next begins; keep separate properties apart (parallax on x, bobbing on y)
- **Later `fromTo`s get `immediateRender: false`**: only the first on a property should apply immediately, or a later state (camera moves especially) shows from the start
- **ids unique across the page**: a duplicate silently sends an animation to the wrong element (a parallax layer and a note both named `s10-l1` left that layer, and its image, never moving into view). Scan the built page for duplicates
- `data-start` on an `<svg>` is ignored; put timing on a wrapping `<div>`
- Animating `clip-path: inset(...)` with GSAP can make the element vanish; animate the width of an `overflow: hidden` wrapper, or `scaleX`
- When splitting text into per-character spans at runtime (typewriter, letter pops), styles written for `.head span` hit every character; scope container styles as `.head > span`
- Douyin Sans' GSUB table can't be subset; add `--drop-tables+=GSUB,GPOS`
- Deliberate overlaps trip check's layout audit; when intended, add `data-layout-allow-overlap` / `-occlusion` / `-overflow`
- Audio peaks failing the last step, failed renders hidden by a pipe: see `sound.md`
- Detailed pictures render large at `--quality delivery` (about 870 MB for 3.5 minutes); re-encode with `-c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart` (about 400 MB, no visible difference)
- Render time on an Apple-silicon Mac: 13-second opening about 35 s; 3.5 minutes 4.5 min (plain) to 8 min (dense collage)

## Canvas animation (10-06, *Fish and Bear's Paw*)

- One full-screen `<canvas>`, every dot and line drawn by `draw(t)`; a proxy tween from 0 to the full duration on the main timeline calls `draw(proxy.t)` in `onUpdate`, so every rendered frame is right. Seed the PRNG
- Labels that move with the camera are drawn on the canvas (`fillText`); text that stays put on screen (captions, readouts) is DOM. Hide on-screen readouts while the camera rotates, or they sit on top of the turned picture
- Keep the template in `src/`, not the project root: a second HTML with `data-composition-id` in the root fails lint with `multiple_root_compositions`
- If `pyftsubset` isn't on PATH, use `python3 -m fontTools.subset`
- Typewriter text: a centered line revealed by hidden spans sits off to the left at frame 0; show the first line whole at frame 0 and type the second
- Film grain that changes every frame bloats the render (1.8 GB for 3 minutes, still 900 MB re-encoded); one static grain tile brings the re-encoded file to about 135 MB

## Three.js 机制演示

- 多视角共用同一组物体、世界光照与时间，仅切换相机；不要独立画一个看似同步的结果窗口。分别匹配每个 viewport 的相机宽高比，用球体检查是否被拉成椭圆。
- 自转、公转与观察方向分别核对坐标系和正负方向。需要保持朝向关系时写小断言，并实际看运动中段；起点和终点正确不能证明过程正确。
- 用绝对时间重建每帧状态，资源与字体加载完成后再抓帧；乱序跳转后比较画面。光照和几何示意不等于物理仿真，不按比例或省略的效应须在影响理解处说明。
- 旁白段落之间有安静空隙时，保持最近已开始的镜头，不能在区间查询未命中时跳到末镜。检查每个切点前后、开头留白和片尾留白，而不只检查各段中间。
- 需要持续追踪同一主体时，让它独占关键识别线索；沿相机移动过程和切前末帧检查整个主体轮廓、遮挡和字幕安全区，不能只查中心点或几个均匀时刻。局部跟拍与世界远景分别插值时，尤其检查中段漂移。
- 随物体或状态移动的方向标记会相遇；检查相遇时刻的标签避让和绘制层次，先画箭头、后画文字底板，避免箭头穿过另一标签的文字。最终编码抽帧发现的问题，要回到全部调用镜头复核。
