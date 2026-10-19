# Regicide · versión 1 (JavaFX)

Juego de cartas Regicide en modo solitario, hecho en Java con JavaFX como proyecto final del módulo de Programación de DAM. Esta rama conserva el código tal como lo entregué; la versión web parte de aquí.

## Cómo se juega

Se juega con una baraja francesa de 52 cartas (Picas, Corazones, Tréboles y Diamantes) y el objetivo es derrotar a los 12 enemigos del castillo.

- **El castillo:** las 4 jotas (vida 20, ataque 10), después las 4 reinas (vida 30, ataque 15) y por último los 4 reyes (vida 40, ataque 20), barajados dentro de cada grupo.
- **La mano:** empiezas con 8 cartas del 1 al 10. El resto forma la posada, de donde se roba.
- **Atacar:** juegas una carta, varias del mismo número y distinto palo que sumen 10 como máximo, o un as (el compañero, que vale 1) junto a otra carta.
- **Poderes de los palos:** Tréboles duplica el daño, Picas reduce el ataque del enemigo, Diamantes roba cartas de la posada y Corazones devuelve cartas del descarte a la posada. Picas, Diamantes y Corazones no funcionan contra un enemigo de su mismo palo.
- **Defenderse:** si el enemigo sobrevive, te ataca y descartas cartas de la mano hasta cubrir su ataque.
- **Comodines:** hay dos. Cada uno descarta la mano entera y roba 8 cartas nuevas.
- **Final:** ganas al derrotar al último rey. Pierdes si, sin comodines, te quedas sin cartas o no puedes cubrir un ataque.

Si dejas a un enemigo con la vida justa a 0, pasa a la posada y lo puedes robar como carta.

## Guardado y estadísticas

- **Partidas en JSON** con Gson: cada partida se guarda en `src/main/resources/PartidasGuardadas/partida_<n>.json` y se puede cargar desde la pantalla de juego.
- **Estadísticas en CSV** en `src/main/resources/estadisticas.csv`: número de partida, fecha, cartas jugadas, vida restante del enemigo, mano y resultado.

Las rutas son relativas, así que el juego se arranca desde la raíz del proyecto.

## Cómo ejecutarlo

Requisitos: JDK 17 o superior. JavaFX 23 y Gson los descarga Maven.

```bash
./mvnw javafx:run        # en Windows: mvnw.cmd javafx:run
```

También se abre desde IntelliJ IDEA, que es el IDE con el que lo desarrollé.

## Estructura

Sigue el patrón MVC:

```
src/main/java/
├── Controlador/   Main, ControladorInicio (nombre del jugador y reglas) y ControladorJuego (turnos, ataque, defensa y comodines)
├── Modelo/        Juego (estado de la partida), Baraja (reparto inicial) y las cartas: CartaPueblo y CartaEnemigo
└── Utilidades/    Guardado (JSON y CSV) y CartaDeserializable (Gson)
src/main/resources/
├── Vistas/        pantallas en FXML y sus hojas de estilo
└── imgs/          imágenes de las cartas
```

## Estado

Es la versión que entregué, sin cambios en el código. La migración a la web, con Spring Boot en el servidor y Angular en el navegador, se desarrolla en `master` a partir de esta versión.

---

Hecho por [Ismael Manzano León](https://leosoftware.dev).
