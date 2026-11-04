import importlib.util
import io
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / 'skills/vibe-knowledge-film'
spec = importlib.util.spec_from_file_location('video_render', SKILL / 'engine/render.py')
render = importlib.util.module_from_spec(spec)
spec.loader.exec_module(render)


class EngineTests(unittest.TestCase):
    def test_generator_preserves_existing_index(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)
            (path / 'index.html').write_text('keep me')
            result = subprocess.run([sys.executable, str(SKILL / 'scripts/new_film.py'), folder], capture_output=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual((path / 'index.html').read_text(), 'keep me')
            self.assertFalse((path / 'film.js').exists())

    def test_generator_creates_both_worlds(self):
        with tempfile.TemporaryDirectory() as folder:
            for world in ('B', 'C'):
                path = Path(folder) / world
                subprocess.run([sys.executable, str(SKILL / 'scripts/new_film.py'), str(path), '--world', world], check=True, capture_output=True)
                self.assertTrue((path / 'index.html').is_file())
                self.assertIn('VK.film(', (path / 'film.js').read_text())

    def test_preview_rejects_directory_escape(self):
        with tempfile.TemporaryDirectory() as folder:
            handler = object.__new__(render.Handler)
            handler.proj = Path(folder)
            self.assertEqual(handler.translate_path('/?play'), str(Path(folder).resolve() / 'index.html'))
            self.assertEqual(handler.translate_path('/engine/vk.js'), str(SKILL / 'engine/vk.js'))
            for request in ('/../private.txt', '/%2e%2e/private.txt', '/engine/../private.txt', '/engine/%2e%2e/private.txt'):
                with self.subTest(request=request), self.assertRaises(PermissionError):
                    handler.translate_path(request)
            (Path(folder) / 'outside').symlink_to(Path(folder).parent, target_is_directory=True)
            with self.assertRaises(PermissionError):
                handler.translate_path('/outside/private.txt')

    def test_failed_encoder_preserves_previous_video(self):
        with tempfile.TemporaryDirectory() as folder:
            out = Path(folder) / 'raw.mp4'
            out.write_bytes(b'previous valid output')
            page = Mock()
            page.evaluate.side_effect = lambda expression: {'END': 1, 'FPS': 1}[expression]
            encoder = Mock(stdin=io.BytesIO(), args=['ffmpeg'])
            encoder.wait.return_value = 7
            encoder.poll.return_value = 7
            with patch.object(render, 'with_page', side_effect=lambda proj, fn: fn(page)), patch.object(render, 'shot', return_value=b'image'), patch.object(render.subprocess, 'Popen', return_value=encoder):
                with self.assertRaises(subprocess.CalledProcessError):
                    render.frames(Path(folder), out)
            self.assertEqual(out.read_bytes(), b'previous valid output')
            self.assertEqual(list(Path(folder).iterdir()), [out])

    def test_determinism_failure_is_an_error(self):
        page = Mock()
        page.evaluate.return_value = 2
        with patch.object(render, 'with_page', side_effect=lambda proj, fn: fn(page)), patch.object(render, 'shot', side_effect=[b'a', b'b']):
            with self.assertRaises(RuntimeError):
                render.det(Path('.'), n=1)

    def test_parallel_waits_for_all_children_on_failure(self):
        children = [Mock(), Mock()]
        children[0].wait.return_value = 1
        children[1].wait.return_value = 0
        with patch.object(render, 'with_page', return_value=(2, 30)), patch.object(render.subprocess, 'Popen', side_effect=children):
            with self.assertRaises(SystemExit):
                render.frames_parallel(Path('.'), Path('raw.mp4'), 2)
        for child in children:
            child.wait.assert_called_once()


if __name__ == '__main__':
    unittest.main()
