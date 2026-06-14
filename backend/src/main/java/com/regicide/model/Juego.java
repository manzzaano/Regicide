package com.regicide.model;

import lombok.Getter;
import java.util.*;

@Getter
public class Juego {
    private List<Carta> mano;
    private List<Carta> castillo; // Queue de enemigos (J, Q, K)
    private List<Carta> mazoPosada; // Tavern deck
    private List<Carta> mazoCartasJugadas; // Cards played this turn
    private List<Carta> mazoCartasDescartadas; // Discard pile
    private Baraja baraja;

    public Juego(Baraja baraja) {
        this.baraja = baraja;
        this.mano = new ArrayList<>();
        this.castillo = new ArrayList<>();
        this.mazoPosada = new ArrayList<>();
        this.mazoCartasJugadas = new ArrayList<>();
        this.mazoCartasDescartadas = new ArrayList<>();
        iniciar();
    }

    private void iniciar() {
        List<Carta> allCards = baraja.getCartas();
        Collections.shuffle(allCards);

        // Repartir 8 cartas de 1-10 a la mano
        for (Carta c : allCards) {
            if (mano.size() < 8 && c.getNumero() <= 10) {
                mano.add(new Carta(c.getNumero(), c.getPalo()));
            }
        }

        // Separar J, Q, K al castillo (12 cartas)
        List<Carta> jacks = new ArrayList<>();
        List<Carta> queens = new ArrayList<>();
        List<Carta> kings = new ArrayList<>();

        for (Carta c : allCards) {
            if (c.getNumero() == 11) jacks.add(c);
            else if (c.getNumero() == 12) queens.add(c);
            else if (c.getNumero() == 13) kings.add(c);
        }

        Collections.shuffle(jacks);
        Collections.shuffle(queens);
        Collections.shuffle(kings);

        castillo.addAll(jacks);
        castillo.addAll(queens);
        castillo.addAll(kings);

        // Resto a la posada
        for (Carta c : allCards) {
            if ((c.getNumero() > 10 || c.getNumero() > mano.size()) &&
                !castillo.contains(c)) {
                mazoPosada.add(c);
            }
        }
    }
}
