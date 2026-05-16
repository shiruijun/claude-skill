#!/bin/bash
set -e

SKILLS_DIR="${HOME}/.claude/skills"
REPO="shiruijun/claude-skill"
BRANCH="main"

mkdir -p "$SKILLS_DIR"

echo "Installing claude-skill skills..."

# Download all skill directories
for skill_dir in skills/*/; do
  if [ -d "$skill_dir" ]; then
    skill_name=$(basename "$skill_dir")
    echo "  Installing $skill_name..."
    # Create skill directory
    mkdir -p "${SKILLS_DIR}/${skill_name}"
    # Download all files in the skill directory
    for file in "${skill_dir}"*; do
      if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "    Downloading $filename..."
        curl -sSL "https://raw.githubusercontent.com/${REPO}/${BRANCH}/${skill_dir}${filename}" -o "${SKILLS_DIR}/${skill_name}/${filename}"
      fi
    done
  fi
done

echo ""
echo "Done! Restart Claude Code to use the skills."