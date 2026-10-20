import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Sesion } from '../sesion';
import { Cuenta } from './cuenta';

describe('Cuenta', () => {
  let sesion: {
    nombre: ReturnType<typeof signal<string | null>>;
    cambiarContrasena: ReturnType<typeof vi.fn>;
    cuenta: ReturnType<typeof vi.fn>;
    cambiarCorreo: ReturnType<typeof vi.fn>;
    borrarCuenta: ReturnType<typeof vi.fn>;
  };
  let pantalla: HTMLElement;
  let fixture: ReturnType<typeof TestBed.createComponent<Cuenta>>;
  let navegar: ReturnType<typeof vi.spyOn>;

  function seccion(titulo: string): HTMLElement {
    return [...pantalla.querySelectorAll('section')].find((s) => s.querySelector('h2')!.textContent!.includes(titulo))!;
  }

  function escribir(titulo: string, etiqueta: string, valor: string): void {
    const campo = [...seccion(titulo).querySelectorAll('label')].find((l) => l.textContent!.includes(etiqueta))!
      .control as HTMLInputElement;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  async function enviar(titulo: string): Promise<void> {
    seccion(titulo).querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    sesion = {
      nombre: signal('ana'),
      cambiarContrasena: vi.fn(() => of(undefined)),
      cuenta: vi.fn(() => of({ nombre: 'ana', correo: null, correoPendiente: null })),
      cambiarCorreo: vi.fn(() => of({ nombre: 'ana', correo: null, correoPendiente: 'ana@example.com' })),
      borrarCuenta: vi.fn(() => of(undefined)),
    };
    TestBed.configureTestingModule({
      imports: [Cuenta],
      providers: [provideRouter([]), { provide: Sesion, useValue: sesion }],
    });
    navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Cuenta);
    pantalla = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('cambia la contraseña con la actual y la nueva', async () => {
    escribir('Cambiar la contraseña', 'actual', 'una frase de paso larga');
    escribir('Cambiar la contraseña', 'nueva', 'otra frase de paso larga');

    await enviar('Cambiar la contraseña');

    expect(sesion.cambiarContrasena).toHaveBeenCalledWith('una frase de paso larga', 'otra frase de paso larga');
    expect(pantalla.textContent).toContain('Contraseña cambiada');
  });

  it('enseña el error del servidor solo en su sección', async () => {
    sesion.cambiarContrasena.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 403, error: { mensaje: 'La contraseña actual no es correcta' } })),
    );

    await enviar('Cambiar la contraseña');

    expect(seccion('Cambiar la contraseña').querySelector('[role="alert"]')!.textContent).toContain('no es correcta');
    expect(seccion('Borrar la cuenta').querySelector('[role="alert"]')).toBeNull();
  });

  it('sin correo avisa de que la cuenta no se podrá recuperar', () => {
    expect(seccion('Correo de recuperación').textContent).toContain('no se puede recuperar la cuenta');
  });

  it('guarda el correo con la contraseña y lo enseña pendiente de confirmar', async () => {
    escribir('Correo de recuperación', 'Correo nuevo', ' ana@example.com ');
    escribir('Correo de recuperación', 'actual', 'una frase de paso larga');

    await enviar('Correo de recuperación');

    expect(sesion.cambiarCorreo).toHaveBeenCalledWith('ana@example.com', 'una frase de paso larga');
    expect(seccion('Correo de recuperación').textContent).toContain('Sin confirmar: ana@example.com');
  });

  it('al borrar la cuenta vuelve a la portada', async () => {
    escribir('Borrar la cuenta', 'actual', 'una frase de paso larga');

    await enviar('Borrar la cuenta');

    expect(sesion.borrarCuenta).toHaveBeenCalledWith('una frase de paso larga');
    expect(navegar).toHaveBeenCalledWith('/');
  });
});
