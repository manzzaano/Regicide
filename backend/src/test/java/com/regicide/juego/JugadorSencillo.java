package com.regicide.juego;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Una estrategia sin pensar para jugar partidas enteras en los tests: ataca con la carta más
 * alta, se defiende con las más altas y usa un comodín cuando no le queda otra.
 */
public final class JugadorSencillo {

    public sealed interface Decision permits Atacar, Defender, UsarComodin {
    }

    public record Atacar(List<Integer> cartas) implements Decision {
    }

    public record Defender(List<Integer> cartas) implements Decision {
    }

    public record UsarComodin() implements Decision {
    }

    private JugadorSencillo() {
    }

    public static Decision decidir(Fase fase, List<Carta> mano, int ataqueEnemigo) {
        if (fase == Fase.ATAQUE) {
            if (mano.isEmpty()) {
                return new UsarComodin();
            }
            Carta mayor = mano.stream().max(Comparator.comparingInt(Carta::valor)).orElseThrow();
            return new Atacar(List.of(mano.indexOf(mayor)));
        }
        List<Carta> ordenadas = new ArrayList<>(mano);
        ordenadas.sort(Comparator.comparingInt(Carta::valor).reversed());
        List<Integer> posiciones = new ArrayList<>();
        int cubierto = 0;
        for (Carta carta : ordenadas) {
            if (cubierto >= ataqueEnemigo) {
                break;
            }
            posiciones.add(mano.indexOf(carta));
            cubierto += carta.valor();
        }
        return cubierto >= ataqueEnemigo ? new Defender(posiciones) : new UsarComodin();
    }
}
