import { Component, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carta } from '../carta';
import { Idioma } from '../idioma';
import { Menu } from '../menu';
import { Carta as DatosCarta } from '../modelo';

const es = {
  terminal: 'reglas',
  titulo: '¿Cómo jugar?',
  entrada:
    'Derrota a los 12 enemigos del castillo, uno detrás de otro: primero las 4 sotas, después las 4 reinas y al final los 4 reyes. Empiezas con 8 cartas en la mano y la posada como mazo para robar.',
  indice: 'Secciones',
  secciones: { enemigos: 'Los enemigos', turno: 'Tu turno', palos: 'Los palos', comodines: 'Comodines', final: 'Ganar y perder' },
  tituloEnemigos: '01 · Los enemigos',
  enemigos: ['Sota', 'Reina', 'Rey'],
  vida: 'Vida',
  ataque: 'Ataque',
  valores: 'Las figuras robadas valen 10 (sota), 15 (reina) y 20 (rey). El as vale 1.',
  tituloTurno: '02 · Tu turno',
  // Cada paso: texto antes de la negrita, la negrita y lo que sigue.
  pasos: [
    ['', 'Atacas', ' con cartas de tu mano. El daño es la suma de sus valores.'],
    ['Se activan los ', 'poderes', ' de los palos jugados.'],
    ['Si el enemigo llega a 0 de vida, ', 'cae', ' y pasa el siguiente. Con la vida justa, se va encima de la posada y lo puedes robar como carta.'],
    ['Si sobrevive, te ', 'ataca', ': descarta cartas de tu mano que sumen al menos su ataque. Si no puedes, pierdes.'],
  ],
  jugadasQueValen: 'Jugadas que valen',
  jugadas: [
    { titulo: 'Una carta', texto: 'Cualquiera de tu mano.' },
    { titulo: 'Mismo número', texto: 'De 2 a 4 cartas que sumen 10 o menos.' },
    { titulo: 'As y otra', texto: 'Un as junto a una única carta.' },
    { titulo: 'Números distintos', texto: 'Sin as, no se pueden mezclar.' },
  ],
  tituloPalos: '03 · Los poderes de los palos',
  palos: [
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
  ],
  inmunidad: 'Ningún enemigo se deja afectar por el poder de su propio palo.',
  tituloComodines: '04 · Comodines',
  comodines: ['Tienes ', 'dos por partida', '. Cada uno descarta tu mano y te da 8 cartas nuevas. Puedes usarlo antes de atacar o antes de defenderte.'],
  tituloFinal: '05 · Ganar y perder',
  victoria: 'Victoria',
  comoGanar: 'Derrotas al último rey.',
  derrota: 'Derrota',
  comoPerder: 'Sin comodines, no puedes atacar o no puedes cubrir un ataque.',
  listo: '¿Listo?',
  llamada: 'El castillo te espera.',
  jugar: 'Jugar',
};
const en: typeof es = {
  terminal: 'rules',
  titulo: 'How to play',
  entrada:
    'Defeat the 12 enemies in the castle, one after another: first the 4 jacks, then the 4 queens and finally the 4 kings. You start with 8 cards in your hand and the tavern as the deck to draw from.',
  indice: 'Sections',
  secciones: { enemigos: 'The enemies', turno: 'Your turn', palos: 'The suits', comodines: 'Jokers', final: 'Winning and losing' },
  tituloEnemigos: '01 · The enemies',
  enemigos: ['Jack', 'Queen', 'King'],
  vida: 'Health',
  ataque: 'Attack',
  valores: 'Face cards you draw are worth 10 (jack), 15 (queen) and 20 (king). The ace is worth 1.',
  tituloTurno: '02 · Your turn',
  pasos: [
    ['You ', 'attack', ' with cards from your hand. The damage is the sum of their values.'],
    ['The ', 'powers', ' of the suits you played trigger.'],
    ['If the enemy reaches 0 health, it ', 'falls', ' and the next one comes. With exact damage, it goes on top of the tavern and you can draw it as a card.'],
    ['If it survives, it ', 'attacks', ' you: discard cards from your hand adding up to at least its attack. If you cannot, you lose.'],
  ],
  jugadasQueValen: 'Valid plays',
  jugadas: [
    { titulo: 'One card', texto: 'Any card from your hand.' },
    { titulo: 'Same number', texto: '2 to 4 cards adding up to 10 or less.' },
    { titulo: 'Ace and another', texto: 'An ace together with a single card.' },
    { titulo: 'Different numbers', texto: 'Without an ace, they cannot be mixed.' },
  ],
  tituloPalos: '03 · Suit powers',
  palos: [
    {
      simbolo: '♥',
      nombre: 'Hearts',
      efecto: 'Recover cards',
      detalle: 'Puts cards from the discard pile back under the tavern, as many as the damage.',
      rojo: true,
    },
    {
      simbolo: '♦',
      nombre: 'Diamonds',
      efecto: 'Draw cards',
      detalle: 'Draw as many cards as the damage, up to 8 in your hand.',
      rojo: true,
    },
    {
      simbolo: '♠',
      nombre: 'Spades',
      efecto: 'Lower its attack',
      detalle: 'Lowers the enemy attack by the damage, until you defeat it.',
      rojo: false,
    },
    { simbolo: '♣', nombre: 'Clubs', efecto: 'Double damage', detalle: 'The damage of the play counts double.', rojo: false },
  ],
  inmunidad: 'No enemy is affected by the power of its own suit.',
  tituloComodines: '04 · Jokers',
  comodines: ['You have ', 'two per game', '. Each one discards your hand and gives you 8 new cards. You can use it before attacking or before defending.'],
  tituloFinal: '05 · Winning and losing',
  victoria: 'Victory',
  comoGanar: 'You defeat the last king.',
  derrota: 'Defeat',
  comoPerder: 'With no jokers left, you cannot attack or cannot cover an attack.',
  listo: 'Ready?',
  llamada: 'The castle awaits.',
  jugar: 'Play',
};

@Component({
  selector: 'app-reglas',
  host: { '(window:scroll)': 'marcar()' },
  imports: [Carta, Menu, RouterLink],
  template: `
    <app-menu />
    <main>
      <header class="cabecera">
        <p class="terminal"><span>~/regicide $</span> {{ t().terminal }}</p>
        <h1>{{ t().titulo }}</h1>
        <p class="entrada">{{ t().entrada }}</p>
      </header>

      <nav class="indice" [attr.aria-label]="t().indice">
        @for (seccion of secciones; track seccion; let i = $index) {
          <a [href]="'reglas#' + seccion" [class.activa]="activa() === seccion" (click)="ir($event, seccion)">
            <span class="numero">{{ i + 1 }}</span> {{ t().secciones[seccion] }}
          </a>
        }
      </nav>

      <div class="contenido">
        <section class="caja" id="enemigos">
          <h2 class="etiqueta">{{ t().tituloEnemigos }}</h2>
          <ul class="enemigos">
            @for (enemigo of enemigos; track enemigo.carta.numero; let i = $index) {
              <li>
                <app-carta [carta]="enemigo.carta" />
                <div>
                  <h3>{{ t().enemigos[i] }}</h3>
                  <p class="cifras">
                    <span><small>{{ t().vida }}</small>{{ enemigo.vida }}</span>
                    <span><small>{{ t().ataque }}</small>{{ enemigo.ataque }}</span>
                  </p>
                </div>
              </li>
            }
          </ul>
          <p class="nota">{{ t().valores }}</p>
        </section>

        <section class="caja" id="turno">
          <h2 class="etiqueta">{{ t().tituloTurno }}</h2>
          <ol class="pasos">
            @for (paso of t().pasos; track $index) {
              <li><span>{{ paso[0] }}<strong>{{ paso[1] }}</strong>{{ paso[2] }}</span></li>
            }
          </ol>

          <h3 class="subtitulo">{{ t().jugadasQueValen }}</h3>
          <ul class="jugadas">
            @for (jugada of jugadas; track $index; let i = $index) {
              <li [class.no-vale]="!jugada.vale">
                <span class="mini">
                  @for (carta of jugada.cartas; track $index) {
                    <app-carta [carta]="carta" />
                  }
                </span>
                <strong>{{ jugada.vale ? '✓' : '✕' }} {{ t().jugadas[i].titulo }}</strong>
                <span>{{ t().jugadas[i].texto }}</span>
              </li>
            }
          </ul>
        </section>

        <section class="caja" id="palos">
          <h2 class="etiqueta">{{ t().tituloPalos }}</h2>
          <ul class="palos">
            @for (palo of t().palos; track palo.simbolo) {
              <li [class.rojo]="palo.rojo">
                <span class="simbolo" aria-hidden="true">{{ palo.simbolo }}</span>
                <span class="nombre">{{ palo.nombre }}</span>
                <strong>{{ palo.efecto }}</strong>
                <span class="detalle">{{ palo.detalle }}</span>
              </li>
            }
          </ul>
          <p class="nota">{{ t().inmunidad }}</p>
        </section>

        <section class="caja comodines" id="comodines">
          <h2 class="etiqueta">{{ t().tituloComodines }}</h2>
          <div class="fila">
            <span class="pareja" aria-hidden="true">
              <img src="cartas/comodin.webp" alt="" width="236" height="330" />
              <img src="cartas/comodin.webp" alt="" width="236" height="330" />
            </span>
            <p>{{ t().comodines[0] }}<strong>{{ t().comodines[1] }}</strong>{{ t().comodines[2] }}</p>
          </div>
        </section>

        <section class="caja" id="final">
          <h2 class="etiqueta">{{ t().tituloFinal }}</h2>
          <div class="final">
            <div class="victoria">
              <h3>{{ t().victoria }}</h3>
              <p>{{ t().comoGanar }}</p>
            </div>
            <div>
              <h3>{{ t().derrota }}</h3>
              <p>{{ t().comoPerder }}</p>
            </div>
          </div>
        </section>

        <section class="listo">
          <div>
            <p class="etiqueta">{{ t().listo }}</p>
            <p class="llamada">{{ t().llamada }}</p>
          </div>
          <a class="boton-principal" routerLink="/partida">{{ t().jugar }} <span aria-hidden="true">→</span></a>
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
  protected readonly t = inject(Idioma).textos({ es, en });
  protected readonly secciones = ['enemigos', 'turno', 'palos', 'comodines', 'final'] as const;
  protected readonly activa = signal('enemigos');

  protected readonly enemigos: { carta: DatosCarta; vida: number; ataque: number }[] = [
    { carta: { numero: 11, palo: 'DIAMANTES' }, vida: 20, ataque: 10 },
    { carta: { numero: 12, palo: 'TREBOLES' }, vida: 30, ataque: 15 },
    { carta: { numero: 13, palo: 'CORAZONES' }, vida: 40, ataque: 20 },
  ];

  // Los textos van en el mismo orden, en t().jugadas.
  protected readonly jugadas: { vale: boolean; cartas: DatosCarta[] }[] = [
    { vale: true, cartas: [{ numero: 7, palo: 'CORAZONES' }] },
    {
      vale: true,
      cartas: [
        { numero: 5, palo: 'PICAS' },
        { numero: 5, palo: 'DIAMANTES' },
      ],
    },
    {
      vale: true,
      cartas: [
        { numero: 1, palo: 'DIAMANTES' },
        { numero: 9, palo: 'TREBOLES' },
      ],
    },
    {
      vale: false,
      cartas: [
        { numero: 8, palo: 'PICAS' },
        { numero: 2, palo: 'DIAMANTES' },
      ],
    },
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
