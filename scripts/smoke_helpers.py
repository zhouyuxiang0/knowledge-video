"""Exercise shipped audio helpers with synthetic inputs; no downloads or model calls."""
import json
import math
import struct
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HELPERS = ROOT / 'skills/knowledge-video/scripts'


def main():
    with tempfile.TemporaryDirectory(prefix='knowledge-video-helpers-') as folder:
        work = Path(folder)
        audio = work / 'beat.wav'
        with wave.open(str(audio), 'wb') as out:
            out.setparams((1, 2, 22050, 0, 'NONE', 'not compressed'))
            samples = []
            for i in range(22050 * 12):
                t = i / 22050
                phase = t % 0.5
                samples.append(struct.pack('<h', int(16000 * math.exp(-phase * 60) * math.sin(2 * math.pi * 150 * t))))
            out.writeframes(b''.join(samples))

        def run(script, *args):
            return subprocess.run([sys.executable, str(HELPERS / script), *map(str, args)], cwd=work, capture_output=True, text=True, check=True)

        run('beats.py', audio, '--json', 'beats.json')
        beats = json.loads((work / 'beats.json').read_text())
        assert abs(beats['bpm'] - 120) < 5, beats['bpm']
        assert beats['beats'] == sorted(beats['beats'])
        # Exact fixture isolates downstream grid behavior from beat-estimation error.
        grid = {'duration': 12, 'meter': 4, 'beat_seconds': 0.5, 'first_downbeat': 0,
                'bars': [{'bar': i + 1, 'start': i * 2} for i in range(6)]}
        (work / 'grid.json').write_text(json.dumps(grid))
        (work / 'copy.md').write_text('## One\n| 1 | First test |\n| 2 | Second test |\n', encoding='utf-8')
        run('timing.py', 'copy.md', 'grid.json', '-o', 'plan.json')
        plan = json.loads((work / 'plan.json').read_text())
        assert plan['screens'][0]['t'] == 0
        assert all(s['dur'] > 0 for s in plan['screens'])
        assert plan['screens'][1]['t'] == plan['screens'][0]['dur']
        run('music_loops.py', audio, 'grid.json', '--len', '2')
        run('cut_music.py', audio, 'grid.json', '--bars', '2-3', '4-5', '-o', 'edit.wav')
        with wave.open(str(work / 'edit.wav')) as output:
            assert output.getnframes() == 8 * 48000
        (work / 'cues.json').write_text(json.dumps([{'t': 0, 'file': str(audio), 'peak': 0.2}]))
        run('sfx.py', 'mix', 'cues.json', '--length', '2', '-o', 'sfx.wav')
        with wave.open(str(work / 'sfx.wav')) as output:
            assert output.getnframes() == 2 * 48000
        video = work / 'test.mp4'
        subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=green:s=320x180:r=30', '-t', str(plan['duration']), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', str(video)], check=True)
        run('qa.py', video, 'plan.json', '-o', 'review')
        assert (work / 'review/sheet-1.jpg').stat().st_size > 0
        print('PASS: beat analysis, timeline, music loops/cut, SFX mix and video contact sheet')


if __name__ == '__main__':
    main()
