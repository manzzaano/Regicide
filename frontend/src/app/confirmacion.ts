import { Component, ElementRef, afterNextRender, inject, input, output, viewChild } from '@angular/core';
import { Idioma } from './idioma';

const es = { cancelar: 'Cancelar' };
const en: typeof es = { cancelar: 'Cancel' };

/** La pregunta de antes de algo que no se deshace, en lugar del confirm() del navegador. */
@Component({
  selector: 'app-confirmacion',
  template: `
    <!-- Con showModal() el diálogo sube a la capa superior: ni el blur de la barra lo encierra. Escape cancela. -->
    <dialog #dialogo aria-labelledby="confirmacion-pregunta" (close)="respuesta.emit(dialogo.returnValue === 'si')">
      <p class="pregunta" id="confirmacion-pregunta">{{ pregunta() }}</p>
      <div class="pie">
        <button type="button" class="boton" autofocus (click)="dialogo.close()">{{ t().cancelar }}</button>
        <button type="button" class="boton-principal" (click)="dialogo.close('si')">{{ aceptar() }}</button>
      </div>
    </dialog>
  `,
  styles: `
    dialog {
      width: min(100% - 32px, 400px);
      padding: 24px;
      border: 1px solid var(--borde-caja);
      border-top: 2px solid var(--rojo);
      border-radius: var(--radio);
      background: var(--caja-fuerte);
      box-shadow: 0 24px 80px -12px rgb(239 68 68 / 0.25);
      color: var(--texto);
      animation: subir 240ms var(--curva);
    }
    dialog::backdrop {
      background: rgb(0 0 0 / 0.7);
      backdrop-filter: blur(4px);
    }
    .pregunta {
      margin: 0 0 20px;
      font: 700 20px var(--display);
      letter-spacing: -0.01em;
    }
    .pie {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
    }
    @keyframes subir {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.97);
      }
    }
  `,
})
export class Confirmacion {
  readonly pregunta = input.required<string>();
  readonly aceptar = input.required<string>();
  readonly respuesta = output<boolean>();
  protected readonly t = inject(Idioma).textos({ es, en });
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    afterNextRender(() => this.dialogo().nativeElement.showModal());
  }
}
