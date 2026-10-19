package com.regicide.partida;

import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import tools.jackson.databind.json.JsonMapper;

import java.lang.reflect.Type;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

/** Un jugador de prueba: se conecta por STOMP y guarda lo que el servidor le envía. */
class ClienteStomp implements AutoCloseable {

    private static final JsonMapper JSON = new JsonMapper();

    private final StompSession sesion;
    private final BlockingQueue<byte[]> estados = new LinkedBlockingQueue<>();
    private final BlockingQueue<byte[]> errores = new LinkedBlockingQueue<>();

    ClienteStomp(int puerto) throws Exception {
        this(puerto, null);
    }

    /** Con token, el jugador se identifica en el CONNECT; sin él, entra como invitado. */
    ClienteStomp(int puerto, String token) throws Exception {
        StompHeaders conexion = new StompHeaders();
        if (token != null) {
            conexion.add("Authorization", "Bearer " + token);
        }
        WebSocketStompClient cliente = new WebSocketStompClient(new StandardWebSocketClient());
        sesion = cliente.connectAsync("ws://localhost:" + puerto + "/ws", new WebSocketHttpHeaders(), conexion,
                        new StompSessionHandlerAdapter() { })
                .get(5, TimeUnit.SECONDS);
        suscribir("/user/queue/partida", estados);
        suscribir("/user/queue/errores", errores);
    }

    // El servidor procesa los mensajes de cada sesión en orden, así que la suscripción
    // siempre llega antes que la primera acción.
    private void suscribir(String destino, BlockingQueue<byte[]> cola) {
        sesion.subscribe(destino, new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return byte[].class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                cola.add((byte[]) payload);
            }
        });
    }

    void enviar(String accion) {
        sesion.send("/app/partida/" + accion, new byte[0]);
    }

    void enviar(String accion, String json) {
        StompHeaders headers = new StompHeaders();
        headers.setDestination("/app/partida/" + accion);
        headers.setContentType(MimeTypeUtils.APPLICATION_JSON);
        sesion.send(headers, json.getBytes());
    }

    EstadoPartida estado() throws InterruptedException {
        return JSON.readValue(siguiente(estados), EstadoPartida.class);
    }

    @SuppressWarnings("unchecked")
    Map<String, Object> estadoEnBruto() throws InterruptedException {
        return JSON.readValue(siguiente(estados), Map.class);
    }

    String error() throws InterruptedException {
        return JSON.readValue(siguiente(errores), MensajeDeError.class).mensaje();
    }

    boolean sinMensajes() throws InterruptedException {
        return estados.poll(500, TimeUnit.MILLISECONDS) == null && errores.isEmpty();
    }

    private static byte[] siguiente(BlockingQueue<byte[]> cola) throws InterruptedException {
        byte[] mensaje = cola.poll(5, TimeUnit.SECONDS);
        if (mensaje == null) {
            throw new AssertionError("El servidor no ha respondido");
        }
        return mensaje;
    }

    @Override
    public void close() {
        sesion.disconnect();
    }
}
