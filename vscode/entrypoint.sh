#!/bin/bash
if [[ "$DEVMODE" == "1" ]]; then
DISPLAY=:1.0
export DISPLAY

# x authority
COOKIE=$(mcookie)
TEMP_XAUTH="/tmp/.Xauthority-$USERNAME"
if [[ -e "$TEMP_XAUTH" ]]; then
	rm "$TEMP_XAUTH"
fi
rm $USER_HOME/.Xauthority || true
xauth -f $TEMP_XAUTH add $DISPLAY . $COOKIE
USER_HOME=$(eval echo ~$USERNAME)
mv $TEMP_XAUTH $USER_HOME/.Xauthority
chown $USERNAME:$USERNAME $USER_HOME/.Xauthority
cp $USER_HOME/.Xauthority /root/.Xauthority
chown root:root / root/.Xauthority
rsync $USER_HOME/.vnc/ /root/.vnc/ -ar

ls -lhtra /root/.vnc

Xvfb :1 -screen 0 "${DISPLAY_WIDTH}x${DISPLAY_HEIGHT}x16" &
/usr/bin/x11vnc -display :1.0 -auth guess -forever -rfbport 5900 -rfbauth /root/.vnc/passwd &
code-insiders --no-sandbox --user-data-dir /codedata
sleep infinity
fi