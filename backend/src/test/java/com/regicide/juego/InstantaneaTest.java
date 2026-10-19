package com.regicide.juego;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;

class InstantaneaTest {

    @Test
    void unaPartidaReconstruidaEsIgualALaOriginal() {
        Partida original = new Partida(new Random(7));
        original.atacar(List.of(0));
        if (original.fase() == Fase.DEFENSA) {
            original.usarComodin();
        }

        Partida reconstruida = Partida.desde(original.instantanea(), new Random(1));

        assertThat(reconstruida.instantanea()).isEqualTo(original.instantanea());
        assertThat(reconstruida.fase()).isEqualTo(original.fase());
        assertThat(reconstruida.enemigo().vida()).isEqualTo(original.enemigo().vida());
        assertThat(reconstruida.enemigo().ataque()).isEqualTo(original.enemigo().ataque());
    }

    @Test
    void laInstantaneaGuardaElOrdenDeLaPosada() {
        List<Carta> posada = List.of(new Carta(9, Palo.TREBOLES), new Carta(2, Palo.PICAS));
        Partida partida = new Partida(List.of(new Carta(5, Palo.PICAS)), posada, List.of(),
                List.of(new Enemigo(new Carta(13, Palo.CORAZONES))), 2, new Random(1));

        assertThat(partida.instantanea().posada()).isEqualTo(posada);
    }

    @Test
    void laPartidaReconstruidaSigueJugandose() {
        Partida original = new Partida(new Random(7));
        Partida reconstruida = Partida.desde(original.instantanea(), new Random(1));

        reconstruida.atacar(List.of(0));
        original.atacar(List.of(0));

        assertThat(reconstruida.enemigo().vida()).isEqualTo(original.enemigo().vida());
        assertThat(reconstruida.mano()).isEqualTo(original.mano());
    }
}
