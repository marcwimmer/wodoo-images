create table console_log (
    id serial primary key,
    logdate character varying,
    remote character varying,
    host character varying,
    usr character varying,
    method character varying,
    path character varying,
    code character varying,
    size bigint,
    referer character varying,
    agent character varying,
    exported boolean
);

create index console_log_timestamp on console_log(logdate);
