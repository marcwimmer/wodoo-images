from datetime import datetime
import psycopg2
import os

db_params = {
    "dbname": os.environ["POSTGRES_DB"],
    "user": os.environ["POSTGRES_USER"],
    "password": os.environ["POSTGRES_PASSWORD"],
    "host": os.environ["POSTGRES_HOST"],
    "port": int(os.environ["POSTGRES_PORT"]),
}

try:
    conn = psycopg2.connect(**db_params)
    now = datetime.utcnow()

    cur = conn.cursor()
    print("Executing delete command")
    cur.execute("DELETE FROM httpd_access WHERE timestamp < NOW() - INTERVAL '2 days';")
    cur.close()

    conn.commit()
    conn.close()
    print("Connection closed")

except psycopg2.Error as e:
    print("Error connecting to the database:", e)
