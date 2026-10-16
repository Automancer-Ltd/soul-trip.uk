"""Unit tests for scripts/verify_repo_meta.py."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from verify_repo_meta import (  # noqa: E402
    run_meta_verification,
    verify_deploy_json,
    verify_gitleaks_toml,
    verify_release_notes_json,
    verify_site_manifest_structure,
)


class VerifyRepoMetaTests(unittest.TestCase):
    def test_live_repository_passes(self) -> None:
        report = run_meta_verification(REPO_ROOT)
        self.assertTrue(report.ok, f"Unexpected findings: {report.findings}")
        self.assertGreater(report.manifest_entries, 50)

    def test_deploy_json_rejects_bad_kind_and_json_path(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "deploy.json").write_text(
                json.dumps({"kind": "none", "url": "https://example.com", "json_path": ".sha"}),
                encoding="utf-8",
            )
            findings = verify_deploy_json(root)
            self.assertEqual(len(findings), 3)

    def test_release_notes_requires_push_trigger(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / ".release-notes.json").write_text(
                json.dumps({"deployTrigger": "ref"}),
                encoding="utf-8",
            )
            findings = verify_release_notes_json(root)
            self.assertEqual(len(findings), 1)

    def test_gitleaks_rejects_disabled_default_rules(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / ".gitleaks.toml").write_text(
                'title = "bad"\n[extend]\nuseDefault = false\n[allowlist]\ndescription = "x"\n',
                encoding="utf-8",
            )
            findings = verify_gitleaks_toml(root)
            self.assertEqual(len(findings), 2)

    def test_manifest_rejects_excluded_and_hidden_paths(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "site-manifest.json").write_text(
                json.dumps(
                    {
                        "algorithm": "sha256",
                        "files": {
                            "index.html": "abc",
                            "CHANGELOG.md": "def",
                            ".github/RELEASING.md": "123",
                        },
                    }
                ),
                encoding="utf-8",
            )
            findings, count = verify_site_manifest_structure(root)
            self.assertEqual(count, 3)
            self.assertEqual(len(findings), 2)


if __name__ == "__main__":
    unittest.main()
