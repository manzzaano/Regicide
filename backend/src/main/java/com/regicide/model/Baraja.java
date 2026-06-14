package com.regicide.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Baraja {
    private List<Carta> cartas;

    public Baraja() {
        this.cartas = new ArrayList<>();
        inicializar();
    }

    private void inicializar() {
        String[] palos = {"Corazones", "Diamantes", "Picas", "Tréboles"};
        for (String palo : palos) {
            for (int i = 1; i <= 13; i++) {
                cartas.add(new Carta(i, palo));
            }
        }
        Collections.shuffle(cartas);
    }

    public List<Carta> getCartas() {
        return cartas;
    }

    public Carta sacar() {
        if (cartas.isEmpty()) return null;
        return cartas.remove(0);
    }
}
