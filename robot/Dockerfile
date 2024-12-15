FROM ubuntu:24.04 AS build_gecko
ARG WODOO_VERSION
LABEL authors=Mozilla,jamesmortensen

#========= tags
# local/geckodriver-arm-builder
#=========

ENV GECKODRIVER_VERSION=0.35.0
USER root


#===========
# Install dependencies and clone geckodriver source
#===========
WORKDIR /opt
RUN RUSTUP_INIT_SKIP_PATH_CHECK=1 curl https://sh.rustup.rs -sSf | bash -s -- -y
RUN apt update \
	&& apt install gcc build-essential git cargo ca-certificates curl --no-install-recommends -y 
RUN apt update && apt install -y x11-utils xorg

RUN git clone https://github.com/mozilla/geckodriver.git && cd geckodriver \
	&& git checkout v$GECKODRIVER_VERSION \
	&& apt-get autoremove -y && apt-get clean -y \
	&& rm -rf /var/lib/apt/lists/* /var/cache/apt/*

WORKDIR /opt/geckodriver
RUN cargo install --locked cargo-feature
RUN cargo build --release
RUN mv ./target/release/geckodriver /usr/local/bin/


FROM ubuntu:22.04
ARG TARGETARCH
ARG OWNER_UID
ARG WODOO_VERSION

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update -q && \
apt install -y wget unzip python3 \
python3-pip python3-magic libmagickwand-dev xvfb \
sudo curl software-properties-common pipx
RUN apt update && apt install -y x11-utils xorg

COPY ./requirements.txt /tmp/requirements.txt
RUN python3 -mpip install pip -U
RUN python3 -mpip install setuptools
RUN python3 -mpip install --no-cache-dir -r /tmp/requirements.txt
RUN rm -rf /tmp/requirements.txt

# Download and install Firefox
RUN add-apt-repository ppa:mozillateam/ppa && \
printf 'Package: *\nPin: release o=LP-PPA-mozillateam\nPin-Priority: 1001\n' | sudo tee /etc/apt/preferences.d/mozilla-firefox
RUN cat /etc/apt/preferences.d/mozilla-firefox
RUN \
apt remove firefox && \
apt update && \
apt install -y firefox

#ADD install_geckodriver.sh .
#RUN /bin/bash install_geckodriver.sh
COPY --from=build_gecko /usr/local/bin/geckodriver /usr/local/bin

# As this image cannot run in non-headless mode anyway, it's better to forcibly
# enable it, regardless whether WebDriver client requests it in capabilities or
# not.
ENV MOZ_HEADLESS=1

ENV WORKDIR=/opt/robot
ENV ROBOT_THREADS 1

WORKDIR $WORKDIR

RUN userdel -r $(getent passwd $OWNER_UID | cut -d: -f1) || true
RUN useradd -rm -s /bin/bash -d /opt/robot -g root -G sudo -u $OWNER_UID robot
RUN echo 'robot ALL=NOPASSWD:SETENV: ALL' > /etc/sudoers.d/robot

RUN apt update && apt install -y git ssh rsync
RUN mkdir -p /opt/robot/.ssh && \
chmod 500 /opt/robot/.ssh  && \
chown robot /opt/robot && \
chown robot /opt/robot/.ssh -R 

# -------------------------------------------
# Setup Wodoo Framework
# postgres
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && \
apt install -y postgresql postgresql-contrib
RUN sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list' && \
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list && \
apt update && \
apt -y install postgresql-14 libpq-dev

# install docker cli
RUN apt install -y ca-certificates curl gnupg lsb-release
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt update
RUN apt install docker-ce docker-ce-cli containerd.io -y
RUN usermod -aG docker robot

#--------------------------------------------

RUN apt update && apt install -y pipx gosu

USER robot
ENV WODOO_VERSION=$WODOO_VERSION
RUN \
mkdir /opt/robot/.local/pipx -p && \
pipx install wodoo==$WODOO_VERSION --force
ENV PATH="$PATH:/opt/robot/.local/bin"
USER root
RUN find /opt/robot -not -user robot -exec chown robot {} \;


USER root
COPY ssh_config /opt/robot/.ssh/config
RUN chown robot /opt/robot/.ssh/config  

RUN apt install -y firefox
RUN apt install -y gpg x11vnc xvfb xauth git gosu net-tools rsync
RUN apt install -y x11-apps python3-pip python3-venv fluxbox xdotool

COPY robotest.py ./
COPY entrypoint.sh ./
COPY entrypoint_standalone.sh ./
RUN chmod a+x entrypoint*.sh
USER root
ENTRYPOINT ["/opt/robot/entrypoint.sh"]
