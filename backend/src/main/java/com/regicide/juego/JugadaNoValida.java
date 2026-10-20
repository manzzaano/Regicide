package com.regicide.juego;

/**
 * Una jugada que las reglas no permiten. El mensaje es la clave del texto para el jugador
 * (messages.properties), para que el motor no dependa del idioma; los argumentos rellenan sus huecos.
 */
public class JugadaNoValida extends RuntimeException {

    private final transient Object[] argumentos;

    public JugadaNoValida(String clave, Object... argumentos) {
        super(clave);
        this.argumentos = argumentos;
    }

    public Object[] argumentos() {
        return argumentos;
    }
}
