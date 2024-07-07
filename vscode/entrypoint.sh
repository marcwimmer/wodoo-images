#!/bin/bash
if [[ "$DEVMODE" == "1" ]]; then

Xvfb :1 -screen 0 "${DISPLAY_WIDTH}x${DISPLAY_HEIGHT}x16" &
/usr/bin/x11vnc -display :1.0 -forever -rfbport 5900 -rfbauth /root/.vnc/passwd &
DISPLAY=:1.0
export DISPLAY
code-insiders --no-sandbox --user-data-dir /codedata
sleep infinity

fi