import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameWebSocketService, GameState } from '@app/shared/services/game-websocket.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';
import gsap from 'gsap';

interface CardVisual {
  value: number;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  isSelected: boolean;
  rotation: number;
  scale: number;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="game-wrapper">
      <div class="animated-bg">
        <div class="grid-bg"></div>
        <div class="nebula"></div>
        <div class="stars"></div>
      </div>

      <div class="game-container" *ngIf="gameState$ | async as state">

        <header class="game-header">
          <div class="logo-section">
            <h1 class="title">♔ REGICIDE ♔</h1>
            <p class="subtitle">Card Dominion</p>
          </div>

          <div class="status-panel">
            <div class="connection-indicator" [class.connected]="connected$ | async">
              <span class="pulse"></span>
              {{ (connected$ | async) ? '● ONLINE' : '● OFFLINE' }}
            </div>
            <div class="player-info">
              <span class="username">{{ state.playerName || 'Guest' }}</span>
              <span class="stats">Level {{ state.playerLevel || 1 }}</span>
            </div>
          </div>
        </header>

        <section class="enemy-stage">
          <div class="enemy-card-container">
            <div class="enemy-aura" [style.opacity]="state.enemyHP / state.enemyMaxHP"></div>

            <div class="enemy-card-visual" [class]="state.currentEnemy?.toLowerCase() || 'unknown'">
              <div class="card-shine"></div>
              <div class="enemy-display">
                <div class="enemy-name">{{ state.currentEnemy }}</div>
                <div class="enemy-rank">{{ state.currentEnemyRank }}</div>
              </div>

              <div class="hp-bar-container">
                <div class="hp-bar">
                  <div class="hp-fill" [style.width.%]="(state.enemyHP / state.enemyMaxHP) * 100"></div>
                  <div class="hp-text">
                    {{ state.enemyHP }} / {{ state.enemyMaxHP }} HP
                  </div>
                </div>
                <div class="damage-indicator" *ngIf="state.currentDamage > 0">
                  +{{ state.currentDamage }} DMG
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="game-status">
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">PHASE</span>
              <span class="status-value phase" [class]="state.phase?.toLowerCase() || 'play'">
                {{ state.phase }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">TURN</span>
              <span class="status-value">{{ state.turnCount }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">CARDS PLAYED</span>
              <span class="status-value">{{ state.cardsPlayed }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">HAND SIZE</span>
              <span class="status-value">{{ state.hand.length }}</span>
            </div>
          </div>

          <div class="message-display" *ngIf="state.message || state.error || state.gameWon">
            <div *ngIf="state.gameWon" class="victory-message">
              <div class="confetti"></div>
              🎉 VICTORY! 🎉
              <p>You defeated the {{ state.currentEnemy }}!</p>
            </div>
            <div *ngIf="state.error" class="error-message">❌ {{ state.error }}</div>
            <div *ngIf="state.message && !state.gameWon && !state.error" class="info-message">
              📝 {{ state.message }}
            </div>
          </div>
        </section>

        <section class="hand-section">
          <h2 class="hand-title">YOUR ARSENAL ({{ state.hand.length }} Cards)</h2>

          <div class="hand-container">
            <div class="cards-wrapper">
              <button
                *ngFor="let card of state.hand; let i = index"
                class="card-button"
                [class.disabled]="!canPlayCard(state)"
                (click)="playCard(i)"
                [style.transform]="getCardTransform(i, state.hand.length)"
              >
                <div class="card-face">
                  <div class="card-corner top-left">
                    <span class="card-value">{{ card }}</span>
                  </div>

                  <div class="card-center">
                    <span class="card-suit">{{ getSuitSymbol(card) }}</span>
                  </div>

                  <div class="card-corner bottom-right">
                    <span class="card-value">{{ card }}</span>
                  </div>
                </div>

                <div class="card-back"></div>
                <div class="card-glow"></div>
              </button>
            </div>
          </div>
        </section>

        <section class="actions-section">
          <div class="action-grid">
            <button
              class="btn btn-primary"
              (click)="startNewGame()"
              [disabled]="state.gameWon"
            >
              <span class="btn-icon">🎮</span>
              <span class="btn-text">New Game</span>
            </button>

            <button
              class="btn btn-danger"
              (click)="finishGame()"
            >
              <span class="btn-icon">🏴</span>
              <span class="btn-text">Surrender</span>
            </button>

            <button
              class="btn btn-secondary"
              *ngIf="isGuest"
              (click)="goToAuth()"
            >
              <span class="btn-icon">👤</span>
              <span class="btn-text">Sign Up</span>
            </button>

            <button
              class="btn btn-info"
              (click)="toggleLeaderboard()"
            >
              <span class="btn-icon">🏆</span>
              <span class="btn-text">Leaderboard</span>
            </button>
          </div>
        </section>

        <div class="guest-banner" *ngIf="isGuest">
          <div class="banner-content">
            <span class="banner-icon">⚠️</span>
            <div class="banner-text">
              <strong>Playing as Guest</strong> — Your progress won't be saved
            </div>
            <button class="banner-action" (click)="goToAuth()">Create Account →</button>
          </div>
        </div>
      </div>

      <div class="loading-container" *ngIf="!(gameState$ | async)">
        <div class="loading-content">
          <div class="loader">
            <div class="loader-ring"></div>
            <div class="loader-ring"></div>
            <div class="loader-ring"></div>
          </div>
          <h2>Initializing Battle Arena</h2>
          <p>Preparing your deck...</p>
          <button class="btn btn-primary btn-large" (click)="startNewGame()">
            ⚔️ Enter Battle
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .game-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      background: #0a0e27;
      overflow: hidden;
    }

    .animated-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
    }

    .grid-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image:
        linear-gradient(0deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: slide 20s linear infinite;
    }

    @keyframes slide {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }

    .nebula {
      position: absolute;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(138, 43, 226, 0.2) 0%, transparent 70%);
      border-radius: 50%;
      top: -100px;
      right: -100px;
      filter: blur(40px);
      animation: float 8s ease-in-out infinite;
    }

    .stars {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image:
        radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
        radial-gradient(2px 2px at 60px 70px, #fff, rgba(0,0,0,0)),
        radial-gradient(1px 1px at 50px 50px, #ddd, rgba(0,0,0,0));
      background-size: 200px 200px;
      opacity: 0.5;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(20px); }
    }

    .game-container {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 20px;
      box-sizing: border-box;
      overflow-y: auto;
      gap: 20px;
    }

    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 30px;
      background: linear-gradient(90deg, rgba(0, 212, 255, 0.1) 0%, rgba(138, 43, 226, 0.1) 100%);
      border-bottom: 2px solid #00d4ff;
      border-radius: 10px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
    }

    .logo-section h1 {
      font-size: 2.5em;
      font-weight: 900;
      background: linear-gradient(135deg, #00d4ff 0%, #0288d1 50%, #8a2be2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
      letter-spacing: 2px;
    }

    .logo-section .subtitle {
      margin: 0;
      color: #00d4ff;
      font-size: 0.9em;
      letter-spacing: 3px;
    }

    .status-panel {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .connection-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(0, 100, 0, 0.3);
      border: 1px solid #ff6b6b;
      border-radius: 20px;
      color: #ff6b6b;
      font-size: 0.9em;
      font-weight: bold;
      transition: all 0.3s ease;
    }

    .connection-indicator.connected {
      background: rgba(0, 200, 0, 0.3);
      border-color: #00ff00;
      color: #00ff00;
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    }

    .pulse {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .player-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px 16px;
      background: rgba(0, 212, 255, 0.1);
      border-radius: 8px;
    }

    .username {
      color: #00d4ff;
      font-weight: bold;
      font-size: 1em;
    }

    .stats {
      color: #888;
      font-size: 0.85em;
    }

    .enemy-stage {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      min-height: 300px;
      padding: 20px;
    }

    .enemy-card-container {
      position: relative;
      width: 100%;
      max-width: 400px;
      height: 300px;
      perspective: 1000px;
    }

    .enemy-aura {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 450px;
      height: 350px;
      background: radial-gradient(circle, rgba(255, 0, 0, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      filter: blur(30px);
      animation: pulse-aura 3s ease-in-out infinite;
    }

    @keyframes pulse-aura {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.1); }
    }

    .enemy-card-visual {
      position: relative;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 3px solid #ff6b6b;
      border-radius: 15px;
      overflow: hidden;
      box-shadow:
        0 0 30px rgba(255, 107, 107, 0.5),
        inset 0 0 20px rgba(255, 107, 107, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 20px;
      animation: float 4s ease-in-out infinite;
    }

    .card-shine {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
      animation: shine 3s infinite;
    }

    @keyframes shine {
      0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
      100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
    }

    .enemy-display {
      position: relative;
      z-index: 2;
      text-align: center;
      color: white;
    }

    .enemy-name {
      font-size: 2.5em;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8c42 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
    }

    .enemy-rank {
      font-size: 1.2em;
      color: #ffc107;
      letter-spacing: 1px;
      margin-top: 8px;
    }

    .hp-bar-container {
      position: relative;
      z-index: 2;
      width: 100%;
      padding: 0 20px;
    }

    .hp-bar {
      height: 25px;
      background: #1a1a1a;
      border: 2px solid #ff6b6b;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
    }

    .hp-fill {
      height: 100%;
      background: linear-gradient(90deg, #00ff00 0%, #ffff00 50%, #ff0000 100%);
      transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    }

    .hp-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-weight: bold;
      font-size: 0.9em;
      text-shadow: 0 0 5px #000;
    }

    .damage-indicator {
      margin-top: 10px;
      color: #ffff00;
      font-weight: bold;
      font-size: 1.2em;
      text-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
      animation: bounce 0.5s ease;
    }

    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .game-status {
      padding: 20px;
      background: rgba(0, 212, 255, 0.05);
      border-radius: 10px;
      border: 1px solid rgba(0, 212, 255, 0.3);
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 15px;
      margin-bottom: 15px;
    }

    .status-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 10px;
      background: rgba(0, 100, 200, 0.1);
      border-left: 3px solid #00d4ff;
      border-radius: 5px;
    }

    .status-label {
      font-size: 0.8em;
      color: #888;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .status-value {
      font-size: 1.5em;
      font-weight: bold;
      color: #00d4ff;
    }

    .status-value.phase {
      color: #ffc107;
    }

    .message-display {
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      font-weight: bold;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .victory-message {
      background: linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%);
      border: 2px solid #00ff00;
      color: #00ff00;
      font-size: 1.3em;
      animation: victory-pulse 0.5s ease;
      position: relative;
      overflow: hidden;
    }

    .victory-message p {
      margin: 8px 0 0 0;
      font-size: 0.9em;
      color: #ffff00;
    }

    @keyframes victory-pulse {
      0% { transform: scale(0.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .error-message {
      background: rgba(255, 107, 107, 0.2);
      border: 2px solid #ff6b6b;
      color: #ff8a80;
    }

    .info-message {
      background: rgba(0, 212, 255, 0.2);
      border: 2px solid #00d4ff;
      color: #00d4ff;
    }

    .hand-section {
      padding: 20px;
      background: rgba(138, 43, 226, 0.05);
      border-radius: 10px;
      border: 1px solid rgba(138, 43, 226, 0.3);
    }

    .hand-title {
      margin: 0 0 15px 0;
      color: #8a2be2;
      font-size: 1.1em;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .hand-container {
      overflow-x: auto;
      padding: 20px 0;
    }

    .cards-wrapper {
      display: flex;
      gap: 15px;
      justify-content: center;
      align-items: flex-end;
      min-width: 100%;
      padding: 0 20px;
    }

    .card-button {
      position: relative;
      width: 80px;
      height: 120px;
      background: none;
      border: none;
      cursor: pointer;
      transform-style: preserve-3d;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      flex-shrink: 0;
    }

    .card-button:hover {
      transform: translateY(-20px) scale(1.1);
    }

    .card-button:active {
      transform: translateY(-15px) scale(1.05);
    }

    .card-button.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #00bcd4 0%, #0288d1 100%);
      border: 2px solid #00d4ff;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      box-sizing: border-box;
      box-shadow: 0 8px 16px rgba(0, 212, 255, 0.3);
      z-index: 2;
    }

    .card-corner {
      font-size: 0.8em;
      font-weight: bold;
      color: white;
      display: flex;
      width: 100%;
      justify-content: space-between;
    }

    .card-corner.top-left {
      text-align: left;
    }

    .card-corner.bottom-right {
      text-align: right;
      transform: rotate(180deg);
    }

    .card-center {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
    }

    .card-suit {
      font-size: 2em;
      color: white;
      text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    }

    .card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
      border: 2px solid #8a2be2;
      border-radius: 8px;
      background-size: 20px 20px;
    }

    .card-glow {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 10px rgba(0, 212, 255, 0.2);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .card-button:hover .card-glow {
      opacity: 1;
    }

    .actions-section {
      padding: 20px;
      background: rgba(0, 212, 255, 0.05);
      border-radius: 10px;
      border-top: 2px solid rgba(0, 212, 255, 0.3);
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    .btn {
      padding: 12px 20px;
      border: 2px solid;
      border-radius: 8px;
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 200, 255, 0.1) 100%);
      color: #00d4ff;
      cursor: pointer;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s ease;
      text-transform: uppercase;
      font-size: 0.9em;
      letter-spacing: 1px;
      position: relative;
      overflow: hidden;
    }

    .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.1);
      transition: left 0.3s ease;
      z-index: 0;
    }

    .btn:hover::before {
      left: 100%;
    }

    .btn-icon, .btn-text {
      position: relative;
      z-index: 1;
    }

    .btn-primary {
      border-color: #00d4ff;
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
    }

    .btn-primary:hover {
      box-shadow: 0 0 25px rgba(0, 212, 255, 0.8), inset 0 0 10px rgba(0, 212, 255, 0.3);
      transform: translateY(-2px);
    }

    .btn-danger {
      border-color: #ff6b6b;
      color: #ff6b6b;
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 100, 100, 0.1) 100%);
      box-shadow: 0 0 15px rgba(255, 107, 107, 0.5);
    }

    .btn-danger:hover {
      box-shadow: 0 0 25px rgba(255, 107, 107, 0.8), inset 0 0 10px rgba(255, 107, 107, 0.3);
      transform: translateY(-2px);
    }

    .btn-secondary {
      border-color: #ffc107;
      color: #ffc107;
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%);
      box-shadow: 0 0 15px rgba(255, 193, 7, 0.5);
    }

    .btn-secondary:hover {
      box-shadow: 0 0 25px rgba(255, 193, 7, 0.8), inset 0 0 10px rgba(255, 193, 7, 0.3);
      transform: translateY(-2px);
    }

    .btn-info {
      border-color: #00ff00;
      color: #00ff00;
      background: linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 200, 0, 0.1) 100%);
      box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
    }

    .btn-info:hover {
      box-shadow: 0 0 25px rgba(0, 255, 0, 0.8), inset 0 0 10px rgba(0, 255, 0, 0.3);
      transform: translateY(-2px);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-large {
      padding: 16px 32px;
      font-size: 1.1em;
    }

    .guest-banner {
      padding: 15px 20px;
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 152, 0, 0.1) 100%);
      border: 2px solid #ffc107;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 15px;
      margin-top: 10px;
    }

    .banner-content {
      display: flex;
      align-items: center;
      gap: 15px;
      flex: 1;
    }

    .banner-icon {
      font-size: 1.5em;
    }

    .banner-text {
      flex: 1;
      color: #ffc107;
      font-size: 0.95em;
    }

    .banner-action {
      padding: 8px 16px;
      background: #ffc107;
      color: #000;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      white-space: nowrap;
      transition: all 0.3s ease;
    }

    .banner-action:hover {
      background: #ffb300;
      transform: scale(1.05);
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
      background: rgba(10, 14, 39, 0.95);
    }

    .loading-content {
      text-align: center;
      color: #00d4ff;
    }

    .loader {
      width: 100px;
      height: 100px;
      margin: 0 auto 30px;
      position: relative;
    }

    .loader-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 4px solid transparent;
      border-top-color: #00d4ff;
      border-right-color: #0288d1;
      border-radius: 50%;
      animation: spin 1.5s linear infinite;
    }

    .loader-ring:nth-child(2) {
      width: 70%;
      height: 70%;
      top: 15%;
      left: 15%;
      border-top-color: #8a2be2;
      animation-duration: 2s;
      animation-direction: reverse;
    }

    .loader-ring:nth-child(3) {
      width: 40%;
      height: 40%;
      top: 30%;
      left: 30%;
      border-top-color: #ffc107;
      animation-duration: 1s;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-content h2 {
      margin: 20px 0 10px 0;
      font-size: 1.8em;
      letter-spacing: 1px;
    }

    .loading-content p {
      margin: 0 0 30px 0;
      color: #888;
      font-size: 0.95em;
    }

    @media (max-width: 768px) {
      .game-header {
        flex-direction: column;
        gap: 15px;
      }

      .logo-section h1 {
        font-size: 2em;
      }

      .status-panel {
        width: 100%;
        justify-content: center;
      }

      .enemy-stage {
        min-height: 250px;
      }

      .hand-section {
        padding: 15px;
      }

      .cards-wrapper {
        gap: 10px;
      }

      .card-button {
        width: 70px;
        height: 105px;
      }

      .action-grid {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }

      .status-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .game-container {
        padding: 10px;
        gap: 10px;
      }

      .game-header {
        padding: 10px 15px;
      }

      .logo-section h1 {
        font-size: 1.6em;
      }

      .card-button {
        width: 60px;
        height: 90px;
      }

      .btn {
        padding: 10px 15px;
        font-size: 0.8em;
      }

      .action-grid {
        grid-template-columns: 1fr 1fr;
      }

      .guest-banner {
        flex-direction: column;
        gap: 10px;
      }

      .banner-action {
        width: 100%;
      }
    }
  `]
})
export class GameComponent implements OnInit, OnDestroy {
  gameState$: Observable<GameState | null>;
  connected$: Observable<boolean>;
  isGuest = false;
  private destroy$ = new Subject<void>();

  constructor(
    private wsService: GameWebSocketService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.gameState$ = this.wsService.getGameState$();
    this.connected$ = this.wsService.isConnected$();
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.isGuest = params['guest'] === 'true';
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

  goToAuth(): void {
    this.router.navigate(['/registro']);
  }

  toggleLeaderboard(): void {
    this.router.navigate(['/leaderboard']);
  }

  canPlayCard(state: GameState): boolean {
    return state.phase?.toUpperCase() === 'PLAY' && !state.gameWon;
  }

  getCardTransform(index: number, total: number): string {
    const offset = (index - (total - 1) / 2) * 8;
    const rotation = offset * 3;
    return `translateY(${Math.abs(offset) * 10}px) rotateZ(${rotation}deg)`;
  }

  getSuitSymbol(card: number): string {
    const suits = ['♥', '♦', '♣', '♠'];
    return suits[card % 4];
  }
}
