create table usuarios (
    id         bigint generated always as identity primary key,
    nombre     varchar(20)  not null unique,
    contrasena varchar(100) not null,
    creado_en  timestamptz  not null default now()
);
