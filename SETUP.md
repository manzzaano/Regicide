# Setup Desarrollo Local — Regicide

## Requisitos previos

- **Java 17+** (testado con Java 21)
- **Docker Desktop** (para PostgreSQL)
- **Node.js 20+** (para Angular)
- **Git**

## 1. Iniciar PostgreSQL

```bash
docker-compose up -d postgres
```

Espera a que esté healthy (~10 segundos):
```bash
docker-compose ps  # Ver status
```

## 2. Backend (Spring Boot)

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

Backend listo en `http://localhost:8080/api`

## 3. Frontend (Angular)

Terminal 2:
```bash
cd frontend
npm install
npm start
```

Frontend listo en `http://localhost:4200`

## 4. Probar endpoints

### Registrar usuario
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ismael",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Respuesta:
```json
{
  "token": "eyJhbGc...",
  "username": "ismael",
  "message": "User registered successfully"
}
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ismael",
    "password": "password123"
  }'
```

### Leaderboard (sin auth)
```bash
curl http://localhost:8080/api/leaderboard
```

### Guardar partida (con JWT)
```bash
curl -X POST http://localhost:8080/api/partidas \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "ganada": true,
    "turnosJugados": 15,
    "cartasJugadas": 42,
    "enemigoActual": 4
  }'
```

## 5. Base de datos

Acceder a PostgreSQL:
```bash
docker exec -it regicide_postgres_1 psql -U postgres -d regicide
```

Ver tablas:
```sql
\dt
SELECT * FROM users;
SELECT * FROM partidas;
```

## Troubleshooting

### "JAVA_HOME not found"
Windows PowerShell:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
```

### "Port 5432 already in use"
```bash
docker-compose down  # Detener BD
docker-compose up -d postgres  # Reiniciar
```

### "npm ERR! code ERESOLVE"
```bash
cd frontend
rm package-lock.json
npm install --legacy-peer-deps
```

## Próximos pasos

1. ✓ Backend compilando y endpoints funcionando
2. → Port lógica de cartas (Baraja, Juego) a TypeScript
3. → Implementar UI del juego con animaciones GSAP
4. → Deploy a Railway (backend) + Vercel (frontend)
