package com.regicide.partida;

import java.util.List;

/** Las posiciones en la mano de las cartas que el jugador elige. */
record Jugada(List<Integer> cartas) {

    Jugada {
        cartas = cartas == null ? List.of() : cartas;
    }
}
