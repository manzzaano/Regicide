import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Sesion } from './sesion';

/** La fila de botones de arriba de la ventana de juego de v1, como barra oscura al estilo de leosoftware.dev. */
@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header>
      <div class="interior">
        <a class="marca" routerLink="/" aria-label="Regicide, inicio">REGICIDE<span>/</span></a>
        <nav aria-label="Menú">
          <a routerLink="/reglas" routerLinkActive="activo" ariaCurrentWhenActive="page">¿Cómo jugar?</a>
          <a routerLink="/clasificacion" routerLinkActive="activo" ariaCurrentWhenActive="page">Estadísticas</a>
        </nav>
        <div class="acciones">
          <ng-content />
          <span class="jugador">{{ sesion.nombre() ?? 'invitado' }}</span>
          @if (sesion.nombre()) {
            <button type="button" class="enlace" (click)="sesion.salir()">Salir</button>
          } @else {
            <a class="enlace" routerLink="/entrar" routerLinkActive="activo" ariaCurrentWhenActive="page">Entrar</a>
          }
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
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 28px;
      max-width: 1500px;
      min-height: 60px;
      margin: 0 auto;
      padding: 8px 16px;
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
    nav {
      display: flex;
      gap: 22px;
    }
    nav a,
    .enlace {
      position: relative;
      padding: 6px 0;
      border: 0;
      background: none;
      color: #a1a1aa;
      font-size: 14px;
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
      padding: 4px 10px;
      border: 1px solid rgb(239 68 68 / 0.12);
      border-radius: 3px;
      background: rgb(239 68 68 / 0.06);
      color: var(--rojo);
      font-family: var(--mono);
      font-size: 12px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
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
}
