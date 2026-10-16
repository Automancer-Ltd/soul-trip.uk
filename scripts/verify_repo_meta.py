#!/usr/bin/env python3
"""Strict-typed metadata and manifest invariant verifier for soul-trip.uk."""

from __future__ import annotations

import json
import sys
import tomllib
from dataclasses import dataclass, field
from pathlib import Path

FINGERPRINT_EXCLUDED_FILES: tuple[str, ...] = ("CHANGELOG.md", "VISION.md")


@dataclass(frozen=True)
class MetaFinding:
    check_id: str
    path: str
    message: str


@dataclass
class MetaVerificationReport:
    findings: list[MetaFinding] = field(default_factory=list)
    manifest_entries: int = 0

    @property
    def ok(self) -> bool:
        return len(self.findings) == 0


def verify_deploy_json(repo_root: Path) -> list[MetaFinding]:
    findings: list[MetaFinding] = []
    p = repo_root / "deploy.json"
    if not p.is_file():
        findings.append(MetaFinding("deploy-json", "deploy.json", "deploy.json is missing"))
        return findings
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        findings.append(MetaFinding("deploy-json", "deploy.json", f"invalid JSON: {exc}"))
        return findings

    if not isinstance(data, dict):
        findings.append(MetaFinding("deploy-json", "deploy.json", "root must be a JSON object"))
        return findings

    if data.get("kind") != "auto":
        findings.append(
            MetaFinding("deploy-json", "deploy.json", 'expected "kind": "auto" for GitHub Pages workflow deploy')
        )
    url = data.get("url")
    if not isinstance(url, str) or "Automancer-Ltd/soul-trip.uk/deployments" not in url:
        findings.append(
            MetaFinding(
                "deploy-json",
                "deploy.json",
                "url must point to Automancer-Ltd/soul-trip.uk/deployments?environment=github-pages&per_page=1",
            )
        )
    if data.get("json_path") != "0.sha":
        findings.append(
            MetaFinding("deploy-json", "deploy.json", 'expected "json_path": "0.sha"')
        )
    return findings


def verify_release_notes_json(repo_root: Path) -> list[MetaFinding]:
    findings: list[MetaFinding] = []
    p = repo_root / ".release-notes.json"
    if not p.is_file():
        findings.append(
            MetaFinding("release-notes", ".release-notes.json", ".release-notes.json is missing")
        )
        return findings
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        findings.append(
            MetaFinding("release-notes", ".release-notes.json", f"invalid JSON: {exc}")
        )
        return findings

    if not isinstance(data, dict) or data.get("deployTrigger") != "push":
        findings.append(
            MetaFinding(
                "release-notes",
                ".release-notes.json",
                'expected "deployTrigger": "push" so the hourly release-notes catchup lane tracks main pushes',
            )
        )
    return findings


def verify_gitleaks_toml(repo_root: Path) -> list[MetaFinding]:
    findings: list[MetaFinding] = []
    p = repo_root / ".gitleaks.toml"
    if not p.is_file():
        findings.append(MetaFinding("gitleaks", ".gitleaks.toml", ".gitleaks.toml is missing"))
        return findings
    try:
        data = tomllib.loads(p.read_text(encoding="utf-8"))
    except tomllib.TOMLDecodeError as exc:
        findings.append(MetaFinding("gitleaks", ".gitleaks.toml", f"invalid TOML: {exc}"))
        return findings

    extend = data.get("extend")
    if not isinstance(extend, dict) or extend.get("useDefault") is not True:
        findings.append(
            MetaFinding(
                "gitleaks",
                ".gitleaks.toml",
                "[extend].useDefault must be true so built-in rules remain active",
            )
        )
    if "allowlist" in data:
        findings.append(
            MetaFinding(
                "gitleaks",
                ".gitleaks.toml",
                "deprecated singular [allowlist] found; use plural [[allowlists]]",
            )
        )
    return findings


def verify_site_manifest_structure(repo_root: Path) -> tuple[list[MetaFinding], int]:
    findings: list[MetaFinding] = []
    p = repo_root / "site-manifest.json"
    if not p.is_file():
        findings.append(MetaFinding("manifest", "site-manifest.json", "site-manifest.json is missing"))
        return findings, 0
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        findings.append(MetaFinding("manifest", "site-manifest.json", f"invalid JSON: {exc}"))
        return findings, 0

    if not isinstance(data, dict) or data.get("algorithm") != "sha256":
        findings.append(
            MetaFinding("manifest", "site-manifest.json", 'expected "algorithm": "sha256"')
        )
        return findings, 0

    files = data.get("files")
    if not isinstance(files, dict) or len(files) == 0:
        findings.append(
            MetaFinding("manifest", "site-manifest.json", '"files" must be a non-empty object')
        )
        return findings, 0

    for excluded in FINGERPRINT_EXCLUDED_FILES:
        if excluded in files:
            findings.append(
                MetaFinding(
                    "manifest",
                    "site-manifest.json",
                    f"fingerprint-excluded file '{excluded}' must not appear in site-manifest.json",
                )
            )

    for rel_key in files:
        if any(seg.startswith(".") or seg.startswith("_") for seg in str(rel_key).split("/")):
            findings.append(
                MetaFinding(
                    "manifest",
                    "site-manifest.json",
                    f"non-served path '{rel_key}' must not appear in site-manifest.json",
                )
            )
    return findings, len(files)


def run_meta_verification(repo_root: Path) -> MetaVerificationReport:
    report = MetaVerificationReport()
    report.findings.extend(verify_deploy_json(repo_root))
    report.findings.extend(verify_release_notes_json(repo_root))
    report.findings.extend(verify_gitleaks_toml(repo_root))
    mf_findings, mf_count = verify_site_manifest_structure(repo_root)
    report.findings.extend(mf_findings)
    report.manifest_entries = mf_count
    return report


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    report = run_meta_verification(repo_root)
    if not report.ok:
        for f in report.findings:
            print(f"ERROR [{f.check_id}] {f.path}: {f.message}", file=sys.stderr)
        return 1
    print(f"verify_repo_meta: PASS ({report.manifest_entries} manifest entries, 0 findings)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
