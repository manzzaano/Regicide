import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Sesion } from '../sesion';
import { Entrar } from './entrar';

describe('Entrar', () => {
  let sesion: { entrar: ReturnType<typeof vi.fn>; registrarse: ReturnType<typeof vi.fn> };
  let pantalla: HTMLElement;
  let fixture: ReturnType<typeof TestBed.createComponent<Entrar>>;
  let navegar: ReturnType<typeof vi.spyOn>;

  function escribir(etiqueta: string, valor: string): void {
    const campo = [...pantalla.querySelectorAll('label')].find((l) => l.textContent!.includes(etiqueta))!.control as HTMLInputElement;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  async function enviar(): Promise<void> {
    pantalla.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    sesion = { entrar: vi.fn(() => of(undefined)), registrarse: vi.fn(() => of(undefined)) };
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
    escribir('Contraseña', 'contrasena-segura');

    await enviar();

    expect(sesion.entrar).toHaveBeenCalledWith('ana', 'contrasena-segura');
    expect(navegar).toHaveBeenCalledWith('/partida');
  });

  it('crea la cuenta desde la otra pestaña', async () => {
    [...pantalla.querySelectorAll('button')].find((b) => b.textContent!.includes('Crear cuenta'))!.click();
    fixture.detectChanges();
    escribir('Nombre', 'ana');
    escribir('Contraseña', 'contrasena-segura');

    await enviar();

    expect(sesion.registrarse).toHaveBeenCalledWith('ana', 'contrasena-segura');
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
    escribir('Contraseña', 'contrasena-segura');

    await enviar();

    expect(pantalla.querySelector('[role="alert"]')!.textContent).toContain('No se ha podido conectar');
  });
});
