import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Juego } from '../juego';
import { EstadoPartida } from '../modelo';
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

  function cartaDeLaMano(posicion: number): HTMLButtonElement {
    return pantalla.querySelectorAll<HTMLButtonElement>('.mano-cartas button')[posicion];
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
    boton('Atacar').click();

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
    expect(boton('Atacar').disabled).toBe(true);
  });

  it('al defenderse dice cuánto hay que cubrir y envía la defensa', async () => {
    await mostrar({ ...EN_ATAQUE, fase: 'DEFENSA' });

    expect(pantalla.textContent).toContain('al menos 10');
    cartaDeLaMano(0).click();
    cartaDeLaMano(1).click();
    fixture.detectChanges();
    boton('Defenderte').click();

    expect(juego.defender).toHaveBeenCalledWith([0, 1]);
  });

  it('la elección se borra cuando llega un estado nuevo', async () => {
    await mostrar(EN_ATAQUE);
    cartaDeLaMano(0).click();

    await mostrar({ ...EN_ATAQUE, cartasEnDescarte: 1 });

    expect(cartaDeLaMano(0).getAttribute('aria-pressed')).toBe('false');
  });

  it('sin comodines no se puede usar ninguno', async () => {
    await mostrar({ ...EN_ATAQUE, comodines: 0 });

    expect(boton('Usar comodín').disabled).toBe(true);
  });

  it('sin cartas en la mano pide usar un comodín', async () => {
    await mostrar({ ...EN_ATAQUE, mano: [] });

    expect(pantalla.textContent).toContain('usa un comodín');
  });

  it('usa un comodín', async () => {
    await mostrar(EN_ATAQUE);

    boton('Usar comodín').click();

    expect(juego.usarComodin).toHaveBeenCalled();
  });

  it('muestra el error del servidor', async () => {
    juego.error.set('Solo puedes combinar cartas del mismo número que sumen 10 o menos');
    await mostrar(EN_ATAQUE);

    expect(pantalla.querySelector('[role="alert"]')!.textContent).toContain('sumen 10 o menos');
  });

  it('al ganar ofrece jugar otra', async () => {
    await mostrar({ ...EN_ATAQUE, fase: 'VICTORIA', enemigo: null, enemigosRestantes: 0, mano: [] });

    expect(pantalla.textContent).toContain('Has derrotado al último rey');
    boton('Jugar otra').click();

    expect(juego.nuevaPartida).toHaveBeenCalled();
  });

  it('al perder dice cuántos enemigos ha derrotado', async () => {
    await mostrar({ ...EN_ATAQUE, fase: 'DERROTA', enemigosRestantes: 5 });

    expect(pantalla.textContent).toContain('7 de 12');
  });
});
