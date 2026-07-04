from __future__ import annotations

import fnmatch
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
OUTPUT = DIST / "nyx-os.zip"

EXCLUDED_DIRS = {
    ".git",
    ".next",
    ".swc",
    ".venv",
    "build",
    "dist",
    "Fundamentos",
    "node_modules",
    "coverage",
}
EXCLUDED_PATTERNS = (
    ".env",
    ".env.local",
    ".env.*.local",
    "*.log",
    "public/sw.js",
    "public/workbox-*.js",
    "public/worker-*.js",
    "public/fallback-*.js",
)


def should_exclude(path: Path) -> bool:
    relative = path.relative_to(ROOT)
    parts = set(relative.parts)

    if parts & EXCLUDED_DIRS:
        return True

    relative_posix = relative.as_posix()
    return any(
        fnmatch.fnmatch(relative.name, pattern) or fnmatch.fnmatch(relative_posix, pattern)
        for pattern in EXCLUDED_PATTERNS
    )


def main() -> None:
    DIST.mkdir(exist_ok=True)

    with zipfile.ZipFile(OUTPUT, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in ROOT.rglob("*"):
            if path.is_dir() or should_exclude(path):
                continue

            archive.write(path, path.relative_to(ROOT))

    print(f"Package written to {OUTPUT}")


if __name__ == "__main__":
    main()
