import { Component, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carta } from '../carta';
import { Menu } from '../menu';
import { Carta as DatosCarta } from '../modelo';

@Component({
  selector: 'app-reglas',
  host: { '(window:scroll)': 'marcar()' },
  imports: [Carta, Menu, RouterLink],
  template: `
    <app-menu />
    <main>
      <header class="cabecera">
        <p class="terminal"><span>~/regicide $</span> reglas</p>
        <h1>¿Cómo jugar?</h1>
        <p class="entrada">
          Derrota a los 12 enemigos del castillo, uno detrás de otro: primero las 4 sotas, después las 4 reinas y al
          final los 4 reyes. Empiezas con 8 cartas en la mano y la posada como mazo para robar.
        </p>
      </header>

      <nav class="indice" aria-label="Secciones">
        @for (seccion of secciones; track seccion.id; let i = $index) {
          <a [href]="'reglas#' + seccion.id" [class.activa]="activa() === seccion.id" (click)="ir($event, seccion.id)">
            <span class="numero">{{ i + 1 }}</span> {{ seccion.titulo }}
          </a>
        }
      </nav>

      <div class="contenido">
        <section class="caja" id="enemigos">
          <h2 class="etiqueta">01 · Los enemigos</h2>
          <ul class="enemigos">
            @for (enemigo of enemigos; track enemigo.nombre) {
              <li>
                <app-carta [carta]="enemigo.carta" />
                <div>
                  <h3>{{ enemigo.nombre }}</h3>
                  <p class="cifras">
                    <span><small>Vida</small>{{ enemigo.vida }}</span>
                    <span><small>Ataque</small>{{ enemigo.ataque }}</span>
                  </p>
                </div>
              </li>
            }
          </ul>
          <p class="nota">Las figuras robadas valen 10 (sota), 15 (reina) y 20 (rey). El as vale 1.</p>
        </section>

        <section class="caja" id="turno">
          <h2 class="etiqueta">02 · Tu turno</h2>
          <ol class="pasos">
            <li><span><strong>Atacas</strong> con cartas de tu mano. El daño es la suma de sus valores.</span></li>
            <li><span>Se activan los <strong>poderes</strong> de los palos jugados.</span></li>
            <li><span>Si el enemigo llega a 0 de vida, <strong>cae</strong> y pasa el siguiente. Con la vida justa, se va encima de la posada y lo puedes robar como carta.</span></li>
            <li><span>Si sobrevive, te <strong>ataca</strong>: descarta cartas de tu mano que sumen al menos su ataque. Si no puedes, pierdes.</span></li>
          </ol>

          <h3 class="subtitulo">Jugadas que valen</h3>
          <ul class="jugadas">
            @for (jugada of jugadas; track jugada.titulo) {
              <li [class.no-vale]="!jugada.vale">
                <span class="mini">
                  @for (carta of jugada.cartas; track $index) {
                    <app-carta [carta]="carta" />
                  }
                </span>
                <strong>{{ jugada.vale ? '✓' : '✕' }} {{ jugada.titulo }}</strong>
                <span>{{ jugada.texto }}</span>
              </li>
            }
          </ul>
        </section>

        <section class="caja" id="palos">
          <h2 class="etiqueta">03 · Los poderes de los palos</h2>
          <ul class="palos">
            @for (palo of palos; track palo.nombre) {
              <li [class.rojo]="palo.rojo">
                <span class="simbolo" aria-hidden="true">{{ palo.simbolo }}</span>
                <span class="nombre">{{ palo.nombre }}</span>
                <strong>{{ palo.efecto }}</strong>
                <span class="detalle">{{ palo.detalle }}</span>
              </li>
            }
          </ul>
          <p class="nota">Ningún enemigo se deja afectar por el poder de su propio palo.</p>
        </section>

        <section class="caja comodines" id="comodines">
          <h2 class="etiqueta">04 · Comodines</h2>
          <div class="fila">
            <span class="pareja" aria-hidden="true">
              <img src="cartas/comodin.webp" alt="" width="236" height="330" />
              <img src="cartas/comodin.webp" alt="" width="236" height="330" />
            </span>
            <p>
              Tienes <strong>dos por partida</strong>. Cada uno descarta tu mano y te da 8 cartas nuevas. Puedes usarlo
              antes de atacar o antes de defenderte.
            </p>
          </div>
        </section>

        <section class="caja" id="final">
          <h2 class="etiqueta">05 · Ganar y perder</h2>
          <div class="final">
            <div class="victoria">
              <h3>Victoria</h3>
              <p>Derrotas al último rey.</p>
            </div>
            <div>
              <h3>Derrota</h3>
              <p>Sin comodines, no puedes atacar o no puedes cubrir un ataque.</p>
            </div>
          </div>
        </section>

        <section class="listo">
          <div>
            <p class="etiqueta">¿Listo?</p>
            <p class="llamada">El castillo te espera.</p>
          </div>
          <a class="boton-principal" routerLink="/partida">Jugar <span aria-hidden="true">→</span></a>
        </section>
      </div>
    </main>
  `,
  styles: `
    main {
      display: grid;
      grid-template-columns: 220px minmax(0, 1fr);
      grid-template-areas: 'cabecera cabecera' 'indice contenido';
      gap: 24px 40px;
      max-width: 1180px;
      margin: 0 auto;
      padding: 24px 16px 48px;
    }
    .cabecera {
      grid-area: cabecera;
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
    .entrada {
      max-width: 60ch;
      margin: 4px 0 0;
      color: var(--texto-suave);
      font-size: 17px;
      text-wrap: pretty;
    }

    /* El índice se queda fijo al bajar y marca la sección que se está leyendo. */
    .indice {
      grid-area: indice;
      position: sticky;
      top: 96px;
      display: grid;
      align-self: start;
      gap: 2px;
      padding-left: 12px;
      border-left: 1px solid var(--linea);
    }
    .indice a {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: -13px;
      padding: 8px 10px;
      border-left: 2px solid transparent;
      color: var(--texto-suave);
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      transition:
        color 150ms,
        border-color 150ms;
    }
    .indice a:hover {
      color: var(--texto);
    }
    .indice .activa {
      border-color: var(--rojo);
      color: var(--texto);
    }
    .numero {
      color: var(--texto-suave);
      font-family: var(--mono);
      font-size: 11px;
    }
    .activa .numero {
      color: var(--rojo);
    }

    .contenido {
      grid-area: contenido;
      display: grid;
      gap: clamp(40px, 7vh, 80px);
    }
    section {
      scroll-margin-top: 96px;
    }
    .caja {
      padding: 22px 24px;
    }
    .caja > .etiqueta {
      margin-bottom: 16px;
    }
    h3 {
      margin: 0;
      color: var(--titulo);
      font-family: var(--display);
      font-size: 20px;
      font-weight: 800;
    }
    .nota {
      margin: 16px 0 0;
      padding: 10px 14px;
      border-left: 3px solid var(--rojo);
      border-radius: 0 8px 8px 0;
      background: rgb(239 68 68 / 0.08);
      color: var(--texto-suave);
      font-size: 14px;
    }

    .enemigos {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .enemigos li {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px;
      border: 1px solid var(--linea);
      border-radius: 10px;
      background: rgb(255 255 255 / 0.02);
    }
    .enemigos app-carta {
      flex: none;
      width: 72px;
      transition: transform 200ms var(--curva);
    }
    .enemigos li:hover app-carta {
      transform: rotate(-4deg) translateY(-3px);
    }
    .cifras {
      display: flex;
      gap: 16px;
      margin: 6px 0 0;
    }
    .cifras span {
      display: grid;
      color: var(--texto);
      font-family: var(--display);
      font-size: 26px;
      font-weight: 800;
      line-height: 1.1;
    }
    .cifras small {
      color: var(--texto-suave);
      font-family: var(--mono);
      font-size: 10px;
      font-weight: 400;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .pasos {
      display: grid;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
      counter-reset: paso;
    }
    .pasos li {
      display: grid;
      grid-template-columns: 26px 1fr;
      align-items: start;
      gap: 12px;
      color: var(--texto-suave);
      counter-increment: paso;
    }
    .pasos li::before {
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
    .pasos li:first-child::before {
      border-color: var(--rojo);
      background: var(--rojo);
      color: #fff;
    }
    .pasos strong {
      color: var(--texto);
    }
    .subtitulo {
      margin: 22px 0 12px;
      font-size: 16px;
    }
    .jugadas {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .jugadas li {
      display: grid;
      align-content: start;
      gap: 4px;
      padding: 12px;
      border: 1px solid var(--linea);
      border-radius: 10px;
      background: rgb(255 255 255 / 0.02);
      font-size: 13px;
      color: var(--texto-suave);
    }
    .jugadas strong {
      color: var(--texto);
      font-size: 14px;
    }
    .mini {
      display: flex;
      height: 74px;
      margin-bottom: 6px;
    }
    .mini app-carta {
      width: 50px;
      border-radius: 5px;
    }
    .mini app-carta + app-carta {
      margin-left: -14px;
      transform: rotate(6deg);
    }
    .no-vale {
      border-style: dashed !important;
    }
    .no-vale .mini {
      opacity: 0.45;
      filter: grayscale(0.8);
    }
    .no-vale strong {
      color: var(--rojo);
    }

    .palos {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .palos li {
      display: grid;
      align-content: start;
      gap: 4px;
      padding: 14px;
      border: 1px solid var(--linea);
      border-radius: 10px;
      background: rgb(18 18 18 / 0.85);
      transition:
        transform 200ms var(--curva),
        border-color 200ms;
    }
    .palos li:hover {
      border-color: rgb(239 68 68 / 0.5);
      transform: translateY(-3px);
    }
    .simbolo {
      color: var(--texto);
      font-size: 28px;
      line-height: 1.1;
    }
    .rojo .simbolo {
      color: var(--rojo);
    }
    .nombre {
      color: var(--texto-suave);
      font-family: var(--mono);
      font-size: 10px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .detalle {
      color: var(--texto-suave);
      font-size: 13px;
      line-height: 1.45;
    }

    .comodines .fila {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .comodines p {
      margin: 0;
      color: var(--texto-suave);
    }
    .comodines strong {
      color: var(--texto);
    }
    .pareja {
      display: flex;
      flex: none;
    }
    .pareja img {
      width: 64px;
      height: auto;
      border-radius: 6px;
      box-shadow: 0 6px 16px -4px rgb(0 0 0 / 0.8);
      transform: rotate(-6deg);
    }
    .pareja img + img {
      margin-left: -24px;
      transform: rotate(6deg);
    }

    .final {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .final > div {
      padding: 14px 16px;
      border: 1px solid var(--linea);
      border-radius: 10px;
    }
    .final p {
      margin: 4px 0 0;
      color: var(--texto-suave);
      font-size: 14px;
    }
    .final .victoria {
      border-color: rgb(239 68 68 / 0.5);
      background: rgb(239 68 68 / 0.08);
    }
    .victoria h3 {
      color: var(--rojo);
    }

    .listo {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 22px 24px;
      border: 1px solid var(--borde-caja);
      border-top: 2px solid var(--rojo);
      border-radius: var(--radio);
      background: rgb(18 18 18 / 0.85);
    }
    .listo .etiqueta {
      margin: 0;
    }
    .llamada {
      margin: 0;
      color: var(--titulo);
      font-family: var(--display);
      font-size: 24px;
      font-weight: 800;
    }
    .listo .boton-principal {
      min-width: 200px;
      justify-content: space-between;
    }

    @media (max-width: 900px) {
      main {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas: 'cabecera' 'indice' 'contenido';
      }
      /* En el móvil el índice es una fila de pestañas que se desliza en horizontal. */
      .indice {
        position: static;
        display: flex;
        scrollbar-width: none;
        overflow-x: auto;
        margin: 0 -16px;
        padding: 0 16px;
        border-left: 0;
        border-bottom: 1px solid var(--linea);
        background: var(--fondo);
      }
      .indice a {
        flex: none;
        margin: 0 0 -1px;
        border-left: 0;
        border-bottom: 2px solid transparent;
      }
      .enemigos,
      .final {
        grid-template-columns: 1fr;
      }
      .jugadas,
      .palos {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `,
})
export class Reglas {
  protected readonly secciones = [
    { id: 'enemigos', titulo: 'Los enemigos' },
    { id: 'turno', titulo: 'Tu turno' },
    { id: 'palos', titulo: 'Los palos' },
    { id: 'comodines', titulo: 'Comodines' },
    { id: 'final', titulo: 'Ganar y perder' },
  ];
  protected readonly activa = signal('enemigos');

  protected readonly enemigos: { nombre: string; carta: DatosCarta; vida: number; ataque: number }[] = [
    { nombre: 'Sota', carta: { numero: 11, palo: 'DIAMANTES' }, vida: 20, ataque: 10 },
    { nombre: 'Reina', carta: { numero: 12, palo: 'TREBOLES' }, vida: 30, ataque: 15 },
    { nombre: 'Rey', carta: { numero: 13, palo: 'CORAZONES' }, vida: 40, ataque: 20 },
  ];

  protected readonly jugadas: { titulo: string; texto: string; vale: boolean; cartas: DatosCarta[] }[] = [
    { titulo: 'Una carta', texto: 'Cualquiera de tu mano.', vale: true, cartas: [{ numero: 7, palo: 'CORAZONES' }] },
    {
      titulo: 'Mismo número',
      texto: 'De 2 a 4 cartas que sumen 10 o menos.',
      vale: true,
      cartas: [
        { numero: 5, palo: 'PICAS' },
        { numero: 5, palo: 'DIAMANTES' },
      ],
    },
    {
      titulo: 'As y otra',
      texto: 'Un as junto a una única carta.',
      vale: true,
      cartas: [
        { numero: 1, palo: 'DIAMANTES' },
        { numero: 9, palo: 'TREBOLES' },
      ],
    },
    {
      titulo: 'Números distintos',
      texto: 'Sin as, no se pueden mezclar.',
      vale: false,
      cartas: [
        { numero: 8, palo: 'PICAS' },
        { numero: 2, palo: 'DIAMANTES' },
      ],
    },
  ];

  protected readonly palos = [
    {
      simbolo: '♥',
      nombre: 'Corazones',
      efecto: 'Recuperas cartas',
      detalle: 'Devuelve cartas del descarte a la posada, por debajo, tantas como el daño.',
      rojo: true,
    },
    {
      simbolo: '♦',
      nombre: 'Diamantes',
      efecto: 'Robas cartas',
      detalle: 'Robas tantas cartas como el daño, sin pasar de 8 en la mano.',
      rojo: true,
    },
    {
      simbolo: '♠',
      nombre: 'Picas',
      efecto: 'Baja su ataque',
      detalle: 'Baja el ataque del enemigo tanto como el daño, hasta que lo derrotes.',
      rojo: false,
    },
    { simbolo: '♣', nombre: 'Tréboles', efecto: 'Doble de daño', detalle: 'El daño de la jugada cuenta doble.', rojo: false },
  ];

  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  // Tras un clic en el índice, la sección elegida manda hasta que termina el desplazamiento.
  private saltando = false;

  constructor() {
    afterNextRender(() => this.marcar());
  }

  // La sección activa es la última cuyo borde de arriba ya ha pasado una línea bajo el menú. Las
  // últimas nunca suben tanto, así que en el último tramo de scroll la línea baja hasta el pie de
  // la pantalla: cada sección se marca por turno y al final queda la última.
  protected marcar(): void {
    if (this.saltando) {
      return;
    }
    const secciones = [...this.elemento.querySelectorAll<HTMLElement>('.contenido > section[id]')];
    const queda = document.documentElement.scrollHeight - innerHeight - scrollY;
    const linea = Math.max(120, innerHeight - queda);
    const pasadas = secciones.filter((seccion) => seccion.getBoundingClientRect().top <= linea);
    this.activa.set((pasadas.at(-1) ?? secciones[0]).id);
  }

  // El enlace lleva el ancla por si se abre en otra pestaña; aquí se desplaza sin pasar por el router.
  protected ir(evento: MouseEvent, id: string): void {
    evento.preventDefault();
    this.activa.set(id);
    this.saltando = true;
    const soltar = () => (this.saltando = false);
    addEventListener('scrollend', soltar, { once: true });
    // Si ya estaba ahí no hay desplazamiento ni scrollend.
    setTimeout(soltar, 1200);
    this.elemento.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth' });
  }
}
