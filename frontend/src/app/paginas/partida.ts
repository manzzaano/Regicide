import { Component, OnInit, effect, inject, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Aviso } from '../aviso';
import { Carta } from '../carta';
import { Juego } from '../juego';
import { Menu } from '../menu';
import { Carta as DatosCarta, EstadoPartida, terminada } from '../modelo';
import { Sesion } from '../sesion';

interface Mensaje {
  titulo: string;
  texto: string;
  invitado?: boolean;
}

/** VistaJuego.fxml de v1. Solo pinta el estado y envía jugadas: las reglas las aplica el servidor. */
@Component({
  selector: 'app-partida',
  imports: [Aviso, Carta, Menu, RouterLink],
  templateUrl: './partida.html',
  styleUrl: './partida.css',
})
export class Partida implements OnInit {
  protected readonly juego = inject(Juego);
  protected readonly sesion = inject(Sesion);

  /** Posiciones de la mano elegidas, en el orden en que se eligieron; se vacía con cada estado nuevo. */
  protected readonly elegidas = linkedSignal<EstadoPartida | null, number[]>({
    source: this.juego.estado,
    computation: () => [],
  });

  /** Los avisos pendientes; se muestran de uno en uno, como los Alert de v1. */
  protected readonly avisos = signal<Mensaje[]>([]);

  protected readonly huecosDeSeleccion = Array.from({ length: 8 }, (_, i) => i);
  protected readonly castillo = ['J', 'J', 'J', 'J', 'Q', 'Q', 'Q', 'Q', 'K', 'K', 'K', 'K'];
  protected readonly terminada = terminada;

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
        this.encolar({ titulo: 'Jugada no válida', texto: error });
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

  protected cancelarSeleccion(): void {
    this.elegidas.set([]);
  }

  protected atacar(): void {
    this.juego.atacar([...this.elegidas()].sort((a, b) => a - b));
  }

  protected defender(): void {
    this.juego.defender([...this.elegidas()].sort((a, b) => a - b));
  }

  protected nuevaPartida(estado: EstadoPartida | null): void {
    if (!estado || terminada(estado) || confirm('¿Abandonar esta partida y empezar otra?')) {
      this.juego.nuevaPartida();
    }
  }

  // Igual que el estilo sin-poder de v1: la carta no activa su poder contra un enemigo de su palo.
  protected sinPoder(carta: DatosCarta, estado: EstadoPartida): boolean {
    return estado.fase === 'ATAQUE' && carta.palo === estado.enemigo?.carta.palo;
  }

  protected cerrarAviso(): void {
    this.avisos.update(([, ...resto]) => resto);
  }

  private avisar(anterior: EstadoPartida | null, estado: EstadoPartida): void {
    if (terminada(estado)) {
      if (!anterior || !terminada(anterior)) {
        const resultado = estado.fase === 'VICTORIA' ? 'Victoria' : 'Derrota';
        this.encolar({ titulo: 'Fin de Partida', texto: `La partida ha terminado: ${resultado}`, invitado: !this.sesion.nombre() });
      }
      return;
    }
    if (anterior && estado.enemigosRestantes < anterior.enemigosRestantes) {
      this.encolar({ titulo: 'Enemigo Derrotado', texto: '¡Has derrotado al enemigo!' });
    }
    if (!estado.mano.length && (!anterior || anterior.mano.length)) {
      this.encolar({ titulo: 'Mano Vacía', texto: 'No te quedan cartas en la mano.' });
    }
  }

  private encolar(mensaje: Mensaje): void {
    this.avisos.update((avisos) => [...avisos, mensaje]);
  }
}
