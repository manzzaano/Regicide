package com.regicide.juego;

import com.regicide.juego.JugadorSencillo.Atacar;
import com.regicide.juego.JugadorSencillo.Defender;
import com.regicide.juego.JugadorSencillo.UsarComodin;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;

/** Juega partidas enteras y comprueba que terminan sin perder ninguna carta. */
class PartidaCompletaTest {

    @ParameterizedTest
    @ValueSource(longs = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20})
    void unaPartidaTerminaYLas52CartasSiguenEnJuego(long semilla) {
        Partida partida = new Partida(new Random(semilla));

        for (int turno = 0; turno < 500 && !terminada(partida); turno++) {
            int ataque = partida.fase() == Fase.DEFENSA ? partida.enemigo().ataque() : 0;
            switch (JugadorSencillo.decidir(partida.fase(), partida.mano(), ataque)) {
                case Atacar atacar -> partida.atacar(atacar.cartas());
                case Defender defender -> partida.defender(defender.cartas());
                case UsarComodin ignorada -> partida.usarComodin();
            }
            assertThat(cartasEnJuego(partida)).isEqualTo(52);
        }

        assertThat(terminada(partida)).isTrue();
    }

    private static boolean terminada(Partida partida) {
        return partida.fase() == Fase.VICTORIA || partida.fase() == Fase.DERROTA;
    }

    private static int cartasEnJuego(Partida partida) {
        return partida.mano().size() + partida.cartasEnPosada() + partida.cartasEnDescarte()
                + partida.cartasJugadas().size() + partida.castillo().size();
    }
}
