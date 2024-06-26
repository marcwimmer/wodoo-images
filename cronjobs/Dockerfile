FROM ubuntu:22.04
ARG WODOO_VERSION
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && \
apt install -y python3-pip python3 curl rsync locales pv \
pigz telnet libpq-dev wget lsb-release \
libxml2-dev libxslt-dev pipx gosu git sudo \
ca-certificates curl gnupg lsb-release \
unzip

# install docker
ADD docker.gpg /tmp/docker.gpg
RUN mkdir -p /etc/apt/keyrings && \
cat /tmp/docker.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && \
apt update && apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin python3-venv zlib1g-dev


# install postgres
RUN apt -y install && \
export DEBIAN_FRONTEND=noninteractive && \
apt install -y postgresql postgresql-contrib
RUN sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list' && \
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list && \
apt update && \
apt -y install postgresql-16

RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
    && dpkg-reconfigure --frontend=noninteractive locales \
    && update-locale LANG=en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8

WORKDIR /usr/local/bin
RUN apt install -y python3-lxml
ADD bin/ /usr/local/bin/
RUN chmod a+x /usr/local/bin/*.py

WORKDIR /root
COPY requirements.txt requirements.txt
RUN python3 -mpip install -r requirements.txt

RUN pipx install wodoo==$WODOO_VERSION

ADD entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]