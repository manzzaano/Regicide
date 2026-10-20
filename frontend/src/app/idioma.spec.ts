import { TestBed } from '@angular/core/testing';
import { Idioma } from './idioma';

describe('Idioma', () => {
  afterEach(() => localStorage.clear());

  it('empieza en el idioma del navegador', () => {
    expect(TestBed.inject(Idioma).actual()).toBe('es');
  });

  it('recuerda el idioma elegido y lo pone en la página', () => {
    const idioma = TestBed.inject(Idioma);
    const textos = idioma.textos({ es: 'Hola', en: 'Hello' });

    idioma.cambiar();
    TestBed.tick();

    expect(textos()).toBe('Hello');
    expect(localStorage.getItem('idioma')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('lo elegido gana al navegador', () => {
    localStorage.setItem('idioma', 'en');

    expect(TestBed.inject(Idioma).actual()).toBe('en');
  });
});
