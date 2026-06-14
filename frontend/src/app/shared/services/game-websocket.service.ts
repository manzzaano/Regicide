import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '@app/environments/environment';

export interface GameState {
  gameId: string;
  phase: string; // ATTACK, DEFENSE, GAME_OVER
  hand: number[];
  enemyHP: number;
  currentEnemy: string;
  currentDamage: number;
  turnCount: number;
  cardsPlayed: number;
  gameWon: boolean;
  message: string;
  error: string | null;
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

    this.rxStomp.activate().then(() => {
      this.connected$.next(true);
    }).catch(() => {
      this.connected$.next(false);
    });
  }

  startGame(): void {
    this.rxStomp.publish({
      destination: '/app/game/start',
      body: JSON.stringify({})
    });

    this.listenGameState();
  }

  playCard(cardIndex: number): void {
    this.rxStomp.publish({
      destination: '/app/game/play',
      body: JSON.stringify({ cardIndex })
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
