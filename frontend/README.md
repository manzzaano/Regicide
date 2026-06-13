# Regicide Frontend

Frontend Angular 18 para el juego Regicide online.

## Stack

- **Angular 18**
- **TypeScript 5.5**
- **SCSS**
- **GSAP** para animaciones
- **Standalone Components**

## Instalación

```bash
cd regicide-frontend
npm install
```

## Desarrollo

```bash
npm start
```

Abre `http://localhost:4200/` en el navegador.

## Build

```bash
npm run build
```

Los artefactos compilados se guardan en `dist/`.

## Estructura

```
src/
├── app/
│   ├── features/           # Módulos por funcionalidad
│   │   ├── auth/          # Login y registro
│   │   ├── game/          # Gameplay
│   │   └── leaderboard/   # Ranking
│   ├── shared/            # Servicios, guards, interceptores
│   ├── environments/      # Config por ambiente
│   ├── app.routes.ts      # Routing
│   └── app.config.ts      # Configuración global
├── assets/                # Imágenes, card PNG
└── index.html
```

## Características por implementar

1. **Auth** — Login/registro funcional con JWT
2. **Game** — Componentes de cartas, tablero, lógica
3. **Animaciones** — Flip cards, GSAP para ataques
4. **Leaderboard** — Tabla de top jugadores
5. **Responsive** — Funciona en mobile

## Deploy a Vercel

```bash
vercel
```

O conectar el repo de GitHub directamente a Vercel.
