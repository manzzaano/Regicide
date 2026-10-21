import { Component, OnInit, effect, inject, linkedSignal, signal } from '@angular/core';
import { Carta } from '../carta';
import { Confirmacion } from '../confirmacion';
import { FinDePartida } from '../fin-de-partida';
import { Idioma } from '../idioma';
import { Juego } from '../juego';
import { Menu } from '../menu';
import { Carta as DatosCarta, EstadoPartida, nombreCarta, nombrePalo, terminada } from '../modelo';
import { Sesion } from '../sesion';

const es = {
  nueva: 'Nueva Partida',
  partida: 'Partida',
  mazos: 'Mazos',
  nombresMazos: { castillo: 'CASTILLO', posada: 'POSADA', jugadas: 'JUGADAS', descartes: 'DESCARTES' },
  enemigo: 'Enemigo',
  vida: 'Vida',
  ataque: 'Ataque',
  porPicas: (n: number) => `−${n} por picas`,
  derrotados: (n: number) => `${n} de 12 enemigos derrotados`,
  ataca: '> ataca',
  eligeCartas: 'elige cartas de tu mano',
  defiendete: '> defiéndete',
  descarta: (n: number) => `descarta al menos ${n} ${n === 1 ? 'punto' : 'puntos'}`,
  victoria: '> victoria',
  ultimoRey: 'has derrotado al último rey',
  derrota: '> derrota',
  deDoce: (n: number) => `${n} de 12 enemigos`,
  comodines: 'Comodines',
  comodin: (n: number, usado: boolean) => `Comodín ${n}${usado ? ' (usado)' : ''}`,
  pistaComodin: 'Descarta tu mano y roba 8 cartas',
  cartas: (n: number) => `${n}/8 cartas`,
  puntos: (n: number) => `· ${n} ${n === 1 ? 'punto' : 'puntos'}`,
  cancelar: 'Cancelar',
  confirmarDefensa: 'Confirmar Defensa',
  confirmarAtaque: 'Confirmar Ataque',
  sinPoder: 'sin poder',
  motivo: (palo: string) => `el enemigo es de ${palo}`,
  conectando: 'Conectando con el servidor…',
  cerrarAviso: 'Cerrar aviso',
  jugadaNoValida: 'Jugada no válida',
  enemigoDerrotado: 'Enemigo derrotado',
  hasDerrotado: '¡Has derrotado al enemigo!',
  manoVacia: 'Mano vacía',
  sinCartas: 'No te quedan cartas en la mano.',
  abandonar: '¿Abandonar esta partida y empezar otra?',
  usarComodin: '¿Usar un comodín? Descartas tu mano y robas 8 cartas.',
  aceptarComodin: 'Usar comodín',
};
const en: typeof es = {
  nueva: 'New Game',
  partida: 'Game',
  mazos: 'Decks',
  nombresMazos: { castillo: 'CASTLE', posada: 'TAVERN', jugadas: 'PLAYED', descartes: 'DISCARD' },
  enemigo: 'Enemy',
  vida: 'Health',
  ataque: 'Attack',
  porPicas: (n: number) => `−${n} from spades`,
  derrotados: (n: number) => `${n} of 12 enemies defeated`,
  ataca: '> attack',
  eligeCartas: 'choose cards from your hand',
  defiendete: '> defend',
  descarta: (n: number) => `discard at least ${n} ${n === 1 ? 'point' : 'points'}`,
  victoria: '> victory',
  ultimoRey: 'you defeated the last king',
  derrota: '> defeat',
  deDoce: (n: number) => `${n} of 12 enemies`,
  comodines: 'Jokers',
  comodin: (n: number, usado: boolean) => `Joker ${n}${usado ? ' (used)' : ''}`,
  pistaComodin: 'Discard your hand and draw 8 cards',
  cartas: (n: number) => `${n}/8 cards`,
  puntos: (n: number) => `· ${n} ${n === 1 ? 'point' : 'points'}`,
  cancelar: 'Cancel',
  confirmarDefensa: 'Confirm Defense',
  confirmarAtaque: 'Confirm Attack',
  sinPoder: 'no power',
  motivo: (palo: string) => `the enemy is ${palo}`,
  conectando: 'Connecting to the server…',
  cerrarAviso: 'Close notice',
  jugadaNoValida: 'Invalid move',
  enemigoDerrotado: 'Enemy defeated',
  hasDerrotado: 'You defeated the enemy!',
  manoVacia: 'Empty hand',
  sinCartas: 'You have no cards left in your hand.',
  abandonar: 'Abandon this game and start another one?',
  usarComodin: 'Use a joker? You discard your hand and draw 8 cards.',
  aceptarComodin: 'Use joker',
};

interface Mensaje {
  id: number;
  titulo: string;
  texto: string;
  error: boolean;
}

/** VistaJuego.fxml de v1. Solo pinta el estado y envía jugadas: las reglas las aplica el servidor. */
@Component({
  selector: 'app-partida',
  imports: [Carta, Confirmacion, FinDePartida, Menu],
  templateUrl: './partida.html',
  styleUrl: './partida.css',
})
export class Partida implements OnInit {
  protected readonly juego = inject(Juego);
  protected readonly sesion = inject(Sesion);
  protected readonly idioma = inject(Idioma);
  protected readonly t = this.idioma.textos({ es, en });

  /** Posiciones de la mano elegidas, en el orden en que se eligieron; se vacía con cada estado nuevo. */
  protected readonly elegidas = linkedSignal<EstadoPartida | null, number[]>({
    source: this.juego.estado,
    computation: () => [],
  });

  /** Avisos de la esquina: no paran la partida y se cierran solos, a diferencia de los Alert de v1. */
  protected readonly avisos = signal<Mensaje[]>([]);
  /** Lo que no se deshace se pregunta antes: abandonar la partida o gastar un comodín. */
  protected readonly preguntando = signal<'abandonar' | 'comodin' | null>(null);
  private siguienteAviso = 0;

  /** El diálogo de fin de partida se puede cerrar para ver la mesa; vuelve con cada estado nuevo. */
  protected readonly finCerrado = linkedSignal<EstadoPartida | null, boolean>({
    source: this.juego.estado,
    computation: () => false,
  });

  protected readonly simbolos = { PICAS: '♠', CORAZONES: '♥', TREBOLES: '♣', DIAMANTES: '♦' };
  protected readonly castillo = ['J', 'J', 'J', 'J', 'Q', 'Q', 'Q', 'Q', 'K', 'K', 'K', 'K'];
  protected readonly terminada = terminada;
  protected readonly nombreCarta = nombreCarta;
  protected readonly nombrePalo = nombrePalo;

  constructor() {
    let anterior: EstadoPartida | null = null;
    effect(() => {
      const estado = this.juego.estado();
      if (estado) {
        this.avisar(anterior, estado);
      }
      anterior = estado;
    });
    effect(() => {
      const error = this.juego.error();
      if (error) {
        this.encolar(this.t().jugadaNoValida, error, true);
      }
    });
  }

  ngOnInit(): void {
    this.juego.abrir();
  }

  protected alternar(posicion: number): void {
    this.elegidas.update((elegidas) =>
      elegidas.includes(posicion) ? elegidas.filter((p) => p !== posicion) : [...elegidas, posicion],
    );
  }

  // Solo para dibujar la barra de vida y el escudo; los valores reales llegan del servidor.
  protected base(carta: DatosCarta): { vida: number; ataque: number } {
    return { 11: { vida: 20, ataque: 10 }, 12: { vida: 30, ataque: 15 } }[carta.numero] ?? { vida: 40, ataque: 20 };
  }

  protected porcentajeDeVida(estado: EstadoPartida): number {
    return estado.enemigo ? (estado.enemigo.vida / this.base(estado.enemigo.carta).vida) * 100 : 0;
  }

  protected ataqueReducido(estado: EstadoPartida): number {
    return estado.enemigo ? Math.max(0, this.base(estado.enemigo.carta).ataque - estado.enemigo.ataque) : 0;
  }

  protected mazos(estado: EstadoPartida): { clave: string; nombre: string; cartas: number }[] {
    const nombres = this.t().nombresMazos;
    return [
      { clave: 'castillo', nombre: nombres.castillo, cartas: estado.enemigosRestantes },
      { clave: 'posada', nombre: nombres.posada, cartas: estado.cartasEnPosada },
      { clave: 'jugadas', nombre: nombres.jugadas, cartas: estado.cartasJugadas.length },
      { clave: 'descartes', nombre: nombres.descartes, cartas: estado.cartasEnDescarte },
    ];
  }

  /** Grosor de la pila dibujada: una capa por cada 8 cartas, de 1 a 6; ninguna si el mazo está vacío. */
  protected capas(cartas: number): number[] {
    return Array.from({ length: cartas ? Math.min(6, Math.ceil(cartas / 8)) : 0 });
  }

  // Valor de una carta en la mano: el as 1 y las figuras robadas 10, 15 y 20, como en las reglas.
  protected puntosElegidos(estado: EstadoPartida): number {
    const valor = (numero: number) => ({ 11: 10, 12: 15, 13: 20 })[numero] ?? numero;
    return this.elegidas().reduce((suma, i) => suma + valor(estado.mano[i].numero), 0);
  }

  // La inclinación 3D y el reflejo siguen al puntero; con transform en CSS, sin volver a pintar la vista.
  protected inclinar(evento: PointerEvent): void {
    const carta = evento.currentTarget as HTMLElement;
    const { left, top, width, height } = carta.getBoundingClientRect();
    const x = (evento.clientX - left) / width;
    const y = (evento.clientY - top) / height;
    carta.style.setProperty('--rx', `${(0.5 - y) * 18}deg`);
    carta.style.setProperty('--ry', `${(x - 0.5) * 18}deg`);
    carta.style.setProperty('--gx', `${x * 100}%`);
    carta.style.setProperty('--gy', `${y * 100}%`);
  }

  protected enderezar(evento: PointerEvent): void {
    const carta = evento.currentTarget as HTMLElement;
    for (const propiedad of ['--rx', '--ry', '--gx', '--gy']) {
      carta.style.removeProperty(propiedad);
    }
  }

  protected cancelarSeleccion(): void {
    this.elegidas.set([]);
  }

  protected atacar(): void {
    this.juego.atacar([...this.elegidas()].sort((a, b) => a - b));
  }

  protected defender(): void {
    this.juego.defender([...this.elegidas()].sort((a, b) => a - b));
  }

  // Con la partida en juego, antes se pregunta.
  protected nuevaPartida(estado: EstadoPartida | null): void {
    if (!estado || terminada(estado)) {
      this.juego.nuevaPartida();
    } else {
      this.preguntando.set('abandonar');
    }
  }

  protected responder(confirmado: boolean): void {
    const pregunta = this.preguntando();
    this.preguntando.set(null);
    if (!confirmado) {
      return;
    }
    if (pregunta === 'abandonar') {
      this.juego.nuevaPartida();
    } else {
      this.juego.usarComodin();
    }
  }

  // Igual que el estilo sin-poder de v1: la carta no activa su poder contra un enemigo de su palo.
  protected sinPoder(carta: DatosCarta, estado: EstadoPartida): boolean {
    return estado.fase === 'ATAQUE' && carta.palo === estado.enemigo?.carta.palo;
  }

  protected cerrarAviso(id: number): void {
    this.avisos.update((avisos) => avisos.filter((aviso) => aviso.id !== id));
  }

  // El final lo cuenta su propio diálogo; aquí solo lo que pasa durante la partida.
  private avisar(anterior: EstadoPartida | null, estado: EstadoPartida): void {
    if (terminada(estado)) {
      return;
    }
    if (anterior && estado.enemigosRestantes < anterior.enemigosRestantes) {
      this.encolar(this.t().enemigoDerrotado, this.t().hasDerrotado);
    }
    if (!estado.mano.length && (!anterior || anterior.mano.length)) {
      this.encolar(this.t().manoVacia, this.t().sinCartas);
    }
  }

  private encolar(titulo: string, texto: string, error = false): void {
    const id = this.siguienteAviso++;
    this.avisos.update((avisos) => [...avisos, { id, titulo, texto, error }]);
    setTimeout(() => this.cerrarAviso(id), error ? 6000 : 4000);
  }
}
