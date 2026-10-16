#!/usr/bin/env python3
"""Functional verification harness for soul-trip.uk."""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from verify_repo_meta import (  # noqa: E402
    run_meta_verification,
    verify_deploy_json,
    verify_gitleaks_toml,
)


def run_cmd(args: list[str]) -> tuple[int, str]:
    res = subprocess.run(
        args,
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        check=False,
        timeout=60,
    )
    out = (res.stdout + "\n" + res.stderr).strip()
    return res.returncode, out


def main() -> int:
    checks: list[dict[str, object]] = []

    def record(name: str, passed: bool, detail: str) -> None:
        checks.append({"name": name, "passed": passed, "detail": detail})
        if not passed:
            print(f"FAIL: {name}: {detail}", file=sys.stderr)

    # 1. Repo metadata verification
    meta_report = run_meta_verification(REPO_ROOT)
    record(
        "repo_meta_valid",
        meta_report.ok and meta_report.manifest_entries >= 80,
        f"manifest_entries={meta_report.manifest_entries}, findings={len(meta_report.findings)}",
    )

    # 2. Manifest canonical check
    rc_man, out_man = run_cmd(["node", "scripts/check-manifest.mjs"])
    record(
        "manifest_canonical_green",
        rc_man == 0 and "matches the working tree exactly" in out_man,
        out_man.splitlines()[-1] if out_man else f"rc={rc_man}",
    )

    # 3. Static site contract C1-C8
    rc_site, out_site = run_cmd(["node", "scripts/check-site.mjs"])
    record(
        "site_contract_c1_c8_green",
        rc_site == 0 and "all site-contract checks passed" in out_site,
        out_site.splitlines()[-1] if out_site else f"rc={rc_site}",
    )

    # 4. Sentry SRI and privacy check
    rc_sentry, out_sentry = run_cmd(["node", "scripts/check-sentry-integration.mjs", "--expect-active"])
    record(
        "sentry_sri_and_privacy_green",
        rc_sentry == 0,
        out_sentry.splitlines()[-1] if out_sentry else f"rc={rc_sentry}",
    )

    # 5. Production verifier self-proof
    rc_prod, out_prod = run_cmd(["node", "scripts/verify-production.mjs", "--prove-verification"])
    record(
        "production_verifier_self_proof",
        rc_prod == 0,
        out_prod.splitlines()[-1] if out_prod else f"rc={rc_prod}",
    )

    # 6. Synthetic metadata fault detection in temp directory
    with tempfile.TemporaryDirectory() as tmp:
        tmp_root = Path(tmp)
        (tmp_root / "deploy.json").write_text(
            json.dumps({"kind": "none", "url": "https://bad.example", "json_path": ".bad"}),
            encoding="utf-8",
        )
        (tmp_root / ".gitleaks.toml").write_text(
            'title = "bad"\n[extend]\nuseDefault = false\n[allowlist]\ndescription = "bad"\n',
            encoding="utf-8",
        )
        dp_findings = verify_deploy_json(tmp_root)
        gl_findings = verify_gitleaks_toml(tmp_root)
        record(
            "synthetic_meta_fault_detected",
            len(dp_findings) == 3 and len(gl_findings) == 2,
            f"deploy_findings={len(dp_findings)}, gitleaks_findings={len(gl_findings)}",
        )

    all_passed = all(bool(c["passed"]) for c in checks)
    artifact_dir = REPO_ROOT / ".audit" / "verify-soul-trip-uk"
    artifact_dir.mkdir(parents=True, exist_ok=True)
    artifact_path = artifact_dir / "latest.json"
    payload = {
        "skill": "verify-soul-trip-uk",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "passed": all_passed,
        "total_checks": len(checks),
        "passed_checks": sum(1 for c in checks if c["passed"]),
        "checks": checks,
    }
    artifact_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(
        f"verify-soul-trip-uk: {'PASS' if all_passed else 'FAIL'} "
        f"({payload['passed_checks']}/{payload['total_checks']} checks)"
    )
    return 0 if all_passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
