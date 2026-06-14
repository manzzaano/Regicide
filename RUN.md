# Regicide Online - Cómo Correr

## Requisitos

- Java 17+ (testado con JDK 21)
- Node.js 20+
- Docker + docker-compose
- Git

## 1. Base de datos

```bash
cd C:\Users\Ismael\Desktop\regicide
docker-compose up -d postgres
```

Espera ~10s hasta que PostgreSQL esté healthy:
```bash
docker-compose ps
```

## 2. Backend (Spring Boot + WebSocket)

Terminal 1:
```bash
cd backend

# Windows
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:SPRING_PROFILES_ACTIVE = "local"
.\mvnw.cmd spring-boot:run

# macOS/Linux
export SPRING_PROFILES_ACTIVE=local
./mvnw spring-boot:run
```

Backend listo en:
- REST API: `http://localhost:8080/api`
- WebSocket: `ws://localhost:8080/ws/game`

## 3. Frontend (Angular)

Terminal 2:
```bash
cd frontend

npm install   # Instala @stomp/ng2-stompjs y otras deps
npm start     # ng serve en http://localhost:4200
```

## 4. Jugar

1. Abre http://localhost:4200 en el navegador
2. Ve a `/juego` (debería redirigir automáticamente)
3. Verás:
   - 🟢/🔴 indicador de conexión WebSocket
   - Botón "Iniciar Juego"
   - Tu mano de cartas (después de iniciar)
   - Enemigo actual con HP y daño

## Arquitectura WebSocket

### Backend → Frontend

```
/topic/game  ← GameState (JSON)
{
  gameId: string,
  phase: "ATTACK" | "DEFENSE" | "GAME_OVER",
  hand: [1, 2, 3, ...],
  enemyHP: 20,
  currentDamage: 15,
  turnCount: 5,
  cardsPlayed: 12,
  gameWon: true/false,
  message: string,
  error: string | null
}
```

### Frontend → Backend

```
/app/game/start       → Inicia nueva partida
/app/game/play        → Juega carta (cardIndex)
/app/game/state       → Pide estado actual
/app/game/finish      → Termina partida
```

## Troubleshooting

### "Cannot find module @stomp/ng2-stompjs"
```bash
cd frontend
npm install
```

### Backend no responde
```bash
# Ver logs
Get-Content backend/spring-boot.log -Tail 20
```

### Conexión WebSocket roja
- ¿Backend está corriendo?
- ¿Firewall bloquea puerto 8080?
- Abre DevTools (F12) → Network → WS para debug

## Próximos pasos

1. ✓ Backend WebSocket + game engine
2. ✓ Frontend Angular WebSocket client
3. → Implementar lógica completa de juego en Java
4. → Animaciones GSAP (flip card, ataque, etc.)
5. → Auth con JWT (actualmente bloqueada)
6. → Deploy Railway (backend) + Vercel (frontend)
