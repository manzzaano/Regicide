import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { A11yModule } from '@angular/cdk/a11y';
import { Subscription } from 'rxjs';
import { GameWebSocketService, GameState } from '../../shared/services/game-websocket.service';
import { CardsService } from '../../shared/services/cards.service';
import { PlayerService } from '../../shared/services/player.service';
import { GameCardComponent } from '../../shared/ui/game-card.component';
import { defeatEnemy, enemyEnter, shake } from '../../shared/animations/card-animations';

@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [CommonModule, A11yModule, GameCardComponent],
  template: `
    <div class="bg-board no-scroll flex h-screen w-full flex-col text-white">

      <!-- HUD -->
      <header class="flex flex-shrink-0 items-center justify-between bg-black/45 px-4 py-2 backdrop-blur sm:px-6">
        <button class="btn-ghost text-sm" (click)="salir()">← Salir</button>
        <div class="font-bold tracking-[0.2em]">REGICIDE</div>
        <div class="flex items-center gap-2 text-xs">
          @if (state) { <span>Turno {{ state.turnCount }}</span> }
          <span [class.text-green-400]="connected" [class.text-gray-500]="!connected" aria-hidden="true">●</span>
          <span class="sr-only">{{ connected ? 'Conectado' : 'Desconectado' }}</span>
        </div>
      </header>

      <!-- Conectando -->
      @if (!connected) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" role="status">
          <div class="panel px-12 py-10 text-center">
            <div class="spinner mx-auto"></div>
            <p class="mt-3 text-sm text-[var(--color-ink-soft)]">Conectando al servidor...</p>
          </div>
        </div>
      }

      <!-- Victoria / Derrota -->
      @if (state?.phase === 'GAME_OVER') {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75" cdkTrapFocus
             role="dialog" aria-modal="true" aria-labelledby="result-title">
          <div class="panel max-w-sm px-10 py-9 text-center">
            <div class="text-6xl">{{ state?.gameWon ? '👑' : '☠' }}</div>
            <h2 id="result-title" class="mt-2 text-3xl font-extrabold tracking-wide"
                [style.color]="state?.gameWon ? '#1a7a1a' : 'var(--color-enemy)'">
              {{ state?.gameWon ? '¡Victoria!' : 'Derrota' }}
            </h2>
            <p class="mt-2 text-sm text-[var(--color-ink-soft)]">{{ state?.message }}</p>
            <button class="btn-action mt-6 w-full uppercase tracking-wider" cdkFocusInitial (click)="volverInicio()">
              Volver al inicio
            </button>
          </div>
        </div>
      }

      <!-- Tablero -->
      @if (connected && state && state.phase !== 'GAME_OVER') {
        <main class="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-5">

          <!-- Enemigo -->
          <section class="panel panel-strong flex flex-shrink-0 items-center gap-4 p-3 sm:gap-6 sm:p-4">
            <div #enemyEl class="flex-shrink-0">
              <app-game-card [cardId]="enemyCardId()" size="enemy" [enemy]="true" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-lg font-extrabold tracking-wide text-[var(--color-ink)]">
                {{ state.currentEnemy }}
              </div>

              <div class="mt-2 h-3 overflow-hidden rounded-full bg-black/15" role="progressbar"
                   [attr.aria-valuenow]="state.enemyHP" aria-valuemin="0" [attr.aria-valuemax]="enemyMaxHP()">
                <div class="h-full rounded-full transition-[width] duration-500"
                     style="background:linear-gradient(90deg,#800000,#c83232)"
                     [style.width.%]="hpPercent()"></div>
              </div>
              <div class="mt-1 flex items-baseline gap-2">
                <span class="text-2xl font-extrabold" style="color:var(--color-enemy)">{{ state.enemyHP }}</span>
                <span class="text-sm text-[var(--color-ink-muted)]">/ {{ enemyMaxHP() }} HP</span>
                <span class="ml-auto text-sm font-bold text-[var(--color-ink)]">⚔ {{ enemyAttack() }}</span>
              </div>

              @if (state.currentDamage > 0) {
                <div class="mt-2 inline-block rounded border border-black/20 bg-black/5 px-2 py-0.5 text-xs font-semibold text-[var(--color-ink)]">
                  {{ state.currentDamage }} de daño entrante
                </div>
              }
            </div>
          </section>

          <!-- Mensaje / fase -->
          <div class="flex flex-shrink-0 items-center justify-center gap-3">
            <span class="rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {{ faseLabel() }}
            </span>
            @if (state.message) {
              <span class="rounded bg-black/30 px-3 py-1 text-sm text-white/90">{{ state.message }}</span>
            }
          </div>
          @if (state.error) {
            <div class="flex-shrink-0 rounded bg-red-900/60 px-3 py-1 text-center text-sm text-white" role="alert">
              {{ state.error }}
            </div>
          }

          <!-- Mano + acciones -->
          <section class="flex min-h-0 flex-1 flex-col gap-2">
            <div class="flex flex-shrink-0 flex-wrap items-center justify-between gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-white/70">{{ manoLabel() }}</span>
              <div class="flex gap-2">
                <button class="btn-action px-3 py-1.5 text-xs uppercase tracking-wider"
                        [disabled]="!puedeConfirmar()" (click)="confirmar()">
                  {{ confirmarLabel() }}
                </button>
                @if (selected.length) {
                  <button class="btn-ghost px-3 py-1.5 text-xs" (click)="limpiar()">Limpiar</button>
                }
                <button class="btn-ghost px-3 py-1.5 text-xs" (click)="comodin()" title="Rebaraja tu mano">
                  🃏 Comodín
                </button>
              </div>
            </div>
            <div class="flex flex-1 flex-wrap content-start gap-2 overflow-y-auto pb-1 sm:gap-3"
                 role="group" aria-label="Tu mano de cartas">
              @for (cardId of state.hand; track $index; let i = $index) {
                <app-game-card
                  [cardId]="cardId"
                  size="hand"
                  [selectable]="true"
                  [selected]="selected.includes(i)"
                  [sinPoder]="esSinPoder(cardId)"
                  (pick)="toggle(i)"
                />
              }
            </div>
          </section>
        </main>
      }

      <!-- Iniciando -->
      @if (connected && !state) {
        <main class="flex flex-1 items-center justify-center">
          <div class="panel px-10 py-9 text-center">
            <div class="spinner mx-auto"></div>
            <p class="mt-3 text-sm text-[var(--color-ink-soft)]">Preparando la partida...</p>
            <button class="btn-action mt-4 uppercase tracking-wider" (click)="iniciar()">Comenzar</button>
          </div>
        </main>
      }
    </div>
  `,
  styles: [`
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid rgba(0,0,0,0.15);
      border-top-color: #000;
      border-radius: 50%;
      animation: var(--animate-spin-slow);
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class JuegoComponent implements OnInit, AfterViewInit, OnDestroy {
  state: GameState | null = null;
  connected = false;
  selected: number[] = [];

  private enemyEl = viewChild<ElementRef<HTMLElement>>('enemyEl');
  private sub = new Subscription();
  private prevEnemy = '';
  private prevHP = -1;
  private wantNew = false;
  private started = false;
  private recorded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public cards: CardsService,
    private ws: GameWebSocketService,
    private player: PlayerService
  ) {}

  ngOnInit() {
    this.wantNew = this.route.snapshot.queryParamMap.get('nueva') === '1';
    // Sembrar el estado actual (BehaviorSubject emite sincrónicamente) antes de decidir si iniciar
    this.sub.add(this.ws.getGameState$().subscribe(s => this.onState(s)));
    this.sub.add(this.ws.isConnected$().subscribe(v => {
      this.connected = v;
      if (v && !this.started) {
        this.started = true;
        if (this.wantNew || !this.hasActiveGame()) this.iniciar();
      }
    }));
  }

  private hasActiveGame(): boolean {
    return !!this.state && this.state.phase !== 'GAME_OVER';
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private onState(s: GameState | null) {
    const prev = this.state;
    this.state = s;
    this.selected = [];
    if (!s) return;

    // Registrar resultado una vez al terminar (récord local)
    if (s.phase === 'GAME_OVER' && !this.recorded) {
      this.recorded = true;
      this.player.recordResult(!!s.gameWon);
    }

    // Animaciones tras el render
    setTimeout(() => {
      const el = this.enemyEl()?.nativeElement;
      if (!el) return;
      if (s.currentEnemy !== this.prevEnemy && this.prevEnemy && prev) {
        // Enemigo derrotado → desvanecer y entrar el nuevo
        defeatEnemy(el, () => enemyEnter(el));
      } else if (s.currentEnemy !== this.prevEnemy) {
        enemyEnter(el);
      } else if (this.prevHP >= 0 && s.enemyHP < this.prevHP) {
        shake(el);
      }
      this.prevEnemy = s.currentEnemy;
      this.prevHP = s.enemyHP;
    });
  }

  iniciar() { this.recorded = false; this.ws.startGame(); }

  /** ATAQUE: alterna selección de combo. DEFENSA: una sola carta. */
  toggle(i: number) {
    if (this.state?.phase === 'DEFENSE') {
      this.selected = this.selected[0] === i ? [] : [i];
      return;
    }
    const idx = this.selected.indexOf(i);
    if (idx >= 0) this.selected = this.selected.filter(x => x !== i);
    else this.selected = [...this.selected, i];
  }

  puedeConfirmar(): boolean {
    if (this.state?.phase === 'DEFENSE') return this.selected.length === 1;
    return this.selected.length >= 1;
  }

  confirmarLabel(): string {
    return this.state?.phase === 'DEFENSE' ? 'Confirmar defensa' : 'Confirmar ataque';
  }

  confirmar() {
    if (!this.puedeConfirmar()) return;
    if (this.state?.phase === 'DEFENSE') this.ws.defend(this.selected[0]);
    else this.ws.attack([...this.selected]);
    this.selected = [];
  }

  limpiar() { this.selected = []; }

  comodin() { this.ws.useJoker(); this.selected = []; }

  hpPercent(): number {
    const max = this.enemyMaxHP();
    if (!this.state || max === 0) return 0;
    return Math.max(0, Math.min(100, (this.state.enemyHP / max) * 100));
  }

  /** Vida máxima del enemigo según rango (Jota 20, Reina 30, Rey 40). */
  enemyMaxHP(): number {
    const v = this.enemyValue();
    return v === 13 ? 40 : v === 12 ? 30 : v === 11 ? 20 : (this.state?.enemyHP ?? 1);
  }

  /** Ataque del enemigo según su rango (Jota 10, Reina 15, Rey 20). */
  enemyAttack(): number {
    const v = this.enemyValue();
    if (v === 11) return 10;
    if (v === 12) return 15;
    if (v === 13) return 20;
    return v || 0;
  }

  /** Id de carta real para ilustrar al enemigo.
   *  El backend manda el rango como letra (J/Q/K), sin palo; derivamos un
   *  palo estable por el nombre para mostrar una carta ilustrada coherente. */
  enemyCardId(): number | string {
    const v = this.enemyValue();
    if (!v) return 'invisible';
    return this.enemySuit() * 13 + (v - 1);
  }

  private enemyValue(): number {
    const raw = String(this.state?.currentEnemy ?? '');
    if (/\bK\b|Rey|King/i.test(raw)) return 13;
    if (/\bQ\b|Reina|Queen/i.test(raw)) return 12;
    if (/\bJ\b|Jota|Jack/i.test(raw)) return 11;
    return 0;
  }

  private enemySuit(): number {
    let h = 0;
    for (const c of String(this.state?.currentEnemy ?? '')) h = (h + c.charCodeAt(0)) % 4;
    return h;
  }

  faseLabel(): string {
    switch (this.state?.phase) {
      case 'ATTACK':  return 'Fase de ataque';
      case 'DEFENSE': return 'Fase de defensa';
      default:        return this.state?.phase ?? '';
    }
  }

  manoLabel(): string {
    return this.state?.phase === 'DEFENSE'
      ? 'Tu mano — elige una carta para defender'
      : 'Tu mano — elige una carta para atacar';
  }

  /** Carta cuyo palo coincide con el del enemigo: pierde su poder (marca v1). */
  esSinPoder(cardId: number | string): boolean {
    const cardSuit = this.suitIndex(cardId);
    return cardSuit !== null && cardSuit === this.enemySuit();
  }

  private suitIndex(id: number | string | undefined): number | null {
    const n = typeof id === 'string' ? parseInt(id, 10) : id;
    if (n === undefined || isNaN(n) || n < 0 || n > 51) return null;
    return Math.floor(n / 13);
  }

  salir() { this.router.navigate(['/inicio']); }
  volverInicio() { this.router.navigate(['/inicio']); }
}
