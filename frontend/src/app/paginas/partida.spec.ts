import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Juego } from '../juego';
import { EstadoPartida, nombreCarta } from '../modelo';
import { Sesion } from '../sesion';
import { Partida } from './partida';

const EN_ATAQUE: EstadoPartida = {
  fase: 'ATAQUE',
  mano: [
    { numero: 7, palo: 'CORAZONES' },
    { numero: 3, palo: 'PICAS' },
    { numero: 3, palo: 'TREBOLES' },
  ],
  enemigo: { carta: { numero: 11, palo: 'PICAS' }, vida: 20, ataque: 10 },
  enemigosRestantes: 12,
  cartasEnPosada: 40,
  cartasEnDescarte: 0,
  cartasJugadas: [],
  comodines: 2,
};

describe('Partida', () => {
  let juego: {
    estado: ReturnType<typeof signal<EstadoPartida | null>>;
    error: ReturnType<typeof signal<string | null>>;
    conectado: ReturnType<typeof signal<boolean>>;
    abrir: ReturnType<typeof vi.fn>;
    atacar: ReturnType<typeof vi.fn>;
    defender: ReturnType<typeof vi.fn>;
    usarComodin: ReturnType<typeof vi.fn>;
    nuevaPartida: ReturnType<typeof vi.fn>;
  };
  let fixture: ReturnType<typeof TestBed.createComponent<Partida>>;
  let pantalla: HTMLElement;

  async function mostrar(estado: EstadoPartida | null): Promise<void> {
    juego.estado.set(estado);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function boton(texto: string): HTMLButtonElement {
    const encontrado = [...pantalla.querySelectorAll('button')].find((b) => b.textContent!.trim().startsWith(texto));
    if (!encontrado) {
      throw new Error(`No hay ningún botón «${texto}»`);
    }
    return encontrado;
  }

  function aviso(): string | null {
    return pantalla.querySelector('[role="alertdialog"]')?.textContent ?? null;
  }

  function cartaDeLaMano(posicion: number): HTMLButtonElement {
    return pantalla.querySelectorAll<HTMLButtonElement>('.mano button')[posicion];
  }

  beforeEach(() => {
    juego = {
      estado: signal(null),
      error: signal(null),
      conectado: signal(true),
      abrir: vi.fn(),
      atacar: vi.fn(),
      defender: vi.fn(),
      usarComodin: vi.fn(),
      nuevaPartida: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [Partida],
      providers: [
        provideRouter([]),
        { provide: Juego, useValue: juego },
        { provide: Sesion, useValue: { nombre: signal(null) } },
      ],
    });
    fixture = TestBed.createComponent(Partida);
    pantalla = fixture.nativeElement;
  });

  it('abre la conexión al entrar y espera el estado', async () => {
    await mostrar(null);

    expect(juego.abrir).toHaveBeenCalled();
    expect(pantalla.textContent).toContain('Conectando');
  });

  it('ataca con las cartas elegidas, en el orden de la mano', async () => {
    await mostrar(EN_ATAQUE);

    cartaDeLaMano(2).click();
    cartaDeLaMano(1).click();
    fixture.detectChanges();
    boton('Confirmar Ataque').click();

    expect(juego.atacar).toHaveBeenCalledWith([1, 2]);
  });

  it('una carta elegida se puede soltar', async () => {
    await mostrar(EN_ATAQUE);

    cartaDeLaMano(0).click();
    fixture.detectChanges();
    expect(cartaDeLaMano(0).getAttribute('aria-pressed')).toBe('true');

    cartaDeLaMano(0).click();
    fixture.detectChanges();
    expect(cartaDeLaMano(0).getAttribute('aria-pressed')).toBe('false');
    expect(boton('Confirmar Ataque').disabled).toBe(true);
  });

  it('envía la defensa con las cartas elegidas', async () => {
    await mostrar({ ...EN_ATAQUE, fase: 'DEFENSA' });

    expect(boton('Confirmar Ataque').disabled).toBe(true);
    cartaDeLaMano(0).click();
    cartaDeLaMano(1).click();
    fixture.detectChanges();
    boton('Confirmar Defensa').click();

    expect(juego.defender).toHaveBeenCalledWith([0, 1]);
  });

  it('las cartas elegidas pasan a la caja de selección y Cancelar Selección las suelta', async () => {
    await mostrar(EN_ATAQUE);

    cartaDeLaMano(1).click();
    fixture.detectChanges();
    expect(pantalla.querySelector('.seleccion img')!.getAttribute('alt')).toBe(nombreCarta(EN_ATAQUE.mano[1]));

    boton('Cancelar Selección').click();
    fixture.detectChanges();
    expect(pantalla.querySelector('.seleccion img')).toBeNull();
    expect(cartaDeLaMano(1).getAttribute('aria-pressed')).toBe('false');
  });

  it('la elección se borra cuando llega un estado nuevo', async () => {
    await mostrar(EN_ATAQUE);
    cartaDeLaMano(0).click();

    await mostrar({ ...EN_ATAQUE, cartasEnDescarte: 1 });

    expect(cartaDeLaMano(0).getAttribute('aria-pressed')).toBe('false');
  });

  it('marca las cartas del palo del enemigo, que no activan su poder', async () => {
    await mostrar(EN_ATAQUE);

    expect(cartaDeLaMano(1).classList).toContain('sin-poder');
    expect(cartaDeLaMano(0).classList).not.toContain('sin-poder');
  });

  it('muestra el estado de los mazos como v1', async () => {
    await mostrar(EN_ATAQUE);

    expect(pantalla.querySelector('.caja-mazos')!.textContent).toContain('| POSADA: 40');
  });

  it('los comodines usados quedan desactivados y el otro se puede usar', async () => {
    await mostrar({ ...EN_ATAQUE, comodines: 1 });
    const [usado, libre] = pantalla.querySelectorAll<HTMLButtonElement>('.comodines button');

    expect(usado.disabled).toBe(true);
    libre.click();

    expect(juego.usarComodin).toHaveBeenCalled();
  });

  it('avisa cuando la mano se queda vacía', async () => {
    await mostrar({ ...EN_ATAQUE, mano: [] });

    expect(aviso()).toContain('No te quedan cartas en la mano.');
  });

  it('avisa del error del servidor y el aviso se cierra con Aceptar', async () => {
    await mostrar(EN_ATAQUE);
    juego.error.set('Solo puedes combinar cartas del mismo número que sumen 10 o menos');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(aviso()).toContain('sumen 10 o menos');
    boton('Aceptar').click();
    fixture.detectChanges();
    expect(aviso()).toBeNull();
  });

  it('avisa al derrotar a un enemigo', async () => {
    await mostrar(EN_ATAQUE);
    await mostrar({ ...EN_ATAQUE, enemigosRestantes: 11 });

    expect(aviso()).toContain('¡Has derrotado al enemigo!');
  });

  it('al terminar avisa del resultado y Nueva Partida empieza otra sin preguntar', async () => {
    await mostrar({ ...EN_ATAQUE, fase: 'DERROTA', enemigosRestantes: 5 });

    expect(aviso()).toContain('La partida ha terminado: Derrota');
    boton('Nueva Partida').click();

    expect(juego.nuevaPartida).toHaveBeenCalled();
  });
});
