import { Component, input, output, signal } from '@angular/core';

/** El código de recuperación recién emitido. El servidor solo guarda su resumen: esta es la única vez que se ve. */
@Component({
  selector: 'app-codigo-recuperacion',
  template: `
    <div class="codigo" role="status">
      <p class="titulo">Tu código de recuperación</p>
      <p class="valor">{{ codigo() }}</p>
      <p class="aviso">
        Guárdalo en tu gestor de contraseñas o apúntalo. Sin correo, es la única forma de recuperar la cuenta si
        olvidas la contraseña, y no se volverá a mostrar. Cada código vale una sola vez.
      </p>
      <div class="botones">
        <button type="button" class="boton" (click)="copiar()">{{ copiado() ? 'Copiado' : 'Copiar' }}</button>
        <button type="button" class="boton-principal" (click)="guardado.emit()">
          Lo he guardado <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  `,
  styles: `
    .codigo {
      padding: 1em;
      border: 1px solid rgb(239 68 68 / 0.35);
      border-radius: 0.5em;
      background: rgb(239 68 68 / 0.06);
    }
    .titulo {
      margin: 0;
      color: var(--texto-suave);
      font-size: 0.85em;
    }
    .valor {
      margin: 0.3em 0 0.6em;
      color: var(--titulo);
      font: 600 1.4em var(--mono);
      letter-spacing: 0.08em;
      user-select: all;
    }
    .aviso {
      margin: 0 0 1em;
      color: var(--texto-suave);
      font-size: 0.85em;
    }
    .botones {
      display: flex;
      gap: 0.6em;
    }
    .boton-principal {
      flex: 1;
      justify-content: space-between;
    }
  `,
})
export class CodigoRecuperacion {
  readonly codigo = input.required<string>();
  readonly guardado = output();

  protected readonly copiado = signal(false);

  protected copiar(): void {
    void navigator.clipboard.writeText(this.codigo()).then(() => this.copiado.set(true));
  }
}
