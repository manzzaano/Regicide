package com.regicide;

import tools.jackson.databind.json.JsonMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.UUID;

/** Llamadas a la API REST desde los tests. */
public class ClienteHttp {

    public record Respuesta(int estado, String cuerpo) {

        @SuppressWarnings("unchecked")
        public Map<String, Object> json() {
            return JSON.readValue(cuerpo, Map.class);
        }

        public String campo(String nombre) {
            return (String) json().get(nombre);
        }
    }

    private static final JsonMapper JSON = new JsonMapper();

    private final HttpClient http = HttpClient.newHttpClient();
    private final String base;

    public ClienteHttp(int puerto) {
        this.base = "http://localhost:" + puerto;
    }

    public Respuesta post(String ruta, String json) throws Exception {
        return post(ruta, json, null);
    }

    public Respuesta post(String ruta, String json, String token) throws Exception {
        HttpRequest.Builder peticion = HttpRequest.newBuilder(URI.create(base + ruta))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json));
        if (token != null) {
            peticion.header("Authorization", "Bearer " + token);
        }
        return enviar(peticion.build());
    }

    public Respuesta get(String ruta, String token) throws Exception {
        HttpRequest.Builder peticion = HttpRequest.newBuilder(URI.create(base + ruta)).GET();
        if (token != null) {
            peticion.header("Authorization", "Bearer " + token);
        }
        return enviar(peticion.build());
    }

    public static final String CONTRASENA = "una frase de paso bastante larga";

    public record Jugador(String nombre, String token) {
    }

    /** Registra un jugador con un nombre que no se repite entre tests. */
    public Jugador registrarJugadorNuevo() throws Exception {
        String nombre = "j" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        Respuesta respuesta = post("/api/auth/register",
                "{\"nombre\":\"" + nombre + "\",\"contrasena\":\"" + CONTRASENA + "\"}");
        return new Jugador(nombre, respuesta.campo("token"));
    }

    private Respuesta enviar(HttpRequest peticion) throws Exception {
        HttpResponse<String> respuesta = http.send(peticion, HttpResponse.BodyHandlers.ofString());
        return new Respuesta(respuesta.statusCode(), respuesta.body());
    }
}
