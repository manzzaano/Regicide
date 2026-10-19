package com.regicide.juego;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Random;

import static com.regicide.juego.Palo.*;
import static org.assertj.core.api.Assertions.assertThat;

class PoderesTest {

    private static Enemigo rey(Palo palo) {
        return new Enemigo(new Carta(13, palo));
    }

    private static Partida partida(List<Carta> mano, List<Carta> posada, List<Carta> descarte, Palo paloDelEnemigo) {
        return new Partida(mano, posada, descarte, List.of(rey(paloDelEnemigo)), 2, new Random(1));
    }

    @Test
    void treboles_doblanElDaño() {
        Partida partida = partida(List.of(new Carta(8, TREBOLES)), List.of(), List.of(), PICAS);

        partida.atacar(List.of(0));

        assertThat(partida.enemigo().vida()).isEqualTo(24);
    }

    @Test
    void picas_bajanElAtaqueDelEnemigo() {
        Partida partida = partida(List.of(new Carta(5, PICAS)), List.of(), List.of(), CORAZONES);

        partida.atacar(List.of(0));

        assertThat(partida.enemigo().ataque()).isEqualTo(15);
    }

    @Test
    void diamantes_robanDeLaPosadaPorArriba() {
        List<Carta> posada = List.of(new Carta(9, TREBOLES), new Carta(2, PICAS), new Carta(6, CORAZONES));
        Partida partida = partida(List.of(new Carta(2, DIAMANTES)), posada, List.of(), PICAS);

        partida.atacar(List.of(0));

        assertThat(partida.mano()).containsExactly(new Carta(9, TREBOLES), new Carta(2, PICAS));
        assertThat(partida.cartasEnPosada()).isEqualTo(1);
    }

    @Test
    void diamantes_noPasanDeOchoCartasEnLaMano() {
        List<Carta> mano = List.of(new Carta(9, DIAMANTES), new Carta(2, PICAS), new Carta(3, PICAS), new Carta(4, PICAS),
                new Carta(5, PICAS), new Carta(6, PICAS), new Carta(7, PICAS), new Carta(8, PICAS));
        List<Carta> posada = List.of(new Carta(2, TREBOLES), new Carta(3, TREBOLES));
        Partida partida = partida(mano, posada, List.of(), CORAZONES);

        partida.atacar(List.of(0));

        assertThat(partida.mano()).hasSize(8);
        assertThat(partida.cartasEnPosada()).isEqualTo(1);
    }

    @Test
    void corazones_devuelvenCartasDelDescarteDebajoDeLaPosada() {
        List<Carta> descarte = List.of(new Carta(2, PICAS), new Carta(3, PICAS), new Carta(4, PICAS));
        Partida partida = partida(List.of(new Carta(2, CORAZONES)), List.of(new Carta(9, TREBOLES)), descarte, PICAS);

        partida.atacar(List.of(0));

        assertThat(partida.cartasEnPosada()).isEqualTo(3);
        assertThat(partida.cartasEnDescarte()).isEqualTo(1);
        assertThat(partida.posada().getFirst()).isEqualTo(new Carta(9, TREBOLES));
    }

    @Test
    void corazones_seResuelvenAntesQueDiamantes() {
        List<Carta> descarte = List.of(new Carta(2, PICAS), new Carta(3, PICAS), new Carta(4, PICAS),
                new Carta(5, PICAS), new Carta(6, PICAS), new Carta(7, PICAS));
        Partida partida = partida(List.of(new Carta(3, CORAZONES), new Carta(3, DIAMANTES)), List.of(), descarte, TREBOLES);

        partida.atacar(List.of(0, 1));

        assertThat(partida.mano()).hasSize(6);
    }

    @Test
    void conUnAsSeAplicanLosDosPalosConElTotal() {
        List<Carta> posada = List.of(new Carta(2, PICAS), new Carta(3, PICAS), new Carta(4, PICAS), new Carta(5, PICAS),
                new Carta(6, PICAS), new Carta(7, PICAS), new Carta(8, PICAS), new Carta(9, PICAS), new Carta(10, PICAS));
        Partida partida = partida(List.of(new Carta(1, TREBOLES), new Carta(8, DIAMANTES)), posada, List.of(), PICAS);

        partida.atacar(List.of(0, 1));

        assertThat(partida.enemigo().vida()).isEqualTo(22);
        assertThat(partida.mano()).hasSize(8);
    }

    @Test
    void elEnemigoEsInmuneASuPalo_tambienATreboles() {
        Partida partida = partida(List.of(new Carta(8, TREBOLES)), List.of(), List.of(), TREBOLES);

        partida.atacar(List.of(0));

        assertThat(partida.enemigo().vida()).isEqualTo(32);
    }

    @Test
    void elEnemigoEsInmuneASuPalo_picas() {
        Partida partida = partida(List.of(new Carta(5, PICAS)), List.of(), List.of(), PICAS);

        partida.atacar(List.of(0));

        assertThat(partida.enemigo().ataque()).isEqualTo(20);
    }

    @Test
    void elEnemigoEsInmuneASuPalo_diamantes() {
        Partida partida = partida(List.of(new Carta(2, DIAMANTES)), List.of(new Carta(9, TREBOLES)), List.of(), DIAMANTES);

        partida.atacar(List.of(0));

        assertThat(partida.mano()).isEmpty();
    }

    @Test
    void elEnemigoEsInmuneASuPalo_corazones() {
        Partida partida = partida(List.of(new Carta(2, CORAZONES)), List.of(), List.of(new Carta(5, PICAS)), CORAZONES);

        partida.atacar(List.of(0));

        assertThat(partida.cartasEnDescarte()).isEqualTo(1);
        assertThat(partida.cartasEnPosada()).isZero();
    }
}
