package com.regicide.juego;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.List;
import java.util.Random;

/** Una partida en solitario con las reglas del juego. No sabe nada de cómo se muestra. */
public class Partida {

    static final int MANO_MAXIMA = 8;

    private final Random random;
    private final List<Carta> mano = new ArrayList<>();
    private final Deque<Carta> posada = new ArrayDeque<>();
    private final List<Carta> descarte = new ArrayList<>();
    private final List<Carta> jugadas = new ArrayList<>();
    private final Deque<Enemigo> castillo = new ArrayDeque<>();
    private int comodines = 2;
    private Fase fase = Fase.ATAQUE;

    public Partida(Random random) {
        this.random = random;
        List<Carta> numeradas = new ArrayList<>();
        List<Enemigo> sotas = new ArrayList<>();
        List<Enemigo> reinas = new ArrayList<>();
        List<Enemigo> reyes = new ArrayList<>();
        for (Palo palo : Palo.values()) {
            for (int numero = 1; numero <= 10; numero++) {
                numeradas.add(new Carta(numero, palo));
            }
            sotas.add(new Enemigo(new Carta(11, palo)));
            reinas.add(new Enemigo(new Carta(12, palo)));
            reyes.add(new Enemigo(new Carta(13, palo)));
        }
        Collections.shuffle(numeradas, random);
        Collections.shuffle(sotas, random);
        Collections.shuffle(reinas, random);
        Collections.shuffle(reyes, random);

        posada.addAll(numeradas);
        castillo.addAll(sotas);
        castillo.addAll(reinas);
        castillo.addAll(reyes);
        robar(MANO_MAXIMA);
    }

    /** Para los tests: una partida con las cartas colocadas a mano. La primera de la posada es la de arriba. */
    Partida(List<Carta> mano, List<Carta> posada, List<Enemigo> castillo, Random random) {
        this.random = random;
        this.mano.addAll(mano);
        this.posada.addAll(posada);
        this.castillo.addAll(castillo);
    }

    private void robar(int cartas) {
        for (int i = 0; i < cartas && mano.size() < MANO_MAXIMA && !posada.isEmpty(); i++) {
            mano.add(posada.pop());
        }
    }

    public List<Carta> mano() {
        return List.copyOf(mano);
    }

    public Enemigo enemigo() {
        return castillo.peek();
    }

    public List<Enemigo> castillo() {
        return List.copyOf(castillo);
    }

    public List<Carta> cartasJugadas() {
        return List.copyOf(jugadas);
    }

    public int cartasEnPosada() {
        return posada.size();
    }

    public int cartasEnDescarte() {
        return descarte.size();
    }

    public int comodines() {
        return comodines;
    }

    public Fase fase() {
        return fase;
    }
}
