package com.regicide.juego;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static com.regicide.juego.Palo.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DefensaTest {

    // Tras jugar el 2 de Tréboles contra el rey de Corazones (ataque 20), toca defenderse con el resto.
    private static Partida partidaEnDefensa(Carta... resto) {
        List<Carta> mano = new ArrayList<>(List.of(new Carta(2, TREBOLES)));
        mano.addAll(List.of(resto));
        Partida partida = new Partida(mano, List.of(), List.of(), List.of(new Enemigo(new Carta(13, CORAZONES))), 2, new Random(1));
        partida.atacar(List.of(0));
        return partida;
    }

    @Test
    void seDescartanCartasQueCubrenElAtaque() {
        Partida partida = partidaEnDefensa(new Carta(10, PICAS), new Carta(10, DIAMANTES), new Carta(3, PICAS));

        partida.defender(List.of(0, 1));

        assertThat(partida.mano()).containsExactly(new Carta(3, PICAS));
        assertThat(partida.descarte()).containsExactly(new Carta(10, PICAS), new Carta(10, DIAMANTES));
        assertThat(partida.fase()).isEqualTo(Fase.ATAQUE);
    }

    @Test
    void noSePuedeDescartarMenosDelAtaque() {
        Partida partida = partidaEnDefensa(new Carta(10, PICAS), new Carta(9, DIAMANTES), new Carta(3, PICAS));

        assertThatThrownBy(() -> partida.defender(List.of(0, 1))).isInstanceOf(JugadaNoValida.class);
        assertThat(partida.mano()).hasSize(3);
        assertThat(partida.fase()).isEqualTo(Fase.DEFENSA);
    }

    @Test
    void elAsCuentaUno() {
        Partida partida = partidaEnDefensa(new Carta(10, PICAS), new Carta(9, DIAMANTES), new Carta(1, PICAS));

        assertThatCode(() -> partida.defender(List.of(0, 1, 2))).doesNotThrowAnyException();
    }

    @Test
    void unaFiguraCuentaSuAtaque() {
        Partida partida = partidaEnDefensa(new Carta(13, DIAMANTES), new Carta(3, PICAS));

        assertThatCode(() -> partida.defender(List.of(0))).doesNotThrowAnyException();
    }

    @Test
    void noSePuedeDefenderCuandoTocaAtacar() {
        Partida partida = new Partida(List.of(new Carta(10, PICAS)), List.of(), List.of(),
                List.of(new Enemigo(new Carta(13, CORAZONES))), 2, new Random(1));

        assertThatThrownBy(() -> partida.defender(List.of(0))).isInstanceOf(JugadaNoValida.class);
    }

    @Test
    void lasPicasSeAcumulanContraElMismoEnemigo() {
        Partida partida = new Partida(
                List.of(new Carta(5, PICAS), new Carta(10, DIAMANTES), new Carta(5, TREBOLES), new Carta(3, PICAS), new Carta(9, CORAZONES)),
                List.of(), List.of(), List.of(new Enemigo(new Carta(13, CORAZONES))), 2, new Random(1));

        partida.atacar(List.of(0));
        partida.defender(List.of(0, 1));
        partida.atacar(List.of(0));

        assertThat(partida.enemigo().ataque()).isEqualTo(12);
    }
}
