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

    // Tablas y estilos en línea: es lo único que respetan todos los clientes de correo. Los colores
    // son los de la web; el botón lleva el texto oscuro, como el botón principal.
    private static final String MARCO = """
            <!doctype html>
            <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\
            <meta name="color-scheme" content="dark"></head>
            <body style="margin:0;padding:0;background:#070707">
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#070707">\
            <tr><td align="center" style="padding:32px 16px">
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:520px">
            <tr><td style="padding:0 4px 16px;font:800 26px/1 Arial,Helvetica,sans-serif;letter-spacing:-0.5px;color:#fafafa">\
            REGICIDE<span style="color:#ef4444">/</span></td></tr>
            <tr><td style="padding:28px;background:#121212;border:1px solid #27272a;border-top:2px solid #ef4444;\
            border-radius:10px;font:16px/1.6 Arial,Helvetica,sans-serif;color:#d4d4d8">
            %s</td></tr>
            <tr><td style="padding:16px 4px 0;font:12px/1.5 Arial,Helvetica,sans-serif;color:#a1a1aa">%s</td></tr>
            </table></td></tr></table>
            </body></html>
            """;
    private static final String PARRAFO = "<p style=\"margin:0 0 16px\">%s</p>\n";
    private static final String BOTON = """
            <p style="margin:8px 0 12px"><a href="%1$s" style="display:inline-block;padding:13px 24px;background:#ef4444;\
            border-radius:8px;color:#070707;font-weight:bold;text-decoration:none">%2$s</a></p>
            <p style="margin:0 0 20px;font-size:12px;line-height:1.5;color:#a1a1aa;word-break:break-all">%1$s</p>
            """;

    /**
     * La versión HTML del texto: un párrafo por cada línea en blanco, el enlace solo en su párrafo
     * como botón y las demás direcciones como enlaces. Sin botón, el enlace queda como texto.
     */
    static String html(String texto, String enlace, String boton, String pie) {
        StringBuilder cuerpo = new StringBuilder();
        for (String parrafo : texto.split("\n\n")) {
            if (boton != null && parrafo.equals(enlace)) {
                cuerpo.append(BOTON.formatted(escapar(enlace), escapar(boton)));
            } else {
                String enlazado = escapar(parrafo)
                        .replaceAll("https://[^\\s<]+", "<a href=\"$0\" style=\"color:#ef4444\">$0</a>")
                        .replace("\n", "<br>");
                cuerpo.append(PARRAFO.formatted(enlazado));
            }
        }
        return MARCO.formatted(cuerpo, escapar(pie));
    }

    private static String escapar(String texto) {
        return texto.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    void enviar(String para, String asunto, String texto, String html) {
        if (clave.isBlank()) {
            LOG.warn("Correo sin enviar, falta RESEND_API_KEY: " + asunto);
            return;
        }
        Thread.startVirtualThread(() -> {
            try {
                resend.post().uri("/emails")
                        .header("Authorization", "Bearer " + clave)
                        .body(Map.of("from", remitente, "to", List.of(para), "subject", asunto, "text", texto, "html", html))
                        .retrieve()
                        .toBodilessEntity();
            } catch (RuntimeException error) {
                LOG.error("No se ha podido enviar el correo: " + asunto, error);
            }
        });
    }
}
