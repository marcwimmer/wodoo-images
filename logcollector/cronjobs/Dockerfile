FROM ubuntu:22.04

RUN apt update && apt -y install cron postgresql-client python3-pip python3.10-venv
RUN python3 -mvenv /root/venv
RUN /root/venv/bin/pip install psycopg2-binary

# Start cron service on container startup
CMD ["cron", "-f"]