import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carta } from '../carta';
import { Confirmacion } from '../confirmacion';
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
  seguroSalir: '¿Cerrar la sesión?',
  guarda: 'Guarda tu partida y entra en la clasificación.',
  entrar: 'Entrar o crear cuenta',
  privacidad: 'Privacidad · sin cookies',
  desarrolladoPor: 'Desarrollado por',
  codigo: 'Código en GitHub',
  noOficial: 'Versión no oficial y sin ánimo de lucro. Regicide es un juego de Badgers From Mars, publicado en España por Devir, que no tiene relación con este sitio.',
  webOficial: 'Web oficial del juego',
  linkedin: 'Ismael en LinkedIn',
  oficio: 'Full stack · leosoftware.dev',
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
  seguroSalir: 'Sign out?',
  guarda: 'Save your game and get on the leaderboard.',
  entrar: 'Sign in or create an account',
  privacidad: 'Privacy · no cookies',
  desarrolladoPor: 'Developed by',
  codigo: 'Code on GitHub',
  noOficial: 'Unofficial, non-profit version. Regicide is a game by Badgers From Mars, published in Spain by Devir, who are not affiliated with this site.',
  webOficial: 'Official game website',
  linkedin: 'Ismael on LinkedIn',
  oficio: 'Full stack · leosoftware.dev',
  otroIdioma: 'Español',
};

/** VistaInicio.fxml de v1 (título, quién juega y los botones) con la portada de leosoftware.dev. */
@Component({
  selector: 'app-inicio',
  imports: [Carta, Confirmacion, RouterLink],
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
        <p class="no-oficial">
          {{ t().noOficial }}
          <a href="https://www.regicidegame.com" target="_blank" rel="noopener">{{ t().webOficial }} <span aria-hidden="true">↗</span></a>
        </p>
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
            <button type="button" class="enlace" (click)="preguntando.set(true)">{{ t().salir }} <span aria-hidden="true">→</span></button>
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
        <footer class="firma">
          <a class="autor" href="https://leosoftware.dev">
            <span class="sello" aria-hidden="true">leo<span>/</span></span>
            <span class="quien">
              <span class="desarrollado-por">{{ t().desarrolladoPor }}</span>
              <strong>Ismael Manzano León</strong>
              <span class="oficio">{{ t().oficio }}</span>
            </span>
          </a>
          <a class="icono" href="https://github.com/manzzaano/Regicide" [attr.aria-label]="t().codigo" [title]="t().codigo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3" /></svg>
          </a>
          <a class="icono" href="https://www.linkedin.com/in/ismael-manzano-leon/" [attr.aria-label]="t().linkedin" [title]="t().linkedin">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" /></svg>
          </a>
        </footer>
      </section>
    </main>
    @if (preguntando()) {
      <app-confirmacion [pregunta]="t().seguroSalir" [aceptar]="t().salir" (respuesta)="salir($event)" />
    }
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
    /* Aviso de que el juego es de sus autores y esto es un proyecto personal. */
    .no-oficial {
      max-width: 34em;
      margin: 1.2em 0 0;
      color: var(--texto-suave);
      font-size: 0.7em;
      line-height: 1.5;
    }
    .no-oficial a {
      color: var(--texto);
      white-space: nowrap;
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
    /* La firma: el sello de leosoftware.dev, el nombre y los enlaces al código y a LinkedIn. */
    .firma {
      display: flex;
      align-items: center;
      gap: 0.6em;
      margin: 0.2em -1.4em -1.4em;
      padding: 1em 1.4em;
      border-top: 1px solid var(--linea);
      border-radius: 0 0 0.7em 0.7em;
      background: rgb(239 68 68 / 0.05);
    }
    .panel .autor {
      display: flex;
      flex: 1;
      align-items: center;
      gap: 0.8em;
      min-width: 0;
      color: var(--texto);
      font-size: 1em;
      text-decoration: none;
    }
    .sello {
      display: flex;
      flex: none;
      align-items: center;
      justify-content: center;
      height: 2.9em;
      padding: 0 0.6em;
      border: 1px solid rgb(239 68 68 / 0.4);
      border-radius: 0.5em;
      background: var(--negro);
      font: 800 0.9em var(--display);
      letter-spacing: -0.02em;
      transition: border-color 150ms;
    }
    .sello span {
      color: var(--rojo);
    }
    .quien {
      display: grid;
      min-width: 0;
    }
    .desarrollado-por {
      color: var(--texto-suave);
      font: 0.62em var(--mono);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .quien strong {
      font: 700 1em var(--display);
      transition: color 150ms;
    }
    .oficio {
      overflow: hidden;
      color: var(--texto-suave);
      font-size: 0.7em;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .autor:hover .sello {
      border-color: var(--rojo);
    }
    .autor:hover strong {
      color: var(--rojo);
    }
    .panel .icono {
      display: grid;
      flex: none;
      place-items: center;
      width: 2.4em;
      height: 2.4em;
      border: 1px solid var(--linea);
      border-radius: 0.5em;
      color: var(--texto-suave);
      transition:
        color 150ms,
        border-color 150ms;
    }
    .panel .icono:hover {
      border-color: var(--rojo);
      color: var(--texto);
    }
    .icono svg {
      width: 1.1em;
      height: 1.1em;
      fill: currentColor;
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
      /* En el móvil el panel con Jugar va justo después del texto, antes de los palos. */
      .inicio {
        row-gap: 0;
        justify-items: start;
      }
      .portada {
        display: contents;
      }
      .palos {
        order: 1;
        justify-self: stretch;
        margin-top: 2em;
      }
      .no-oficial {
        order: 1;
      }
      .panel {
        justify-self: stretch;
        margin-top: 2em;
      }
      .abanico {
        margin: 0.8em 0 1.2em 1.8em;
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

  protected readonly preguntando = signal(false);

  protected salir(confirmado: boolean): void {
    this.preguntando.set(false);
    if (confirmado) {
      this.sesion.salir();
    }
  }
}
