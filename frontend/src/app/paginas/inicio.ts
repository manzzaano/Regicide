import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Sesion } from '../sesion';

/** VistaInicio.fxml de v1: el título, quién juega y los botones. */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  template: `
    <main class="inicio">
      <h1 class="titulo">BIENVENIDO A REGICIDE - MODO SOLITARIO</h1>
      @if (sesion.nombre(); as nombre) {
        <p class="campo jugador">Jugando como: <strong>{{ nombre }}</strong></p>
      } @else {
        <p class="campo jugador">Jugando como invitado</p>
      }
      <div class="botones">
        <a class="boton" routerLink="/reglas">¿Cómo jugar?</a>
        <a class="boton" routerLink="/partida">Jugar</a>
      </div>
      <div class="botones secundarios">
        <a class="boton" routerLink="/clasificacion">Estadísticas</a>
        @if (sesion.nombre()) {
          <button type="button" class="boton" (click)="sesion.salir()">Salir</button>
        } @else {
          <a class="boton" routerLink="/entrar">Entrar o crear cuenta</a>
        }
      </div>
    </main>
  `,
  styles: `
    .inicio {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      min-height: 100dvh;
      padding: 16px;
    }
    .jugador {
      max-width: 250px;
      margin: 0;
      text-align: center;
    }
    .botones {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
    }
  `,
})
export class Inicio {
  protected readonly sesion = inject(Sesion);
}
