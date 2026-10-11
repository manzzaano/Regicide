import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { gsap } from 'gsap';
import { environment } from '../../environments/environment';
import { GameCardComponent } from '../../shared/ui/game-card.component';
import { GameWebSocketService } from '../../shared/services/game-websocket.service';
import { PlayerService, PlayerRecord } from '../../shared/services/player.service';
import { dealIn } from '../../shared/animations/card-animations';

interface LeaderRow { username: string; victorias: number; total: number; porcentaje: number; }

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, GameCardComponent],
  template: `
    <main class="bg-board min-h-screen w-full flex items-center justify-center px-5 py-10">
      <div class="home">

        <!-- ── IZQUIERDA: arte + identidad (póster) ── -->
        <section #stage class="hero">
          <div #fan class="fan" aria-hidden="true">
            @for (k of kings; track k.id; let i = $index) {
              <div class="fan-card" [style.--i]="i - 1.5" [style.--z.px]="depth[i]">
                <app-game-card [cardId]="k.id" size="showcase" />
              </div>
            }
          </div>

          <h1 class="wordmark">REGICIDE</h1>
          <div class="suit-rule" aria-hidden="true">
            <span class="hr"></span>
            <span class="s red">&#9824;</span><span class="s">&#9829;</span>
            <span class="s red">&#9830;</span><span class="s">&#9827;</span>
            <span class="hr"></span>
          </div>
          <p class="tagline">Modo solitario · Vence a los doce monarcas</p>

          <div class="castle">
            <span class="castle-label">El castillo · 12 monarcas</span>
            <div class="ladder">
              @for (g of castle; track g.rank) {
                <div class="rank-group" [title]="g.label">
                  @for (n of g.pips; track $index) { <span class="pip" [class.k]="g.rank==='K'">{{ g.rank }}</span> }
                </div>
              }
            </div>
          </div>
        </section>

        <!-- ── DERECHA: consola (acciones + récord + ranking) ── -->
        <section class="console">
          <div class="actions">
            @if (hayPartida) {
              <button class="btn-regal" (click)="continuar()">Continuar partida</button>
              <button class="btn-outline" (click)="nueva()">Nueva partida</button>
            } @else {
              <button class="btn-regal" (click)="nueva()">Jugar</button>
            }
          </div>

          @if (record.partidas > 0) {
            <div class="record">
              <div class="rec"><b>{{ record.partidas }}</b><span>Partidas</span></div>
              <div class="rec"><b class="win">{{ record.victorias }}</b><span>Victorias</span></div>
              <div class="rec"><b>{{ record.mejorRacha }}</b><span>Mejor racha</span></div>
            </div>
          } @else {
            <p class="first-run">Tu primera partida te espera.</p>
          }

          <div class="identity">
            @if (editandoNombre) {
              <input #nameInput class="id-input" [(ngModel)]="nombre" maxlength="20"
                     placeholder="Tu nombre..." (keyup.enter)="guardarNombre()" (blur)="guardarNombre()" />
            } @else {
              <button class="id-chip" (click)="editarNombre()">
                {{ nombre ? 'Jugando como ' + nombre : 'Añade tu nombre' }} <span class="pen">✎</span>
              </button>
            }
          </div>

          <nav class="links">
            <button (click)="ir('reglas')">Cómo se juega</button>
            <span aria-hidden="true">·</span>
            <button (click)="ir('estadisticas')">Estadísticas</button>
          </nav>

          <div class="lb">
            <h2>Ranking</h2>
            @if (cargandoLb) {
              <p class="lb-empty">Cargando ranking...</p>
            } @else if (leaderboard.length) {
              <ol>
                @for (row of leaderboard; track row.username; let i = $index) {
                  <li [class.me]="esYo(row.username)">
                    <span class="pos">{{ i + 1 }}</span>
                    <span class="who">{{ row.username }}</span>
                    <span class="score">{{ row.victorias }}/{{ row.total }} · {{ row.porcentaje | number:'1.0-0' }}%</span>
                  </li>
                }
              </ol>
            } @else {
              <p class="lb-empty">Aún nadie en el ranking. Termina partidas para aparecer.</p>
            }
          </div>
        </section>

      </div>
    </main>
  `,
  styles: [`
    .home {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      align-items: center;
      gap: 64px;
      width: 100%;
      max-width: 1040px;
    }

    /* ── HERO (arte sobre teal) ── */
    .hero {
      perspective: 1200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .fan {
      display: flex; justify-content: center; align-items: flex-end;
      transform-style: preserve-3d; will-change: transform;
      margin-bottom: 18px; position: relative;
    }
    .fan-card {
      margin: 0 -36px;
      transform: rotateZ(calc(var(--i) * 9deg)) translateZ(var(--z));
      transform-origin: bottom center; transition: transform 0.3s ease;
      filter: drop-shadow(0 22px 34px rgba(0,0,0,0.55));
    }
    .fan-card:hover {
      transform: rotateZ(calc(var(--i) * 9deg)) translateZ(40px) translateY(-12px) scale(1.04);
      z-index: 10;
    }
    .wordmark {
      font-family: var(--font-display); font-optical-sizing: auto;
      font-weight: 900; font-size: clamp(48px, 6vw, 76px);
      line-height: 0.92; letter-spacing: 0.02em;
      color: var(--color-parchment);
      text-shadow: 0 3px 22px rgba(0,0,0,0.55);
    }
    .suit-rule { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 12px 0 6px; }
    .suit-rule .hr { height: 1px; width: 54px; background: linear-gradient(90deg, transparent, var(--color-regal)); }
    .suit-rule .hr:last-child { transform: scaleX(-1); }
    .suit-rule .s { font-size: 15px; color: rgba(255,255,255,0.9); }
    .suit-rule .s.red { color: oklch(0.7 0.16 25); }
    .tagline { font-size: 14px; letter-spacing: 0.04em; color: rgba(255,255,255,0.82); }

    .castle { margin-top: 20px; }
    .castle-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(255,255,255,0.62); }
    .ladder { display: flex; justify-content: center; gap: 14px; margin-top: 10px; }
    .rank-group { display: flex; gap: 5px; }
    .pip {
      width: 18px; height: 24px; border-radius: 3px;
      display: grid; place-items: center; font-size: 9px; font-weight: 800;
      color: rgba(255,255,255,0.85);
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.22);
    }
    .pip.k { color: var(--color-regal); border-color: color-mix(in oklch, var(--color-regal) 55%, transparent); background: color-mix(in oklch, var(--color-regal) 14%, transparent); }

    /* ── CONSOLA (pergamino) ── */
    .console {
      position: relative;
      padding: 30px 30px 26px;
      background: radial-gradient(120% 90% at 50% 0%, color-mix(in oklch, var(--color-parchment) 100%, white 6%), var(--color-parchment));
      color: var(--color-ink-deep);
      border: 1px solid var(--color-parchment-edge);
      border-radius: 6px; box-shadow: 0 30px 70px rgba(0,0,0,0.45);
    }
    .console::before {
      content: ''; position: absolute; inset: 9px;
      border: 1px solid color-mix(in oklch, var(--color-regal) 50%, transparent);
      border-radius: 3px; pointer-events: none;
    }
    .console > * { position: relative; }

    .actions { display: flex; flex-direction: column; gap: 10px; }
    .btn-regal {
      padding: 15px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.14em;
      color: var(--color-ink-deep);
      background: linear-gradient(180deg, color-mix(in oklch, var(--color-regal) 100%, white 8%), var(--color-regal));
      border: 1px solid var(--color-regal-deep); border-radius: 4px; cursor: pointer;
      box-shadow: 0 8px 20px color-mix(in oklch, var(--color-regal) 40%, transparent);
      transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    }
    .btn-regal:hover { background: var(--color-regal-deep); transform: translateY(-2px); box-shadow: 0 12px 26px color-mix(in oklch, var(--color-regal) 50%, transparent); }
    .btn-regal:focus-visible { outline: 3px solid var(--color-ink-deep); outline-offset: 2px; }
    .btn-outline {
      padding: 11px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em;
      color: color-mix(in oklch, var(--color-ink-deep) 80%, transparent);
      background: transparent; border: 1px solid var(--color-parchment-edge); border-radius: 4px; cursor: pointer;
      transition: border-color 0.18s ease, color 0.18s ease;
    }
    .btn-outline:hover { border-color: var(--color-regal); color: var(--color-ink-deep); }

    .record { display: flex; justify-content: space-around; gap: 8px; margin-top: 20px; }
    .rec { display: flex; flex-direction: column; align-items: center; }
    .rec b { font-family: var(--font-display); font-size: 26px; font-weight: 900; line-height: 1; color: var(--color-ink-deep); }
    .rec b.win { color: var(--color-regal-deep); }
    .rec span { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: color-mix(in oklch, var(--color-ink-deep) 50%, transparent); margin-top: 5px; }
    .first-run { text-align: center; font-size: 12px; margin-top: 18px; color: color-mix(in oklch, var(--color-ink-deep) 60%, transparent); }

    .identity { text-align: center; margin-top: 16px; }
    .id-chip { background: none; border: none; cursor: pointer; font-size: 12px; color: color-mix(in oklch, var(--color-ink-deep) 65%, transparent); }
    .id-chip:hover { color: var(--color-ink-deep); }
    .id-chip .pen { color: var(--color-regal-deep); }
    .id-input { text-align: center; font-size: 14px; padding: 8px 12px; color: var(--color-ink-deep); background: color-mix(in oklch, var(--color-parchment) 60%, white 40%); border: 1px solid var(--color-regal); border-radius: 4px; outline: none; }

    .links { display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 14px; }
    .links button { background: none; border: none; cursor: pointer; font-size: 12px; font-weight: 600; color: color-mix(in oklch, var(--color-ink-deep) 70%, transparent); text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 4px; }
    .links button:hover { color: var(--color-crimson); }
    .links span { color: color-mix(in oklch, var(--color-ink-deep) 40%, transparent); }

    /* Ranking: sección con divisor, no tarjeta anidada */
    .lb { margin-top: 22px; padding-top: 18px; border-top: 1px solid color-mix(in oklch, var(--color-parchment-edge) 80%, transparent); }
    .lb h2 { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; color: color-mix(in oklch, var(--color-ink-deep) 60%, transparent); margin-bottom: 10px; }
    .lb ol { list-style: none; display: flex; flex-direction: column; gap: 5px; }
    .lb li { display: flex; align-items: center; gap: 10px; font-size: 13px; }
    .lb li.me { font-weight: 800; color: var(--color-regal-deep); }
    .lb .pos { width: 18px; font-weight: 800; color: var(--color-regal-deep); }
    .lb .who { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .lb .score { font-size: 11px; color: color-mix(in oklch, var(--color-ink-deep) 60%, transparent); }
    .lb-empty { font-size: 12px; color: color-mix(in oklch, var(--color-ink-deep) 55%, transparent); }

    /* ── Móvil: una columna ── */
    @media (max-width: 900px) {
      .home { grid-template-columns: 1fr; gap: 30px; max-width: 460px; }
      .fan { transform: scale(0.82); margin-bottom: 6px; }
      .wordmark { font-size: clamp(44px, 13vw, 60px); }
    }
  `]
})
export class InicioComponent implements OnInit, AfterViewInit, OnDestroy {
  nombre = '';
  editandoNombre = false;
  hayPartida = false;
  record: PlayerRecord = { partidas: 0, victorias: 0, rachaActual: 0, mejorRacha: 0 };

  kings = [
    { id: 12, suit: 'Tréboles' }, { id: 25, suit: 'Diamantes' },
    { id: 38, suit: 'Corazones' }, { id: 51, suit: 'Picas' }
  ];
  depth = [-26, -8, -8, -26];

  castle = [
    { rank: 'J', label: '4 Jotas', pips: [0, 0, 0, 0] },
    { rank: 'Q', label: '4 Reinas', pips: [0, 0, 0, 0] },
    { rank: 'K', label: '4 Reyes', pips: [0, 0, 0, 0] }
  ];

  leaderboard: LeaderRow[] = [];
  cargandoLb = true;

  private fan = viewChild<ElementRef<HTMLElement>>('fan');
  private nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  private onMove?: (e: PointerEvent) => void;
  private sub = new Subscription();

  constructor(
    private router: Router,
    private http: HttpClient,
    private ws: GameWebSocketService,
    private player: PlayerService
  ) {}

  ngOnInit() {
    this.nombre = this.player.getName();
    this.record = this.player.getRecord();

    this.sub.add(this.ws.getGameState$().subscribe(s => {
      this.hayPartida = !!s && s.phase !== 'GAME_OVER';
    }));

    this.http.get<LeaderRow[]>(`${environment.apiUrl}/leaderboard`).subscribe({
      next: rows => { this.leaderboard = (rows ?? []).slice(0, 5); this.cargandoLb = false; },
      error: () => { this.leaderboard = []; this.cargandoLb = false; }
    });
  }

  ngAfterViewInit() {
    const fanEl = this.fan()?.nativeElement;
    if (fanEl) dealIn(fanEl.querySelectorAll('.fan-card'));
    this.setupParallax();
  }

  ngOnDestroy() {
    if (this.onMove) window.removeEventListener('pointermove', this.onMove);
    this.sub.unsubscribe();
  }

  nueva() { this.router.navigate(['/juego'], { queryParams: { nueva: 1 } }); }
  continuar() { this.router.navigate(['/juego']); }
  ir(ruta: string) { this.router.navigate(['/' + ruta]); }

  editarNombre() {
    this.editandoNombre = true;
    setTimeout(() => this.nameInput()?.nativeElement.focus());
  }
  guardarNombre() {
    this.nombre = this.nombre.trim();
    this.player.setName(this.nombre);
    this.editandoNombre = false;
  }

  esYo(username: string): boolean {
    return !!this.nombre && username.toLowerCase() === this.nombre.toLowerCase();
  }

  private setupParallax() {
    const fanEl = this.fan()?.nativeElement;
    if (!fanEl) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (matchMedia('(pointer: coarse)').matches) return;

    const rotY = gsap.quickTo(fanEl, 'rotationY', { duration: 0.6, ease: 'power3' });
    const rotX = gsap.quickTo(fanEl, 'rotationX', { duration: 0.6, ease: 'power3' });
    this.onMove = (e: PointerEvent) => {
      rotY((e.clientX / window.innerWidth - 0.5) * 16);
      rotX(-(e.clientY / window.innerHeight - 0.5) * 11);
    };
    window.addEventListener('pointermove', this.onMove);
  }
}
