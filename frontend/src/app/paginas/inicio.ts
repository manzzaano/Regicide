import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carta } from '../carta';
import { Sesion } from '../sesion';

/** VistaInicio.fxml de v1: el título, quién juega y los botones, con los tres enemigos del castillo encima. */
@Component({
  selector: 'app-inicio',
  imports: [Carta, RouterLink],
  template: `
    <main class="inicio">
      <div class="abanico" aria-hidden="true">
        <app-carta [carta]="{ numero: 11, palo: 'DIAMANTES' }" />
        <app-carta [carta]="{ numero: 13, palo: 'CORAZONES' }" />
        <app-carta [carta]="{ numero: 12, palo: 'TREBOLES' }" />
      </div>
      <h1 class="titulo">
        <span class="saludo">Bienvenido a</span>
        REGICIDE
        <span class="modo">Modo solitario</span>
      </h1>
      <section class="caja panel">
        @if (sesion.nombre(); as nombre) {
          <p class="jugador"><span class="etiqueta">Jugando como</span><strong>{{ nombre }}</strong></p>
        } @else {
          <p class="jugador"><span class="etiqueta">Jugando como</span><strong>invitado</strong></p>
        }
        <div class="botones">
          <a class="boton claro" routerLink="/reglas">¿Cómo jugar?</a>
          <a class="boton" routerLink="/partida">Jugar</a>
        </div>
        <div class="enlaces">
          <a routerLink="/clasificacion">Estadísticas</a>
          @if (sesion.nombre()) {
            <button type="button" (click)="sesion.salir()">Salir</button>
          } @else {
            <a routerLink="/entrar">Entrar o crear cuenta</a>
          }
        </div>
      </section>
    </main>
  `,
  styles: `
    .inicio {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 100dvh;
      padding: 32px 16px;
    }
    .abanico {
      display: flex;
      justify-content: center;
      height: clamp(120px, 22vh, 190px);
      margin-bottom: 8px;
    }
    .abanico app-carta {
      width: clamp(86px, 15vh, 130px);
      margin-inline: -18px;
      border-radius: 10px;
      box-shadow: 0 18px 40px -12px rgb(0 0 0 / 0.6);
      transform-origin: 50% 120%;
      animation: abrir 900ms var(--curva) backwards;
    }
    .abanico app-carta:nth-child(1) {
      transform: rotate(-14deg);
    }
    .abanico app-carta:nth-child(2) {
      z-index: 1;
      transform: translateY(-14px);
      box-shadow:
        0 0 36px 2px rgb(255 0 0 / 0.4),
        0 18px 40px -12px rgb(0 0 0 / 0.6);
    }
    .abanico app-carta:nth-child(3) {
      transform: rotate(14deg);
    }
    .titulo {
      display: grid;
      gap: 10px;
      padding: 12px 0 20px;
      color: #fff;
      font-size: clamp(56px, 12vw, 120px);
      text-shadow: 0 2px 30px rgb(0 30 30 / 0.45);
    }
    .saludo,
    .modo {
      font-family: var(--mono);
      font-size: clamp(12px, 1.6vw, 15px);
      font-weight: 500;
      letter-spacing: 0.3em;
      text-transform: uppercase;
    }
    .panel {
      display: grid;
      justify-items: center;
      gap: 16px;
      width: min(100%, 360px);
      padding: 20px;
    }
    .jugador {
      display: grid;
      justify-items: center;
      margin: 0;
    }
    .jugador .etiqueta {
      margin: 0;
    }
    .jugador strong {
      font-family: var(--display);
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .botones {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      width: 100%;
    }
    .claro {
      border-color: var(--linea);
      background: #fff;
      color: var(--negro);
    }
    .boton.claro:hover {
      background: #f4f4f5;
    }
    .enlaces {
      display: flex;
      gap: 20px;
      font-size: 14px;
    }
    .enlaces a,
    .enlaces button {
      padding: 0;
      border: 0;
      background: none;
      color: var(--texto-suave);
      text-decoration: underline;
      cursor: pointer;
    }
    .enlaces a:hover,
    .enlaces button:hover {
      color: var(--texto);
    }
    @keyframes abrir {
      from {
        opacity: 0;
        transform: translateY(30px) rotate(0deg);
      }
    }
  `,
})
export class Inicio {
  protected readonly sesion = inject(Sesion);
}
