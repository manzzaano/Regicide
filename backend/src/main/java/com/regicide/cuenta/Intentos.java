package com.regicide.cuenta;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * Cuenta los intentos por nombre y por IP en ventanas de 15 minutos, para frenar a quien prueba
 * contraseñas o códigos de recuperación a ciegas.
 * ponytail: en memoria, se pierde al reiniciar y solo vale con un backend; con varios, Redis.
 */
@Component
class Intentos {

    static final int POR_NOMBRE = 10;
    private static final Duration VENTANA = Duration.ofMinutes(15);

    private record Ventana(Instant inicio, int cuenta) {
    }

    private final Map<String, Ventana> ventanas = new ConcurrentHashMap<>();
    private final int porIp;
    private final Supplier<Instant> reloj;

    @Autowired
    Intentos(@Value("${regicide.intentos.por-ip}") int porIp) {
        this(porIp, Instant::now);
    }

    Intentos(int porIp, Supplier<Instant> reloj) {
        this.porIp = porIp;
        this.reloj = reloj;
    }

    boolean agotadosPorNombre(String nombre) {
        return agotados("nombre:" + nombre, POR_NOMBRE);
    }

    boolean agotadosPorIp(String ip) {
        return agotados("ip:" + ip, porIp);
    }

    void fallo(String nombre, String ip) {
        sumar("nombre:" + nombre);
        sumar("ip:" + ip);
    }

    void acierto(String nombre) {
        ventanas.remove("nombre:" + nombre);
    }

    /** Los registros tienen su propia cuenta por IP: crear cuentas no bloquea el login. */
    boolean registrar(String ip) {
        return permitir("registro:" + ip, porIp);
    }

    /** Como mucho 3 enlaces por nombre cada 15 minutos, para no llenar el buzón de nadie. */
    boolean pedirEnlace(String nombre, String ip) {
        return permitir("enlace:" + ip, porIp) & permitir("enlace:" + nombre, 3);
    }

    private boolean permitir(String clave, int limite) {
        if (agotados(clave, limite)) {
            return false;
        }
        sumar(clave);
        return true;
    }

    private boolean agotados(String clave, int limite) {
        Ventana ventana = ventanas.get(clave);
        return ventana != null && !caducada(ventana) && ventana.cuenta() >= limite;
    }

    private void sumar(String clave) {
        // Con muchas claves, se tiran las caducadas para que el mapa no crezca sin fin.
        if (ventanas.size() > 10_000) {
            ventanas.values().removeIf(this::caducada);
        }
        ventanas.compute(clave, (k, ventana) -> ventana == null || caducada(ventana)
                ? new Ventana(reloj.get(), 1)
                : new Ventana(ventana.inicio(), ventana.cuenta() + 1));
    }

    private boolean caducada(Ventana ventana) {
        return ventana.inicio().plus(VENTANA).isBefore(reloj.get());
    }
}
