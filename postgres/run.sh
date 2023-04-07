#!/bin/bash
set -e

function make_entrypoint_with_params() {
python3 <<EOF
print("Version 1.0")
import os
with open('/config') as file:
    conf = file.read().splitlines()
conf += os.getenv('POSTGRES_CONFIG').split(",")
conf = list(filter(lambda x: bool((x or '').strip()) and not (x or '').strip().startswith("#"), conf))

print("Applying configuration:\n" + '\n'.join(conf))

conf = list(map(lambda x: f"-c {x}", conf))

with open('/start.sh', 'w') as f:
    f.write('/usr/local/bin/docker-entrypoint.sh postgres ' + ' '.join(conf))

EOF
}

function create_socket() {
    # we let postgres create its socket file with strange permissions as it wants
    # Using socat with connect that socket file
    PGSOCKET=/var/run/postgresql/.s.PGSQL.5432
    while [[ ! -e "$PGSOCKET" ]]; do
        sleep 0.5
        echo "Waiting for socketfile"
    done
    echo "unix socket $PGSOCKET available now"
    set -x
    mkdir -p "$(dirname "$POSTGRES_SOCKET")"
    if [[ -e "$POSTGRES_SOCKET" ]]; then
        unlink "$POSTGRES_SOCKET"
        rm "$POSTGRES_SOCKET" || true
    fi
    sync
    socat unix-listen:$POSTGRES_SOCKET,reuseaddr,fork UNIX-CONNECT:/var/run/postgresql/.s.PGSQL.5432
}

make_entrypoint_with_params
create_socket &

if [[ "$1" == "postgres" ]]; then
    exec gosu postgres bash /start.sh
else
    exec gosu postgres "$@"
fi
