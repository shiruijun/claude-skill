#!/bin/bash
set -e

SKILLS_DIR="${HOME}/.claude/skills"
REPO="shiruijun/claude-skill"
BRANCH="main"

mkdir -p "$SKILLS_DIR"

echo "Installing claude-skill skills..."

# Download all skill files
for skill_file in skills/*.md; do
  if [ -f "$skill_file" ]; then
    skill_name=$(basename "$skill_file")
    echo "  Installing $skill_name..."
    curl -sSL "https://raw.githubusercontent.com/${REPO}/${BRANCH}/${skill_file}" -o "${SKILLS_DIR}/${skill_name}"
  fi
done

# Download CLAUDE.md if exists
if [ -f "CLAUDE.md" ]; then
  echo "  Installing CLAUDE.md..."
  curl -sSL "https://raw.githubusercontent.com/${REPO}/${BRANCH}/CLAUDE.md" -o "${HOME}/.claude/CLAUDE.md"
fi

echo "Done! Restart Claude Code to use the skills."