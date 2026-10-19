# Regicide

Juego de cartas Regicide en modo solitario. Empezó como mi proyecto final de Programación en DAM, hecho en JavaFX, y lo llevo a la web: las reglas en un servidor Spring Boot, la partida en tiempo real por WebSocket y una interfaz en Angular.

La versión JavaFX que entregué está en la rama [`v1`](https://github.com/manzzaano/Regicide/tree/v1).

## Estado

La migración va por fases y cada una llega a `master` con un pull request. El plan, las decisiones y el estado de cada fase están en [docs/migracion-a-la-web.md](docs/migracion-a-la-web.md).

En `master` está el motor del juego: todas las reglas en Java, sin dependencias de interfaz, con tests de cada regla y partidas completas jugadas desde los tests.

## Cómo se juega

El objetivo es derrotar a los 12 enemigos del castillo: 4 sotas (vida 20, ataque 10), 4 reinas (vida 30, ataque 15) y 4 reyes (vida 40, ataque 20).

- **Atacar:** juegas una carta, de 2 a 4 cartas del mismo número que sumen 10 como máximo, o un as junto a una única carta.
- **Poderes de los palos:** Corazones devuelve cartas del descarte debajo de la posada, Diamantes roba cartas, Picas baja el ataque del enemigo y Tréboles dobla el daño. Ningún poder funciona contra un enemigo de su mismo palo.
- **Defenderse:** si el enemigo sobrevive, descartas cartas que sumen al menos su ataque.
- **Comodines:** dos por partida. Cada uno descarta la mano y roba 8 cartas, antes de atacar o antes de defenderte.
- **Final:** ganas al derrotar al último rey. Pierdes si, sin comodines, no puedes atacar o no puedes cubrir un ataque.

Si derrotas a un enemigo con la vida justa, pasa encima de la posada y lo puedes robar como carta.

## Cómo ejecutar los tests

Requisitos: JDK 21.

```bash
cd backend
./mvnw test
```

## Estructura

```
regicide/
├── backend/   Spring Boot; el motor del juego está en com.regicide.juego
└── docs/      caso de estudio de la migración
```

---

Hecho por [Ismael Manzano León](https://leosoftware.dev).
