import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameWebSocketService, GameState } from '@app/shared/services/game-websocket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container">
      <div class="game-header">
        <h1>Regicide Online</h1>
        <div class="connection-status" [class.connected]="connected$ | async">
          {{ (connected$ | async) ? '🟢 Conectado' : '🔴 Desconectado' }}
        </div>
      </div>

      <div class="game-board" *ngIf="gameState$ | async as state">
        <div class="enemy-area">
          <div class="enemy-card">
            <h2>{{ state.currentEnemy }}</h2>
            <div class="enemy-stats">
              <div>HP: {{ state.enemyHP }}</div>
              <div>Daño: {{ state.currentDamage }}</div>
            </div>
          </div>
        </div>

        <div class="game-info">
          <div>Fase: <strong>{{ state.phase }}</strong></div>
          <div>Turno: {{ state.turnCount }}</div>
          <div>Cartas jugadas: {{ state.cardsPlayed }}</div>
          <div *ngIf="state.message">📝 {{ state.message }}</div>
          <div *ngIf="state.error" class="error">❌ {{ state.error }}</div>
          <div *ngIf="state.gameWon" class="win">🎉 ¡Ganaste!</div>
        </div>

        <div class="hand">
          <h3>Tu mano ({{ state.hand.length }} cartas)</h3>
          <div class="cards">
            <button *ngFor="let cardNum of state.hand; let i = index" class="card" (click)="playCard(i)">
              {{ cardNum }}
            </button>
          </div>
        </div>

        <div class="actions">
          <button (click)="startNewGame()" class="btn-primary">Nueva partida</button>
          <button (click)="finishGame()" class="btn-danger">Terminar</button>
        </div>
      </div>

      <div class="loading" *ngIf="!(gameState$ | async)">
        <button (click)="startNewGame()" class="btn-primary btn-large">Iniciar Juego</button>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #eee;
      min-height: 100vh;
    }
    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #00d4ff;
      padding-bottom: 15px;
    }
    .connection-status {
      padding: 8px 12px;
      border-radius: 20px;
      background: #333;
    }
    .connection-status.connected {
      background: #0f7938;
    }
    .enemy-area {
      text-align: center;
      padding: 20px;
      background: rgba(255, 0, 0, 0.1);
      border: 2px solid #ff6b6b;
      border-radius: 10px;
    }
    .enemy-card {
      padding: 30px 60px;
      background: linear-gradient(135deg, #d32f2f 0%, #f57c00 100%);
      border-radius: 10px;
      font-size: 1.5em;
      font-weight: bold;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    .card {
      padding: 15px;
      background: linear-gradient(135deg, #00bcd4 0%, #0288d1 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
    }
    .btn-primary {
      padding: 12px 24px;
      background: #00d4ff;
      color: #000;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
    }
    .btn-danger {
      padding: 12px 24px;
      background: #ff6b6b;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    .actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      padding: 20px;
    }
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
  `]
})
export class GameComponent implements OnInit, OnDestroy {
  gameState$ = this.wsService.getGameState$();
  connected$ = this.wsService.isConnected$();
  private destroy$ = new Subject<void>();

  constructor(private wsService: GameWebSocketService) {}

  ngOnInit(): void {
    this.gameState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state) {
          console.log('Game state:', state);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startNewGame(): void {
    this.wsService.startGame();
  }

  playCard(index: number): void {
    this.wsService.playCard(index);
  }

  finishGame(): void {
    this.wsService.finishGame();
  }
}
