package com.regicide.juego;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Random;

import static com.regicide.juego.Palo.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AtaqueTest {

    // Un rey de Picas aguanta cualquier ataque de estos tests; posada y descarte vacíos para que
    // los poderes de Corazones y Diamantes no muevan cartas.
    private Partida partidaCon(Carta... mano) {
        return new Partida(List.of(mano), List.of(), List.of(), List.of(new Enemigo(new Carta(13, PICAS))), new Random(1));
    }

    @Test
    void unaCartaSola() {
        Partida partida = partidaCon(new Carta(7, CORAZONES), new Carta(3, PICAS));

        partida.atacar(List.of(0));

        assertThat(partida.mano()).containsExactly(new Carta(3, PICAS));
        assertThat(partida.cartasJugadas()).containsExactly(new Carta(7, CORAZONES));
        assertThat(partida.enemigo().vida()).isEqualTo(33);
    }

    @Test
    void variasDelMismoNumeroQueSumanDiezOMenos() {
        Partida partida = partidaCon(new Carta(2, CORAZONES), new Carta(2, PICAS), new Carta(2, DIAMANTES), new Carta(2, TREBOLES));

        partida.atacar(List.of(0, 1, 2, 3));

        assertThat(partida.mano()).isEmpty();
        assertThat(partida.cartasJugadas()).hasSize(4);
    }

    @Test
    void variasDelMismoNumeroQueSumanMasDeDiez() {
        Partida partida = partidaCon(new Carta(4, CORAZONES), new Carta(4, PICAS), new Carta(4, DIAMANTES));

        assertThatThrownBy(() -> partida.atacar(List.of(0, 1, 2))).isInstanceOf(JugadaNoValida.class);
        assertThat(partida.mano()).hasSize(3);
    }

    @Test
    void cartasDeDistintoNumero() {
        Partida partida = partidaCon(new Carta(2, CORAZONES), new Carta(3, PICAS));

        assertThatThrownBy(() -> partida.atacar(List.of(0, 1))).isInstanceOf(JugadaNoValida.class);
    }

    @Test
    void unAsConOtraCarta() {
        Partida partida = partidaCon(new Carta(1, CORAZONES), new Carta(8, PICAS));

        partida.atacar(List.of(0, 1));

        assertThat(partida.enemigo().vida()).isEqualTo(31);
    }

    @Test
    void dosAses() {
        Partida partida = partidaCon(new Carta(1, CORAZONES), new Carta(1, PICAS));

        partida.atacar(List.of(0, 1));

        assertThat(partida.mano()).isEmpty();
    }

    @Test
    void unAsConMasDeUnaCarta() {
        Partida partida = partidaCon(new Carta(1, CORAZONES), new Carta(2, PICAS), new Carta(2, DIAMANTES));

        assertThatThrownBy(() -> partida.atacar(List.of(0, 1, 2))).isInstanceOf(JugadaNoValida.class);
    }

    @Test
    void tresAses() {
        Partida partida = partidaCon(new Carta(1, CORAZONES), new Carta(1, PICAS), new Carta(1, DIAMANTES));

        assertThatThrownBy(() -> partida.atacar(List.of(0, 1, 2))).isInstanceOf(JugadaNoValida.class);
    }

    @Test
    void sinCartas() {
        Partida partida = partidaCon(new Carta(7, CORAZONES));

        assertThatThrownBy(() -> partida.atacar(List.of())).isInstanceOf(JugadaNoValida.class);
    }

    @Test
    void posicionesQueNoEstanEnLaMano() {
        Partida partida = partidaCon(new Carta(7, CORAZONES));

        assertThatThrownBy(() -> partida.atacar(List.of(1))).isInstanceOf(JugadaNoValida.class);
        assertThatThrownBy(() -> partida.atacar(List.of(-1))).isInstanceOf(JugadaNoValida.class);
    }

    @Test
    void laMismaCartaDosVeces() {
        Partida partida = partidaCon(new Carta(1, CORAZONES), new Carta(8, PICAS));

        assertThatThrownBy(() -> partida.atacar(List.of(0, 0))).isInstanceOf(JugadaNoValida.class);
    }

    @Test
    void siElEnemigoSobreviveTocaDefenderse() {
        Partida partida = partidaCon(new Carta(7, CORAZONES), new Carta(3, PICAS));

        partida.atacar(List.of(0));

        assertThat(partida.fase()).isEqualTo(Fase.DEFENSA);
        assertThatThrownBy(() -> partida.atacar(List.of(0))).isInstanceOf(JugadaNoValida.class);
    }
}
