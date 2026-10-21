import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Confirmacion } from './confirmacion';
import { Idioma } from './idioma';
import { Sesion } from './sesion';

const es = {
  inicio: 'Regicide, inicio',
  menu: 'Menú',
  cerrar: 'Cerrar',
  reglas: '¿Cómo jugar?',
  estadisticas: 'Estadísticas',
  cuenta: 'Tu cuenta',
  salir: 'Salir',
  seguroSalir: '¿Cerrar la sesión?',
  invitado: 'invitado',
  entrar: 'Entrar',
  otroIdioma: 'Read in English',
};
const en: typeof es = {
  inicio: 'Regicide, home',
  menu: 'Menu',
  cerrar: 'Close',
  reglas: 'How to play',
  estadisticas: 'Stats',
  cuenta: 'Your account',
  salir: 'Sign out',
  seguroSalir: 'Sign out?',
  invitado: 'guest',
  entrar: 'Sign in',
  otroIdioma: 'Leer en español',
};

/** La fila de botones de arriba de la ventana de juego de v1, como barra oscura al estilo de leosoftware.dev. */
@Component({
  selector: 'app-menu',
  imports: [Confirmacion, RouterLink, RouterLinkActive],
  template: `
    <header>
      <div class="interior" [class.abierto]="abierto()">
        <a class="marca" routerLink="/" [attr.aria-label]="t().inicio">REGICIDE<span>/</span></a>
        <button type="button" class="alternar" aria-controls="menu-desplegable" [attr.aria-expanded]="abierto()" (click)="abierto.set(!abierto())">
          {{ abierto() ? t().cerrar : t().menu }}
        </button>
        <!-- En el móvil todo esto se pliega tras el botón; se cierra al tocar cualquier enlace o botón. -->
        <div class="desplegable" id="menu-desplegable" (click)="cerrarAlElegir($event)">
          <nav [attr.aria-label]="t().menu">
            <a routerLink="/reglas" routerLinkActive="activo" ariaCurrentWhenActive="page">{{ t().reglas }}</a>
            <a routerLink="/clasificacion" routerLinkActive="activo" ariaCurrentWhenActive="page">{{ t().estadisticas }}</a>
          </nav>
          <div class="acciones">
            <ng-content />
            @if (sesion.nombre(); as nombre) {
              <a class="jugador" routerLink="/cuenta" [title]="t().cuenta">{{ nombre }}</a>
              <button type="button" class="enlace" (click)="preguntando.set(true)">{{ t().salir }}</button>
            } @else {
              <span class="jugador">{{ t().invitado }}</span>
              <a class="enlace" routerLink="/entrar" routerLinkActive="activo" ariaCurrentWhenActive="page">{{ t().entrar }}</a>
            }
            <button type="button" class="enlace idioma" [attr.aria-label]="t().otroIdioma" [title]="t().otroIdioma" (click)="idioma.cambiar()">
              {{ idioma.actual() === 'es' ? 'EN' : 'ES' }}
            </button>
          </div>
        </div>
      </div>
    </header>
    @if (preguntando()) {
      <app-confirmacion [pregunta]="t().seguroSalir" [aceptar]="t().salir" (respuesta)="salir($event)" />
    }
  `,
  styles: `
    header {
      position: sticky;
      top: 0;
      z-index: 5;
      margin-bottom: 16px;
      border-bottom: 1px solid rgb(239 68 68 / 0.35);
      background: rgb(11 11 11 / 0.92);
      box-shadow: 0 1px 28px -8px rgb(239 68 68 / 0.35);
      backdrop-filter: blur(12px) saturate(1.4);
    }
    .interior {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 36px;
      max-width: 1500px;
      min-height: 72px;
      margin: 0 auto;
      padding: 10px 16px;
    }
    .marca {
      color: #fafafa;
      font-family: var(--display);
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
      text-decoration: none;
    }
    .marca span {
      margin-left: 1px;
      color: var(--rojo);
    }
    nav {
      display: flex;
      gap: 28px;
    }
    nav a,
    .enlace {
      position: relative;
      padding: 6px 0;
      border: 0;
      background: none;
      color: #d4d4d8;
      font-size: 15px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: color 150ms;
    }
    nav a:hover,
    .enlace:hover,
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
      gap: 16px;
      margin-left: auto;
    }
    .jugador {
      padding: 6px 12px;
      border: 1px solid rgb(239 68 68 / 0.25);
      border-radius: 3px;
      background: rgb(239 68 68 / 0.06);
      color: var(--rojo);
      font-family: var(--mono);
      font-size: 13px;
      letter-spacing: 0.15em;
      text-decoration: none;
      text-transform: uppercase;
    }
    .idioma {
      font-family: var(--mono);
      font-size: 13px;
      letter-spacing: 0.15em;
    }
    a.jugador:hover {
      border-color: var(--rojo);
    }
    .desplegable {
      display: contents;
    }
    .alternar {
      display: none;
    }
    /* En el móvil, de pie o tumbado, una fila con la marca y el botón del menú; la barra deja de
       ir pegada arriba. */
    @media (max-width: 640px), (max-height: 500px) {
      header {
        position: static;
      }
      .interior {
        min-height: 56px;
        padding-block: 8px;
      }
      .marca {
        font-size: 22px;
      }
      .alternar {
        display: block;
        min-height: 40px;
        margin-left: auto;
        padding: 0 14px;
        border: 1px solid var(--linea);
        border-radius: 6px;
        background: none;
        color: #fafafa;
        font: 500 14px var(--mono);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
      }
      .abierto .alternar {
        border-color: var(--rojo);
      }
      .desplegable {
        display: none;
      }
      .abierto .desplegable {
        display: grid;
        gap: 4px;
        width: 100%;
        padding: 8px 0 6px;
        border-top: 1px solid var(--linea);
      }
      nav {
        display: grid;
        gap: 0;
      }
      nav a {
        padding: 12px 0;
        font-size: 16px;
      }
      .activo::after {
        inset: auto auto 6px 0;
        width: 24px;
      }
      .acciones {
        flex-wrap: wrap;
        gap: 12px 16px;
        margin-left: 0;
        padding-top: 12px;
        border-top: 1px solid var(--linea);
      }
      .acciones .enlace {
        min-height: 40px;
      }
    }
  `,
})
export class Menu {
  protected readonly sesion = inject(Sesion);
  protected readonly idioma = inject(Idioma);
  protected readonly t = this.idioma.textos({ es, en });
  protected readonly abierto = signal(false);
  protected readonly preguntando = signal(false);
  private readonly router = inject(Router);

  protected cerrarAlElegir(evento: Event): void {
    if ((evento.target as Element).closest('a, button')) {
      this.abierto.set(false);
    }
  }

  // A la portada: la página de la cuenta y la partida guardada ya no son de nadie.
  protected salir(confirmado: boolean): void {
    this.preguntando.set(false);
    if (confirmado) {
      this.sesion.salir();
      void this.router.navigateByUrl('/');
    }
  }
}
