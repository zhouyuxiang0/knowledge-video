# 必要辅助脚本

脚本来自当前制作项目的共享实现。路径相对于本技能；安装位置变化时使用实际路径。它们是导出和校验模块，不是自动制作整片的命令。

| 模块 | 用途 | 依赖 |
|---|---|---|
| [capture.mjs](../scripts/capture.mjs) | `renderFrames` 逐帧抓图并流入 FFmpeg；`grabStill` 抓静帧 | Node.js、playwright-core、Chrome；视频另需 FFmpeg |
| [server.mjs](../scripts/server.mjs) | `serve(root)` 提供只读本机静态服务 | Node.js 标准库 |
| [motion-review.mjs](../scripts/motion-review.mjs) | `requireMotionReview` 检查动作审查记录与输入/样片摘要是否一致 | Node.js 标准库 |

在本技能目录执行 `npm install` 安装固定版本的 `playwright-core`。浏览器使用已安装的 Chrome；不自动下载浏览器。项目自行准备 PixiJS、页面、字体、素材与混音。服务仅监听 `127.0.0.1`，根目录应只包含可供该页面读取的制作文件。

## 页面导出协议

资源加载完成后设置 `window.__ready = true`，初始化失败则设置 `window.__error`。页面提供：

```js
window.__render = {
  total: 60, // 秒，必须与导出参数一致
  seek(t) {
    // 从绝对时间重建全部状态，并完成这一帧渲染。
    // 异步渲染必须返回可等待的 Promise。
  },
};
```

PixiJS 场景的 `seek` 更新场景状态后主动渲染，不能依赖实时 ticker 恰好运行。固定种子；资源或字体未就绪时不抓帧；乱序 seek 后比较同一时刻。

项目中的接入方式（把导入改为实际技能路径）：

```js
import {serve} from './skill/scripts/server.mjs';
import {renderFrames} from './skill/scripts/capture.mjs';

const srv = await serve('/path/to/film');
try {
  await renderFrames({
    url: `${srv.origin}/index.html`, total: 60, fps: 30,
    width: 1920, height: 1080,
    audio: '/path/to/film/audio/master.wav',
    out: '/path/to/film/out/take-002.partial.mp4',
  });
} finally {
  srv.close();
}
```

画幅、时长与帧率按本片传入。输出目录应提前创建，输出文件必须尚不存在；失败文件保留供排查，重试换新路径。音轨需在调用前按时间轴准备到目标时长；默认软件 H.264，`fast: true` 仅供已验证的 macOS VideoToolbox 环境。抓静帧调用 `grabStill({url, t, out, width, height})`，同样使用新路径。

完成后用 `ffprobe` 核对时长、帧数和流，用 `ffmpeg -v error -xerror -i take-002.partial.mp4 -f null -` 检查完整解码，再执行[冻结与成片验收](production.md#冻结导出与验收)。底层模块不替项目做原声绑定、混音、动作审看或交付版提升。

## 动作记录校验

含人物动作并准备扩展整片时使用 `requireMotionReview(review, inputs, artifactHash)`。`inputs` 是本片相关文件到 SHA-256 的映射；`artifactHash(path)` 读取本期目录内实际样片并返回其 SHA-256。

`review` 包含 `status: 'passed_for_render'`、相同的 `inputs`、`artifacts: [{path, sha256}]`，以及 `checks` 中的 `anatomy`、`handedness`、`action_mechanics`、`contact_support`、`occlusion`、`continuity`、`naturalness`。每项必须有 `pass: true` 与实际 `evidence`；自然度还须有 `method: 'real_time_playback'` 和对应 MP4 的 `artifact_path`。材料路径相对于本期目录。

只在真实审看后填写结论。脚本拒绝缺项、过期输入和已替换样片，但不会判断所填文字是否真实，也不能代替人的观看。
