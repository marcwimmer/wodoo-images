FROM fluentd:v1.16-debian-1

USER root

#RUN ["apk", "add", "gcc", "g++"]
#RUN ["apk", "add", "ruby-dev"]
#RUN ["apk", "add", "libpq-dev"]

RUN apt update
RUN apt install -y build-essential
RUN apt install -y libpq-dev
RUN apt install -y python3-pip

#RUN ["gem", "install", "fluent-plugin-sql", "--no-document", "--version", "5.0.3"]
#RUN ["gem", "install", "fluent-plugin-nginx", "--no-document"]
RUN ["gem", "install", "fluent-plugin-sql", "--no-document"]
RUN ["gem", "install", "fluent-plugin-postgres", "--no-document"]
RUN ["gem", "install", "fluent-plugin-rewrite-tag-filter", "--no-document"]
#RUN ["gem", "install", "fluent-plugin-tail", "--no-document"]
RUN ["gem", "install", "pg", "--no-document"]
RUN pip install fluent-logger
RUN ["gem", "install", "fluent-plugin-json", "--no-document"]
RUN ["gem", "install", "fluent-plugin-docker-json", "--no-document"]
RUN ["gem", "install", "fluent-plugin-multi-format-parser", "--no-document"]
RUN ["gem", "install", "fluent-plugin-concat", "--no-document"]
RUN ["gem", "install", "fluent-plugin-multiline-parser", "--no-document"]
RUN ["gem", "install", "fluent-plugin-unix-client", "--no-document"]

USER fluent
