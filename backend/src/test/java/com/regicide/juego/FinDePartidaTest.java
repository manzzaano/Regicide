package com.regicide.juego;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Random;

import static com.regicide.juego.Palo.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FinDePartidaTest {

    private static Partida partida(List<Carta> mano, int comodines) {
        return new Partida(mano, List.of(), List.of(), List.of(new Enemigo(new Carta(13, CORAZONES))), comodines, new Random(1));
    }

    @Test
    void sinComodinesYSinPoderCubrirElAtaqueSePierde() {
        Partida partida = partida(List.of(new Carta(2, TREBOLES), new Carta(10, PICAS)), 0);
        partida.atacar(List.of(0));

        assertThat(partida.fase()).isEqualTo(Fase.DERROTA);
    }

    @Test
    void conComodinesSeSigueDefendiendo() {
        Partida partida = partida(List.of(new Carta(2, TREBOLES), new Carta(10, PICAS)), 1);
        partida.atacar(List.of(0));

        assertThat(partida.fase()).isEqualTo(Fase.DEFENSA);
    }

    @Test
    void siLosComodinesNoDanCartasSePierde() {
        Partida partida = partida(List.of(new Carta(2, TREBOLES), new Carta(10, PICAS), new Carta(10, DIAMANTES)), 2);
        partida.atacar(List.of(0));
        partida.usarComodin();
        partida.usarComodin();

        assertThat(partida.fase()).isEqualTo(Fase.DERROTA);
    }

    @Test
    void sinCartasNiComodinesCuandoTocaAtacarSePierde() {
        Partida partida = partida(List.of(new Carta(2, TREBOLES), new Carta(10, PICAS), new Carta(10, DIAMANTES)), 0);
        partida.atacar(List.of(0));
        partida.defender(List.of(0, 1));

        assertThat(partida.fase()).isEqualTo(Fase.DERROTA);
    }

    @Test
    void conLaPartidaTerminadaNoSePuedeJugar() {
        Partida partida = partida(List.of(new Carta(2, TREBOLES), new Carta(10, PICAS)), 0);
        partida.atacar(List.of(0));

        assertThatThrownBy(() -> partida.atacar(List.of(0))).isInstanceOf(JugadaNoValida.class);
        assertThatThrownBy(() -> partida.defender(List.of(0))).isInstanceOf(JugadaNoValida.class);
        assertThatThrownBy(partida::usarComodin).isInstanceOf(JugadaNoValida.class);
    }
}
