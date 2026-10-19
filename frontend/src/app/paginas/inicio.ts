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
      <div class="abanico" aria-hidden="true">
        <app-carta [carta]="{ numero: 11, palo: 'DIAMANTES' }" />
        <app-carta [carta]="{ numero: 13, palo: 'CORAZONES' }" />
        <app-carta [carta]="{ numero: 12, palo: 'TREBOLES' }" />
      </div>

      <p class="terminal"><span>~/regicide $</span> modo solitario</p>
      <h1 class="titulo">REGICIDE<span class="punto">.</span></h1>
      <p class="subtitulo">Derrota a los 12 enemigos del castillo.</p>

      <section class="panel" aria-label="Empezar">
        <p class="jugador">
          <span class="etiqueta">Jugando como</span>
          <strong>{{ sesion.nombre() ?? 'invitado' }}</strong>
        </p>
        <div class="botones">
          <a class="boton" routerLink="/partida">Jugar</a>
          <a class="boton-rojo" routerLink="/reglas">¿Cómo jugar?</a>
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

      <ul class="palos" aria-label="Poderes de los palos">
        <li><span aria-hidden="true">♣</span> daño ×2</li>
        <li><span aria-hidden="true">♦</span> roba</li>
        <li><span aria-hidden="true">♠</span> escudo</li>
        <li><span aria-hidden="true">♥</span> cura</li>
      </ul>
    </main>
  `,
  styles: `
    .inicio {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
      padding: 32px 16px;
      text-align: center;
    }
    .abanico {
      display: flex;
      justify-content: center;
      height: clamp(110px, 20vh, 180px);
      margin-bottom: 20px;
    }
    .abanico app-carta {
      width: clamp(80px, 14vh, 124px);
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
        0 0 40px 4px rgb(239 68 68 / 0.55),
        0 18px 40px -12px rgb(0 0 0 / 0.6);
    }
    .abanico app-carta:nth-child(3) {
      transform: rotate(14deg);
    }
    .terminal {
      margin: 0;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgb(11 11 11 / 0.8);
      color: #d4d4d8;
      font-family: var(--mono);
      font-size: 13px;
    }
    .terminal span {
      color: var(--rojo);
    }
    .titulo {
      padding: 14px 0 6px;
      font-size: clamp(60px, 13vw, 128px);
    }
    .punto {
      color: var(--rojo);
    }
    .subtitulo {
      margin: 0 0 28px;
      color: #fff;
      font-size: clamp(16px, 2vw, 19px);
      font-weight: 500;
      text-shadow: 0 1px 12px rgb(0 30 30 / 0.6);
    }
    /* Oscuro como la barra superior: sobre negro, el rojo se lee bien. */
    .panel {
      display: grid;
      justify-items: center;
      gap: 16px;
      width: min(100%, 380px);
      padding: 20px;
      border: 1px solid rgb(255 255 255 / 0.08);
      border-radius: var(--radio);
      background: rgb(11 11 11 / 0.75);
      box-shadow: 0 24px 60px -20px rgb(0 0 0 / 0.6);
      backdrop-filter: blur(12px) saturate(1.4);
      color: #fafafa;
    }
    .jugador {
      display: grid;
      margin: 0;
    }
    .jugador .etiqueta {
      margin: 0;
      color: #a1a1aa;
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
    .botones a {
      justify-content: center;
      min-height: 42px;
      text-decoration: none;
    }
    .botones .boton {
      border-color: rgb(255 255 255 / 0.14);
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
      color: #a1a1aa;
      text-decoration: underline;
      cursor: pointer;
    }
    .enlaces a:hover,
    .enlaces button:hover {
      color: #fafafa;
    }
    .palos {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
      margin: 24px 0 0;
      padding: 0;
      list-style: none;
    }
    .palos li {
      padding: 4px 10px;
      border: 1px solid rgb(239 68 68 / 0.12);
      border-radius: 3px;
      background: linear-gradient(rgb(239 68 68 / 0.06), rgb(239 68 68 / 0.06)), rgb(11 11 11 / 0.8);
      color: var(--rojo);
      font-family: var(--mono);
      font-size: 12px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
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
