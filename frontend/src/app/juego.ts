import { Injectable, InjectionToken, effect, inject, signal } from '@angular/core';
import { Client, StompConfig } from '@stomp/stompjs';
import { EstadoPartida, terminada } from './modelo';
import { Sesion } from './sesion';

export type ClienteStomp = Pick<Client, 'activate' | 'deactivate' | 'publish' | 'subscribe'>;

/** Los tests lo sustituyen por un cliente falso. */
export const CREAR_CLIENTE = new InjectionToken<(config: StompConfig) => ClienteStomp>('CREAR_CLIENTE', {
  providedIn: 'root',
  factory: () => (config) => new Client(config),
});

// ponytail: se reconoce por el texto que envía el servidor; un código de error haría falta si hubiera más casos así.
const SIN_PARTIDA_GUARDADA = 'No tienes ninguna partida guardada';

function urlDelWebSocket(): string {
  return `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;
}

/**
 * La conexión STOMP con la partida. Solo envía jugadas y guarda el estado que contesta el
 * servidor: ninguna regla se comprueba aquí.
 */
@Injectable({ providedIn: 'root' })
export class Juego {
  private readonly sesion = inject(Sesion);
  private readonly crearCliente = inject(CREAR_CLIENTE);
  private cliente: ClienteStomp | null = null;
  private retomando = false;

  readonly estado = signal<EstadoPartida | null>(null);
  readonly error = signal<string | null>(null);
  readonly conectado = signal(false);

  constructor() {
    // Otra sesión es otra partida: se vuelve a conectar con el token nuevo, o como invitado.
    let tokenAnterior = this.sesion.token();
    effect(() => {
      const token = this.sesion.token();
      if (token !== tokenAnterior) {
        tokenAnterior = token;
        if (this.cliente) {
          this.cerrar();
          this.abrir();
        }
      }
    });
  }

  abrir(): void {
    if (this.cliente) {
      return;
    }
    const token = this.sesion.token();
    this.cliente = this.crearCliente({
      brokerURL: urlDelWebSocket(),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 3000,
      onConnect: () => this.alConectar(),
      onWebSocketClose: () => this.conectado.set(false),
      onStompError: () => this.alRechazarLaConexion(),
    });
    this.cliente.activate();
  }

  cerrar(): void {
    void this.cliente?.deactivate();
    this.cliente = null;
    this.estado.set(null);
    this.conectado.set(false);
    this.retomando = false;
  }

  atacar(cartas: number[]): void {
    this.enviar('atacar', { cartas });
  }

  defender(cartas: number[]): void {
    this.enviar('defender', { cartas });
  }

  usarComodin(): void {
    this.enviar('comodin');
  }

  nuevaPartida(): void {
    this.enviar('abandonar');
    this.enviar('empezar');
  }

  private alConectar(): void {
    this.conectado.set(true);
    this.cliente!.subscribe('/user/queue/partida', (mensaje) => {
      this.retomando = false;
      this.estado.set(JSON.parse(mensaje.body) as EstadoPartida);
    });
    this.cliente!.subscribe('/user/queue/errores', (mensaje) => this.alFallar(JSON.parse(mensaje.body).mensaje));

    const anterior = this.estado();
    if (anterior && terminada(anterior)) {
      return;
    }
    if (this.sesion.token()) {
      this.retomando = true;
      this.enviar('retomar');
    } else {
      this.enviar('empezar');
      if (anterior) {
        this.error.set('Se ha cortado la conexión y la partida se ha perdido: sin cuenta no se guarda. Empiezas otra.');
      }
    }
  }

  private alFallar(mensaje: string): void {
    if (this.retomando && mensaje === SIN_PARTIDA_GUARDADA) {
      this.retomando = false;
      this.enviar('empezar');
      return;
    }
    this.error.set(mensaje);
  }

  // El servidor contesta con un frame ERROR si el token ha caducado o no es válido.
  private alRechazarLaConexion(): void {
    if (this.sesion.token()) {
      this.sesion.salir();
    } else {
      this.error.set('No se ha podido conectar con el servidor');
    }
  }

  private enviar(accion: string, cuerpo?: object): void {
    if (!this.conectado()) {
      this.error.set('Sin conexión con el servidor. Reintentando…');
      return;
    }
    this.error.set(null);
    this.cliente!.publish({ destination: `/app/partida/${accion}`, body: cuerpo ? JSON.stringify(cuerpo) : '' });
  }
}
