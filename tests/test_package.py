import ast
import re
import unittest
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class PackageTests(unittest.TestCase):
    def test_skills_are_discoverable_and_self_contained(self):
        entries = sorted((ROOT / 'skills').glob('*/SKILL.md'))
        self.assertEqual([entry.parent.name for entry in entries], ['knowledge-video'])
        for entry in entries:
            text = entry.read_text(encoding='utf-8')
            header = text.split('---', 2)[1]
            self.assertRegex(header, rf'(?m)^name: {re.escape(entry.parent.name)}$')
            self.assertRegex(header, r'(?m)^description: .+')
            self.assertTrue((entry.parent / 'LICENSE').is_file())
            for doc in entry.parent.rglob('*.md'):
                if 'node_modules' in doc.parts:
                    continue
                for link in re.findall(r'\]\(([^)]+)\)', doc.read_text(encoding='utf-8')):
                    url = urlsplit(link)
                    if url.scheme or not url.path:
                        continue
                    target = (doc.parent / unquote(url.path)).resolve()
                    self.assertTrue(target.is_relative_to(entry.parent), f'{doc}: external dependency {link}')
                    self.assertTrue(target.exists(), f'{doc}: missing {link}')

    def test_repository_links(self):
        for doc in ROOT.glob('*.md'):
            for link in re.findall(r'\]\(([^)]+)\)', doc.read_text(encoding='utf-8')):
                url = urlsplit(link)
                if not url.scheme and url.path:
                    self.assertTrue((doc.parent / unquote(url.path)).exists(), f'{doc}: missing {link}')

    def test_python_syntax_and_no_machine_paths(self):
        for path in (ROOT / 'skills').rglob('*'):
            if not path.is_file() or path.suffix not in {'.py', '.js', '.mjs', '.md', '.html', '.txt'} or 'node_modules' in path.parts:
                continue
            text = path.read_text(encoding='utf-8')
            if path.suffix == '.py':
                ast.parse(text, filename=str(path))
            self.assertNotRegex(text, r'/Users/[^/\s]+/|/home/[^/\s]+/|[A-Z]:\\Users\\')


if __name__ == '__main__':
    unittest.main()
