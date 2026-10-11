# Regicide · backend

Spring Boot 3.3 con Java 17: reglas del juego, WebSocket (STOMP), autenticación con JWT y partidas en PostgreSQL.

- `game/`: `RegicideGame` (reglas y fases del turno) y `GameSessionManager` (una partida por sesión WebSocket).
- `controller/`: `GameWebSocketController` (`/app/game/*` → `/topic/game`), `AuthController` (`/auth`) y `PartidaController` (partidas y clasificación).
- `security/`: filtro y proveedor de JWT, configuración de Spring Security.

La configuración de producción está en `application-prod.properties` y lee `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` y `JWT_EXPIRATION_MS`. El arranque y la API están en el [README principal](../README.md).

```bash
./mvnw -DskipTests package     # genera target/regicide-backend-1.0.0.jar (requiere JDK 17+)
```
