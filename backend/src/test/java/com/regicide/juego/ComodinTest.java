package com.regicide.juego;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static com.regicide.juego.Palo.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ComodinTest {

    private static List<Carta> posadaDe(int cartas) {
        List<Carta> posada = new ArrayList<>();
        for (int numero = 1; posada.size() < cartas; numero++) {
            posada.add(new Carta(numero, TREBOLES));
            posada.add(new Carta(numero, DIAMANTES));
        }
        return posada.subList(0, cartas);
    }

    private static Partida partida(List<Carta> mano, List<Carta> posada) {
        return new Partida(mano, posada, List.of(), List.of(new Enemigo(new Carta(13, CORAZONES))), 2, new Random(1));
    }

    @Test
    void descartaLaManoYRobaOcho() {
        Partida partida = partida(List.of(new Carta(2, PICAS), new Carta(3, PICAS)), posadaDe(10));

        partida.usarComodin();

        assertThat(partida.mano()).hasSize(8).doesNotContain(new Carta(2, PICAS), new Carta(3, PICAS));
        assertThat(partida.descarte()).containsExactly(new Carta(2, PICAS), new Carta(3, PICAS));
        assertThat(partida.comodines()).isEqualTo(1);
    }

    @Test
    void sePuedeUsarAntesDeDefenderse() {
        Partida partida = partida(List.of(new Carta(2, PICAS), new Carta(3, PICAS)), posadaDe(10));
        partida.atacar(List.of(0));

        partida.usarComodin();

        assertThat(partida.fase()).isEqualTo(Fase.DEFENSA);
        assertThat(partida.mano()).hasSize(8);
    }

    @Test
    void soloHayDos() {
        Partida partida = partida(List.of(new Carta(2, PICAS)), posadaDe(20));
        partida.usarComodin();
        partida.usarComodin();

        assertThatThrownBy(partida::usarComodin).isInstanceOf(JugadaNoValida.class);
    }
}
