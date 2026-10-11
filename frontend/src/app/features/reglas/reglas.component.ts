import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reglas',
  standalone: true,
  template: `
    <div class="bg-board min-h-screen w-full flex flex-col">

      <header class="sticky top-0 z-10 flex items-center justify-between bg-black/45 px-6 py-3 backdrop-blur">
        <button class="btn-ghost text-sm" (click)="volver()">← Inicio</button>
        <span class="font-bold tracking-[0.2em] text-white">CÓMO JUGAR</span>
        <span class="w-16"></span>
      </header>

      <div class="mx-auto w-full max-w-3xl px-4 py-10">

        <div class="mb-8 text-center text-white">
          <h1 class="text-4xl font-extrabold tracking-[0.16em]">Regicide</h1>
          <p class="mt-2 text-sm font-semibold text-white/80">
            Vence a los 12 monarcas del castillo y salva el reino
          </p>
        </div>

        <!-- Reglas -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          @for (r of rules; track r.title) {
            <article class="panel p-5">
              <div class="mb-2 text-2xl">{{ r.icon }}</div>
              <h3 class="mb-1 text-sm font-bold uppercase tracking-wider text-[var(--color-ink)]">{{ r.title }}</h3>
              <p class="text-sm leading-relaxed text-[var(--color-ink-soft)]">{{ r.text }}</p>
            </article>
          }
        </div>

        <!-- Poderes por palo -->
        <h2 class="mt-10 mb-3 border-b border-white/25 pb-2 text-sm font-bold uppercase tracking-[0.2em] text-white">
          Poderes de los palos
        </h2>
        <div class="flex flex-col gap-3">
          @for (s of suits; track s.name) {
            <div class="panel flex items-center gap-4 px-4 py-3">
              <span class="w-9 text-center text-2xl font-bold" [style.color]="s.red ? '#b00000' : '#111'">{{ s.sym }}</span>
              <div>
                <strong class="block text-sm text-[var(--color-ink)]">{{ s.name }}</strong>
                <span class="text-sm text-[var(--color-ink-soft)]">{{ s.power }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Enemigos -->
        <h2 class="mt-10 mb-3 border-b border-white/25 pb-2 text-sm font-bold uppercase tracking-[0.2em] text-white">
          El castillo
        </h2>
        <div class="grid grid-cols-3 gap-3 text-center">
          @for (e of enemies; track e.name) {
            <div class="panel px-3 py-4">
              <div class="text-lg font-extrabold text-[var(--color-ink)]">{{ e.name }}</div>
              <div class="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                Vida {{ e.hp }} · Ataque {{ e.atk }}
              </div>
            </div>
          }
        </div>

        <button class="btn-action mt-10 w-full text-base uppercase tracking-wider" (click)="jugar()">
          ⚔ ¡A jugar!
        </button>
      </div>
    </div>
  `
})
export class ReglasComponent {
  rules = [
    { icon: '🎯', title: 'Objetivo', text: 'Derrota a los 12 monarcas del castillo (4 Jotas, 4 Reinas, 4 Reyes). Ganas cuando el castillo queda vacío.' },
    { icon: '🃏', title: 'Tu mano', text: 'Empiezas con 8 cartas numéricas (As a 10). En ataque sumas su valor; puedes combinar cartas del mismo número (palos distintos) hasta sumar 10, y añadir Ases como compañeros.' },
    { icon: '⚔', title: 'Ataque', text: 'La suma de las cartas jugadas inflige ese daño al enemigo y activa el poder de cada palo presente en la jugada.' },
    { icon: '🛡', title: 'Defensa', text: 'Tras tu ataque el enemigo contraataca. Juega una carta para reducir el daño por su valor; si no puedes cubrirlo, pierdes.' },
    { icon: '🔁', title: 'Comodines', text: 'Tienes 2 comodines. Cada uno rebaraja toda tu mano: descartas las cartas actuales y robas nuevas. No se recuperan.' },
    { icon: '🏆', title: 'Victoria', text: 'Vence a Jotas, Reinas y Reyes sin quedarte sin cartas ni recibir daño letal en defensa.' }
  ];

  // Poderes reales del v1
  suits = [
    { sym: '♥', red: true,  name: 'Corazones', power: 'Recupera cartas del descarte de vuelta al mazo de robo.' },
    { sym: '♦', red: true,  name: 'Diamantes', power: 'Roba cartas adicionales del mazo a tu mano.' },
    { sym: '♠', red: false, name: 'Picas',     power: 'Reduce el ataque del enemigo durante este turno.' },
    { sym: '♣', red: false, name: 'Tréboles',  power: 'Duplica (×2) el daño base de tu ataque.' }
  ];

  enemies = [
    { name: 'Jota (J)',  hp: 20, atk: 10 },
    { name: 'Reina (Q)', hp: 30, atk: 15 },
    { name: 'Rey (K)',   hp: 40, atk: 20 }
  ];

  constructor(private router: Router) {}

  volver() { this.router.navigate(['/inicio']); }
  jugar()  { this.router.navigate(['/juego']); }
}
