package com.regicide.partida;

import com.regicide.juego.JugadaNoValida;
import org.springframework.messaging.converter.MessageConversionException;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

/** Las acciones del jugador llegan a /app/partida/*; el estado vuelve solo a su sesión. */
@Controller
@MessageMapping("/partida")
class PartidaController {

    private static final String SESION = "simpSessionId";

    private final PartidasEnCurso partidas;

    PartidaController(PartidasEnCurso partidas) {
        this.partidas = partidas;
    }

    @MessageMapping("/empezar")
    @SendToUser(destinations = "/queue/partida", broadcast = false)
    EstadoPartida empezar(@Header(SESION) String sesion) {
        return partidas.empezar(sesion);
    }

    @MessageMapping("/atacar")
    @SendToUser(destinations = "/queue/partida", broadcast = false)
    EstadoPartida atacar(Jugada jugada, @Header(SESION) String sesion) {
        return partidas.jugar(sesion, partida -> partida.atacar(jugada.cartas()));
    }

    @MessageMapping("/defender")
    @SendToUser(destinations = "/queue/partida", broadcast = false)
    EstadoPartida defender(Jugada jugada, @Header(SESION) String sesion) {
        return partidas.jugar(sesion, partida -> partida.defender(jugada.cartas()));
    }

    @MessageMapping("/comodin")
    @SendToUser(destinations = "/queue/partida", broadcast = false)
    EstadoPartida usarComodin(@Header(SESION) String sesion) {
        return partidas.jugar(sesion, partida -> partida.usarComodin());
    }

    @MessageMapping("/abandonar")
    void abandonar(@Header(SESION) String sesion) {
        partidas.terminar(sesion);
    }

    @MessageExceptionHandler
    @SendToUser(destinations = "/queue/errores", broadcast = false)
    MensajeDeError jugadaNoValida(JugadaNoValida error) {
        return new MensajeDeError(error.getMessage());
    }

    @MessageExceptionHandler
    @SendToUser(destinations = "/queue/errores", broadcast = false)
    MensajeDeError mensajeMalFormado(MessageConversionException error) {
        return new MensajeDeError("Mensaje no válido");
    }
}
