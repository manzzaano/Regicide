package com.regicide.partida;

import com.regicide.juego.Fase;
import org.springframework.data.domain.Limit;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    record Reclamo(String codigo) {
    }

    private final PartidasJugadas jugadas;
    private final PartidasPorReclamar porReclamar;
    private final Historial historial;

    HistorialController(PartidasJugadas jugadas, PartidasPorReclamar porReclamar, Historial historial) {
        this.jugadas = jugadas;
        this.porReclamar = porReclamar;
        this.historial = historial;
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

    // La partida que el jugador acaba de terminar como invitado pasa a su cuenta.
    @PostMapping("/games/reclamar")
    ResponseEntity<Void> reclamar(@RequestBody Reclamo reclamo, Principal usuario) {
        return porReclamar.canjear(reclamo.codigo())
                .map(resultado -> {
                    historial.registrarReclamada(usuario.getName(), resultado);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
