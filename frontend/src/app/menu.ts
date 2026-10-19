import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Sesion } from './sesion';

/** La fila de botones negros de arriba de la ventana de juego de v1, con el nombre del juego a la izquierda. */
@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header>
      <a class="marca" routerLink="/" aria-label="Regicide, inicio">REGICIDE<span>/solitario</span></a>
      <nav aria-label="Menú">
        <a class="boton" routerLink="/reglas" routerLinkActive="activo" ariaCurrentWhenActive="page">¿Cómo jugar?</a>
        <a class="boton" routerLink="/clasificacion" routerLinkActive="activo" ariaCurrentWhenActive="page">
          Estadísticas
        </a>
        <ng-content />
        @if (sesion.nombre(); as nombre) {
          <button type="button" class="boton" (click)="sesion.salir()">
            Salir <span class="jugador">{{ nombre }}</span>
          </button>
        } @else {
          <a class="boton" routerLink="/entrar" routerLinkActive="activo" ariaCurrentWhenActive="page">Entrar</a>
        }
      </nav>
    </header>
  `,
  styles: `
    header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px 24px;
      max-width: 1500px;
      margin: 0 auto;
      padding: 16px;
    }
    .marca {
      color: #fff;
      font-family: var(--display);
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      text-decoration: none;
      text-shadow: 0 1px 12px rgb(0 0 0 / 0.35);
    }
    .marca span {
      margin-left: 2px;
      font-family: var(--mono);
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0;
      opacity: 0.8;
    }
    nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .activo {
      background: #fff;
      color: var(--negro);
    }
    .boton.activo:hover {
      background: #f4f4f5;
    }
    .jugador {
      font-family: var(--mono);
      font-size: 13px;
      opacity: 0.7;
    }
  `,
})
export class Menu {
  protected readonly sesion = inject(Sesion);
}
