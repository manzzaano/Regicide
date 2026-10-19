package com.regicide.partida;

import com.regicide.juego.Fase;
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
 * Las partidas abiertas, una por conexión WebSocket. Las de los jugadores con cuenta (nombre
 * distinto de null) se guardan además en el historial tras cada jugada, para poder retomarlas.
 */
@Component
class PartidasEnCurso {

    private final Map<String, Partida> porSesion = new ConcurrentHashMap<>();
    private final Historial historial;

    PartidasEnCurso(Historial historial) {
        this.historial = historial;
    }

    EstadoPartida empezar(String sesion, String nombre) {
        return abrir(sesion, nombre, new Partida(new SecureRandom()));
    }

    EstadoPartida retomar(String sesion, String nombre) {
        if (nombre == null) {
            throw new JugadaNoValida("Inicia sesión para retomar una partida");
        }
        Partida partida = historial.recuperar(nombre)
                .map(guardada -> Partida.desde(guardada, new SecureRandom()))
                .orElseThrow(() -> new JugadaNoValida("No tienes ninguna partida guardada"));
        return abrir(sesion, nombre, partida);
    }

    private EstadoPartida abrir(String sesion, String nombre, Partida partida) {
        porSesion.put(sesion, partida);
        if (nombre != null) {
            historial.guardar(nombre, partida);
        }
        return EstadoPartida.de(partida);
    }

    EstadoPartida jugar(String sesion, String nombre, Consumer<Partida> accion) {
        Partida partida = porSesion.get(sesion);
        if (partida == null) {
            throw new JugadaNoValida("No tienes ninguna partida empezada");
        }
        accion.accept(partida);
        if (nombre != null) {
            boolean terminada = partida.fase() == Fase.VICTORIA || partida.fase() == Fase.DERROTA;
            if (terminada) {
                historial.registrarFin(nombre, partida);
            } else {
                historial.guardar(nombre, partida);
            }
        }
        return EstadoPartida.de(partida);
    }

    void abandonar(String sesion, String nombre) {
        porSesion.remove(sesion);
        if (nombre != null) {
            historial.borrarGuardada(nombre);
        }
    }

    int enCurso() {
        return porSesion.size();
    }

    // Al desconectarse solo se libera la memoria: la partida guardada sigue esperando al jugador.
    @EventListener
    void alDesconectarse(SessionDisconnectEvent evento) {
        porSesion.remove(evento.getSessionId());
    }
}
