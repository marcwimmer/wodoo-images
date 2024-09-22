. "$HOME/.bashrc"
PATH="$HOME/.local/bin:$HOME/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
cat /usr/share/welcome.txt
cd /opt/src
. "$HOME/env"

export PS1="\[\e[1;32m\]odoo \[\e[0m\]> "

alias odoo="/home/odoo/.local/bin/odoo -p $PROJECT_NAME"