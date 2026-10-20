-- Con todos a 0 enemigos, la clasificación no daba con quién medirse. Ahora van de principiante
-- (ninguno derrotado) a nivel medio (6 de 12), sin victorias: el reto está en pasar de la mitad.
delete from partidas_jugadas
where usuario_id in (select id from usuarios where simulado);

insert into partidas_jugadas (usuario_id, resultado, enemigos_derrotados, comodines_usados, terminada_en)
select u.id, 'DERROTA', p.derrotados, p.comodines, now() - p.hace * interval '1 day'
from usuarios u
join (values ('pablo_rv', 0, 1, 15), ('pablo_rv', 0, 2, 10),
             ('dani_garcia', 0, 2, 13), ('dani_garcia', 1, 2, 9), ('dani_garcia', 1, 1, 7),
             ('sergio_ll', 1, 2, 14), ('sergio_ll', 0, 1, 11), ('sergio_ll', 2, 2, 8), ('sergio_ll', 2, 2, 3),
             ('marta92', 1, 1, 20), ('marta92', 3, 2, 16), ('marta92', 2, 2, 12), ('marta92', 4, 2, 9),
             ('marta92', 3, 2, 4),
             ('javi_rdz', 2, 2, 22), ('javi_rdz', 3, 2, 18), ('javi_rdz', 5, 2, 14), ('javi_rdz', 4, 2, 12),
             ('javi_rdz', 1, 1, 6), ('javi_rdz', 5, 2, 2),
             ('lucia_mtz', 2, 2, 28), ('lucia_mtz', 4, 2, 24), ('lucia_mtz', 3, 2, 19), ('lucia_mtz', 6, 2, 15),
             ('lucia_mtz', 5, 2, 10), ('lucia_mtz', 4, 1, 5), ('lucia_mtz', 6, 2, 1))
        as p (nombre, derrotados, comodines, hace)
    on u.nombre = p.nombre;
