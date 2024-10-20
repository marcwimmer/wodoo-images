#!/bin/bash
path="/usr/local/bin/wodoo_python"
if [[ ! -e "$path" ]]; then
	tee -a "$path" > /dev/null <<- EOT
		#!/bin/bash
		cd $(dirname "$WODOO_PYTHON")
		./python3 $( echo '"$@"' )
	EOT
	chmod a+x "$path"
fi
exec "$WODOO_PYTHON" /odoolib/entrypoint.py "$@"
