package com.regicide.partida;

import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

interface PartidasJugadas extends JpaRepository<PartidaJugada, Long> {

    List<PartidaJugada> findByUsuarioNombreOrderByTerminadaEnDesc(String nombre, Limit limite);

    // Más victorias primero; a igualdad, la mejor partida y luego quien lo logró en menos partidas.
    @Query("""
            select new com.regicide.partida.PuestoEnClasificacion(
                p.usuario.nombre,
                sum(case when p.resultado = com.regicide.juego.Fase.VICTORIA then 1 else 0 end),
                count(p),
                max(p.enemigosDerrotados))
            from PartidaJugada p
            group by p.usuario.nombre
            order by sum(case when p.resultado = com.regicide.juego.Fase.VICTORIA then 1 else 0 end) desc,
                max(p.enemigosDerrotados) desc,
                count(p) asc
            """)
    List<PuestoEnClasificacion> clasificacion(Limit limite);
}
