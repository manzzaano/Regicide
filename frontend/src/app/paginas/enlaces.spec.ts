import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Sesion } from '../sesion';
import { ConfirmarCorreo, Restablecer } from './enlaces';

describe('Enlaces del correo', () => {
  let sesion: { [metodo in 'nombre' | 'restablecer' | 'confirmarCorreo']: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sesion = { nombre: vi.fn(() => null), restablecer: vi.fn(() => of(undefined)), confirmarCorreo: vi.fn(() => of(undefined)) };
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: Sesion, useValue: sesion }] });
  });

  it('restablece la contraseña con el enlace y lo quita de la barra de direcciones', async () => {
    history.replaceState(null, '', '/restablecer#enlace-del-correo');
    const fixture = TestBed.createComponent(Restablecer);
    const pantalla: HTMLElement = fixture.nativeElement;
    await fixture.whenStable();

    expect(location.hash).toBe('');
    const campo = pantalla.querySelector('input')!;
    campo.value = 'una frase de paso larga';
    campo.dispatchEvent(new Event('input'));
    pantalla.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(sesion.restablecer).toHaveBeenCalledWith('enlace-del-correo', 'una frase de paso larga');
    expect(pantalla.textContent).toContain('Contraseña cambiada');
  });

  it('confirma el correo nada más abrir el enlace', async () => {
    history.replaceState(null, '', '/confirmar-correo#otro-enlace');
    const fixture = TestBed.createComponent(ConfirmarCorreo);
    await fixture.whenStable();

    expect(sesion.confirmarCorreo).toHaveBeenCalledWith('otro-enlace');
    expect(fixture.nativeElement.textContent).toContain('Correo confirmado');
  });
});
