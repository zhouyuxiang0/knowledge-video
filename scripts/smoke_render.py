"""Render and mux the two-second fixture in a temporary project; downloads nothing."""
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / 'skills/vibe-knowledge-film'


def main():
    subprocess.run([sys.executable, str(SKILL / 'engine/get_fonts.py'), '--check'], check=True)
    with tempfile.TemporaryDirectory(prefix='knowledge-video-render-') as folder:
        project = Path(folder) / 'film'
        shutil.copytree(SKILL / 'examples/smoke', project)
        for args in (['--det'], [], ['--events']):
            subprocess.run([sys.executable, str(SKILL / 'engine/render.py'), str(project), *args], check=True)
        subprocess.run([sys.executable, str(SKILL / 'engine/audio.py'), str(project)], check=True)
        final = project / 'renders/final.mp4'
        result = subprocess.run(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(final)], check=True, capture_output=True, text=True)
        probe = json.loads(result.stdout)
        assert abs(float(probe['format']['duration']) - 2) < 0.1
        assert {s['codec_type'] for s in probe['streams']} == {'audio', 'video'}
        video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
        assert (video['width'], video['height'], video['r_frame_rate']) == (1920, 1080, '30/1')
        subprocess.run(['ffmpeg', '-v', 'error', '-i', str(final), '-f', 'null', '-'], check=True)
        digest = hashlib.sha256(final.read_bytes()).digest()
        (project / 'renders/raw.mp4').write_bytes(b'invalid video fixture')
        failed = subprocess.run([sys.executable, str(SKILL / 'engine/audio.py'), str(project)], capture_output=True)
        assert failed.returncode != 0
        assert hashlib.sha256(final.read_bytes()).digest() == digest
        print('PASS: deterministic frames, 1080p/30fps export, event audio, MP4 decode and failed-mux recovery')


if __name__ == '__main__':
    main()
