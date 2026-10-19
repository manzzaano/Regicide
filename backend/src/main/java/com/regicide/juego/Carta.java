package com.regicide.juego;

/** Una carta de la baraja francesa: del 1 (as) al 10, y 11, 12 y 13 para sota, reina y rey. */
public record Carta(int numero, Palo palo) {

    public Carta {
        if (numero < 1 || numero > 13) {
            throw new IllegalArgumentException("Número de carta fuera de rango: " + numero);
        }
    }

    public int valor() {
        return switch (numero) {
            case 11 -> 10;
            case 12 -> 15;
            case 13 -> 20;
            default -> numero;
        };
    }

    public boolean esCompanero() {
        return numero == 1;
    }
}
