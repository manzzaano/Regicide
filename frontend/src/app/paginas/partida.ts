import { Component, OnInit, inject, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carta } from '../carta';
import { Juego } from '../juego';
import { EstadoPartida, nombreCarta, nombrePalo, terminada } from '../modelo';
import { Sesion } from '../sesion';

@Component({
  selector: 'app-partida',
  imports: [Carta, RouterLink],
  templateUrl: './partida.html',
  styleUrl: './partida.css',
})
export class Partida implements OnInit {
  protected readonly juego = inject(Juego);
  protected readonly sesion = inject(Sesion);

  /** Posiciones de la mano elegidas; se vacía con cada estado nuevo. */
  protected readonly elegidas = linkedSignal<EstadoPartida | null, number[]>({
    source: this.juego.estado,
    computation: () => [],
  });

  protected readonly nombreCarta = nombreCarta;
  protected readonly nombrePalo = nombrePalo;
  protected readonly terminada = terminada;

  ngOnInit(): void {
    this.juego.abrir();
  }

  protected alternar(posicion: number): void {
    this.elegidas.update((elegidas) =>
      elegidas.includes(posicion) ? elegidas.filter((p) => p !== posicion) : [...elegidas, posicion].sort((a, b) => a - b),
    );
  }

  protected jugar(estado: EstadoPartida): void {
    if (estado.fase === 'ATAQUE') {
      this.juego.atacar(this.elegidas());
    } else {
      this.juego.defender(this.elegidas());
    }
  }

  protected nuevaPartida(estado: EstadoPartida): void {
    if (terminada(estado) || confirm('¿Abandonar esta partida y empezar otra?')) {
      this.juego.nuevaPartida();
    }
  }
}
