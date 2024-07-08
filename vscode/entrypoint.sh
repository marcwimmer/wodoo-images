#!/bin/bash
if [[ "$DEVMODE" == "1" ]]; then
DISPLAY=:0.0
export DISPLAY

killall vscode
killall xvfb
killall x11vnc
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

Xvfb $DISPLAY -screen 0 "${DISPLAY_WIDTH}x${DISPLAY_HEIGHT}x${DISPLAY_COLOR}" &
/usr/bin/x11vnc -display ${DISPLAY} -auth guess \
	-forever -rfbport 5900 -rfbauth /root/.vnc/passwd \
	-scale "${DISPLAY_WIDTH}x${DISPLAY_HEIGHT}" \
	&
xhost +local: &

# transfer some environment variables
echo "export project_name=$project_name" > /tmp/envvars.sh
echo "export CUSTOMS_DIR=$CUSTOMS_DIR" >> /tmp/envvars.sh
echo "alias odoo=\"$USER_HOME/.local/bin/odoo --project-name=$project_name\"" >> $USER_HOME/.bash_aliases

# gosu $USERNAME xeyes
STARTUPFILE_FLUXBOX=/home/user1/.fluxbox/startup
echo '#!/bin/bash' > $STARTUPFILE_FLUXBOX
echo 'sleep 5' >> $STARTUPFILE_FLUXBOX
echo "DISPLAY=$DISPLAY /usr/bin/code-insiders /opt/src &" >> $STARTUPFILE_FLUXBOX
chown $USERNAME:$USERNAME $STARTUPFILE_FLUXBOX
chmod a+x $STARTUPFILE_FLUXBOX
gosu $USERNAME fluxbox &

line="DISPLAY=$DISPLAY /usr/bin/code-insiders /opt/src"
gosu $USERNAME bash -c "$line"
sleep 2
WINDOW_ID=$(DISPLAY="$DISPLAY" xdotool getactivewindow)
xdotool windowactivate --sync $WINDOW_ID key --clearmodifiers alt+F10

sleep infinity
fi