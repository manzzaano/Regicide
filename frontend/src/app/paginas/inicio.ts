import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Carta } from '../carta';
import { Sesion } from '../sesion';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, Carta],
  template: `
    <section class="portada">
      <div class="contenedor contenido">
        <div class="texto">
          <h1>Regicide</h1>
          <p class="lema">Doce figuras guardan el castillo. Tú solo tienes tu mano.</p>
          <p>
            Derrota a las sotas, a las reinas y a los reyes con las cartas de la baraja. Cada palo tiene su poder
            y ningún enemigo se deja hacer daño por el suyo.
          </p>
          <div class="acciones">
            <a class="boton" routerLink="/partida">{{ sesion.nombre() ? 'Jugar' : 'Jugar sin cuenta' }}</a>
            <a class="boton secundario" routerLink="/reglas">Cómo se juega</a>
          </div>
          @if (!sesion.nombre()) {
            <p class="nota">
              Sin cuenta, la partida se pierde al cerrar la página. <a routerLink="/entrar">Crea una cuenta</a> para
              retomarla y aparecer en la clasificación.
            </p>
          }
        </div>
        <div class="abanico" aria-hidden="true">
          @for (carta of figuras; track $index) {
            <app-carta [carta]="carta" [style.--i]="$index" />
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .portada {
      position: relative;
      min-height: calc(100dvh - 61px);
      display: grid;
      align-items: center;
      padding-block: 2.5rem 9rem;
      isolation: isolate;
    }
    /* El paisaje va en una capa aparte para oscurecerlo en modo oscuro sin tocar el texto. */
    .portada::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      background: url('/paisaje.webp') center bottom / cover no-repeat;
      filter: var(--paisaje-filtro);
    }
    .contenido {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 2rem;
      align-items: center;
    }
    .texto {
      padding: 1.75rem;
      border-radius: var(--radio);
      background: color-mix(in srgb, var(--superficie) 88%, transparent);
      box-shadow: var(--sombra);
    }
    h1 {
      font-size: clamp(3rem, 9vw, 5.5rem);
      margin-bottom: 0.15em;
    }
    .lema {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--acento);
    }
    .acciones {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-block: 1.5rem 0.5rem;
    }
    .nota {
      color: var(--texto-suave);
      font-size: 1rem;
    }
    .abanico {
      position: relative;
      height: clamp(220px, 34vw, 360px);
    }
    .abanico app-carta {
      position: absolute;
      left: 50%;
      bottom: 0;
      width: clamp(110px, 16vw, 180px);
      transform-origin: 50% 120%;
      transform: translateX(-50%) rotate(calc((var(--i) - 1) * 14deg));
      animation: repartir 600ms cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
      animation-delay: calc(var(--i) * 120ms);
    }
    @keyframes repartir {
      from {
        transform: translateX(-50%) translateY(40px) rotate(0deg);
        opacity: 0;
      }
    }
    @media (max-width: 760px) {
      .contenido {
        grid-template-columns: 1fr;
      }
      .abanico {
        order: -1;
        height: 200px;
      }
      .abanico app-carta {
        width: 110px;
      }
    }
  `,
})
export class Inicio {
  protected readonly sesion = inject(Sesion);
  protected readonly figuras = [
    { numero: 11, palo: 'TREBOLES' },
    { numero: 13, palo: 'PICAS' },
    { numero: 12, palo: 'CORAZONES' },
  ] as const;
}
