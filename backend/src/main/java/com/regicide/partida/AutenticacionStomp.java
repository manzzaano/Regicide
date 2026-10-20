package com.regicide.partida;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Lee el JWT de la cabecera Authorization del CONNECT de STOMP. Sin cabecera, el jugador entra
 * como invitado; con un token caducado, falso o de una sesión cerrada, el decoder lanza una
 * excepción y Spring responde con un frame de error.
 */
@Component
class AutenticacionStomp implements ChannelInterceptor {

    private static final String PREFIJO = "Bearer ";
    static final String IDIOMA = "idioma";
    static final Locale POR_DEFECTO = Locale.of("es");

    private final JwtDecoder decoder;

    AutenticacionStomp(JwtDecoder decoder) {
        this.decoder = decoder;
    }

    @Override
    public Message<?> preSend(Message<?> mensaje, MessageChannel canal) {
        StompHeaderAccessor cabeceras = MessageHeaderAccessor.getAccessor(mensaje, StompHeaderAccessor.class);
        if (cabeceras == null) {
            return mensaje;
        }
        // Cada jugada vuelve a validar el token: si caduca o se cierra la sesión desde otro
        // dispositivo, la conexión abierta tampoco sirve.
        if (cabeceras.getCommand() == StompCommand.SEND && cabeceras.getUser() instanceof JwtAuthenticationToken token) {
            decoder.decode(token.getToken().getTokenValue());
            return mensaje;
        }
        if (cabeceras.getCommand() != StompCommand.CONNECT) {
            return mensaje;
        }
        String idioma = cabeceras.getFirstNativeHeader("Accept-Language");
        if (idioma != null && cabeceras.getSessionAttributes() != null) {
            cabeceras.getSessionAttributes().put(IDIOMA, idioma.toLowerCase(Locale.ROOT).startsWith("en") ? Locale.ENGLISH : POR_DEFECTO);
        }
        String autorizacion = cabeceras.getFirstNativeHeader("Authorization");
        if (autorizacion != null) {
            if (!autorizacion.startsWith(PREFIJO)) {
                throw new IllegalArgumentException("Cabecera Authorization sin Bearer");
            }
            cabeceras.setUser(new JwtAuthenticationToken(decoder.decode(autorizacion.substring(PREFIJO.length()))));
        }
        return mensaje;
    }
}
