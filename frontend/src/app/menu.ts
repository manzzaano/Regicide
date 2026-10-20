import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Idioma } from './idioma';
import { Sesion } from './sesion';

const es = {
  inicio: 'Regicide, inicio',
  menu: 'Menú',
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
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header>
      <div class="interior">
        <a class="marca" routerLink="/" [attr.aria-label]="t().inicio">REGICIDE<span>/</span></a>
        <nav [attr.aria-label]="t().menu">
          <a routerLink="/reglas" routerLinkActive="activo" ariaCurrentWhenActive="page">{{ t().reglas }}</a>
          <a routerLink="/clasificacion" routerLinkActive="activo" ariaCurrentWhenActive="page">{{ t().estadisticas }}</a>
        </nav>
        <div class="acciones">
          <ng-content />
          @if (sesion.nombre(); as nombre) {
            <a class="jugador" routerLink="/cuenta" [title]="t().cuenta">{{ nombre }}</a>
            <button type="button" class="enlace" (click)="salir()">{{ t().salir }}</button>
          } @else {
            <span class="jugador">{{ t().invitado }}</span>
            <a class="enlace" routerLink="/entrar" routerLinkActive="activo" ariaCurrentWhenActive="page">{{ t().entrar }}</a>
          }
          <button type="button" class="enlace idioma" [attr.aria-label]="t().otroIdioma" [title]="t().otroIdioma" (click)="idioma.cambiar()">
            {{ idioma.actual() === 'es' ? 'EN' : 'ES' }}
          </button>
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
    @media (max-width: 560px) {
      .acciones {
        width: 100%;
        margin-left: 0;
      }
    }
  `,
})
export class Menu {
  protected readonly sesion = inject(Sesion);
  protected readonly idioma = inject(Idioma);
  protected readonly t = this.idioma.textos({ es, en });
  private readonly router = inject(Router);

  // A la portada: la página de la cuenta y la partida guardada ya no son de nadie.
  protected salir(): void {
    if (confirm(this.t().seguroSalir)) {
      this.sesion.salir();
      void this.router.navigateByUrl('/');
    }
  }
}
