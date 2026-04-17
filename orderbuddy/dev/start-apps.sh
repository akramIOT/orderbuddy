#!/bin/bash
set -e

SESSION="orderbuddy"

# Kill existing session if it's already running
tmux has-session -t "$SESSION" 2>/dev/null && tmux kill-session -t "$SESSION"

# Start new tmux session
tmux new-session -d -s "$SESSION" -c ./src/order -n dev 'npm run dev'

# Split horizontally for manage app
tmux split-window -h -t "$SESSION:0" -c ./src/manage 'npm run dev'

# Split vertically from left pane for API
tmux select-pane -t "$SESSION:0.0"
tmux split-window -v -c ./src/api 'npm run dev'

# Optional: rename the panes
tmux select-pane -t "$SESSION:0.0" -T "order"
tmux select-pane -t "$SESSION:0.1" -T "manage"
tmux select-pane -t "$SESSION:0.2" -T "api"

# Attach to session
tmux attach-session -t "$SESSION"

# make the file executable by running chmod +x dev/start-apps.sh
# run dev/start-apps.sh