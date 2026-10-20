# Regicide

Juego de cartas Regicide en modo solitario. Empezó como mi proyecto final de Programación en DAM, hecho en JavaFX, y lo llevo a la web: las reglas en un servidor Spring Boot, la partida en tiempo real por WebSocket y una interfaz en Angular.

**Jugar:** [regicide.leosoftware.dev](https://regicide.leosoftware.dev)

La versión JavaFX que entregué está en la rama [`v1`](https://github.com/manzzaano/Regicide/tree/v1).

## Estado

La migración está terminada: las seis fases llegaron a `master` con un pull request cada una. El plan, las decisiones y el resultado de cada fase están en [docs/migracion-a-la-web.md](docs/migracion-a-la-web.md).

El backend tiene el motor del juego, con todas las reglas en Java y tests de cada una; la partida por WebSocket con STOMP, en la que cada jugador recibe solo su estado; y las cuentas con JWT, la clasificación y las partidas a medias guardadas en PostgreSQL. El frontend, en Angular, pinta la partida que le manda el servidor y tiene las pantallas de reglas, estadísticas y entrar. Todo se levanta con Docker Compose, cada cambio pasa por GitHub Actions y la web publicada corre en una máquina gratuita de Oracle Cloud con Caddy para el HTTPS.

## Cómo se juega

El objetivo es derrotar a los 12 enemigos del castillo: 4 sotas (vida 20, ataque 10), 4 reinas (vida 30, ataque 15) y 4 reyes (vida 40, ataque 20).

- **Atacar:** juegas una carta, de 2 a 4 cartas del mismo número que sumen 10 como máximo, o un as junto a una única carta.
- **Poderes de los palos:** Corazones devuelve cartas del descarte debajo de la posada, Diamantes roba cartas, Picas baja el ataque del enemigo y Tréboles dobla el daño. Ningún poder funciona contra un enemigo de su mismo palo.
- **Defenderse:** si el enemigo sobrevive, descartas cartas que sumen al menos su ataque.
- **Comodines:** dos por partida. Cada uno descarta la mano y roba 8 cartas, antes de atacar o antes de defenderte.
- **Final:** ganas al derrotar al último rey. Pierdes si, sin comodines, no puedes atacar o no puedes cubrir un ataque.

Si derrotas a un enemigo con la vida justa, pasa encima de la posada y lo puedes robar como carta.

## Cómo ejecutarlo

Con Docker, todo de una vez:

```bash
cp .env.example .env      # cambia la contraseña y el secreto
docker compose up --build  # http://localhost:8081
```

En el servidor, con el dominio en `DOMINIO` dentro de `.env` y los puertos 80 y 443 abiertos, el mismo Compose se arranca junto a `docker-compose.prod.yml`, que añade Caddy para el HTTPS:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Para desarrollar, cada parte por separado. Requisitos: JDK 21, Node 22.22 o superior y Docker (los tests del backend levantan su propio PostgreSQL con Testcontainers).

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

La base de datos trae seis jugadores de ejemplo (migración `V3`) para que la clasificación no salga vacía; la API los marca con `"simulado": true` y no se puede entrar con sus cuentas.

Por WebSocket, el cliente envía sus jugadas a `/app/partida/empezar`, `atacar`, `defender`, `comodin`, `abandonar` y `retomar` (`atacar` y `defender` llevan `{"cartas": [posiciones en la mano]}`), y recibe el estado de su partida en `/user/queue/partida` y los errores en `/user/queue/errores`. Para jugar con cuenta, el token va en la cabecera `Authorization` del CONNECT; sin ella se juega como invitado y la partida no se guarda.

Con el backend en marcha, el frontend se arranca en otra terminal:

```bash
cd frontend
npm install
npm test -- --watch=false   # tests con Vitest
npx ng serve                # http://localhost:4200, redirige /api y /ws al backend en :8080
```

## Estructura

```
regicide/
├── backend/   Spring Boot: el motor del juego (com.regicide.juego), las cuentas (com.regicide.cuenta) y la partida por WebSocket (com.regicide.partida)
├── frontend/  Angular: las pantallas y la conexión STOMP; no calcula ninguna regla
├── .github/   CI con GitHub Actions y Dependabot
└── docs/      caso de estudio de la migración
```

---

Hecho por [Ismael Manzano León](https://leosoftware.dev).
