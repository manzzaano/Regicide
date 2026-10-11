# Regicide · frontend

Angular 18 con componentes standalone y rutas con carga diferida: inicio, partida, reglas y estadísticas. Tailwind CSS 4 (se compila antes de `start` y `build`) y RxStomp para el WebSocket.

- `features/`: una carpeta por pantalla.
- `shared/services/`: conexión WebSocket con la partida, cartas, jugador (nombre y récord en el navegador) y autenticación.
- `shared/ui/` y `shared/animations/`: la carta y sus animaciones.

La URL del backend está en `src/app/environments/`. El arranque está en el [README principal](../README.md).

```bash
npm install
npm start          # http://localhost:4200
npm run build      # build en dist/
```
