package com.regicide.juego;

import java.util.List;

/** El estado completo de una partida, para guardarla y retomarla. La posada va en orden, de arriba abajo. */
public record Instantanea(
        List<Carta> mano,
        List<Carta> posada,
        List<Carta> descarte,
        List<Carta> jugadas,
        List<EnemigoGuardado> castillo,
        int comodines,
        Fase fase) {

    public record EnemigoGuardado(Carta carta, int vida, int ataque) {
    }
}
