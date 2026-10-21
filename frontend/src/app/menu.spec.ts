import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { Menu } from './menu';
import { Sesion } from './sesion';

describe('Menu', () => {
  let sesion: { nombre: ReturnType<typeof signal<string | null>>; salir: ReturnType<typeof vi.fn> };
  let navegar: ReturnType<typeof vi.spyOn>;
  let salir: HTMLButtonElement;
  let fixture: ReturnType<typeof TestBed.createComponent<Menu>>;

  beforeEach(() => {
    sesion = { nombre: signal('ana'), salir: vi.fn() };
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: Sesion, useValue: sesion }] });
    navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Menu);
    fixture.detectChanges();
    salir = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find((b) => b.textContent!.includes('Salir'))!;
  });

  // Pulsa Salir y responde en el diálogo propio, que sustituye al confirm() del navegador.
  async function responder(boton: string): Promise<void> {
    salir.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const dialogo = (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
    expect(dialogo.open).toBe(true);
    expect(dialogo.textContent).toContain('¿Cerrar la sesión?');
    [...dialogo.querySelectorAll('button')].find((b) => b.textContent!.trim() === boton)!.click();
    fixture.detectChanges();
  }

  it('pide confirmación y lleva a la portada al salir', async () => {
    await responder('Salir');
    expect(sesion.salir).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith('/');
    expect((fixture.nativeElement as HTMLElement).querySelector('dialog')).toBeNull();
  });

  it('no sale si se cancela', async () => {
    await responder('Cancelar');
    expect(sesion.salir).not.toHaveBeenCalled();
    expect(navegar).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).querySelector('dialog')).toBeNull();
  });

  it('el botón del menú lo abre y elegir algo lo cierra', () => {
    const alternar = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.alternar')!;
    alternar.click();
    fixture.detectChanges();
    expect(alternar.getAttribute('aria-expanded')).toBe('true');
    expect(alternar.textContent!.trim()).toBe('Cerrar');

    salir.click();
    fixture.detectChanges();
    expect(alternar.getAttribute('aria-expanded')).toBe('false');
  });
});
