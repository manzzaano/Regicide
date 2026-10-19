package com.regicide.juego;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;

/** Juega partidas enteras con una estrategia sencilla y comprueba que terminan sin perder ninguna carta. */
class PartidaCompletaTest {

    @ParameterizedTest
    @ValueSource(longs = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20})
    void unaPartidaTerminaYLas52CartasSiguenEnJuego(long semilla) {
        Partida partida = new Partida(new Random(semilla));

        for (int turno = 0; turno < 500 && !terminada(partida); turno++) {
            jugarTurno(partida);
            assertThat(cartasEnJuego(partida)).isEqualTo(52);
        }

        assertThat(terminada(partida)).isTrue();
    }

    private static void jugarTurno(Partida partida) {
        List<Carta> mano = partida.mano();
        if (partida.fase() == Fase.ATAQUE) {
            if (mano.isEmpty()) {
                partida.usarComodin();
            } else {
                Carta mayor = mano.stream().max(Comparator.comparingInt(Carta::valor)).orElseThrow();
                partida.atacar(List.of(mano.indexOf(mayor)));
            }
            return;
        }
        List<Integer> descarte = cartasParaCubrir(mano, partida.enemigo().ataque());
        if (descarte == null) {
            partida.usarComodin();
        } else {
            partida.defender(descarte);
        }
    }

    // De mayor a menor hasta cubrir el ataque; null si la mano entera no llega.
    private static List<Integer> cartasParaCubrir(List<Carta> mano, int ataque) {
        List<Carta> ordenadas = new ArrayList<>(mano);
        ordenadas.sort(Comparator.comparingInt(Carta::valor).reversed());
        List<Integer> posiciones = new ArrayList<>();
        int cubierto = 0;
        for (Carta carta : ordenadas) {
            if (cubierto >= ataque) {
                break;
            }
            posiciones.add(mano.indexOf(carta));
            cubierto += carta.valor();
        }
        return cubierto >= ataque ? posiciones : null;
    }

    private static boolean terminada(Partida partida) {
        return partida.fase() == Fase.VICTORIA || partida.fase() == Fase.DERROTA;
    }

    private static int cartasEnJuego(Partida partida) {
        return partida.mano().size() + partida.cartasEnPosada() + partida.cartasEnDescarte()
                + partida.cartasJugadas().size() + partida.castillo().size();
    }
}
