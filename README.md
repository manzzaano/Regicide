# Regicide — Juego de Cartas Online

Modernización de Regicide (originalmente desarrollado en JavaFX) a un stack web con **Spring Boot** + **Angular**.

Versión original → `legacy/` (código JavaFX de 4 días)

## 🏗 Estructura Monorepo

```
regicide/
├── backend/               Spring Boot 3 + PostgreSQL + JWT
├── frontend/              Angular 18 + SCSS + GSAP
├── legacy/                Código JavaFX original (archivo)
└── README.md
```

## 🚀 Stack

| Capa | Tech |
|------|------|
| Backend | Spring Boot 3, Spring Security, JPA, PostgreSQL |
| Frontend | Angular 18, TypeScript, SCSS, GSAP (animaciones) |
| Auth | JWT |
| Deploy | Railway (backend), Vercel (frontend) |

## 🎮 Características

- **Online solitario** — cada jugador compite por stats globales
- **Leaderboard** — top jugadores por victorias
- **UI espectacular** — animaciones de cartas con GSAP
- **Auth segura** — JWT + Spring Security

## 📖 Desarrollo Local

### Setup BD + Backend

1. **Iniciar PostgreSQL (docker-compose)**
```bash
docker-compose up -d postgres
# Espera a que esté healthy (~10s)
```

2. **Compilar backend**
```bash
cd backend
mvn clean install -DskipTests
```

3. **Correr backend (con profile local)**
```bash
export SPRING_PROFILES_ACTIVE=local
mvn spring-boot:run
```

Backend disponible en `http://localhost:8080/api`

### Frontend

```bash
cd frontend
npm install
npm start
```

Abre http://localhost:4200

**Endpoints para probar:**
- `POST /api/auth/register` — crear usuario
- `POST /api/auth/login` — login
- `GET /api/leaderboard` — ranking (sin auth)

## 📦 Deploy

**Backend** → Railway (free tier con PostgreSQL)
**Frontend** → Vercel

Ver `backend/README.md` y `frontend/README.md` para instrucciones detalladas.
