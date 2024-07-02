#!/bin/bash
tee >/tmp/archive <&0
usermod -u $OWNER_UID robot
chown robot /opt/robot 
chown robot /opt/robot/.odoo
chown robot /opt/robot/.odoo/images
exec gosu robot /opt/venv/bin/python3 robotest.py "$@"