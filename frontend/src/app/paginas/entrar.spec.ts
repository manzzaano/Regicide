import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Sesion } from '../sesion';
import { Entrar } from './entrar';

describe('Entrar', () => {
  let sesion: {
    nombre: ReturnType<typeof signal<string | null>>;
    entrar: ReturnType<typeof vi.fn>;
    registrarse: ReturnType<typeof vi.fn>;
    olvide: ReturnType<typeof vi.fn>;
  };
  let pantalla: HTMLElement;
  let fixture: ReturnType<typeof TestBed.createComponent<Entrar>>;
  let navegar: ReturnType<typeof vi.spyOn>;

  function escribir(etiqueta: string, valor: string): void {
    const campo = [...pantalla.querySelectorAll('label')].find((l) => l.textContent!.includes(etiqueta))!.control as HTMLInputElement;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  async function pulsar(texto: string): Promise<void> {
    [...pantalla.querySelectorAll('button')].find((b) => b.textContent!.includes(texto))!.click();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function enviar(): Promise<void> {
    pantalla.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    sesion = {
      nombre: signal(null),
      entrar: vi.fn(() => of(undefined)),
      registrarse: vi.fn(() => of(undefined)),
      olvide: vi.fn(() => of('Si la cuenta tiene un correo confirmado, te hemos enviado un enlace.')),
    };
    TestBed.configureTestingModule({
      imports: [Entrar],
      providers: [provideRouter([]), { provide: Sesion, useValue: sesion }],
    });
    navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Entrar);
    pantalla = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('entra con el nombre y la contraseña y lleva a la partida', async () => {
    escribir('Nombre', 'ana');
    escribir('Contraseña', 'una frase de paso larga');

    await enviar();

    expect(sesion.entrar).toHaveBeenCalledWith('ana', 'una frase de paso larga');
    expect(navegar).toHaveBeenCalledWith('/partida');
  });

  it('al crear la cuenta el correo es opcional y lleva a la partida', async () => {
    await pulsar('Crear cuenta');
    expect(pantalla.textContent).toContain('si la olvidas no se puede recuperar la cuenta');
    escribir('Nombre', 'ana');
    escribir('Contraseña', 'una frase de paso larga');
    escribir('Correo', 'ana@example.com');

    await enviar();

    expect(sesion.registrarse).toHaveBeenCalledWith('ana', 'una frase de paso larga', 'ana@example.com');
    expect(navegar).toHaveBeenCalledWith('/partida');
  });

  it('para recuperar la cuenta solo pide el nombre y enseña la respuesta del servidor', async () => {
    await pulsar('¿Has olvidado la contraseña?');
    expect(pantalla.querySelector('input[type="password"]')).toBeNull();
    escribir('Nombre', 'ana');

    await enviar();

    expect(sesion.olvide).toHaveBeenCalledWith('ana');
    expect(pantalla.querySelector('[role="status"]')!.textContent).toContain('te hemos enviado un enlace');
    expect(navegar).not.toHaveBeenCalled();
  });

  it('muestra el mensaje del servidor si falla', async () => {
    sesion.entrar.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, error: { mensaje: 'Nombre o contraseña incorrectos' } })),
    );
    escribir('Nombre', 'ana');
    escribir('Contraseña', 'otra-cosa');

    await enviar();

    expect(pantalla.querySelector('[role="alert"]')!.textContent).toContain('Nombre o contraseña incorrectos');
  });

  it('avisa si el servidor no responde', async () => {
    sesion.entrar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    escribir('Nombre', 'ana');
    escribir('Contraseña', 'una frase de paso larga');

    await enviar();

    expect(pantalla.querySelector('[role="alert"]')!.textContent).toContain('No se ha podido conectar');
  });
});
