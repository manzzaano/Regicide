import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@app/environments/environment';

// Espejo del DTO del backend (com.regicide.dto.GameState)
export interface GameState {
  gameId?: string;
  phase: string;            // ATTACK, DEFENSE, GAME_OVER
  hand: number[];           // ids de cartas en mano
  enemyHP: number;
  currentEnemy: string;     // descripción del enemigo (contiene J/Q/K)
  currentDamage: number;    // daño del enemigo
  turnCount: number;
  cardsPlayed: number;
  message?: string;
  gameWon: boolean;
  error?: string | null;
}

@Injectable({ providedIn: 'root' })
export class GameWebSocketService {
  private rxStomp = new RxStomp();
  private gameState$ = new BehaviorSubject<GameState | null>(null);
  private connected$ = new BehaviorSubject(false);

  constructor() {
    this.configureAndConnect();
  }

  private configureAndConnect(): void {
    const wsUrl = environment.wsUrl;

    this.rxStomp.configure({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.rxStomp.activate();

    // Suscribir el topic UNA vez (rxStomp lo mantiene a través de reconexiones).
    // Antes se suscribía dentro de startGame, lo que provocaba una carrera
    // (publish antes de estar suscrito) y fugas por múltiples suscripciones.
    this.listenGameState();

    this.rxStomp.connectionState$
      .pipe(map(state => state?.toString() === '1'))
      .subscribe((connected) => {
        this.connected$.next(connected);
      });
  }

  startGame(): void {
    this.rxStomp.publish({
      destination: '/app/game/start',
      body: JSON.stringify({})
    });
  }

  /** Ataque con combo: lista de índices de cartas de la mano. */
  attack(indices: number[]): void {
    this.rxStomp.publish({
      destination: '/app/game/play',
      body: JSON.stringify({ type: 'ATTACK', payload: indices })
    });
  }

  /** Defensa: una carta para reducir el daño entrante. */
  defend(cardIndex: number): void {
    this.rxStomp.publish({
      destination: '/app/game/play',
      body: JSON.stringify({ type: 'DEFEND', cardIndex })
    });
  }

  /** Comodín: rebaraja la mano. */
  useJoker(): void {
    this.rxStomp.publish({
      destination: '/app/game/play',
      body: JSON.stringify({ type: 'JOKER' })
    });
  }

  getGameState(): void {
    this.rxStomp.publish({
      destination: '/app/game/state',
      body: JSON.stringify({})
    });
  }

  finishGame(): void {
    this.rxStomp.publish({
      destination: '/app/game/finish',
      body: JSON.stringify({})
    });
  }

  private listenGameState(): void {
    this.rxStomp.watch('/topic/game').subscribe((message) => {
      const state = JSON.parse(message.body) as GameState;
      this.gameState$.next(state);
    });
  }

  getGameState$(): Observable<GameState | null> {
    return this.gameState$.asObservable();
  }

  isConnected$(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  disconnect(): void {
    this.rxStomp.deactivate();
    this.connected$.next(false);
  }
}
