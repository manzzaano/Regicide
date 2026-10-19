import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PuestoEnClasificacion, ResumenPartida } from '../modelo';
import { Sesion } from '../sesion';

@Component({
  selector: 'app-clasificacion',
  imports: [DatePipe, RouterLink],
  template: `
    <div class="contenedor pagina">
      <h1>Clasificación</h1>
      <p class="ayuda">Más victorias primero; a igualdad, la mejor partida y quien lo logró en menos partidas.</p>

      @if (clasificacion.error()) {
        <p class="error" role="alert">No se ha podido cargar la clasificación.</p>
      } @else if (clasificacion.value(); as puestos) {
        @if (puestos.length) {
          <div class="tabla">
            <table>
              <thead>
                <tr>
                  <th scope="col">Puesto</th>
                  <th scope="col">Jugador</th>
                  <th scope="col">Victorias</th>
                  <th scope="col">Partidas</th>
                  <th scope="col">Mejor partida</th>
                </tr>
              </thead>
              <tbody>
                @for (puesto of puestos; track puesto.nombre; let i = $index) {
                  <tr [class.tuyo]="puesto.nombre === sesion.nombre()">
                    <td>{{ i + 1 }}</td>
                    <th scope="row">{{ puesto.nombre }}</th>
                    <td>{{ puesto.victorias }}</td>
                    <td>{{ puesto.partidas }}</td>
                    <td>{{ puesto.mejorPartida }} de 12</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p>Aún no ha terminado nadie una partida. <a routerLink="/partida">Sé el primero.</a></p>
        }
      } @else {
        <p class="ayuda">Cargando…</p>
      }

      <h2>Tus partidas</h2>
      @if (!sesion.nombre()) {
        <p><a routerLink="/entrar">Entra con tu cuenta</a> para ver tus partidas.</p>
      } @else if (misPartidas.value(); as partidas) {
        @if (partidas.length) {
          <div class="tabla">
            <table>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Resultado</th>
                  <th scope="col">Enemigos derrotados</th>
                  <th scope="col">Comodines usados</th>
                </tr>
              </thead>
              <tbody>
                @for (partida of partidas; track partida.terminadaEn) {
                  <tr>
                    <td>{{ partida.terminadaEn | date: 'd MMM y, HH:mm' }}</td>
                    <td [class.gana]="partida.resultado === 'VICTORIA'">
                      {{ partida.resultado === 'VICTORIA' ? 'Victoria' : 'Derrota' }}
                    </td>
                    <td>{{ partida.enemigosDerrotados }} de 12</td>
                    <td>{{ partida.comodinesUsados }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p>Todavía no has terminado ninguna partida.</p>
        }
      }
    </div>
  `,
  styles: `
    .pagina {
      padding-block: 2rem 3rem;
    }
    h1 {
      font-size: clamp(2.2rem, 6vw, 3.2rem);
    }
    h2 {
      margin-top: 2.5rem;
      font-size: 1.7rem;
    }
    .ayuda {
      color: var(--texto-suave);
    }
    .tabla {
      overflow-x: auto;
      border-radius: var(--radio);
      background: var(--superficie);
      box-shadow: var(--sombra);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-variant-numeric: tabular-nums;
    }
    th,
    td {
      padding: 0.7em 1em;
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid var(--linea);
    }
    thead th {
      color: var(--texto-suave);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    tbody tr:last-child > * {
      border-bottom: 0;
    }
    .tuyo {
      background: var(--superficie-2);
      box-shadow: inset 4px 0 var(--acento);
    }
    .gana {
      color: var(--exito);
      font-weight: 700;
    }
    .error {
      font-weight: 700;
    }
  `,
})
export class Clasificacion {
  protected readonly sesion = inject(Sesion);
  protected readonly clasificacion = httpResource<PuestoEnClasificacion[]>(() => '/api/leaderboard');
  protected readonly misPartidas = httpResource<ResumenPartida[]>(() => (this.sesion.nombre() ? '/api/games/me' : undefined));
}
