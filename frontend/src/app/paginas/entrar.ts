import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Menu } from '../menu';
import { Sesion } from '../sesion';

function mensajeDeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se ha podido conectar con el servidor';
    }
    if (typeof error.error?.mensaje === 'string') {
      return error.error.mensaje;
    }
  }
  return 'Algo ha fallado. Inténtalo de nuevo.';
}

@Component({
  selector: 'app-entrar',
  imports: [Menu, RouterLink],
  template: `
    <app-menu />
    <img class="fondo-castillo" src="castillo.svg" alt="" width="1000" height="1000" />
    <main class="entrar">
      <section class="panel">
        <div class="pestanas" role="group" aria-label="Elige una opción">
          <button type="button" [attr.aria-pressed]="!creando()" (click)="cambiar(false)">Entrar</button>
          <button type="button" [attr.aria-pressed]="creando()" (click)="cambiar(true)">Crear cuenta</button>
        </div>
        <h1>{{ creando() ? 'Crea tu cuenta' : 'Entra con tu cuenta' }}</h1>
        <p class="ayuda">
          {{ creando() ? 'Solo un nombre y una contraseña, sin correo.' : 'Sigue la partida donde la dejaste.' }}
        </p>

        <form (submit)="enviar($event)">
          <label>
            Nombre
            <input
              class="campo"
              name="nombre"
              autocomplete="username"
              required
              [attr.pattern]="creando() ? '[A-Za-z0-9_]{3,20}' : null"
              maxlength="20"
              [value]="nombre()"
              (input)="nombre.set($any($event.target).value)"
            />
          </label>
          @if (creando()) {
            <p class="pista">De 3 a 20 letras sin tildes, números o guiones bajos.</p>
          }
          <label>
            Contraseña
            <!-- El campo va antes que el botón para que siga siendo el control de la etiqueta. -->
            <span class="clave">
              <input
                class="campo"
                name="contrasena"
                [type]="visible() ? 'text' : 'password'"
                [attr.autocomplete]="creando() ? 'new-password' : 'current-password'"
                required
                [attr.minlength]="creando() ? 8 : null"
                maxlength="72"
                [value]="contrasena()"
                (input)="contrasena.set($any($event.target).value)"
              />
              <button type="button" class="ver" [attr.aria-pressed]="visible()" (click)="visible.set(!visible())">
                {{ visible() ? 'Ocultar' : 'Mostrar' }}
              </button>
            </span>
          </label>
          @if (creando()) {
            <p class="pista">Al menos 8 caracteres.</p>
          }

          @if (error(); as error) {
            <p class="error" role="alert">{{ error }}</p>
          }

          <button class="boton-principal enviar" type="submit" [disabled]="enviando()">
            {{ creando() ? 'Crear cuenta' : 'Entrar' }} <span aria-hidden="true">→</span>
          </button>
        </form>

        <div class="pie">
          <a class="enlace" routerLink="/partida">Seguir como invitado <span aria-hidden="true">→</span></a>
        </div>
      </section>
    </main>
  `,
  styles: `
    /* El formulario solo, centrado en lo que deja el menú y con la escala de la portada. */
    .entrar {
      display: grid;
      place-items: center;
      min-height: calc(100dvh - 72px);
      padding: clamp(24px, 4vh, 56px) 16px;
      font-size: clamp(15px, calc(0.55vw + 0.6vh + 4px), 24px);
    }
    .panel {
      width: min(100%, 22em);
      padding: 1.4em;
      border: 1px solid var(--borde-caja);
      border-top: 2px solid var(--rojo);
      border-radius: 0.7em;
      background: rgb(18 18 18 / 0.85);
      box-shadow: var(--sombra);
      backdrop-filter: blur(12px);
      font-size: 0.8em;
    }
    .pestanas {
      display: grid;
      grid-template-columns: 1fr 1fr;
      margin-bottom: 1.4em;
      border-bottom: 1px solid var(--linea);
    }
    .pestanas button {
      min-height: 2.8em;
      margin-bottom: -1px;
      border: 0;
      border-bottom: 2px solid transparent;
      background: none;
      color: var(--texto-suave);
      font: 500 1em var(--sans);
      cursor: pointer;
      transition:
        color 150ms,
        border-color 150ms;
    }
    .pestanas button:hover {
      color: var(--texto);
    }
    .pestanas button[aria-pressed='true'] {
      border-color: var(--rojo);
      color: var(--texto);
    }
    h1 {
      margin: 0 0 0.25em;
      color: var(--titulo);
      font-size: 1.75em;
      font-weight: 800;
    }
    .ayuda {
      margin: 0 0 1.3em;
      color: var(--texto-suave);
    }
    .pista {
      margin: -0.5em 0 0.9em;
      color: var(--texto-suave);
      font-size: 0.85em;
    }
    label {
      display: grid;
      gap: 0.4em;
      margin-bottom: 0.9em;
      font-weight: 600;
    }
    .campo {
      font-weight: normal;
    }
    .clave {
      position: relative;
      display: block;
    }
    .clave .campo {
      padding-right: 5.5em;
    }
    .ver {
      position: absolute;
      top: 50%;
      right: 6px;
      padding: 0.35em 0.6em;
      border: 0;
      border-radius: 6px;
      background: none;
      color: var(--texto-suave);
      font: 500 0.75em var(--mono);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      transform: translateY(-50%);
    }
    .ver:hover {
      background: var(--hover);
      color: var(--texto);
    }
    .error {
      color: var(--rojo);
      font-weight: bold;
    }
    .enviar {
      justify-content: space-between;
      width: 100%;
      min-height: 3.4em;
      margin-top: 0.4em;
      padding-inline: 1.3em;
    }
    .enviar span,
    .enlace span {
      transition: transform 200ms var(--curva);
    }
    .enviar:hover span,
    .enlace:hover span {
      transform: translateX(4px);
    }
    .pie {
      margin-top: 1.2em;
      padding-top: 1em;
      border-top: 1px solid var(--linea);
    }
    .enlace {
      color: var(--rojo);
      font-weight: 600;
      text-decoration: none;
    }
  `,
})
export class Entrar {
  private readonly sesion = inject(Sesion);
  private readonly router = inject(Router);

  protected readonly creando = signal(false);
  protected readonly nombre = signal('');
  protected readonly contrasena = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly enviando = signal(false);
  protected readonly visible = signal(false);

  protected cambiar(creando: boolean): void {
    this.creando.set(creando);
    this.error.set(null);
  }

  protected enviar(evento: Event): void {
    evento.preventDefault();
    this.enviando.set(true);
    this.error.set(null);
    const peticion = this.creando()
      ? this.sesion.registrarse(this.nombre(), this.contrasena())
      : this.sesion.entrar(this.nombre(), this.contrasena());
    peticion.subscribe({
      next: () => void this.router.navigateByUrl('/partida'),
      error: (error: unknown) => {
        this.error.set(mensajeDeError(error));
        this.enviando.set(false);
      },
    });
  }
}
