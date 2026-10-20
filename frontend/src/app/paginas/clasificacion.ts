import { Component, computed, inject } from '@angular/core';
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
      <header class="cabecera">
        <p class="terminal"><span>~/regicide $</span> estadísticas</p>
        <div class="titular">
          <h1>Estadísticas</h1>
          <button type="button" class="boton ayuda-boton" (click)="explicacion.showModal()">
            <span class="interrogacion" aria-hidden="true">?</span> ¿Cómo se calculan?
          </button>
        </div>
      </header>

      <!-- <dialog> nativo: showModal ya atrapa el foco, cierra con Escape y pone el fondo. -->
      <dialog #explicacion class="explicacion" aria-labelledby="explicacion-titulo" (click)="cerrarFuera($event)">
        <form method="dialog" class="cabeza">
          <div>
            <p class="etiqueta">Estadísticas</p>
            <h2 id="explicacion-titulo">Cómo se calculan</h2>
          </div>
          <button class="cerrar" aria-label="Cerrar">×</button>
        </form>

        <p class="nota">
          <strong>Solo cuentan las partidas terminadas con cuenta</strong>: al derrotar al último rey o al no poder
          defenderte. Las de invitado y las abandonadas con Nueva Partida no se guardan.
        </p>

        <dl class="cifras">
          @for (cifra of cifras; track cifra.nombre) {
            <div>
              <dt><span aria-hidden="true">{{ cifra.simbolo }}</span> {{ cifra.nombre }}</dt>
              <dd>{{ cifra.texto }}</dd>
            </div>
          }
        </dl>

        <h3 class="etiqueta">Orden de la clasificación</h3>
        <ol class="orden">
          <li><strong>Más victorias</strong> <span>gana quien más veces ha tomado el castillo</span></li>
          <li><strong>Mejor partida</strong> <span>si empatan, quien llegó más lejos</span></li>
          <li><strong>Menos partidas</strong> <span>si sigue el empate, quien lo logró antes</span></li>
        </ol>

        <form method="dialog" class="pie-dialogo">
          <p>Se muestran los 20 primeros y tus 50 últimas partidas.</p>
          <button class="boton-principal">Entendido</button>
        </form>
      </dialog>

      @if (resumen(); as resumen) {
        <ul class="resumen" aria-label="Tu resumen">
          <li>
            <span class="etiqueta">Puesto</span>
            <span class="cifra">{{ resumen.puesto ? '#' + resumen.puesto : '—' }}</span>
          </li>
          <li>
            <span class="etiqueta">Victorias</span>
            <span class="cifra rojo">{{ resumen.victorias }}</span>
          </li>
          <li>
            <span class="etiqueta">Partidas</span>
            <span class="cifra">{{ resumen.partidas }}</span>
          </li>
          <li>
            <span class="etiqueta">Mejor partida</span>
            <span class="cifra">{{ resumen.mejor }}<small>/12</small></span>
            <span class="progreso" aria-hidden="true"><span [style.width.%]="(resumen.mejor / 12) * 100"></span></span>
          </li>
        </ul>
      } @else if (!sesion.nombre()) {
        <p class="caja invitado">
          <a routerLink="/entrar">Entra con tu cuenta</a> para guardar tus partidas y ver aquí tu resumen.
        </p>
      }

      <div class="columnas">
        <section class="caja">
          <h2 class="etiqueta">Clasificación</h2>

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
                        <td><span class="puesto" [class.podio]="i < 3" [class.primero]="i === 0">{{ i + 1 }}</span></td>
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
          <h2 class="etiqueta">Tus partidas</h2>
          @if (!sesion.nombre()) {
            <p class="ayuda">Como invitado no se guarda ninguna partida.</p>
          } @else if (misPartidas.value(); as partidas) {
            @if (partidas.length) {
              <div class="tabla">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Fecha</th>
                      <th scope="col">Resultado</th>
                      <th scope="col">Enemigos derrotados</th>
                      <th scope="col">Comodines</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (partida of partidas; track partida.terminadaEn) {
                      <tr>
                        <td>{{ partida.terminadaEn | date: 'd MMM y, HH:mm' }}</td>
                        <td>
                          <span class="resultado" [class.gana]="partida.resultado === 'VICTORIA'">
                            {{ partida.resultado === 'VICTORIA' ? 'Victoria' : 'Derrota' }}
                          </span>
                        </td>
                        <td>
                          <span class="derrotados">
                            <span class="progreso" aria-hidden="true">
                              <span [style.width.%]="(partida.enemigosDerrotados / 12) * 100"></span>
                            </span>
                            {{ partida.enemigosDerrotados }} de 12
                          </span>
                        </td>
                        <td>{{ partida.comodinesUsados }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <p>Todavía no has terminado ninguna partida. <a routerLink="/partida">Juega una.</a></p>
            }
          }
        </section>
      </div>
    </main>
  `,
  styles: `
    main {
      display: grid;
      gap: 20px;
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px 16px 30px;
    }
    .cabecera {
      display: grid;
      justify-items: start;
      gap: 8px;
    }
    .terminal {
      margin: 0;
      padding: 4px 12px;
      border: 1px solid var(--linea);
      border-radius: 999px;
      background: var(--caja);
      color: var(--texto-suave);
      font-family: var(--mono);
      font-size: 12px;
    }
    .terminal span {
      color: var(--rojo);
    }
    h1 {
      margin: 0;
      color: var(--titulo);
      font-size: clamp(36px, 5vw, 56px);
      font-weight: 800;
      line-height: 1;
    }
    .titular {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
    }
    .ayuda-boton {
      gap: 8px;
    }
    .interrogacion {
      display: inline-grid;
      place-items: center;
      width: 20px;
      height: 20px;
      border: 1px solid var(--rojo);
      border-radius: 50%;
      color: var(--rojo);
      font-family: var(--mono);
      font-size: 12px;
    }
    .explicacion {
      width: min(100% - 32px, 620px);
      max-height: min(100% - 32px, 760px);
      padding: 20px 24px;
      border: 1px solid var(--borde-caja);
      border-top: 2px solid var(--rojo);
      border-radius: var(--radio);
      background: var(--caja-fuerte);
      box-shadow: 0 24px 80px -12px rgb(239 68 68 / 0.25);
      color: var(--texto-suave);
    }
    .explicacion[open] {
      animation: subir 280ms var(--curva);
    }
    .explicacion::backdrop {
      background: rgb(0 0 0 / 0.7);
      backdrop-filter: blur(4px);
    }
    .cabeza {
      display: flex;
      align-items: start;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .explicacion h2 {
      margin: 0;
      color: var(--titulo);
      font-size: 28px;
      font-weight: 800;
    }
    .explicacion .etiqueta {
      margin: 0 0 4px;
    }
    .cerrar {
      width: 36px;
      height: 36px;
      border: 1px solid var(--linea);
      border-radius: 8px;
      background: none;
      color: var(--texto-suave);
      font-size: 20px;
      cursor: pointer;
      transition:
        color 150ms,
        border-color 150ms;
    }
    .cerrar:hover {
      border-color: var(--rojo);
      color: var(--texto);
    }
    .nota {
      margin: 0 0 12px;
      padding: 10px 14px;
      border-left: 3px solid var(--rojo);
      border-radius: 0 8px 8px 0;
      background: rgb(239 68 68 / 0.08);
      font-size: 14px;
      line-height: 1.5;
    }
    .nota strong {
      color: var(--texto);
    }
    .cifras {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin: 0 0 16px;
    }
    .cifras div {
      padding: 10px 14px;
      border: 1px solid var(--linea);
      border-radius: 8px;
      background: rgb(255 255 255 / 0.02);
    }
    .cifras dt {
      margin-bottom: 4px;
      color: var(--texto);
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .cifras dt span {
      color: var(--rojo);
    }
    .cifras dd {
      margin: 0;
      font-size: 14px;
      line-height: 1.45;
    }
    .orden {
      display: grid;
      gap: 6px;
      margin: 8px 0 16px;
      padding: 0;
      list-style: none;
      counter-reset: paso;
    }
    .orden li {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      counter-increment: paso;
    }
    .orden li::before {
      content: counter(paso);
      display: grid;
      flex: none;
      place-items: center;
      width: 26px;
      height: 26px;
      border: 1px solid rgb(239 68 68 / 0.4);
      border-radius: 6px;
      color: var(--texto);
      font-family: var(--mono);
      font-size: 13px;
    }
    .orden li:first-child::before {
      border-color: var(--rojo);
      background: var(--rojo);
      color: #fff;
    }
    .orden strong {
      color: var(--texto);
    }
    .pie-dialogo {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 14px;
      border-top: 1px solid var(--linea);
    }
    .pie-dialogo p {
      margin: 0;
      font-size: 13px;
    }
    @keyframes subir {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.96);
      }
    }
    .resumen {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .resumen li {
      display: grid;
      align-content: start;
      gap: 6px;
      padding: 16px 18px;
      border: 1px solid var(--borde-caja);
      border-radius: var(--radio);
      background: rgb(18 18 18 / 0.85);
      transition:
        transform 200ms var(--curva),
        border-color 200ms;
    }
    .resumen li:hover {
      border-color: rgb(239 68 68 / 0.5);
      transform: translateY(-3px);
    }
    .resumen .etiqueta {
      margin: 0;
    }
    .cifra {
      color: var(--titulo);
      font-family: var(--display);
      font-size: clamp(32px, 4vw, 48px);
      font-weight: 800;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .cifra small {
      color: var(--texto-suave);
      font-size: 0.45em;
    }
    .rojo {
      color: var(--rojo);
      text-shadow: 0 0 24px rgb(239 68 68 / 0.4);
    }
    .progreso {
      display: block;
      height: 4px;
      border-radius: 2px;
      background: rgb(255 255 255 / 0.08);
    }
    .progreso span {
      display: block;
      height: 100%;
      border-radius: 2px;
      background: linear-gradient(90deg, #ef4444, #f87171);
    }
    .invitado {
      margin: 0;
      color: var(--texto-suave);
    }
    a {
      color: var(--rojo);
      font-weight: 600;
    }
    .columnas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr));
      align-items: start;
      gap: 20px;
    }
    .caja {
      min-width: 0;
    }
    .ayuda {
      margin: -4px 0 14px;
      color: var(--texto-suave);
      font-size: 14px;
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
      padding: 10px 12px;
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid var(--linea);
    }
    thead th {
      position: sticky;
      top: 0;
      background: var(--negro);
      color: #e4e4e7;
      font-family: var(--mono);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    thead th:first-child {
      border-radius: 8px 0 0 8px;
    }
    thead th:last-child {
      border-radius: 0 8px 8px 0;
    }
    tbody tr {
      transition: background 150ms;
    }
    tbody tr:hover {
      background: rgb(255 255 255 / 0.04);
    }
    tbody tr:last-child > * {
      border-bottom: 0;
    }
    .tuyo {
      background: rgb(239 68 68 / 0.08);
      box-shadow: inset 3px 0 var(--rojo);
      font-weight: 600;
    }
    .puesto {
      display: inline-grid;
      place-items: center;
      min-width: 28px;
      height: 28px;
      border-radius: 6px;
      color: var(--texto-suave);
      font-family: var(--mono);
      font-size: 13px;
    }
    .podio {
      border: 1px solid rgb(239 68 68 / 0.4);
      color: var(--texto);
    }
    .primero {
      border-color: var(--rojo);
      background: var(--rojo);
      color: #fff;
      box-shadow: 0 0 16px rgb(239 68 68 / 0.45);
    }
    .resultado {
      padding: 3px 10px;
      border: 1px solid var(--linea);
      border-radius: 999px;
      color: var(--texto-suave);
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .gana {
      border-color: var(--rojo);
      background: rgb(239 68 68 / 0.12);
      color: var(--rojo);
    }
    .derrotados {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    .derrotados .progreso {
      width: 72px;
    }
    .error {
      color: var(--rojo);
      font-weight: bold;
    }
    /* En ordenador la página no hace scroll: las tablas largas se desplazan dentro de su caja. */
    @media (min-width: 1000px) and (min-height: 600px) {
      :host {
        display: flex;
        flex-direction: column;
        height: 100dvh;
      }
      main {
        flex: 1;
        grid-template-rows: auto auto minmax(0, 1fr);
        width: 100%;
        min-height: 0;
      }
      .columnas {
        align-items: stretch;
        min-height: 0;
      }
      .columnas .caja {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .tabla {
        overflow-y: auto;
      }
    }
    @media (max-width: 700px) {
      .cifras {
        grid-template-columns: 1fr;
      }
      .resumen {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `,
})
export class Clasificacion {
  protected readonly sesion = inject(Sesion);
  protected readonly clasificacion = httpResource<PuestoEnClasificacion[]>(() => '/api/leaderboard');
  protected readonly misPartidas = httpResource<ResumenPartida[]>(() => (this.sesion.nombre() ? '/api/games/me' : undefined));

  protected readonly cifras = [
    { simbolo: '♥', nombre: 'Victorias', texto: 'Partidas en las que derrotaste a los 12 enemigos del castillo.' },
    { simbolo: '♠', nombre: 'Partidas', texto: 'Todas las terminadas, ganadas o perdidas.' },
    { simbolo: '♦', nombre: 'Mejor partida', texto: 'Más enemigos derrotados en una sola partida, de 0 a 12.' },
    { simbolo: '♣', nombre: 'Comodines', texto: 'Cuántos de los 2 comodines usaste en esa partida.' },
  ];

  /** Las cifras de arriba salen de tus partidas; el puesto, de la clasificación. */
  protected readonly resumen = computed(() => {
    const partidas = this.misPartidas.value();
    if (!this.sesion.nombre() || !partidas) {
      return null;
    }
    const puesto = (this.clasificacion.value() ?? []).findIndex((p) => p.nombre === this.sesion.nombre()) + 1;
    return {
      puesto,
      partidas: partidas.length,
      victorias: partidas.filter((p) => p.resultado === 'VICTORIA').length,
      mejor: Math.max(0, ...partidas.map((p) => p.enemigosDerrotados)),
    };
  });

  // Un clic en el fondo llega al propio <dialog>; dentro del cuadro el destino es un hijo.
  protected cerrarFuera(evento: MouseEvent): void {
    const dialogo = evento.currentTarget as HTMLDialogElement;
    if (evento.target === dialogo) {
      dialogo.close();
    }
  }
}
