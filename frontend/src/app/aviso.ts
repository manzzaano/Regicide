import { Component, ElementRef, afterNextRender, inject, input, output } from '@angular/core';

/** Los Alert de JavaFX que usaba v1: un título, un mensaje y Aceptar. */
@Component({
  selector: 'app-aviso',
  template: `
    <div class="fondo">
      <div class="dialogo" role="alertdialog" aria-modal="true" aria-labelledby="aviso-titulo" aria-describedby="aviso-texto">
        <p class="cabecera" id="aviso-titulo">{{ titulo() }}</p>
        <div class="cuerpo">
          <p id="aviso-texto">{{ texto() }}</p>
          <ng-content />
          <div class="pie">
            <button type="button" class="boton" (click)="aceptar.emit()">Aceptar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .fondo {
      position: fixed;
      inset: 0;
      z-index: 10;
      display: grid;
      place-items: center;
      padding: 16px;
      background: rgb(4 20 20 / 0.45);
      backdrop-filter: blur(3px);
      animation: aparecer 160ms ease-out;
    }
    .dialogo {
      width: min(100%, 400px);
      overflow: hidden;
      border: 1px solid var(--borde-caja);
      border-radius: var(--radio);
      background: var(--caja-fuerte);
      box-shadow: 0 24px 60px -12px rgb(0 0 0 / 0.5);
      animation: subir 260ms var(--curva);
    }
    .cabecera {
      margin: 0;
      padding: 18px 20px 0;
      color: var(--titulo);
      font-family: var(--display);
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .cuerpo {
      padding: 6px 20px 20px;
      color: var(--texto-suave);
    }
    .cuerpo p {
      margin: 0 0 16px;
    }
    .pie {
      display: flex;
      justify-content: flex-end;
    }
    @keyframes aparecer {
      from {
        opacity: 0;
      }
    }
    @keyframes subir {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.97);
      }
    }
  `,
})
export class Aviso {
  readonly titulo = input.required<string>();
  readonly texto = input.required<string>();
  readonly aceptar = output<void>();

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => elemento.querySelector('button')?.focus());
  }
}
