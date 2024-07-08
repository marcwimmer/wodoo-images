FROM ubuntu:24.04
ARG OWNER_UID

RUN apt update && apt install -y curl
RUN curl  -L -o /tmp/vscode.deb \
'https://code.visualstudio.com/sha/download?build=insider&os=linux-deb-arm64'
RUN apt install -y gpg x11vnc xvfb xauth git gosu net-tools rsync
RUN apt install -y /tmp/vscode.deb
RUN apt update && apt upgrade -y
ADD entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh
ENTRYPOINT /bin/bash /entrypoint.sh
ADD welcome.txt /root/welcome.txt

ENV USERNAME=user1
RUN userdel -r $(getent passwd $OWNER_UID | cut -d: -f1) || true 
RUN groupdel $USERNAME || true
RUN groupadd $USERNAME || true
RUN useradd -u $OWNER_UID -g $USERNAME -m $USERNAME
ADD passwd /home/$USERNAME/.vnc/passwd
RUN  \
mkdir -p /home/$USERNAME/.vnc && \
chown $USERNAME:$USERNAME /home/$USERNAME/.vnc -R
RUN apt install -y x11-apps