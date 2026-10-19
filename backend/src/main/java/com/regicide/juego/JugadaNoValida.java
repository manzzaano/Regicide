package com.regicide.juego;

/** Una jugada que las reglas no permiten. El mensaje se le enseña al jugador. */
public class JugadaNoValida extends RuntimeException {

    public JugadaNoValida(String mensaje) {
        super(mensaje);
    }
}
