package com.regicide.juego;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EnemigoTest {

    @Test
    void cadaFiguraTieneSuVidaYSuAtaque() {
        assertThat(new Enemigo(new Carta(11, Palo.PICAS))).extracting(Enemigo::vida, Enemigo::ataque).containsExactly(20, 10);
        assertThat(new Enemigo(new Carta(12, Palo.PICAS))).extracting(Enemigo::vida, Enemigo::ataque).containsExactly(30, 15);
        assertThat(new Enemigo(new Carta(13, Palo.PICAS))).extracting(Enemigo::vida, Enemigo::ataque).containsExactly(40, 20);
    }

    @Test
    void elAtaqueNoBajaDeCero() {
        Enemigo sota = new Enemigo(new Carta(11, Palo.PICAS));
        sota.reducirAtaque(15);
        assertThat(sota.ataque()).isZero();
    }
}
