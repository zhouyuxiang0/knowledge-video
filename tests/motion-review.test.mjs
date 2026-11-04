import test from 'node:test';
import assert from 'node:assert/strict';
import {requireMotionReview} from '../skills/knowledge-video/scripts/motion-review.mjs';

test('motion review rejects pending, failed, stale and replaced evidence', () => {
  const hash = 'a'.repeat(64), inputs = {actor: hash};
  const valid = {status: 'passed_for_render', inputs, artifacts: [{path: 'out/actions.mp4', sha256: hash}],
    checks: Object.fromEntries(['anatomy', 'handedness', 'action_mechanics', 'contact_support', 'occlusion', 'continuity', 'naturalness'].map(key => [key, {pass: true, evidence: 'Reviewed actual action sequence.'}]))};
  Object.assign(valid.checks.naturalness, {method: 'real_time_playback', artifact_path: 'out/actions.mp4'});
  assert.equal(requireMotionReview(valid, inputs, () => hash), true);
  assert.throws(() => requireMotionReview({...valid, status: 'pending'}, inputs, () => hash));
  assert.throws(() => requireMotionReview({...valid, checks: {...valid.checks, anatomy: {pass: false, evidence: 'Elbow folds.'}}}, inputs, () => hash));
  const {action_mechanics, ...contourOnly} = valid.checks;
  assert.throws(() => requireMotionReview({...valid, checks: contourOnly}, inputs, () => hash), /action_mechanics/);
  assert.throws(() => requireMotionReview({...valid, checks: {...valid.checks, action_mechanics: {pass: false, evidence: 'Fan turns without a corresponding grip or wrist turn.'}}}, inputs, () => hash), /action_mechanics/);
  for (const key of ['handedness', 'naturalness']) {
    const checks = {...valid.checks}; delete checks[key];
    assert.throws(() => requireMotionReview({...valid, checks}, inputs, () => hash), new RegExp(key));
    assert.throws(() => requireMotionReview({...valid, checks: {...valid.checks, [key]: {pass: false, evidence: 'Not established.'}}}, inputs, () => hash), new RegExp(key));
  }
  assert.throws(() => requireMotionReview({...valid, checks: {...valid.checks, naturalness: {...valid.checks.naturalness, method: 'dense_frames'}}}, inputs, () => hash), /原速/);
  assert.throws(() => requireMotionReview({...valid, checks: {...valid.checks, naturalness: {...valid.checks.naturalness, artifact_path: 'out/unreviewed.mp4'}}}, inputs, () => hash), /未绑定/);
  assert.throws(() => requireMotionReview(valid, {actor: 'b'.repeat(64)}, () => hash));
  assert.throws(() => requireMotionReview(valid, inputs, () => 'b'.repeat(64)));
  assert.throws(() => requireMotionReview({...valid, artifacts: [{path: '../other.mp4', sha256: hash}]}, inputs, () => hash));
});
