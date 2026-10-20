import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { Menu } from './menu';
import { Sesion } from './sesion';

describe('Menu', () => {
  let sesion: { nombre: ReturnType<typeof signal<string | null>>; salir: ReturnType<typeof vi.fn> };
  let navegar: ReturnType<typeof vi.spyOn>;
  let salir: HTMLButtonElement;

  beforeEach(() => {
    sesion = { nombre: signal('ana'), salir: vi.fn() };
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: Sesion, useValue: sesion }] });
    navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Menu);
    fixture.detectChanges();
    salir = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find((b) => b.textContent!.includes('Salir'))!;
  });

  it('pide confirmación y lleva a la portada al salir', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    salir.click();
    expect(window.confirm).toHaveBeenCalledWith('¿Cerrar la sesión?');
    expect(sesion.salir).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith('/');
  });

  it('no sale si se cancela', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    salir.click();
    expect(sesion.salir).not.toHaveBeenCalled();
    expect(navegar).not.toHaveBeenCalled();
  });
});
