package com.regicide.juego;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CartaTest {

    @Test
    void lasCartasNumeradasValenSuNumero() {
        assertThat(new Carta(1, Palo.PICAS).valor()).isEqualTo(1);
        assertThat(new Carta(7, Palo.CORAZONES).valor()).isEqualTo(7);
        assertThat(new Carta(10, Palo.TREBOLES).valor()).isEqualTo(10);
    }

    // Una figura solo llega a la mano si se derrota con la vida justa y se roba de la posada.
    @Test
    void lasFigurasValenSuAtaqueComoEnemigo() {
        assertThat(new Carta(11, Palo.DIAMANTES).valor()).isEqualTo(10);
        assertThat(new Carta(12, Palo.DIAMANTES).valor()).isEqualTo(15);
        assertThat(new Carta(13, Palo.DIAMANTES).valor()).isEqualTo(20);
    }

    @Test
    void elAsEsElCompaneroAnimal() {
        assertThat(new Carta(1, Palo.PICAS).esCompanero()).isTrue();
        assertThat(new Carta(2, Palo.PICAS).esCompanero()).isFalse();
    }

    @Test
    void noExistenCartasFueraDelUnoAlTrece() {
        assertThatThrownBy(() -> new Carta(0, Palo.PICAS)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Carta(14, Palo.PICAS)).isInstanceOf(IllegalArgumentException.class);
    }
}
