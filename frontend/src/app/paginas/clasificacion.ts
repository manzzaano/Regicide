import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { PuestoEnClasificacion, ResumenPartida } from '../modelo';
import { Menu } from '../menu';
import { Sesion } from '../sesion';

@Component({
  selector: 'app-clasificacion',
  imports: [DatePipe, Menu, RouterLink],
  template: `
    <app-menu />
    <main>
      <h1 class="titulo">Estadísticas</h1>
      <section class="caja">
      <h2>Clasificación</h2>
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

      </section>

      <section class="caja">
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
      </section>
    </main>
  `,
  styles: `
    main {
      display: grid;
      gap: 20px;
      max-width: 900px;
      margin: 0 auto;
      padding: 0 16px 30px;
    }
    h2 {
      margin: 0 0 8px;
      color: var(--titulo);
      font-size: 22px;
    }
    .tabla {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-variant-numeric: tabular-nums;
    }
    th,
    td {
      padding: 8px 12px;
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid #bbb;
    }
    thead th {
      background: #000;
      color: #fff;
    }
    tbody tr:last-child > * {
      border-bottom: 0;
    }
    .tuyo {
      font-weight: bold;
    }
    .gana {
      font-weight: bold;
    }
    .error {
      color: var(--vida);
      font-weight: bold;
    }
  `,
})
export class Clasificacion {
  protected readonly sesion = inject(Sesion);
  protected readonly clasificacion = httpResource<PuestoEnClasificacion[]>(() => '/api/leaderboard');
  protected readonly misPartidas = httpResource<ResumenPartida[]>(() => (this.sesion.nombre() ? '/api/games/me' : undefined));
}
