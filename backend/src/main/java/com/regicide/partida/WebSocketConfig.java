package com.regicide.partida;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final String[] origenesPermitidos;
    private final AutenticacionStomp autenticacion;

    WebSocketConfig(@Value("${regicide.origenes-permitidos}") String[] origenesPermitidos,
                    AutenticacionStomp autenticacion) {
        this.origenesPermitidos = origenesPermitidos;
        this.autenticacion = autenticacion;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOriginPatterns(origenesPermitidos);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/queue");
        // Las respuestas salen en el orden en que se generan: el último estado es el que se queda.
        registry.setPreservePublishOrder(true);
    }

    /*
     * Un solo hilo para los mensajes de los jugadores: los de cada conexión se procesan en orden,
     * así que dos jugadas seguidas nunca se cruzan y Partida no necesita bloqueos. No se usa
     * setPreserveReceiveOrder(true) porque se traga la excepción de AutenticacionStomp y el
     * cliente con un token no válido se queda esperando en vez de recibir un ERROR.
     * ponytail: todas las partidas comparten el hilo; con muchos jugadores, una cola por sesión.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(autenticacion);
        registration.taskExecutor().corePoolSize(1).maxPoolSize(1);
    }
}
