#!/bin/bash

# Nova task runner (v0)

echo "🧠 Running Nova agent on task list..."
echo

# Path to task file
TASK_FILE="./docs/tasks.md"

# Read the first unchecked task
TASK=$(grep "\- \[ \]" "$TASK_FILE" | head -n 1 | sed 's/- \[ \] //')

if [ -z "$TASK" ]; then
  echo "✅ No open tasks found in $TASK_FILE"
  exit 0
fi

echo "🚀 Next task: $TASK"
echo

# Prompt for confirmation (optional)
read -p "Run Nova for this task? (y/n): " CONFIRM

if [[ "$CONFIRM" != "y" ]]; then
  echo "❌ Task canceled"
  exit 1
fi

# Simulate agent running (replace this with actual nova CLI if available)
echo "🛠️  Nova is generating code for: $TASK"
echo "🗃️  Output will be committed to current branch"
echo

# Replace this with actual Nova CLI call if applicable
# e.g., npx nova generate "$TASK"

ESCAPED_TASK=$(printf '%s\n' "$TASK" | sed 's/[]\/$*.^[]/\\&/g')

# Mark the task as complete
sed -i "s/- \[ \] $ESCAPED_TASK/- [x] $ESCAPED_TASK/" "$TASK_FILE"


# Git add and commit (optional)
git add .

echo "✅ Task completed and committed"
echo "🔍 Please review the changes before committing."