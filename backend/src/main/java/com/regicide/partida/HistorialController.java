package com.regicide.partida;

import com.regicide.juego.Fase;
import org.springframework.data.domain.Limit;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api")
class HistorialController {

    record ResumenPartida(Fase resultado, int enemigosDerrotados, int comodinesUsados, Instant terminadaEn) {
    }

    private final PartidasJugadas jugadas;

    HistorialController(PartidasJugadas jugadas) {
        this.jugadas = jugadas;
    }

    @GetMapping("/leaderboard")
    List<PuestoEnClasificacion> clasificacion() {
        return jugadas.clasificacion(Limit.of(20));
    }

    @GetMapping("/games/me")
    List<ResumenPartida> misPartidas(Principal usuario) {
        return jugadas.findByUsuarioNombreOrderByTerminadaEnDesc(usuario.getName(), Limit.of(50)).stream()
                .map(partida -> new ResumenPartida(partida.getResultado(), partida.getEnemigosDerrotados(),
                        partida.getComodinesUsados(), partida.getTerminadaEn()))
                .toList();
    }
}
