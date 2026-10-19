package com.regicide.juego;

/** Una jugada que las reglas no permiten. El mensaje se le enseña al jugador. */
public class JugadaNoValida extends RuntimeException {

    JugadaNoValida(String mensaje) {
        super(mensaje);
    }
}
