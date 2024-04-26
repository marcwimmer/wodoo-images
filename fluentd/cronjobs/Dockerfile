FROM ubuntu:latest

RUN apt update && apt -y install cron postgresql-client python3-pip
RUN pip3 install psycopg2-binary

# Start cron service on container startup
CMD ["cron", "-f"]