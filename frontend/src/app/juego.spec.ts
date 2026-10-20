import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { StompConfig } from '@stomp/stompjs';
import { CREAR_CLIENTE, ClienteStomp, Juego } from './juego';
import { EstadoPartida } from './modelo';
import { Sesion } from './sesion';
import { tokenDePrueba } from './pruebas';

class ClienteFalso {
  activo = false;
  readonly enviados: string[] = [];
  private readonly suscripciones = new Map<string, (mensaje: { body: string }) => void>();

  constructor(readonly config: StompConfig) {}

  activate(): void {
    this.activo = true;
  }

  deactivate(): Promise<void> {
    this.activo = false;
    return Promise.resolve();
  }

  publish({ destination, body }: { destination: string; body?: string }): void {
    this.enviados.push(body ? `${destination} ${body}` : destination);
  }

  subscribe(destino: string, alRecibir: (mensaje: { body: string }) => void) {
    this.suscripciones.set(destino, alRecibir);
    return { unsubscribe: () => this.suscripciones.delete(destino) };
  }

  conectar(): void {
    this.config.onConnect?.({} as never);
  }

  recibir(destino: string, cuerpo: unknown): void {
    this.suscripciones.get(destino)!({ body: JSON.stringify(cuerpo) });
  }
}

const ESTADO: EstadoPartida = {
  fase: 'ATAQUE',
  mano: [{ numero: 7, palo: 'CORAZONES' }],
  enemigo: { carta: { numero: 11, palo: 'PICAS' }, vida: 20, ataque: 10 },
  enemigosRestantes: 11,
  cartasEnPosada: 32,
  cartasEnDescarte: 0,
  cartasJugadas: [],
  comodines: 2,
};

describe('Juego', () => {
  let clientes: ClienteFalso[];
  let juego: Juego;
  let sesion: Sesion;

  const cliente = () => clientes.at(-1)!;

  function crear(): void {
    clientes = [];
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: CREAR_CLIENTE,
          useValue: (config: StompConfig) => {
            const nuevo = new ClienteFalso(config);
            clientes.push(nuevo);
            return nuevo as unknown as ClienteStomp;
          },
        },
      ],
    });
    juego = TestBed.inject(Juego);
    sesion = TestBed.inject(Sesion);
  }

  afterEach(() => localStorage.clear());

  describe('como invitado', () => {
    beforeEach(() => {
      crear();
      juego.abrir();
      cliente().conectar();
    });

    it('se conecta sin token y empieza una partida', () => {
      expect(cliente().config.connectHeaders).toEqual({ 'Accept-Language': 'es' });
      expect(cliente().enviados).toEqual(['/app/partida/empezar']);
    });

    it('muestra el estado que envía el servidor', () => {
      cliente().recibir('/user/queue/partida', ESTADO);

      expect(juego.estado()).toEqual(ESTADO);
    });

    it('envía las posiciones de las cartas elegidas', () => {
      juego.atacar([0, 2]);
      juego.defender([1]);
      juego.usarComodin();

      expect(cliente().enviados.slice(1)).toEqual([
        '/app/partida/atacar {"cartas":[0,2]}',
        '/app/partida/defender {"cartas":[1]}',
        '/app/partida/comodin',
      ]);
    });

    it('muestra el error del servidor hasta la siguiente jugada', () => {
      cliente().recibir('/user/queue/errores', { codigo: 'jugada.carta-fuera', mensaje: 'Esa carta no está en tu mano' });
      expect(juego.error()).toBe('Esa carta no está en tu mano');

      juego.atacar([0]);
      expect(juego.error()).toBeNull();
    });

    it('una partida nueva abandona la actual antes de empezar', () => {
      juego.nuevaPartida();

      expect(cliente().enviados.slice(1)).toEqual(['/app/partida/abandonar', '/app/partida/empezar']);
    });

    it('si se corta la conexión, avisa de que la partida se ha perdido y empieza otra', () => {
      cliente().recibir('/user/queue/partida', ESTADO);

      cliente().conectar();

      expect(cliente().enviados.at(-1)).toBe('/app/partida/empezar');
      expect(juego.error()).toContain('se ha perdido');
    });

    it('al iniciar sesión se reconecta con el token', () => {
      localStorage.setItem('token', tokenDePrueba('ana'));
      sesion.token.set(localStorage.getItem('token'));
      TestBed.tick();

      expect(clientes[0].activo).toBe(false);
      expect(cliente().config.connectHeaders).toEqual({ 'Accept-Language': 'es', Authorization: `Bearer ${sesion.token()}` });
      expect(juego.estado()).toBeNull();
    });
  });

  describe('con cuenta', () => {
    beforeEach(() => {
      localStorage.setItem('token', tokenDePrueba('ana'));
      crear();
      juego.abrir();
      cliente().conectar();
    });

    it('se conecta con el token y retoma la partida guardada', () => {
      expect(cliente().config.connectHeaders).toEqual({ 'Accept-Language': 'es', Authorization: `Bearer ${sesion.token()}` });
      expect(cliente().enviados).toEqual(['/app/partida/retomar']);
    });

    it('si no hay partida guardada, empieza una sin mostrar error', () => {
      cliente().recibir('/user/queue/errores', { codigo: 'partida.sin-guardada', mensaje: 'No tienes ninguna partida guardada' });

      expect(cliente().enviados).toEqual(['/app/partida/retomar', '/app/partida/empezar']);
      expect(juego.error()).toBeNull();
    });

    it('si se corta la conexión, retoma la partida al volver', () => {
      cliente().recibir('/user/queue/partida', ESTADO);

      cliente().conectar();

      expect(cliente().enviados.at(-1)).toBe('/app/partida/retomar');
    });

    it('una partida terminada se queda en pantalla al reconectar', () => {
      cliente().recibir('/user/queue/partida', { ...ESTADO, fase: 'VICTORIA' });

      cliente().conectar();

      expect(cliente().enviados).toEqual(['/app/partida/retomar']);
    });

    it('si el servidor rechaza el token, cierra la sesión y entra como invitado', () => {
      cliente().config.onStompError?.({} as never);
      TestBed.tick();

      expect(sesion.nombre()).toBeNull();
      expect(cliente().config.connectHeaders).toEqual({ 'Accept-Language': 'es' });
    });
  });
});
