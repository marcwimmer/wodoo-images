FROM ubuntu:24.04
ARG OWNER_UID

RUN apt update && apt install -y curl
RUN curl  -L -o /tmp/vscode.deb \
'https://code.visualstudio.com/sha/download?build=insider&os=linux-deb-arm64'
RUN apt install -y gpg x11vnc xvfb xauth git gosu net-tools rsync
RUN apt install -y /tmp/vscode.deb
RUN apt update && apt upgrade -y
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
RUN apt install -y x11-apps python3-pip python3-venv fluxbox xdotool

RUN apt install -y postgresql-server-dev-16
RUN apt-get update && \
    apt-get install -y software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y python3.9 python3.9-dev python3.9-distutils python3.9-venv

USER $USERNAME
RUN cd /home/$USERNAME && \
python3.9 -mvenv venv && \
. venv/bin/activate && \
./venv/bin/python -mpip install pipx && \
pipx install wodoo && \
pipx install gimera
#RUN gimera completion -x && \
#odoo completion -x && \


RUN mkdir -p "/home/user1/.config/Code - Insiders/User"
ADD default_vscode_settings.json /tmp/settings

USER root
RUN mv /tmp/settings "/home/user1/.config/Code - Insiders/User/settings.json"
RUN chown -R user1:user1 /home/user1

USER user1
# ADD some extensions here
RUN \
/usr/bin/code-insiders --install-extension ms-python.python && \
/usr/bin/code-insiders --install-extension robocorp.robotframework-lsp && \
/usr/bin/code-insiders --install-extension vscodevim.vim && \
/usr/bin/code-insiders --install-extension MarcWimmerITE.odoobrowserITE

USER root