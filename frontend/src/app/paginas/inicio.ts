import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carta } from '../carta';
import { Sesion } from '../sesion';

/** VistaInicio.fxml de v1 (título, quién juega y los botones) con la portada de leosoftware.dev. */
@Component({
  selector: 'app-inicio',
  imports: [Carta, RouterLink],
  template: `
    <main class="inicio">
      <img class="castillo" src="castillo.svg" alt="" width="900" height="600" />

      <div class="portada">
        <div class="abanico" aria-hidden="true">
          <app-carta [carta]="{ numero: 11, palo: 'DIAMANTES' }" />
          <app-carta [carta]="{ numero: 13, palo: 'CORAZONES' }" />
          <app-carta [carta]="{ numero: 12, palo: 'TREBOLES' }" />
        </div>
        <p class="terminal"><span>~/regicide $</span> modo solitario</p>
        <h1 class="titulo">REGICIDE<span class="punto">.</span></h1>
        <p class="subtitulo">Derrota a los 12 enemigos del castillo.</p>
        <ul class="palos" aria-label="Poderes de los palos">
          <li><span aria-hidden="true">♣</span> daño ×2</li>
          <li><span aria-hidden="true">♦</span> roba</li>
          <li><span aria-hidden="true">♠</span> escudo</li>
          <li><span aria-hidden="true">♥</span> cura</li>
        </ul>
      </div>

      <section class="panel" aria-labelledby="titulo-panel">
        <h2 class="etiqueta" id="titulo-panel">Jugando como</h2>
        <p class="jugador">{{ sesion.nombre() ?? 'invitado' }}</p>
        <div class="botones">
          <a class="boton-principal" routerLink="/partida">Jugar</a>
          <a class="boton" routerLink="/reglas">¿Cómo jugar?</a>
        </div>
        <nav class="enlaces" aria-label="Más">
          <a routerLink="/clasificacion">Estadísticas <span aria-hidden="true">→</span></a>
          @if (sesion.nombre()) {
            <button type="button" (click)="sesion.salir()">Salir <span aria-hidden="true">→</span></button>
          } @else {
            <a routerLink="/entrar">Entrar o crear cuenta <span aria-hidden="true">→</span></a>
          }
        </nav>
      </section>
    </main>
  `,
  styles: `
    /* Todo se mide en em sobre un tamaño base que crece con el ancho y el alto de la pantalla:
       unos 16px en un portátil de 1366×768, 21px en 1920×1080 y el tope de 24px en 2560×1440. */
    .inicio {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr) clamp(300px, 22em, 520px);
      align-items: center;
      gap: clamp(32px, 4vw, 96px);
      max-width: 1760px;
      min-height: 100dvh;
      margin: 0 auto;
      padding: clamp(32px, 5vh, 72px) clamp(20px, 5vw, 96px);
      font-size: clamp(15px, calc(0.55vw + 0.6vh + 4px), 24px);
    }
    /* Fondo: sube en diagonal desde el centro de la pantalla hasta la esquina de arriba a la izquierda. */
    .castillo {
      position: fixed;
      top: 0;
      left: 0;
      z-index: -1;
      width: max(72vw, 110vh);
      height: auto;
      pointer-events: none;
      animation: alzarse 1200ms var(--curva) backwards;
    }
    .portada {
      display: grid;
      justify-items: start;
    }
    .abanico {
      display: flex;
      height: 8.6em;
      margin: 0 0 1.2em 1em;
    }
    .abanico app-carta {
      width: 6em;
      margin-inline: -0.95em;
      border-radius: 0.5em;
      box-shadow: 0 1em 2em -0.6em rgb(0 0 0 / 0.8);
      transform-origin: 50% 120%;
      animation: abrir 900ms var(--curva) backwards;
    }
    .abanico app-carta:nth-child(1) {
      transform: rotate(-14deg);
    }
    .abanico app-carta:nth-child(2) {
      z-index: 1;
      transform: translateY(-0.7em);
      box-shadow:
        0 0 2em 0.2em rgb(239 68 68 / 0.55),
        0 1em 2em -0.6em rgb(0 0 0 / 0.8);
    }
    .abanico app-carta:nth-child(3) {
      transform: rotate(14deg);
    }
    .terminal {
      margin: 0;
      padding: 0.3em 0.9em;
      border: 1px solid var(--linea);
      border-radius: 999px;
      background: var(--caja);
      color: var(--texto-suave);
      font-family: var(--mono);
      font-size: 0.7em;
    }
    .terminal span {
      color: var(--rojo);
    }
    .titulo {
      padding: 0.12em 0 0.06em;
      font-size: min(7.5em, 10.5vw);
      text-align: left;
    }
    .punto {
      color: var(--rojo);
    }
    .subtitulo {
      margin: 0 0 1.3em;
      color: var(--texto-suave);
      font-size: 1.1em;
    }
    .palos {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4em;
      margin: 0;
      padding: 0;
      font-size: 0.66em;
      list-style: none;
    }
    .palos li {
      padding: 0.35em 0.85em;
      border: 1px solid rgb(239 68 68 / 0.12);
      border-radius: 3px;
      background: rgb(239 68 68 / 0.06);
      color: var(--rojo);
      font-family: var(--mono);
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .panel {
      display: grid;
      gap: 1em;
      padding: 1.4em;
      border: 1px solid var(--borde-caja);
      border-radius: 0.7em;
      background: rgb(18 18 18 / 0.85);
      box-shadow: var(--sombra);
      backdrop-filter: blur(12px);
    }
    .panel .etiqueta {
      margin: 0 0 -0.6em;
      font-size: 0.6em;
    }
    .jugador {
      margin: 0;
      font-family: var(--display);
      font-size: 1.5em;
      font-weight: 700;
      letter-spacing: -0.02em;
      overflow-wrap: anywhere;
    }
    .botones {
      display: grid;
      gap: 0.5em;
    }
    .botones a {
      min-height: 2.9em;
      font-size: 0.85em;
    }
    .enlaces {
      display: grid;
      border-top: 1px solid var(--linea);
    }
    .enlaces a,
    .enlaces button {
      display: flex;
      justify-content: space-between;
      padding: 0.75em 0;
      border: 0;
      border-bottom: 1px solid var(--linea);
      background: none;
      color: var(--texto-suave);
      font-size: 0.8em;
      text-align: left;
      text-decoration: none;
      cursor: pointer;
      transition: color 150ms;
    }
    .enlaces :last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }
    .enlaces a:hover,
    .enlaces button:hover {
      color: var(--texto);
    }
    .enlaces span {
      transition: transform 150ms var(--curva);
    }
    .enlaces a:hover span,
    .enlaces button:hover span {
      transform: translateX(3px);
    }
    @media (max-width: 860px) {
      .inicio {
        grid-template-columns: 1fr;
      }
      .titulo {
        font-size: min(7.5em, 20vw);
      }
    }
    @keyframes abrir {
      from {
        opacity: 0;
        transform: translateY(30px) rotate(0deg);
      }
    }
    @keyframes alzarse {
      from {
        opacity: 0;
        transform: translateY(24px);
      }
    }
  `,
})
export class Inicio {
  protected readonly sesion = inject(Sesion);
}
