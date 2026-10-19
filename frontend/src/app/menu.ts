import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Sesion } from './sesion';

/** La fila de botones negros de arriba, como en la ventana de juego de v1. */
@Component({
  selector: 'app-menu',
  imports: [RouterLink],
  template: `
    <nav aria-label="Menú">
      <a class="boton" routerLink="/">Inicio</a>
      <a class="boton" routerLink="/reglas">¿Cómo jugar?</a>
      <a class="boton" routerLink="/clasificacion">Estadísticas</a>
      <ng-content />
      @if (sesion.nombre(); as nombre) {
        <button type="button" class="boton" (click)="sesion.salir()">Salir ({{ nombre }})</button>
      } @else {
        <a class="boton" routerLink="/entrar">Entrar</a>
      }
    </nav>
  `,
  styles: `
    nav {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      padding: 23px 16px 0;
    }
  `,
})
export class Menu {
  protected readonly sesion = inject(Sesion);
}
