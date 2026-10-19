package com.regicide.partida;

import com.regicide.juego.JugadaNoValida;
import com.regicide.juego.Partida;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;

/**
 * Las partidas abiertas, una por conexión WebSocket. Viven en memoria: si el servidor se
 * reinicia, se pierden.
 */
@Component
class PartidasEnCurso {

    private final Map<String, Partida> porSesion = new ConcurrentHashMap<>();

    EstadoPartida empezar(String sesion) {
        Partida partida = new Partida(new SecureRandom());
        porSesion.put(sesion, partida);
        return EstadoPartida.de(partida);
    }

    EstadoPartida jugar(String sesion, Consumer<Partida> accion) {
        Partida partida = porSesion.get(sesion);
        if (partida == null) {
            throw new JugadaNoValida("No tienes ninguna partida empezada");
        }
        accion.accept(partida);
        return EstadoPartida.de(partida);
    }

    void terminar(String sesion) {
        porSesion.remove(sesion);
    }

    int enCurso() {
        return porSesion.size();
    }

    @EventListener
    void alDesconectarse(SessionDisconnectEvent evento) {
        terminar(evento.getSessionId());
    }
}
