import { Component, ElementRef, afterNextRender, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Idioma } from './idioma';

const es = {
  fin: 'Fin de partida',
  victoria: 'Victoria',
  derrota: 'Derrota',
  derrotados: (n: number) => `Has derrotado a ${n} de 12 enemigos.`,
  crea: 'Entra o crea una cuenta',
  paraContar: 'y esta partida contará en tus estadísticas.',
  verMesa: 'Ver la mesa',
  estadisticas: 'Estadísticas',
  nueva: 'Nueva Partida',
};
const en: typeof es = {
  fin: 'Game over',
  victoria: 'Victory',
  derrota: 'Defeat',
  derrotados: (n: number) => `You defeated ${n} of 12 enemies.`,
  crea: 'Sign in or create an account',
  paraContar: 'and this game will count in your stats.',
  verMesa: 'See the table',
  estadisticas: 'Stats',
  nueva: 'New Game',
};

/** El Alert de fin de partida de v1, con el resultado en grande y lo que se puede hacer después. */
@Component({
  selector: 'app-fin-de-partida',
  imports: [RouterLink],
  template: `
    <div class="fondo">
      <div class="dialogo" role="alertdialog" aria-modal="true" aria-labelledby="fin-titulo" aria-describedby="fin-texto">
        <p class="etiqueta">{{ t().fin }}</p>
        <h2 class="resultado" id="fin-titulo" [class.victoria]="victoria()">{{ victoria() ? t().victoria : t().derrota }}</h2>
        <p id="fin-texto">{{ t().derrotados(derrotados()) }}</p>
        <span class="progreso" aria-hidden="true"><span [style.width.%]="(derrotados() / 12) * 100"></span></span>
        @if (invitado()) {
          <p class="nota"><a routerLink="/entrar">{{ t().crea }}</a> {{ t().paraContar }}</p>
        }
        <div class="pie">
          <button type="button" class="boton" (click)="cerrar.emit()">{{ t().verMesa }}</button>
          <a class="boton" routerLink="/clasificacion">{{ t().estadisticas }}</a>
          <button type="button" class="boton-principal" (click)="nuevaPartida.emit()">{{ t().nueva }}</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .fondo {
      position: fixed;
      inset: 0;
      z-index: 40;
      display: grid;
      place-items: center;
      padding: 16px;
      background: rgb(0 0 0 / 0.7);
      backdrop-filter: blur(4px);
      animation: aparecer 200ms ease-out;
    }
    .dialogo {
      width: min(100%, 460px);
      padding: 24px;
      border: 1px solid var(--borde-caja);
      border-top: 2px solid var(--rojo);
      border-radius: var(--radio);
      background: var(--caja-fuerte);
      box-shadow: 0 24px 80px -12px rgb(239 68 68 / 0.25);
      color: var(--texto-suave);
      animation: subir 320ms var(--curva);
    }
    .etiqueta {
      margin: 0;
    }
    .resultado {
      margin: 4px 0 8px;
      color: var(--texto);
      font-size: clamp(44px, 9vw, 64px);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .victoria {
      color: var(--rojo);
      text-shadow: 0 0 32px rgb(239 68 68 / 0.5);
    }
    p {
      margin: 0 0 12px;
    }
    .progreso {
      display: block;
      height: 4px;
      margin-bottom: 20px;
      border-radius: 2px;
      background: rgb(255 255 255 / 0.08);
    }
    .progreso span {
      display: block;
      height: 100%;
      border-radius: 2px;
      background: linear-gradient(90deg, #ef4444, #f87171);
    }
    .nota {
      font-size: 14px;
    }
    .nota a {
      color: var(--rojo);
      font-weight: 600;
    }
    .pie {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
    }
    @keyframes aparecer {
      from {
        opacity: 0;
      }
    }
    @keyframes subir {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.96);
      }
    }
  `,
})
export class FinDePartida {
  readonly victoria = input.required<boolean>();
  readonly derrotados = input.required<number>();
  readonly invitado = input.required<boolean>();
  readonly nuevaPartida = output<void>();
  readonly cerrar = output<void>();
  protected readonly t = inject(Idioma).textos({ es, en });

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => elemento.querySelector<HTMLElement>('.boton-principal')?.focus());
  }
}
