create table console_log (
    id serial primary key,
    date character varying,
    ttime character varying,
    loglevel character varying,
    line character varying,
    exported boolean,
    tag character varying
);

create index console_log_timestamp on console_log(logdate);
create index console_log_exported on console_log(exported);
