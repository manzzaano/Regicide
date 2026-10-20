package com.regicide.cuenta;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Envía los correos con la API de Resend. Cada envío va en su propio hilo virtual: así la respuesta
 * de "he olvidado la contraseña" tarda lo mismo haya correo o no, y no delata qué cuentas lo tienen.
 * Sin RESEND_API_KEY no se envía nada, solo se avisa en el log (sin el enlace).
 */
@Component
class Correos {

    private static final Log LOG = LogFactory.getLog(Correos.class);

    private final RestClient resend;
    private final String clave;
    private final String remitente;

    Correos(@Value("${regicide.correo.resend-api-key}") String clave,
            @Value("${regicide.correo.remitente}") String remitente) {
        SimpleClientHttpRequestFactory conexion = new SimpleClientHttpRequestFactory();
        conexion.setConnectTimeout(Duration.ofSeconds(5));
        conexion.setReadTimeout(Duration.ofSeconds(10));
        this.resend = RestClient.builder().baseUrl("https://api.resend.com").requestFactory(conexion).build();
        this.clave = clave;
        this.remitente = remitente;
    }

    void enviar(String para, String asunto, String texto) {
        if (clave.isBlank()) {
            LOG.warn("Correo sin enviar, falta RESEND_API_KEY: " + asunto);
            return;
        }
        Thread.startVirtualThread(() -> {
            try {
                resend.post().uri("/emails")
                        .header("Authorization", "Bearer " + clave)
                        .body(Map.of("from", remitente, "to", List.of(para), "subject", asunto, "text", texto))
                        .retrieve()
                        .toBodilessEntity();
            } catch (RuntimeException error) {
                LOG.error("No se ha podido enviar el correo: " + asunto, error);
            }
        });
    }
}
