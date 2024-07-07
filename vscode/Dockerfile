FROM ubuntu:24.04

RUN apt update && apt install -y curl
RUN curl  -L -o /tmp/vscode.deb \
'https://code.visualstudio.com/sha/download?build=insider&os=linux-deb-arm64'
RUN apt install -y gpg
RUN apt install -y /tmp/vscode.deb
RUN apt install -y x11vnc xvfb
ADD passwd /root/.vnc/passwd
ADD entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh
ENTRYPOINT /entrypoint.sh