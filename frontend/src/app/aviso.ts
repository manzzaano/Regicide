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
      background: rgb(0 0 0 / 0.35);
    }
    .dialogo {
      width: min(100%, 380px);
      border: 1px solid #999;
      background: #f4f4f4;
      box-shadow: 0 8px 30px rgb(0 0 0 / 0.4);
    }
    .cabecera {
      margin: 0;
      padding: 8px 12px;
      border-bottom: 1px solid #ccc;
      background: #fff;
      font-weight: bold;
    }
    .cuerpo {
      padding: 16px 12px 12px;
    }
    .cuerpo p {
      margin: 0 0 12px;
    }
    .pie {
      display: flex;
      justify-content: flex-end;
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
