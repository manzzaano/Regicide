# Regicide Backend

Spring Boot 3 backend para el juego Regicide online.

## Stack

- **Java 17** + **Spring Boot 3.3**
- **Spring Security** + JWT
- **Spring Data JPA** + PostgreSQL
- **Maven**

## Requisitos previos

- Java 17+
- PostgreSQL 12+
- Maven 3.8+

## Instalación local

### 1. Base de datos

```bash
# Crear BD con Docker
docker run --name regicide-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=regicide \
  -p 5432:5432 \
  -d postgres:15

# O instalar PostgreSQL localmente y crear la BD manualmente
psql -U postgres -c "CREATE DATABASE regicide;"
```

### 2. Clonar y compilar

```bash
cd regicide-backend
mvn clean install
```

### 3. Correr la app (desarrollo local)

En desarrollo, usa el profile `local` que tiene defaults seguros:

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
```

O exporta `SPRING_PROFILES_ACTIVE=local` en tu terminal.

**Producción:** inyecta secrets obligatoriamente:

```bash
export DB_HOST=prod-db-host
export DB_USER=prod-user
export DB_PASSWORD=prod-password
export JWT_SECRET=$(openssl rand -base64 64)
mvn spring-boot:run
```

### 4. Generar JWT_SECRET seguro

```bash
# 64 bytes base64 (recomendado para HS512)
openssl rand -base64 64
```

La app estará disponible en `http://localhost:8080/api`

## Endpoints

### Auth

- `POST /api/auth/register` — Registro
- `POST /api/auth/login` — Login (devuelve JWT)

### Partidas

- `POST /api/partidas` — Guardar partida (requiere JWT)
- `GET /api/partidas/me` — Mis partidas (requiere JWT)
- `GET /api/leaderboard` — Ranking global

## Testing

```bash
mvn test
```

## Deploy a Railway

1. Conectar repositorio GitHub
2. Variables de entorno en Railway:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `JWT_SECRET`
   - `CORS_ORIGIN`

Railway detectará automáticamente que es Spring Boot y lo compilará/desplegará.
