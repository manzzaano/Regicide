import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Menu } from '../menu';
import { Sesion } from '../sesion';
import { mensajeDeError } from './entrar';

/**
 * El enlace de los correos va tras la almohadilla para que no llegue a los logs del servidor ni al
 * Referer. Se lee una vez y se quita de la barra de direcciones.
 */
function leerEnlace(): string {
  const enlace = location.hash.slice(1);
  history.replaceState(history.state, '', location.pathname);
  return enlace;
}

const estilos = `
  :host {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }
  main {
    display: grid;
    flex: 1;
    place-items: center;
    padding: 24px 16px;
  }
  .panel {
    width: min(100%, 26em);
    padding: 1.4em;
    border: 1px solid var(--borde-caja);
    border-top: 2px solid var(--rojo);
    border-radius: 0.7em;
    background: rgb(18 18 18 / 0.85);
  }
  h1 {
    margin: 0 0 0.5em;
    color: var(--titulo);
    font-size: 1.5em;
  }
  p {
    color: var(--texto-suave);
  }
  label {
    display: grid;
    gap: 0.4em;
    margin-bottom: 0.9em;
    font-weight: 600;
  }
  .error {
    color: var(--rojo);
    font-weight: bold;
  }
  .boton-principal {
    width: 100%;
  }
  a {
    color: var(--rojo);
    font-weight: 600;
    text-decoration: none;
  }
`;

@Component({
  selector: 'app-restablecer',
  imports: [Menu, RouterLink],
  template: `
    <app-menu />
    <main>
      <section class="panel">
        <h1>Contraseña nueva</h1>
        @if (hecho()) {
          <p role="status">Contraseña cambiada. Se han cerrado todas las sesiones de la cuenta.</p>
          <a routerLink="/entrar">Entrar <span aria-hidden="true">→</span></a>
        } @else {
          <form (submit)="enviar($event)">
            <label>
              Contraseña nueva
              <input
                class="campo"
                name="nueva"
                type="password"
                autocomplete="new-password"
                required
                minlength="15"
                maxlength="128"
                [value]="nueva()"
                (input)="nueva.set($any($event.target).value)"
              />
            </label>
            <p>De 15 a 128 caracteres. Mejor una frase que recuerdes.</p>
            @if (error(); as error) {
              <p class="error" role="alert">{{ error }}</p>
            }
            <button class="boton-principal" type="submit" [disabled]="enviando()">Cambiar contraseña</button>
          </form>
        }
      </section>
    </main>
  `,
  styles: estilos,
})
export class Restablecer {
  private readonly sesion = inject(Sesion);
  private readonly enlace = leerEnlace();

  protected readonly nueva = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly enviando = signal(false);
  protected readonly hecho = signal(false);

  protected enviar(evento: Event): void {
    evento.preventDefault();
    this.enviando.set(true);
    this.error.set(null);
    this.sesion.restablecer(this.enlace, this.nueva()).subscribe({
      next: () => this.hecho.set(true),
      error: (error: unknown) => {
        this.error.set(mensajeDeError(error));
        this.enviando.set(false);
      },
    });
  }
}

@Component({
  selector: 'app-confirmar-correo',
  imports: [Menu, RouterLink],
  template: `
    <app-menu />
    <main>
      <section class="panel">
        <h1>Confirmar el correo</h1>
        @switch (estado()) {
          @case ('comprobando') {
            <p role="status">Comprobando el enlace…</p>
          }
          @case ('hecho') {
            <p role="status">Correo confirmado. Ya puedes usarlo para recuperar la contraseña.</p>
            <a routerLink="/">Volver a la portada <span aria-hidden="true">→</span></a>
          }
          @default {
            <p class="error" role="alert">{{ estado() }}</p>
            <a routerLink="/cuenta">Ir a tu cuenta <span aria-hidden="true">→</span></a>
          }
        }
      </section>
    </main>
  `,
  styles: estilos,
})
export class ConfirmarCorreo {
  /** 'comprobando', 'hecho' o el mensaje de error. */
  protected readonly estado = signal('comprobando');

  constructor() {
    inject(Sesion)
      .confirmarCorreo(leerEnlace())
      .subscribe({
        next: () => this.estado.set('hecho'),
        error: (error: unknown) => this.estado.set(mensajeDeError(error)),
      });
  }
}
