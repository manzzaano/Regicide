import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carta } from '../carta';
import { Idioma } from '../idioma';
import { Sesion } from '../sesion';

const es = {
  modo: 'modo solitario',
  subtitulo:
    'Derrota a los 12 enemigos del castillo: cuatro sotas, cuatro reinas y cuatro reyes. Ataca con las cartas de tu mano, aprovecha el poder de cada palo y aguanta sus golpes descartando. Tienes dos comodines para salir de un apuro.',
  poderes: 'Poderes de los palos',
  palos: [
    { simbolo: '♣', nombre: 'Tréboles', efecto: 'Doble de daño', rojo: false },
    { simbolo: '♦', nombre: 'Diamantes', efecto: 'Robas cartas', rojo: true },
    { simbolo: '♠', nombre: 'Picas', efecto: 'Baja su ataque', rojo: false },
    { simbolo: '♥', nombre: 'Corazones', efecto: 'Recuperas cartas', rojo: true },
  ],
  invitado: 'Invitado',
  conCuenta: 'Cuenta · partida guardada',
  sinCuenta: 'Invitado · sin guardar',
  jugar: 'Jugar',
  reglas: '¿Cómo jugar?',
  estadisticas: 'Estadísticas',
  cuenta: 'Tu cuenta',
  salir: 'Salir',
  guarda: 'Guarda tu partida y entra en la clasificación.',
  entrar: 'Entrar o crear cuenta',
  privacidad: 'Privacidad · sin cookies',
  otroIdioma: 'English',
};
const en: typeof es = {
  modo: 'solo mode',
  subtitulo:
    'Defeat the 12 enemies in the castle: four jacks, four queens and four kings. Attack with the cards in your hand, use the power of each suit and take their hits by discarding. You have two jokers to get out of a tight spot.',
  poderes: 'Suit powers',
  palos: [
    { simbolo: '♣', nombre: 'Clubs', efecto: 'Double damage', rojo: false },
    { simbolo: '♦', nombre: 'Diamonds', efecto: 'Draw cards', rojo: true },
    { simbolo: '♠', nombre: 'Spades', efecto: 'Lower its attack', rojo: false },
    { simbolo: '♥', nombre: 'Hearts', efecto: 'Recover cards', rojo: true },
  ],
  invitado: 'Guest',
  conCuenta: 'Account · game saved',
  sinCuenta: 'Guest · not saved',
  jugar: 'Play',
  reglas: 'How to play',
  estadisticas: 'Stats',
  cuenta: 'Your account',
  salir: 'Sign out',
  guarda: 'Save your game and get on the leaderboard.',
  entrar: 'Sign in or create an account',
  privacidad: 'Privacy · no cookies',
  otroIdioma: 'Español',
};

/** VistaInicio.fxml de v1 (título, quién juega y los botones) con la portada de leosoftware.dev. */
@Component({
  selector: 'app-inicio',
  imports: [Carta, RouterLink],
  template: `
    <main class="inicio">
      <img class="fondo-castillo" src="castillo.svg" alt="" width="1000" height="1000" />

      <div class="portada">
        <div class="abanico" aria-hidden="true">
          <app-carta [carta]="{ numero: 11, palo: 'DIAMANTES' }" />
          <app-carta [carta]="{ numero: 13, palo: 'CORAZONES' }" />
          <app-carta [carta]="{ numero: 12, palo: 'TREBOLES' }" />
        </div>
        <p class="terminal"><span>~/regicide $</span> {{ t().modo }}</p>
        <h1 class="titulo">REGICIDE<span class="punto">/</span></h1>
        <p class="subtitulo">{{ t().subtitulo }}</p>
<ul class="palos" [attr.aria-label]="t().poderes">
          @for (palo of t().palos; track palo.simbolo) {
            <li [class.rojo]="palo.rojo">
              <span class="simbolo" aria-hidden="true">{{ palo.simbolo }}</span>
              <span class="nombre">{{ palo.nombre }}</span>
              <span class="efecto">{{ palo.efecto }}</span>
            </li>
          }
        </ul>
      </div>

<section class="panel" aria-labelledby="titulo-panel">
        <div class="ficha">
          <span class="avatar" aria-hidden="true">{{ sesion.nombre()?.charAt(0)?.toUpperCase() ?? '?' }}</span>
          <div>
            <h2 class="jugador" id="titulo-panel">{{ sesion.nombre() ?? t().invitado }}</h2>
            <p class="estado">{{ sesion.nombre() ? t().conCuenta : t().sinCuenta }}</p>
          </div>
        </div>
        <a class="boton-principal jugar" routerLink="/partida">{{ t().jugar }} <span aria-hidden="true">→</span></a>
        <div class="secundarios">
          <a class="boton" routerLink="/reglas">{{ t().reglas }}</a>
          <a class="boton" routerLink="/clasificacion">{{ t().estadisticas }}</a>
        </div>
        <div class="pie">
          @if (sesion.nombre()) {
            <a class="enlace" routerLink="/cuenta">{{ t().cuenta }} <span aria-hidden="true">→</span></a>
            <button type="button" class="enlace" (click)="sesion.salir()">{{ t().salir }} <span aria-hidden="true">→</span></button>
          } @else {
            <p>{{ t().guarda }}</p>
            <a class="enlace" routerLink="/entrar">{{ t().entrar }} <span aria-hidden="true">→</span></a>
          }
          <span class="enlaces-pie">
            <a class="privacidad" routerLink="/privacidad">{{ t().privacidad }}</a>
            <button type="button" class="privacidad" [lang]="idioma.actual() === 'es' ? 'en' : 'es'" (click)="idioma.cambiar()">
              {{ t().otroIdioma }}
            </button>
          </span>
        </div>
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
      max-width: 32em;
      margin: 0 0 1.3em;
      color: var(--texto-suave);
      font-size: 1.1em;
      line-height: 1.6;
      text-wrap: pretty;
    }
    .palos {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.6em;
      width: min(100%, 34em);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .palos li {
      display: grid;
      gap: 0.15em;
      padding: 0.8em 0.9em;
      border: 1px solid var(--linea);
      border-radius: 0.5em;
      background: rgb(18 18 18 / 0.85);
      transition:
        transform 200ms var(--curva),
        border-color 200ms;
    }
    .palos li:hover {
      border-color: rgb(239 68 68 / 0.5);
      transform: translateY(-3px);
    }
    .simbolo {
      color: var(--texto);
      font-size: 1.6em;
      line-height: 1.1;
    }
    .rojo .simbolo {
      color: var(--rojo);
    }
    .nombre {
      color: var(--texto-suave);
      font-family: var(--mono);
      font-size: 0.55em;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .efecto {
      font-size: 0.75em;
      font-weight: 500;
      line-height: 1.3;
    }
    .panel {
      display: grid;
      gap: 1em;
      padding: 1.4em;
      border: 1px solid var(--borde-caja);
      border-top: 2px solid var(--rojo);
      border-radius: 0.7em;
      background: rgb(18 18 18 / 0.85);
      box-shadow: var(--sombra);
      backdrop-filter: blur(12px);
    }
    .ficha {
      display: flex;
      align-items: center;
      gap: 0.8em;
      margin-bottom: 0.3em;
    }
    .avatar {
      display: grid;
      flex: none;
      place-items: center;
      width: 2.6em;
      height: 2.6em;
      border: 1px solid rgb(239 68 68 / 0.3);
      border-radius: 0.4em;
      background: rgb(239 68 68 / 0.1);
      color: var(--rojo);
      font-family: var(--display);
      font-size: 1.1em;
      font-weight: 800;
    }
    .jugador {
      margin: 0;
      font-size: 1.4em;
      font-weight: 700;
      line-height: 1.15;
      overflow-wrap: anywhere;
    }
    .estado {
      margin: 0.2em 0 0;
      color: var(--texto-suave);
      font-family: var(--mono);
      font-size: 0.55em;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .panel a,
    .panel button {
      font-size: 0.8em;
    }
    .jugar {
      justify-content: space-between;
      min-height: 3.6em;
      padding-inline: 1.4em;
      font-size: 0.95em !important;
    }
    .jugar span,
    .enlace span {
      transition: transform 200ms var(--curva);
    }
    .jugar:hover span,
    .enlace:hover span {
      transform: translateX(4px);
    }
    .secundarios {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5em;
    }
    .secundarios .boton {
      min-height: 3em;
      padding-inline: 0.6em;
    }
    .pie {
      display: grid;
      gap: 0.4em;
      padding-top: 1em;
      border-top: 1px solid var(--linea);
    }
    .pie p {
      margin: 0;
      color: var(--texto-suave);
      font-size: 0.75em;
    }
    .enlaces-pie {
      display: flex;
      justify-content: space-between;
      gap: 1em;
    }
    .privacidad {
      padding: 0;
      border: 0;
      background: none;
      color: var(--texto-suave);
      font: inherit;
      font-size: 0.75em !important;
      text-decoration: underline;
      cursor: pointer;
    }
    .enlace {
      justify-self: start;
      padding: 0;
      border: 0;
      background: none;
      color: var(--rojo);
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }
    @media (max-width: 860px) {
      .inicio {
        grid-template-columns: 1fr;
      }
      .titulo {
        font-size: min(7.5em, 17vw);
      }
      .palos {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
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
  protected readonly idioma = inject(Idioma);
  protected readonly t = this.idioma.textos({ es, en });
}
