#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
echo "WRAPPER STARTED at $(date) DIR=$DIR" >> /tmp/voiceagent_debug.log
exec "$DIR/venv/bin/python" -u "$DIR/host.py" 2>>"$DIR/wrapper.err"
