FROM ubuntu:20.04
ARG TARGETARCH

# wget
RUN export DEBIAN_FRONTEND=noninteractive
RUN apt update -q 
RUN apt install -y tzdata wget unzip python3
RUN apt install -y python3-pip python3-magic libmagickwand-dev xvfb

# chrome for testing
# CHromium now needs snap to work; it is not so easy to make snap running inside docker container
# Switching to chrome stable now
# RUN apt install -y chromium-browser

COPY ./requirements.txt /tmp/requirements.txt
RUN \
pip3 install --no-cache-dir -r /tmp/requirements.txt && \
rm -rf /tmp/requirements.txt

ENV WORKDIR=/opt/robot
ENV ROBOT_THREADS 1

ENV CHROME_VERSION=95.0.4638.54
ENV ARCH=amd64
COPY artefacts/chromedriver_$ARCH.zip /tmp/chromedriver.zip
COPY artefacts/googlechrome_$ARCH.deb /tmp/googlechrome.deb
ENV arm_chromium_download_link=https://github.com/electron/electron/releases/download/v14.1.1/chromedriver-v14.1.1-linux-arm64.zip
RUN [ "$TARGETARCH" = "amd64" ] && $(apt update && apt install -y /tmp/googlechrome.deb) || exit 0
RUN [ "$TARGETARCH" = "arm64" ] && $(wget -O /tmp/chromedriver $arm_chromium_download_link) || exit 0

RUN unzip /tmp/chromedriver.zip -d /opt/chromedriver \
    && chmod +x /opt/chromedriver/chromedriver \
    && ln -fs /opt/chromedriver/chromedriver /usr/local/bin/chromedriver \
    && rm -rf /tmp/chromedriver_linux64.zip

ENV WORKDIR=/opt/robot
WORKDIR $WORKDIR
COPY robotest.py ./
CMD [ "python3", "robotest.py"]