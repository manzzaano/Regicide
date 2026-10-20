import { Injectable, Signal, computed, effect, signal } from '@angular/core';

export type Lengua = 'es' | 'en';

const CLAVE = 'idioma';

function guardada(): Lengua {
  try {
    const lengua = localStorage.getItem(CLAVE);
    if (lengua === 'es' || lengua === 'en') {
      return lengua;
    }
  } catch {
    // Sin localStorage se elige por el navegador.
  }
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

/**
 * El idioma de la interfaz. Cada página tiene sus textos en los dos idiomas y elige con
 * `textos()`; al servidor se le pide el mismo con Accept-Language.
 */
@Injectable({ providedIn: 'root' })
export class Idioma {
  readonly actual = signal<Lengua>(guardada());

  constructor() {
    effect(() => {
      const lengua = this.actual();
      document.documentElement.lang = lengua;
      try {
        localStorage.setItem(CLAVE, lengua);
      } catch {
        // Se queda solo para esta visita.
      }
    });
  }

  cambiar(): void {
    this.actual.update((lengua) => (lengua === 'es' ? 'en' : 'es'));
  }

  textos<T>(porLengua: Record<Lengua, T>): Signal<T> {
    return computed(() => porLengua[this.actual()]);
  }
}
