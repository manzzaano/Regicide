package com.regicide.partida;

import com.regicide.juego.JugadaNoValida;
import org.springframework.messaging.converter.MessageConversionException;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.context.MessageSource;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Locale;

/**
 * Las acciones del jugador llegan a /app/partida/*; el estado vuelve solo a su sesión. Sin
 * token en la conexión, el jugador es invitado y {@code usuario} llega a null.
 */
@Controller
@MessageMapping("/partida")
class PartidaController {

    private static final String SESION = "simpSessionId";

    private final PartidasEnCurso partidas;
    private final MessageSource textos;

    PartidaController(PartidasEnCurso partidas, MessageSource textos) {
        this.partidas = partidas;
        this.textos = textos;
    }

    @MessageMapping("/empezar")
    @SendToUser(destinations = "/queue/partida", broadcast = false)
    EstadoPartida empezar(@Header(SESION) String sesion, Principal usuario) {
        return partidas.empezar(sesion, nombre(usuario));
    }

    @MessageMapping("/retomar")
    @SendToUser(destinations = "/queue/partida", broadcast = false)
    EstadoPartida retomar(@Header(SESION) String sesion, Principal usuario) {
        return partidas.retomar(sesion, nombre(usuario));
    }

    @MessageMapping("/atacar")
    @SendToUser(destinations = "/queue/partida", broadcast = false)
    EstadoPartida atacar(Jugada jugada, @Header(SESION) String sesion, Principal usuario) {
        return partidas.jugar(sesion, nombre(usuario), partida -> partida.atacar(jugada.cartas()));
    }

    @MessageMapping("/defender")
    @SendToUser(destinations = "/queue/partida", broadcast = false)
    EstadoPartida defender(Jugada jugada, @Header(SESION) String sesion, Principal usuario) {
        return partidas.jugar(sesion, nombre(usuario), partida -> partida.defender(jugada.cartas()));
    }

    @MessageMapping("/comodin")
    @SendToUser(destinations = "/queue/partida", broadcast = false)
    EstadoPartida usarComodin(@Header(SESION) String sesion, Principal usuario) {
        return partidas.jugar(sesion, nombre(usuario), partida -> partida.usarComodin());
    }

    @MessageMapping("/abandonar")
    void abandonar(@Header(SESION) String sesion, Principal usuario) {
        partidas.abandonar(sesion, nombre(usuario));
    }

    private static String nombre(Principal usuario) {
        return usuario == null ? null : usuario.getName();
    }

    @MessageExceptionHandler
    @SendToUser(destinations = "/queue/errores", broadcast = false)
    MensajeDeError jugadaNoValida(JugadaNoValida error, SimpMessageHeaderAccessor cabeceras) {
        return error(error.getMessage(), cabeceras, error.argumentos());
    }

    @MessageExceptionHandler({MessageConversionException.class, MethodArgumentNotValidException.class})
    @SendToUser(destinations = "/queue/errores", broadcast = false)
    MensajeDeError mensajeMalFormado(SimpMessageHeaderAccessor cabeceras) {
        return error("partida.mensaje-no-valido", cabeceras);
    }

    // El idioma lo fija AutenticacionStomp al conectar, con la cabecera Accept-Language.
    private MensajeDeError error(String clave, SimpMessageHeaderAccessor cabeceras, Object... argumentos) {
        Object idioma = cabeceras.getSessionAttributes() == null ? null : cabeceras.getSessionAttributes().get(AutenticacionStomp.IDIOMA);
        Locale locale = idioma instanceof Locale elegido ? elegido : AutenticacionStomp.POR_DEFECTO;
        return new MensajeDeError(clave, textos.getMessage(clave, argumentos, locale));
    }
}
