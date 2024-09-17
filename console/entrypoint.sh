#!/bin/bash
/usr/sbin/sshd -D
echo $PROJECT_NAME > /home/odoo/projectname
while true;
do
	sleep 1000
done