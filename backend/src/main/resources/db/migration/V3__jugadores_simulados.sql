-- Jugadores de ejemplo para que la clasificación no salga vacía al estrenar la base de datos.
-- Tienen las marcas más bajas posibles para que los supere cualquiera, y la clasificación
-- los señala como simulados.
alter table usuarios add column simulado boolean not null default false;

-- '!' no es un hash BCrypt, así que nadie puede entrar con estas cuentas.
insert into usuarios (nombre, contrasena, simulado)
values ('lucia_mtz', '!', true),
       ('javi_rdz', '!', true),
       ('marta92', '!', true),
       ('dani_garcia', '!', true),
       ('sergio_ll', '!', true),
       ('pablo_rv', '!', true);

-- Todas sus partidas acaban sin derrotar a nadie y suman varias, así que cualquiera que derrote
-- a un enemigo, o que juegue menos partidas, ya queda por encima.
insert into partidas_jugadas (usuario_id, resultado, enemigos_derrotados, comodines_usados, terminada_en)
select u.id, 'DERROTA', 0, p.comodines, now() - p.hace * interval '1 day'
from usuarios u
join (values ('lucia_mtz', 2, 2), ('lucia_mtz', 1, 6),
             ('marta92', 2, 1), ('marta92', 2, 4), ('marta92', 0, 9),
             ('sergio_ll', 2, 3), ('sergio_ll', 1, 8),
             ('javi_rdz', 2, 5), ('javi_rdz', 2, 12), ('javi_rdz', 1, 14),
             ('dani_garcia', 2, 7), ('dani_garcia', 2, 13),
             ('pablo_rv', 1, 10), ('pablo_rv', 2, 15)) as p (nombre, comodines, hace)
    on u.nombre = p.nombre;
