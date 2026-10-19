# Regicide

Juego de cartas Regicide en modo solitario. Empezó como mi proyecto final de Programación en DAM, hecho en JavaFX, y lo llevo a la web: las reglas en un servidor Spring Boot, la partida en tiempo real por WebSocket y una interfaz en Angular.

La versión JavaFX que entregué está en la rama [`v1`](https://github.com/manzzaano/Regicide/tree/v1).

## Estado

La migración va por fases y cada una llega a `master` con un pull request. El plan, las decisiones y el estado de cada fase están en [docs/migracion-a-la-web.md](docs/migracion-a-la-web.md).

En `master` está el backend: el motor del juego, con todas las reglas en Java y tests de cada una; la partida por WebSocket con STOMP, en la que cada jugador recibe solo su estado; y las cuentas con JWT, la clasificación y las partidas a medias guardadas en PostgreSQL.

## Cómo se juega

El objetivo es derrotar a los 12 enemigos del castillo: 4 sotas (vida 20, ataque 10), 4 reinas (vida 30, ataque 15) y 4 reyes (vida 40, ataque 20).

- **Atacar:** juegas una carta, de 2 a 4 cartas del mismo número que sumen 10 como máximo, o un as junto a una única carta.
- **Poderes de los palos:** Corazones devuelve cartas del descarte debajo de la posada, Diamantes roba cartas, Picas baja el ataque del enemigo y Tréboles dobla el daño. Ningún poder funciona contra un enemigo de su mismo palo.
- **Defenderse:** si el enemigo sobrevive, descartas cartas que sumen al menos su ataque.
- **Comodines:** dos por partida. Cada uno descarta la mano y roba 8 cartas, antes de atacar o antes de defenderte.
- **Final:** ganas al derrotar al último rey. Pierdes si, sin comodines, no puedes atacar o no puedes cubrir un ataque.

Si derrotas a un enemigo con la vida justa, pasa encima de la posada y lo puedes robar como carta.

## Cómo ejecutarlo

Requisitos: JDK 21 y Docker (los tests levantan su propio PostgreSQL con Testcontainers).

```bash
cd backend
./mvnw test
```

Para arrancar el servidor hace falta un PostgreSQL y un secreto de al menos 32 caracteres para firmar los tokens; sin ellos no arranca:

```bash
docker run -d --name regicide-db -p 5432:5432 -e POSTGRES_DB=regicide -e POSTGRES_USER=regicide -e POSTGRES_PASSWORD=regicide postgres:18-alpine

export DB_URL=jdbc:postgresql://localhost:5432/regicide DB_USER=regicide DB_PASSWORD=regicide
export JWT_SECRET=un-secreto-largo-de-al-menos-32-caracteres
./mvnw spring-boot:run   # http://localhost:8080, WebSocket en ws://localhost:8080/ws
```

La API REST tiene `POST /api/auth/register` y `POST /api/auth/login` (`{"nombre", "contrasena"}`, responden `{"token"}`), `GET /api/leaderboard` (pública) y `GET /api/games/me` (con `Authorization: Bearer <token>`).

Por WebSocket, el cliente envía sus jugadas a `/app/partida/empezar`, `atacar`, `defender`, `comodin`, `abandonar` y `retomar` (`atacar` y `defender` llevan `{"cartas": [posiciones en la mano]}`), y recibe el estado de su partida en `/user/queue/partida` y los errores en `/user/queue/errores`. Para jugar con cuenta, el token va en la cabecera `Authorization` del CONNECT; sin ella se juega como invitado y la partida no se guarda.

## Estructura

```
regicide/
├── backend/   Spring Boot: el motor del juego (com.regicide.juego), las cuentas (com.regicide.cuenta) y la partida por WebSocket (com.regicide.partida)
└── docs/      caso de estudio de la migración
```

---

Hecho por [Ismael Manzano León](https://leosoftware.dev).
