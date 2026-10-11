import { Component, computed, inject, input, output } from '@angular/core';
import { CardsService } from '../services/cards.service';

type CardSize = 'hand' | 'enemy' | 'mini' | 'showcase';

/**
 * Carta reutilizable fiel al v1: fondo blanco, esquinas redondeadas,
 * dropshadow, y los estados visuales del original
 * (enemy → halo rojo, sin-poder → innershadow darkred,
 *  selected → resaltada, disabled → opacidad 0.4, hover → sube).
 * La imagen y el nombre accesible salen de CardsService (sin duplicar el mapeo).
 */
@Component({
  selector: 'app-game-card',
  standalone: true,
  template: `
    @if (selectable()) {
      <button
        type="button"
        class="card-frame"
        [class]="sizeClass()"
        [class.card-hoverable]="!disabled()"
        [class.card-selected]="selected()"
        [class.sin-poder]="sinPoder()"
        [disabled]="disabled()"
        [attr.aria-pressed]="selected()"
        [attr.aria-label]="name()"
        (click)="pick.emit()"
      >
        <img [src]="image()" [alt]="name()" draggable="false" />
      </button>
    } @else {
      <figure
        class="card-frame"
        [class]="sizeClass()"
        [class.card-enemy]="enemy()"
        [attr.aria-label]="name()"
        role="img"
      >
        <img [src]="image()" [alt]="name()" draggable="false" />
      </figure>
    }
  `,
  styles: [`
    .card-frame {
      display: block;
      padding: 0;
      border: none;
      background: #fff;
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-card);
      overflow: hidden;
      aspect-ratio: 9 / 13;
      transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
    }
    .card-frame img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      background: #fff;
      user-select: none;
    }
    .card-hoverable { cursor: pointer; }
    .card-hoverable:hover {
      transform: translateY(-10px);
      box-shadow: var(--shadow-card-hover);
    }
    .card-hoverable:focus-visible {
      outline: 3px solid #fff;
      outline-offset: 3px;
    }
    .card-frame:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
    }
    .card-selected {
      transform: translateY(-10px);
      box-shadow: 0 0 0 3px #000, var(--shadow-card-hover);
    }
    .card-enemy {
      box-shadow: var(--shadow-enemy);
    }

    .size-showcase { width: 200px; }
    .size-enemy    { width: 150px; }
    .size-hand     { width: 78px; }
    .size-mini     { width: 56px; }

    @media (min-width: 640px) {
      .size-enemy { width: 196px; }
      .size-hand  { width: 92px; }
    }
  `]
})
export class GameCardComponent {
  private cards = inject(CardsService);

  cardId = input.required<number | string>();
  size = input<CardSize>('hand');
  selectable = input(false);
  selected = input(false);
  disabled = input(false);
  sinPoder = input(false);
  enemy = input(false);

  pick = output<void>();

  image = computed(() => this.cards.getCardImage(this.cardId()));
  name = computed(() => this.cards.getCardName(this.cardId()));
  sizeClass = computed(() => `size-${this.size()}`);
}
