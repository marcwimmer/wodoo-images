# use buster for latest postgres client
FROM debian:buster
ARG TARGETARCH
ARG ODOO_VERSION
ARG ODOO_REQUIREMENTS
ARG ODOO_DEB_REQUIREMENTS
ARG ODOO_PYTHON_VERSION
ARG DOCKER_GROUP_ID
ARG INSTALL_DOCKER_CLIENTS

MAINTAINER marc@itewimmer.de

# used at a customer to fix proxy; can destroy public keys so no update works
ADD etc/apt/apt.conf.d/99fixbadproxy /etc/apt/apt.conf.d/99fixbadproxy

ENV LANG C.UTF-8
RUN apt update
RUN apt-get install \
	-y \
	--no-install-recommends \
			software-properties-common \
			man \
            cmake \
            ctags \
			build-essential \
            htop \
            ca-certificates \
            curl \
            node-less \
			node-clean-css \
			libpq-dev \
			libjpeg-dev \
            libcurl3-dev \
			libxml2-dev \
			libxslt1-dev \
			libffi-dev \
            tmux \
            libfreetype6-dev \
            libpng-dev \
            libjpeg-dev \
            automake \
            pkg-config \
            libpcre3-dev \
            zlib1g-dev \
            liblzma-dev \
            make \
            ssh \
            mc \
            libxml2-utils \
            libxrender1 \
            libxext6 \
            libfontconfig \
            htop \
            rsync \
            vim \
            psmisc \
            lsof \
            git \
            tig \
            sudo \
            less \
            freetds-dev \
            libsasl2-dev \
			libldap2-dev \
			libssl-dev \
            wget \
            cifs-utils \
            imagemagick \
            cups \
            libreoffice \
            libcairo2 libpango1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info \
            locales \
			libmagickwand-dev \
            ffmpeg \
            zip \
            gpg-agent \
            pdftk \
            python3-gi \
            python3-click \
            python3-gi-cairo \
            python3-cairo \
            gir1.2-gtk-3.0 \
            libmagickwand-dev \
            libmagic-dev \
            libcups2-dev \
            python3-pip \
            python3-dev \
            python3 \
            locales-all \
            libpoppler-cpp-dev \
            postgresql-client \
            sassc \
            libsqlite3-dev

ADD liberation-sans /usr/share/fonts/
# rebuild font cache
RUN fc-cache -f -v

WORKDIR /tmp

RUN apt install -y xfonts-75dpi xfonts-base libgeos-dev
RUN if [ "$TARGETARCH" = "amd64" ]; then curl -o wkhtmltox.deb -SL https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.5/wkhtmltox_0.12.5-1.buster_amd64.deb; fi
RUN if [ "$TARGETARCH" = "arm64" ]; then curl -o wkhtmltox.deb -SL https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.buster_arm64.deb; fi
RUN dpkg -i wkhtmltox.deb

RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10 && \
useradd -ms /bin/bash odoo
RUN \
chown odoo:odoo /home/odoo -R && \
rm -Rf /usr/local/man && mkdir -p /usr/local/man/man1

# install docker client
RUN \
if [ "$INSTALL_DOCKER_CLIENTS" = "1" ]; then \
    groupadd -g $DOCKER_GROUP_ID docker && \
    usermod -aG docker odoo && \
    apt update && \
    apt install -y ca-certificates curl gnupg lsb-release software-properties-common && \
    apt update && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \ 
    $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt update && \
    DEBIAN_FRONTEND="noninteractive" apt install -y docker-ce-cli && \
    echo 'done'; \
fi


# Install specific Python version; example: 3.7.3 has email bug:
# https://github.com/SpamScope/mail-parser/issues/49
RUN apt update && apt install -y libncurses5 libncurses5-dev libncursesw5
ADD python/Python-$ODOO_PYTHON_VERSION.tgz /usr/local/src
WORKDIR /usr/local/src/Python-${ODOO_PYTHON_VERSION}
RUN ./configure --enable-optimizations
RUN apt install time
RUN time make -j4
RUN make install
RUN rm /usr/bin/python3 /usr/bin/pip3

#p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3
# PYTHON 3 and PIP
#p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3

#pip3 10.0 is in other directories; hash -r clears the cache of the path
RUN pip3 install wheel
RUN hash -r && \
	pip3 install --upgrade pip && \
	hash -r && \
	pip3 install --upgrade setuptools cython 
# RUN pip3 install psycopg2 pyinotify python-magic wand pycups pudb
#p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3p3

RUN git clone https://github.com/OCA/openupgradelib /opt/openupgradelib
WORKDIR /opt/openupgradelib
RUN python3 setup.py install


RUN echo "$ODOO_REQUIREMENTS"  | base64 --decode > /root/pip_requirements.txt
RUN pip3 install -r /root/pip_requirements.txt

RUN echo "$ODOO_DEB_REQUIREMENTS"  | base64 --decode > /root/deb_requirements.txt
RUN apt install -y  $(grep -vE "^\s*#" /root/deb_requirements  | tr "\n" " ")

RUN pip3 install pudb ipython marabunta

RUN ipython profile create && \
echo "c.TerminalInteractiveShell.editing_mode = 'vi'" >> /root/.ipython/profile_default/ipython_config.py && \
rsync /root/.ipython/ /home/odoo/.ipython/ -arP && \
chown odoo:odoo -R /home/odoo/.ipython

WORKDIR /usr/local/src
ADD patches/python_3.8.email.patch /usr/local/src
RUN bash python_3.8.email.patch

WORKDIR /opt/odoo


RUN pip3 install /opt/wodoo