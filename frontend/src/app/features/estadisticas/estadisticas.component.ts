import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface Stats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  averageTurns: number;
  bestTime?: string;
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="bg-board min-h-screen w-full flex flex-col">

      <header class="sticky top-0 z-10 flex items-center justify-between bg-black/45 px-6 py-3 backdrop-blur">
        <button class="btn-ghost text-sm" (click)="volver()">← Inicio</button>
        <span class="font-bold tracking-[0.2em] text-white">ESTADÍSTICAS</span>
        <span class="w-16"></span>
      </header>

      <div class="mx-auto w-full max-w-2xl px-4 py-10">

        <div class="mb-8 text-center text-white">
          <div class="text-4xl">📊</div>
          <h1 class="mt-1 text-3xl font-extrabold tracking-[0.16em]">Tu progreso</h1>
          @if (jugador) { <p class="mt-1 text-sm font-semibold text-white/80">{{ jugador }}</p> }
        </div>

        @if (cargando) {
          <div class="py-12 text-center text-white">
            <div class="spinner mx-auto"></div>
            <p class="mt-3 text-sm">Cargando estadísticas...</p>
          </div>
        }

        @if (errorMsg) {
          <div class="mb-6 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-[var(--color-enemy)]">
            <span>⚠</span> {{ errorMsg }}
          </div>
        }

        @if (stats && !cargando) {
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div class="panel px-3 py-5 text-center">
              <div class="text-3xl font-extrabold text-[var(--color-ink)]">{{ stats.totalGames }}</div>
              <div class="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">Partidas</div>
            </div>
            <div class="panel px-3 py-5 text-center">
              <div class="text-3xl font-extrabold text-green-700">{{ stats.wins }}</div>
              <div class="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">Victorias</div>
            </div>
            <div class="panel px-3 py-5 text-center">
              <div class="text-3xl font-extrabold text-[var(--color-enemy)]">{{ stats.losses }}</div>
              <div class="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">Derrotas</div>
            </div>
            <div class="panel px-3 py-5 text-center">
              <div class="text-3xl font-extrabold text-[var(--color-ink)]">{{ stats.winRate | number:'1.0-0' }}%</div>
              <div class="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">Tasa victoria</div>
            </div>
            <div class="panel px-3 py-5 text-center">
              <div class="text-3xl font-extrabold text-[var(--color-ink)]">{{ stats.averageTurns | number:'1.0-1' }}</div>
              <div class="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">Turnos prom.</div>
            </div>
            @if (stats.bestTime) {
              <div class="panel px-3 py-5 text-center">
                <div class="text-3xl font-extrabold text-[var(--color-ink)]">{{ stats.bestTime }}</div>
                <div class="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">Mejor tiempo</div>
              </div>
            }
          </div>

          <div class="mt-7">
            <div class="mb-2 text-xs font-bold uppercase tracking-wider text-white/80">Ratio victoria / derrota</div>
            <div class="flex h-8 overflow-hidden rounded-lg">
              <div class="flex items-center justify-center bg-green-600 text-xs font-bold text-white transition-all duration-700"
                   [style.width.%]="stats.winRate">
                @if (stats.winRate > 10) { {{ stats.wins }}W }
              </div>
              <div class="flex items-center justify-center text-xs font-bold text-white transition-all duration-700"
                   style="background:var(--color-enemy)" [style.width.%]="100 - stats.winRate">
                @if ((100 - stats.winRate) > 10) { {{ stats.losses }}L }
              </div>
            </div>
          </div>
        }

        @if (!stats && !cargando && !errorMsg) {
          <div class="panel px-6 py-12 text-center">
            <div class="text-5xl">🎴</div>
            <h3 class="mt-3 text-lg font-bold text-[var(--color-ink)]">Sin datos aún</h3>
            <p class="mt-1 text-sm text-[var(--color-ink-soft)]">Juega tu primera partida para ver tus estadísticas.</p>
          </div>
        }

        <button class="btn-action mt-8 w-full text-base uppercase tracking-wider" (click)="jugar()">
          ⚔ Jugar ahora
        </button>
      </div>
    </div>
  `,
  styles: [`
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid rgba(255,255,255,0.25);
      border-top-color: #fff;
      border-radius: 50%;
      animation: var(--animate-spin-slow);
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class EstadisticasComponent implements OnInit {
  stats: Stats | null = null;
  cargando = false;
  errorMsg = '';
  jugador = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.jugador = sessionStorage.getItem('nombreJugador') ?? '';
    this.cargarStats();
  }

  cargarStats() {
    this.cargando = true;
    this.errorMsg = '';
    this.http.get<Stats>(`${environment.apiUrl}/stats`).subscribe({
      next: (data) => { this.stats = data; this.cargando = false; },
      error: () => { this.errorMsg = 'No se pudieron cargar las estadísticas.'; this.cargando = false; }
    });
  }

  volver() { this.router.navigate(['/inicio']); }
  jugar()  { this.router.navigate(['/juego']); }
}
