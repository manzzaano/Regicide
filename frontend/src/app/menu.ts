import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { EstadoPartida, Palo } from './modelo';
import { Sesion } from './sesion';

const SIMBOLOS: Record<Palo, string> = { PICAS: '♠', CORAZONES: '♥', DIAMANTES: '♦', TREBOLES: '♣' };
const FIGURAS: Record<number, string> = { 11: 'J', 12: 'Q', 13: 'K' };

/** La fila de botones de arriba de la ventana de juego de v1, como barra oscura al estilo de leosoftware.dev. */
@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  host: { '(window:scroll)': 'alDesplazar()' },
  template: `
    <header [class.compacta]="compacta()">
      <div class="interior">
        <div class="izquierda">
          <a class="marca" routerLink="/" aria-label="Regicide, inicio">REGICIDE<span>/</span></a>
          @if (resumen(); as resumen) {
            <p class="estado-partida" [attr.aria-label]="resumen.etiqueta">
              <span class="conexion" [class.caida]="!conectado()"></span>
              {{ resumen.texto }}
            </p>
          }
        </div>
        <nav aria-label="Menú">
          <a routerLink="/reglas" routerLinkActive="activo" ariaCurrentWhenActive="page">¿Cómo jugar?</a>
          <a routerLink="/clasificacion" routerLinkActive="activo" ariaCurrentWhenActive="page">Estadísticas</a>
        </nav>
        <div class="acciones">
          <ng-content />
          <button type="button" class="avatar" popovertarget="menu-jugador" [attr.aria-label]="'Cuenta: ' + nombre()">
            {{ inicial() }}
          </button>
          <div class="menu-jugador" id="menu-jugador" popover>
            <p class="quien">
              <strong>{{ nombre() }}</strong>
              <span>{{ sesion.nombre() ? 'Cuenta · partida guardada' : 'Invitado · sin guardar' }}</span>
            </p>
            <a routerLink="/clasificacion">Estadísticas</a>
            @if (sesion.nombre()) {
              <button type="button" (click)="sesion.salir()">Salir</button>
            } @else {
              <a routerLink="/entrar">Entrar o crear cuenta</a>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  styles: `
    header {
      position: sticky;
      top: 0;
      z-index: 5;
      margin-bottom: 16px;
      border-bottom: 1px solid rgb(255 255 255 / 0.08);
      background: rgb(11 11 11 / 0.75);
      backdrop-filter: blur(12px) saturate(1.4);
    }
    .interior {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 8px 24px;
      max-width: 1500px;
      min-height: 60px;
      margin: 0 auto;
      padding: 8px 16px;
      transition: min-height 200ms var(--curva);
    }
    .compacta .interior {
      min-height: 46px;
      padding-block: 4px;
    }
    .izquierda {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 0;
    }
    .marca {
      color: #fafafa;
      font-family: var(--display);
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      text-decoration: none;
    }
    .marca span {
      margin-left: 1px;
      color: var(--rojo);
    }
    .estado-partida {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 3px 10px;
      border: 1px solid var(--linea);
      border-radius: 999px;
      color: var(--texto-suave);
      font-family: var(--mono);
      font-size: 12px;
      white-space: nowrap;
    }
    .conexion {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #4ade80;
      animation: latir 2s ease-in-out infinite;
    }
    .conexion.caida {
      background: var(--rojo);
    }
    nav {
      display: flex;
      gap: 22px;
    }
    nav a {
      position: relative;
      padding: 6px 0;
      color: #a1a1aa;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      transition: color 150ms;
    }
    nav a:hover,
    .activo {
      color: #fafafa;
    }
    .activo::after {
      content: '';
      position: absolute;
      inset: auto 0 0;
      height: 2px;
      border-radius: 2px;
      background: var(--rojo);
    }
    .acciones {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
    }
    .avatar {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border: 1px solid rgb(239 68 68 / 0.3);
      border-radius: 7px;
      background: rgb(239 68 68 / 0.1);
      color: var(--rojo);
      font-family: var(--display);
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      transition: border-color 200ms;
    }
    .avatar:hover {
      border-color: var(--rojo);
    }
    /* Popover nativo: se cierra solo al pulsar fuera o con Escape. Va bajo el avatar, en la esquina de la barra. */
    .menu-jugador {
      inset: 58px max(16px, calc((100vw - 1500px) / 2 + 16px)) auto auto;
      min-width: 220px;
      margin: 0;
      padding: 6px;
      border: 1px solid var(--borde-caja);
      border-radius: 10px;
      background: var(--caja-fuerte);
      box-shadow: var(--sombra);
      color: var(--texto);
    }
    .quien {
      display: grid;
      margin: 0 0 6px;
      padding: 8px 10px 10px;
      border-bottom: 1px solid var(--linea);
    }
    .quien span {
      color: var(--texto-suave);
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .menu-jugador a,
    .menu-jugador button {
      display: block;
      width: 100%;
      padding: 8px 10px;
      border: 0;
      border-radius: 6px;
      background: none;
      color: var(--texto);
      font-size: 14px;
      text-align: left;
      text-decoration: none;
      cursor: pointer;
    }
    .menu-jugador a:hover,
    .menu-jugador button:hover {
      background: var(--hover);
    }
    @keyframes latir {
      50% {
        opacity: 0.35;
      }
    }
    @media (max-width: 720px) {
      .interior {
        grid-template-columns: 1fr auto;
      }
      nav {
        grid-row: 2;
        grid-column: 1 / -1;
      }
      .estado-partida {
        display: none;
      }
    }
  `,
})
export class Menu {
  protected readonly sesion = inject(Sesion);

  /** Solo en la mesa: el estado que resume la píldora junto al logo. */
  readonly estado = input<EstadoPartida | null>(null);
  readonly conectado = input(true);

  protected readonly compacta = signal(false);

  protected alDesplazar(): void {
    this.compacta.set(window.scrollY > 8);
  }
  protected readonly nombre = computed(() => this.sesion.nombre() ?? 'Invitado');
  protected readonly inicial = computed(() => this.sesion.nombre()?.charAt(0).toUpperCase() ?? '?');
  protected readonly resumen = computed(() => {
    const estado = this.estado();
    if (!estado) {
      return null;
    }
    const derrotados = 12 - estado.enemigosRestantes;
    const enemigo = estado.enemigo ? FIGURAS[estado.enemigo.carta.numero] + SIMBOLOS[estado.enemigo.carta.palo] + ' · ' : '';
    return {
      texto: `${enemigo}${derrotados}/12 · ${estado.fase}`,
      etiqueta: `${derrotados} de 12 enemigos derrotados, fase ${estado.fase.toLowerCase()}`,
    };
  });
}
