import assert from 'node:assert/strict';

// This gate binds recorded visual judgments to their reviewed inputs; it cannot make those judgments.
export function requireMotionReview(review, inputs, artifactHash) {
  assert.equal(review.status, 'passed_for_render', '人物动作未放行：先完成真实动作样片复核');
  assert.deepEqual(review.inputs, inputs, '人物动作审查已过期：相关输入发生变化');
  for (const key of ['anatomy', 'handedness', 'action_mechanics', 'contact_support', 'occlusion', 'continuity', 'naturalness']) {
    const item = review.checks?.[key];
    assert(item?.pass === true && typeof item.evidence === 'string' && item.evidence.trim(), `人物动作缺少有效审查：${key}`);
  }
  assert(Array.isArray(review.artifacts) && review.artifacts.length, '缺少实际审查样片');
  assert(review.artifacts.some(item => item.path?.endsWith('.mp4')), '缺少实际编码的动作样片');
  assert.equal(review.checks.naturalness.method, 'real_time_playback', '自然度须有实际原速观看证据，抽帧不能替代');
  assert(review.artifacts.some(item => item.path === review.checks.naturalness.artifact_path && item.path.endsWith('.mp4')), '原速审看的视频未绑定到审查材料');
  for (const item of review.artifacts) {
    assert(typeof item.path === 'string' && !item.path.startsWith('/') && !item.path.split('/').includes('..'), '审查材料必须位于本期目录');
    assert(/^[a-f0-9]{64}$/.test(item.sha256) && artifactHash(item.path) === item.sha256, '人物动作审查材料已变化');
  }
  return true;
}
