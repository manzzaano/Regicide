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

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

BD: PostgreSQL en Docker
```bash
docker run --name regicide-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=regicide -p 5432:5432 -d postgres:15
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Abre http://localhost:4200

## 📦 Deploy

**Backend** → Railway (free tier con PostgreSQL)
**Frontend** → Vercel

Ver `backend/README.md` y `frontend/README.md` para instrucciones detalladas.
