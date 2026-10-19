package com.regicide.juego;

/** Una figura del castillo. Las picas le bajan el ataque hasta que se le derrota. */
public class Enemigo {

    private final Carta carta;
    private int vida;
    private int ataque;

    Enemigo(Carta carta) {
        this.carta = carta;
        this.vida = switch (carta.numero()) {
            case 11 -> 20;
            case 12 -> 30;
            case 13 -> 40;
            default -> throw new IllegalArgumentException("Solo las figuras son enemigos: " + carta);
        };
        this.ataque = carta.valor();
    }

    public Carta carta() {
        return carta;
    }

    public int vida() {
        return vida;
    }

    public int ataque() {
        return ataque;
    }

    void restarVida(int puntos) {
        vida -= puntos;
    }

    void reducirAtaque(int puntos) {
        ataque = Math.max(0, ataque - puntos);
    }
}
