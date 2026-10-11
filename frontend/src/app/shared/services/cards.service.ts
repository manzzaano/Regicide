import { Injectable } from '@angular/core';

export interface Card {
  id: number;
  suit: 'Corazones' | 'Diamantes' | 'Picas' | 'Tréboles';
  value: number;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class CardsService {
  private suits = ['Tréboles', 'Diamantes', 'Corazones', 'Picas'] as const;
  private values = [
    'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'
  ];

  getCardImage(cardId: number | string): string {
    if (typeof cardId === 'string') {
      if (cardId === 'comodin' || cardId === '-1') return '/assets/imgs/comodin.png';
      if (cardId === 'invisible' || cardId === '0') return '/assets/imgs/invisible.png';
    }

    const id = typeof cardId === 'string' ? parseInt(cardId) : cardId;

    if (id < 0 || id > 51) return '/assets/imgs/invisible.png';

    const suitIndex = Math.floor(id / 13);
    const valueIndex = id % 13;
    const suit = this.suits[suitIndex];
    const value = valueIndex + 1;

    if (!suit) return '/assets/imgs/invisible.png';

    return `/assets/imgs/${suit}/${value}.png`;
  }

  getCardName(cardId: number | string): string {
    if (typeof cardId === 'string') {
      if (cardId === 'comodin' || cardId === '-1') return 'Comodín';
      if (cardId === 'invisible' || cardId === '0') return 'Dorso';
    }

    const id = typeof cardId === 'string' ? parseInt(cardId) : cardId;
    const suitIndex = Math.floor(id / 13);
    const valueIndex = id % 13;
    const suit = this.suits[suitIndex];
    const value = this.values[valueIndex];

    return `${value}${this.getSuitSymbol(suit)}`;
  }

  private getSuitSymbol(suit: string): string {
    const symbols: Record<string, string> = {
      'Corazones': '♥',
      'Diamantes': '♦',
      'Picas': '♠',
      'Tréboles': '♣'
    };
    return symbols[suit] || '';
  }
}
