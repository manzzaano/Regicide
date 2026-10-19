package com.regicide.partida;

import com.regicide.juego.Carta;
import com.regicide.juego.Enemigo;
import com.regicide.juego.Fase;
import com.regicide.juego.Partida;

import java.util.List;

/**
 * Lo que el jugador puede ver de su partida. De la posada y el descarte solo se envía cuántas
 * cartas hay, para que el navegador no pueda saber qué carta viene.
 */
record EstadoPartida(
        Fase fase,
        List<Carta> mano,
        EnemigoVisible enemigo,
        int enemigosRestantes,
        int cartasEnPosada,
        int cartasEnDescarte,
        List<Carta> cartasJugadas,
        int comodines) {

    record EnemigoVisible(Carta carta, int vida, int ataque) {
    }

    static EstadoPartida de(Partida partida) {
        Enemigo enemigo = partida.enemigo();
        return new EstadoPartida(
                partida.fase(),
                partida.mano(),
                enemigo == null ? null : new EnemigoVisible(enemigo.carta(), enemigo.vida(), enemigo.ataque()),
                partida.castillo().size(),
                partida.cartasEnPosada(),
                partida.cartasEnDescarte(),
                partida.cartasJugadas(),
                partida.comodines());
    }
}
