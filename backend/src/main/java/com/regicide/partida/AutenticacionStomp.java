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

/**
 * Lee el JWT de la cabecera Authorization del CONNECT de STOMP. Sin cabecera, el jugador entra
 * como invitado; con un token caducado o falso, el decoder lanza una excepción y Spring cierra
 * la conexión con un frame de error.
 */
@Component
class AutenticacionStomp implements ChannelInterceptor {

    private static final String PREFIJO = "Bearer ";

    private final JwtDecoder decoder;

    AutenticacionStomp(JwtDecoder decoder) {
        this.decoder = decoder;
    }

    @Override
    public Message<?> preSend(Message<?> mensaje, MessageChannel canal) {
        StompHeaderAccessor cabeceras = MessageHeaderAccessor.getAccessor(mensaje, StompHeaderAccessor.class);
        if (cabeceras == null || cabeceras.getCommand() != StompCommand.CONNECT) {
            return mensaje;
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
