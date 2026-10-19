package com.regicide.juego;

import org.junit.jupiter.api.Test;

import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;

class RepartoTest {

    private final Partida partida = new Partida(new Random(42));

    @Test
    void laManoEmpiezaConOchoCartasNumeradas() {
        assertThat(partida.mano()).hasSize(8).allMatch(carta -> carta.numero() <= 10);
    }

    @Test
    void elRestoDeCartasNumeradasFormaLaPosada() {
        assertThat(partida.cartasEnPosada()).isEqualTo(32);
        assertThat(partida.cartasEnDescarte()).isZero();
        assertThat(partida.cartasJugadas()).isEmpty();
    }

    @Test
    void elCastilloTieneLasSotasPrimeroYLosReyesAlFinal() {
        assertThat(partida.castillo()).extracting(enemigo -> enemigo.carta().numero())
                .containsExactly(11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13);
    }

    @Test
    void elPrimerEnemigoEsUnaSotaConVidaYAtaqueCompletos() {
        Enemigo sota = partida.enemigo();
        assertThat(sota.carta().numero()).isEqualTo(11);
        assertThat(sota.vida()).isEqualTo(20);
        assertThat(sota.ataque()).isEqualTo(10);
    }

    @Test
    void sePuedeEmpezarAtacandoConDosComodines() {
        assertThat(partida.fase()).isEqualTo(Fase.ATAQUE);
        assertThat(partida.comodines()).isEqualTo(2);
    }

    @Test
    void laMismaSemillaReparteLasMismasCartas() {
        Partida otra = new Partida(new Random(42));
        assertThat(otra.mano()).isEqualTo(partida.mano());
        assertThat(otra.castillo()).extracting(Enemigo::carta)
                .isEqualTo(partida.castillo().stream().map(Enemigo::carta).toList());
    }
}
