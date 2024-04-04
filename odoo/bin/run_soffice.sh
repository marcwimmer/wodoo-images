#!/bin/bash
if [[ "$NO_SOFFICE" == "1" ]]; then
    exit 0
fi
while true;
do
	pkill -9 -f soffice.bin.*socket.*port=2002 || break
done

while true;
do
    if [[ -e /usr/lib/libreoffice/program/soffice.bin ]]; then
        sudo -u odoo /usr/lib/libreoffice/program/soffice.bin --headless --calc --accept="socket,host=127.0.0.1,port=2002;urp;StarOffice.ServiceManager" &
        PID=$(echo $!)
        disown $PID
        kill -0 $PID 2>/dev/null && break
    fi
    sleep 1
done
