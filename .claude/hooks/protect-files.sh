#!/bin/bash
# PreToolUse hook: Protect sensitive files from being edited/written
# Exit 2 = BLOCK the action, Exit 0 = ALLOW

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Block .env files (all variants)
if [[ "$FILE_PATH" =~ \.env($|\.local|\.production|\.staging|\.test|\.development) ]]; then
  echo "BLOCKED: .env files are protected. Never edit secrets directly." >&2
  exit 2
fi

# Block lock files
if [[ "$FILE_PATH" == *"pnpm-lock.yaml"* ]] || [[ "$FILE_PATH" == *"package-lock.json"* ]] || [[ "$FILE_PATH" == *"yarn.lock"* ]] || [[ "$FILE_PATH" == *"bun.lockb"* ]]; then
  echo "BLOCKED: Lock files should only be modified by the package manager." >&2
  exit 2
fi

# Block .git directory
if [[ "$FILE_PATH" == *"/.git/"* ]]; then
  echo "BLOCKED: .git directory should not be edited directly." >&2
  exit 2
fi

# Block credentials
if [[ "$FILE_PATH" == *"credentials"* ]] || [[ "$FILE_PATH" == *"secrets.yaml"* ]] || [[ "$FILE_PATH" == *"secrets.json"* ]] || [[ "$FILE_PATH" == *"service-account"* ]]; then
  echo "BLOCKED: Credential files are protected." >&2
  exit 2
fi

exit 0
