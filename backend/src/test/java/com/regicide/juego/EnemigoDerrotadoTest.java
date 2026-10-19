package com.regicide.juego;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Random;

import static com.regicide.juego.Palo.*;
import static org.assertj.core.api.Assertions.assertThat;

class EnemigoDerrotadoTest {

    private static Partida partida(List<Carta> mano, Enemigo... castillo) {
        return new Partida(mano, List.of(), List.of(), List.of(castillo), 2, new Random(1));
    }

    private static Enemigo enemigo(int numero, Palo palo) {
        return new Enemigo(new Carta(numero, palo));
    }

    @Test
    void conLaVidaJustaVaEncimaDeLaPosada() {
        Partida partida = partida(List.of(new Carta(10, TREBOLES)), enemigo(11, PICAS), enemigo(11, CORAZONES));

        partida.atacar(List.of(0));

        assertThat(partida.posada().getFirst()).isEqualTo(new Carta(11, PICAS));
        assertThat(partida.descarte()).containsExactly(new Carta(10, TREBOLES));
        assertThat(partida.cartasJugadas()).isEmpty();
    }

    @Test
    void conDañoDeSobraVaAlDescarteDespuesDeLasCartasJugadas() {
        Partida partida = partida(List.of(new Carta(1, TREBOLES), new Carta(10, DIAMANTES)), enemigo(11, PICAS), enemigo(11, CORAZONES));

        partida.atacar(List.of(0, 1));

        assertThat(partida.descarte()).containsExactly(new Carta(1, TREBOLES), new Carta(10, DIAMANTES), new Carta(11, PICAS));
        assertThat(partida.cartasEnPosada()).isZero();
    }

    @Test
    void saleElSiguienteEnemigoYSeVuelveAAtacar() {
        Partida partida = partida(List.of(new Carta(10, TREBOLES), new Carta(5, PICAS)), enemigo(11, PICAS), enemigo(12, CORAZONES));

        partida.atacar(List.of(0));

        assertThat(partida.enemigo().carta()).isEqualTo(new Carta(12, CORAZONES));
        assertThat(partida.enemigo().vida()).isEqualTo(30);
        assertThat(partida.fase()).isEqualTo(Fase.ATAQUE);
    }

    @Test
    void alDerrotarAlUltimoReySeGana() {
        Partida partida = partida(List.of(new Carta(10, TREBOLES), new Carta(5, PICAS)), enemigo(11, PICAS));

        partida.atacar(List.of(0));

        assertThat(partida.fase()).isEqualTo(Fase.VICTORIA);
        assertThat(partida.enemigo()).isNull();
    }

    @Test
    void siLasPicasDejanSuAtaqueEnCeroNoHayQueDefenderse() {
        Partida partida = partida(List.of(new Carta(10, PICAS), new Carta(5, CORAZONES)), enemigo(11, CORAZONES));

        partida.atacar(List.of(0));

        assertThat(partida.enemigo().ataque()).isZero();
        assertThat(partida.fase()).isEqualTo(Fase.ATAQUE);
    }
}
