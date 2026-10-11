import { Injectable } from '@angular/core';

export interface PlayerRecord {
  partidas: number;
  victorias: number;
  rachaActual: number;
  mejorRacha: number;
}

const REC_KEY = 'regicide.record';
const NAME_KEY = 'nombreJugador';

/** Identidad del jugador (nombre) + récord local en localStorage.
 *  El récord es local al dispositivo: no depende del backend, que aún no
 *  persiste partidas. Se actualiza al terminar cada partida. */
@Injectable({ providedIn: 'root' })
export class PlayerService {
  getName(): string {
    return sessionStorage.getItem(NAME_KEY)?.trim() ?? '';
  }

  setName(name: string): void {
    sessionStorage.setItem(NAME_KEY, name.trim());
  }

  getRecord(): PlayerRecord {
    try {
      const raw = localStorage.getItem(REC_KEY);
      if (raw) return JSON.parse(raw) as PlayerRecord;
    } catch { /* corrupto → reset */ }
    return { partidas: 0, victorias: 0, rachaActual: 0, mejorRacha: 0 };
  }

  /** Registra el resultado de una partida y devuelve el récord actualizado. */
  recordResult(won: boolean): PlayerRecord {
    const r = this.getRecord();
    r.partidas += 1;
    if (won) {
      r.victorias += 1;
      r.rachaActual += 1;
      r.mejorRacha = Math.max(r.mejorRacha, r.rachaActual);
    } else {
      r.rachaActual = 0;
    }
    localStorage.setItem(REC_KEY, JSON.stringify(r));
    return r;
  }
}
