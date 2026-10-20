import { Component, computed, inject, input } from '@angular/core';
import { Idioma } from './idioma';
import { Carta as DatosCarta, nombreCarta } from './modelo';

@Component({
  selector: 'app-carta',
  template: `<img [src]="imagen()" [alt]="nombre()" width="236" height="330" loading="lazy" />`,
  styles: `
    :host {
      display: block;
      aspect-ratio: 236 / 330;
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 3px 8px rgb(0 0 0 / 0.5);
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class Carta {
  readonly carta = input.required<DatosCarta>();
  private readonly idioma = inject(Idioma);

  protected readonly imagen = computed(() => {
    const { numero, palo } = this.carta();
    return `cartas/${palo.toLowerCase()}/${numero}.webp`;
  });
  protected readonly nombre = computed(() => nombreCarta(this.carta(), this.idioma.actual()));
}
