#!/bin/bash
if [[ "$DEVMODE" == "1" ]]; then
DISPLAY=:1.0
export DISPLAY

killall xvfb
killall x11vnc
killall vscode
ps aux
rm /tmp/.*lock /tmp/*lock /tmp/.*X11* /tmp/*vscode* -R
rm /tmp/.X11-unix
ls /tmp -lhtra

# x authority
COOKIE=$(mcookie)
TEMP_XAUTH="/tmp/.Xauthority-$USERNAME"
if [[ -e "$TEMP_XAUTH" ]]; then
	rm "$TEMP_XAUTH"
fi
[[ -f $USER_HOME/.Xauthority ]] && rm $USER_HOME/.Xauthority
xauth -f $TEMP_XAUTH add $DISPLAY . $COOKIE
USER_HOME=$(eval echo ~$USERNAME)
mv $TEMP_XAUTH $USER_HOME/.Xauthority
chown $USERNAME:$USERNAME $USER_HOME/.Xauthority
cp $USER_HOME/.Xauthority /root/.Xauthority
chown root:root / root/.Xauthority
rsync $USER_HOME/.vnc/ /root/.vnc/ -ar

ls -lhtra /root/.vnc

Xvfb $DISPLAY -screen 0 "${DISPLAY_WIDTH}x${DISPLAY_HEIGHT}x16" &
/usr/bin/x11vnc -display ${DISPLAY} -auth guess -forever -rfbport 5900 -rfbauth /root/.vnc/passwd &
code-insiders --no-sandbox --user-data-dir /codedata
sleep infinity
fi