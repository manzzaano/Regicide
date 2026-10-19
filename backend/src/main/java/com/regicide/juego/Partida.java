package com.regicide.juego;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

/** Una partida en solitario con las reglas del juego. No sabe nada de cómo se muestra. */
public class Partida {

    static final int MANO_MAXIMA = 8;

    private final Random random;
    private final List<Carta> mano = new ArrayList<>();
    private final Deque<Carta> posada = new ArrayDeque<>();
    private final List<Carta> descarte = new ArrayList<>();
    private final List<Carta> jugadas = new ArrayList<>();
    private final Deque<Enemigo> castillo = new ArrayDeque<>();
    private int comodines = 2;
    private Fase fase = Fase.ATAQUE;

    public Partida(Random random) {
        this.random = random;
        List<Carta> numeradas = new ArrayList<>();
        List<Enemigo> sotas = new ArrayList<>();
        List<Enemigo> reinas = new ArrayList<>();
        List<Enemigo> reyes = new ArrayList<>();
        for (Palo palo : Palo.values()) {
            for (int numero = 1; numero <= 10; numero++) {
                numeradas.add(new Carta(numero, palo));
            }
            sotas.add(new Enemigo(new Carta(11, palo)));
            reinas.add(new Enemigo(new Carta(12, palo)));
            reyes.add(new Enemigo(new Carta(13, palo)));
        }
        Collections.shuffle(numeradas, random);
        Collections.shuffle(sotas, random);
        Collections.shuffle(reinas, random);
        Collections.shuffle(reyes, random);

        posada.addAll(numeradas);
        castillo.addAll(sotas);
        castillo.addAll(reinas);
        castillo.addAll(reyes);
        robar(MANO_MAXIMA);
    }

    /** Para los tests: una partida con las cartas colocadas a mano. La primera de la posada es la de arriba. */
    Partida(List<Carta> mano, List<Carta> posada, List<Carta> descarte, List<Enemigo> castillo, int comodines, Random random) {
        this.random = random;
        this.comodines = comodines;
        this.mano.addAll(mano);
        this.posada.addAll(posada);
        this.descarte.addAll(descarte);
        this.castillo.addAll(castillo);
    }

    /** Paso 1 a 3: juega las cartas de esas posiciones de la mano contra el enemigo. */
    public void atacar(List<Integer> posiciones) {
        exigirFase(Fase.ATAQUE);
        List<Carta> cartas = cartasEn(posiciones);
        validarCombinacion(cartas);

        mano.removeAll(cartas);
        jugadas.addAll(cartas);
        int total = cartas.stream().mapToInt(Carta::valor).sum();
        Enemigo enemigo = enemigo();
        Set<Palo> poderes = EnumSet.noneOf(Palo.class);
        cartas.forEach(carta -> poderes.add(carta.palo()));
        poderes.remove(enemigo.carta().palo());

        // Corazones antes que Diamantes: así se pueden robar las cartas recién curadas.
        if (poderes.contains(Palo.CORAZONES)) {
            curar(total);
        }
        if (poderes.contains(Palo.DIAMANTES)) {
            robar(total);
        }
        if (poderes.contains(Palo.PICAS)) {
            enemigo.reducirAtaque(total);
        }
        int daño = poderes.contains(Palo.TREBOLES) ? total * 2 : total;
        enemigo.restarVida(daño);

        if (enemigo.vida() <= 0) {
            derrotar(enemigo);
        } else {
            fase = enemigo.ataque() > 0 ? Fase.DEFENSA : Fase.ATAQUE;
        }
        comprobarDerrota();
    }

    // Con la vida justa, el enemigo se une a la posada y se puede robar como una carta más.
    private void derrotar(Enemigo enemigo) {
        castillo.poll();
        descarte.addAll(jugadas);
        jugadas.clear();
        if (enemigo.vida() == 0) {
            posada.addFirst(enemigo.carta());
        } else {
            descarte.add(enemigo.carta());
        }
        fase = castillo.isEmpty() ? Fase.VICTORIA : Fase.ATAQUE;
    }

    private void curar(int cartas) {
        Collections.shuffle(descarte, random);
        for (int i = 0; i < cartas && !descarte.isEmpty(); i++) {
            posada.addLast(descarte.removeLast());
        }
    }

    /** Paso 4: descarta cartas de la mano que sumen al menos el ataque del enemigo. */
    public void defender(List<Integer> posiciones) {
        exigirFase(Fase.DEFENSA);
        List<Carta> cartas = cartasEn(posiciones);
        int ataque = enemigo().ataque();
        if (cartas.stream().mapToInt(Carta::valor).sum() < ataque) {
            throw new JugadaNoValida("Tienes que descartar al menos " + ataque + " puntos");
        }
        mano.removeAll(cartas);
        descarte.addAll(cartas);
        fase = Fase.ATAQUE;
        comprobarDerrota();
    }

    /** Al empezar el paso 1 o el paso 4: descarta la mano entera y roba hasta 8 cartas. */
    public void usarComodin() {
        if (fase != Fase.ATAQUE && fase != Fase.DEFENSA) {
            throw new JugadaNoValida("La partida ha terminado");
        }
        if (comodines == 0) {
            throw new JugadaNoValida("No te quedan comodines");
        }
        comodines--;
        descarte.addAll(mano);
        mano.clear();
        robar(MANO_MAXIMA);
        comprobarDerrota();
    }

    // Mientras quede un comodín, el jugador todavía puede cambiar la mano.
    private void comprobarDerrota() {
        if (comodines > 0) {
            return;
        }
        boolean sinCartasParaAtacar = fase == Fase.ATAQUE && mano.isEmpty();
        boolean sinCartasParaDefenderse = fase == Fase.DEFENSA
                && mano.stream().mapToInt(Carta::valor).sum() < enemigo().ataque();
        if (sinCartasParaAtacar || sinCartasParaDefenderse) {
            fase = Fase.DERROTA;
        }
    }

    private void exigirFase(Fase esperada) {
        if (fase == Fase.VICTORIA || fase == Fase.DERROTA) {
            throw new JugadaNoValida("La partida ha terminado");
        }
        if (fase != esperada) {
            throw new JugadaNoValida("Ahora no toca " + (esperada == Fase.ATAQUE ? "atacar" : "defenderse"));
        }
    }

    private List<Carta> cartasEn(List<Integer> posiciones) {
        if (posiciones.isEmpty()) {
            throw new JugadaNoValida("Elige al menos una carta");
        }
        if (new HashSet<>(posiciones).size() != posiciones.size()) {
            throw new JugadaNoValida("No puedes elegir la misma carta dos veces");
        }
        List<Carta> cartas = new ArrayList<>();
        for (int posicion : posiciones) {
            if (posicion < 0 || posicion >= mano.size()) {
                throw new JugadaNoValida("Esa carta no está en tu mano");
            }
            cartas.add(mano.get(posicion));
        }
        return cartas;
    }

    // Una carta sola; un as junto a una única carta (puede ser otro as); o de 2 a 4 cartas
    // del mismo número que sumen 10 como máximo.
    private static void validarCombinacion(List<Carta> cartas) {
        if (cartas.size() == 1) {
            return;
        }
        if (cartas.stream().anyMatch(Carta::esCompanero)) {
            if (cartas.size() > 2) {
                throw new JugadaNoValida("El as solo se puede jugar con una carta más");
            }
            return;
        }
        boolean mismoNumero = cartas.stream().map(Carta::numero).distinct().count() == 1;
        int total = cartas.stream().mapToInt(Carta::valor).sum();
        if (!mismoNumero || total > 10) {
            throw new JugadaNoValida("Solo puedes combinar cartas del mismo número que sumen 10 o menos");
        }
    }

    private void robar(int cartas) {
        for (int i = 0; i < cartas && mano.size() < MANO_MAXIMA && !posada.isEmpty(); i++) {
            mano.add(posada.pop());
        }
    }

    public List<Carta> mano() {
        return List.copyOf(mano);
    }

    public Enemigo enemigo() {
        return castillo.peek();
    }

    public List<Enemigo> castillo() {
        return List.copyOf(castillo);
    }

    public List<Carta> cartasJugadas() {
        return List.copyOf(jugadas);
    }

    List<Carta> posada() {
        return List.copyOf(posada);
    }

    public int cartasEnPosada() {
        return posada.size();
    }

    List<Carta> descarte() {
        return List.copyOf(descarte);
    }

    public int cartasEnDescarte() {
        return descarte.size();
    }

    public int comodines() {
        return comodines;
    }

    public Fase fase() {
        return fase;
    }
}
