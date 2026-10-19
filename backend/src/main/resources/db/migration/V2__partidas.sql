create table partidas_jugadas (
    id                  bigint generated always as identity primary key,
    usuario_id          bigint      not null references usuarios (id) on delete cascade,
    resultado           varchar(8)  not null check (resultado in ('VICTORIA', 'DERROTA')),
    enemigos_derrotados int         not null check (enemigos_derrotados between 0 and 12),
    comodines_usados    int         not null check (comodines_usados between 0 and 2),
    terminada_en        timestamptz not null
);

create index partidas_jugadas_usuario on partidas_jugadas (usuario_id);

-- Una partida a medias por jugador: el estado completo del motor en JSON.
create table partidas_guardadas (
    usuario_id  bigint      primary key references usuarios (id) on delete cascade,
    estado      jsonb       not null,
    guardada_en timestamptz not null
);
