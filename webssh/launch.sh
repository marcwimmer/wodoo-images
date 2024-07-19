#!/bin/bash
set -x
set -eux

service nginx start
service ssh start

set -r
export WEBSSH2_BASEURL=/console
wssh \
--address=0.0.0.0 \
--port=8080 \
--xsrf=False \
--origin='*' \
--xheaders=True \
--debug \
--wpintvl=3600 \
--redirect false \
--baseURLL /console
