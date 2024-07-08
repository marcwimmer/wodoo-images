FROM ubuntu:24.04
ARG OWNER_UID
ARG TARGETARCH

RUN apt update && apt install -y curl
RUN curl  -L -o /tmp/vscode.deb \
"https://code.visualstudio.com/sha/download?build=insider&os=linux-deb-$TARGETARCH"
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


RUN mkdir -p "/home/$USERNAME/.config/Code - Insiders/User"
ADD default_vscode_settings.json /tmp/settings

USER root
RUN mv /tmp/settings "/home/$USERNAME/.config/Code - Insiders/User/settings.json"
RUN chown -R $USERNAME:$USERNAME /home/$USERNAME

USER $USERNAME
# ADD some extensions here
RUN \
/usr/bin/code-insiders --install-extension ms-python.python && \
/usr/bin/code-insiders --install-extension robocorp.robotframework-lsp && \
/usr/bin/code-insiders --install-extension vscodevim.vim && \
/usr/bin/code-insiders --install-extension MarcWimmerITE.odoobrowserITE

USER root

# install docker cli
RUN apt install -y ca-certificates curl gnupg lsb-release
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt update
RUN apt install docker-ce docker-ce-cli containerd.io -y
RUN delgroup systemd-journal && groupmod -g 999 docker
RUN usermod -aG docker $USERNAME

RUN chsh -s /bin/bash $USERNAME
RUN cp /etc/skel/.bashrc /home/$USERNAME/.bashrc
RUN chown $USERNAME:$USERNAME /home/$USERNAME/.vnc -R
USER $USERNAME
ENV SHELL=bin/bash
RUN echo "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/$USERNAME/.local/bin" >> /home/$USERNAME/.bashrc
RUN echo ". /tmp/envvars.sh" >> /home/$USERNAME/.bashrc
RUN ~/.local/bin/odoo completion -x
RUN ~/.local/bin/gimera completion -x

USER root