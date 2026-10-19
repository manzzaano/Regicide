import { Component, computed, input } from '@angular/core';
import { Carta as DatosCarta, nombreCarta } from './modelo';

@Component({
  selector: 'app-carta',
  template: `<img [src]="imagen()" [alt]="nombre()" width="236" height="330" loading="lazy" />`,
  styles: `
    :host {
      display: block;
      aspect-ratio: 236 / 330;
      border-radius: 6%/4.3%;
      overflow: hidden;
      background: #fff;
      box-shadow: var(--sombra);
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

  protected readonly imagen = computed(() => {
    const { numero, palo } = this.carta();
    return `cartas/${palo.toLowerCase()}/${numero}.webp`;
  });
  protected readonly nombre = computed(() => nombreCarta(this.carta()));
}
