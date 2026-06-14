package com.regicide.model;

import lombok.Getter;
import java.util.ArrayList;
import java.util.List;

@Getter
public class Juego {
    private List<Carta> mano;
    private List<Carta> castillo;
    private Baraja baraja;

    public Juego(Baraja baraja) {
        this.baraja = baraja;
        this.mano = new ArrayList<>();
        this.castillo = new ArrayList<>();
        iniciar();
    }

    private void iniciar() {
        // Repartir 8 cartas iniciales
        for (int i = 0; i < 8; i++) {
            Carta c = baraja.sacar();
            if (c != null && c.getNumero() <= 10) {
                mano.add(c);
            }
        }
    }
}
