# Regicide

Juego de cartas Regicide en el navegador. Empezó como mi proyecto final de Programación en JavaFX y lo estoy llevando a la web: el servidor, en Spring Boot, resuelve cada jugada; Angular la muestra y WebSocket la sincroniza en tiempo real.

Caso de estudio: [leosoftware.dev/sistemas/regicide](https://leosoftware.dev/sistemas/regicide). La versión de JavaFX que entregué está en la rama [`javafx`](https://github.com/manzzaano/Regicide/tree/javafx).

## Cómo funciona

- **La partida vive en el servidor.** El navegador envía la jugada y el servidor la valida, la resuelve y devuelve el estado nuevo. Las reglas están en un solo sitio (`backend/src/main/java/com/regicide/game/RegicideGame.java`) y no se puede hacer trampa desde el cliente.
- **Cada turno es una máquina de estados:** atacar, defenderse y fin de partida. Los palos tienen sus poderes, que no funcionan contra un enemigo del mismo palo, y hay dos comodines para cambiar la mano.
- **Tiempo real con WebSocket y STOMP:** la conexión queda abierta y el estado llega al momento.
- **Interfaz en Angular 18:** inicio con el nombre del jugador y su récord personal (guardado en el navegador), partida, reglas y estadísticas, con animaciones de cartas.
- **El backend incluye cuentas con JWT y Spring Security** y guarda partidas en PostgreSQL, con una clasificación por victorias.

## Estado

Funciona en local con Docker: la partida completa contra el servidor, el récord personal y las reglas.

Pendiente para la versión web completa:

- Guardar en el servidor las partidas jugadas desde la interfaz nueva (hoy la clasificación solo recibe partidas por `POST /api/partidas`, con sesión iniciada).
- El endpoint `/api/stats` que usa la pantalla de estadísticas.
- Desplegar el backend y apuntar el frontend publicado a esa URL.

## Stack

| | |
|---|---|
| Backend | Java 17, Spring Boot 3.3, Spring Security + JWT, Spring Data JPA, WebSocket (STOMP) |
| Base de datos | PostgreSQL 16 |
| Frontend | Angular 18 (componentes standalone, rutas con carga diferida), Tailwind CSS 4, RxStomp |
| Infraestructura | Docker Compose: PostgreSQL, backend y frontend servido con nginx |

## Estructura

```
regicide/
├── backend/     Spring Boot: reglas del juego, WebSocket, autenticación y partidas
├── frontend/    Angular: inicio, partida, reglas y estadísticas
└── legacy/      la versión original en JavaFX
```

## En local

Requisitos: Docker. Para trabajar fuera de Docker: Java 17 o superior y Node.js 20 o superior.

```bash
cp .env.example .env     # DB_USER, DB_PASSWORD, DB_NAME y JWT_SECRET
docker compose up --build
```

- Frontend: <http://localhost>
- Backend: <http://localhost:3000/api> (WebSocket en `ws://localhost:3000/api/ws/game`)

Para desarrollar el frontend con recarga en caliente, con el backend levantado en Docker:

```bash
cd frontend
npm install
npm start                # http://localhost:4200
```

## API

| Método | Ruta | |
|---|---|---|
| `POST` | `/api/auth/register` | Crear usuario |
| `POST` | `/api/auth/login` | Iniciar sesión, devuelve el JWT |
| `GET` | `/api/leaderboard` | Clasificación (sin autenticación) |
| `POST` | `/api/partidas` | Guardar una partida terminada (con sesión) |
| `GET` | `/api/partidas/me` | Mis partidas (con sesión) |

Por WebSocket, el cliente envía a `/app/game/start`, `/app/game/play`, `/app/game/state` y `/app/game/finish`, y recibe el estado de la partida en `/topic/game`.

## Versión original

La rama [`javafx`](https://github.com/manzzaano/Regicide/tree/javafx) conserva el proyecto tal como lo entregué: juego de escritorio en JavaFX 23, con guardado y carga de partidas en JSON y estadísticas en CSV, hecho en cuatro días. El mismo código está también en `legacy/` en la rama principal.

---

Hecho por [Ismael Manzano León](https://leosoftware.dev).
