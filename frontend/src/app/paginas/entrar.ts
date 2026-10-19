import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
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
  template: `
    <div class="contenedor">
      <section class="tarjeta">
        <div class="pestanas" role="group" aria-label="Elige una opción">
          <button type="button" [attr.aria-pressed]="!creando()" (click)="cambiar(false)">Entrar</button>
          <button type="button" [attr.aria-pressed]="creando()" (click)="cambiar(true)">Crear cuenta</button>
        </div>
        <h1>{{ creando() ? 'Crea tu cuenta' : 'Entra con tu cuenta' }}</h1>
        <p class="ayuda">Con cuenta, tu partida se guarda tras cada jugada y apareces en la clasificación.</p>

        <form (submit)="enviar($event)">
          <label>
            Nombre
            <input
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
            <input
              name="contrasena"
              type="password"
              [attr.autocomplete]="creando() ? 'new-password' : 'current-password'"
              required
              [attr.minlength]="creando() ? 8 : null"
              maxlength="72"
              [value]="contrasena()"
              (input)="contrasena.set($any($event.target).value)"
            />
          </label>
          @if (creando()) {
            <p class="pista">Al menos 8 caracteres.</p>
          }

          @if (error(); as error) {
            <p class="error" role="alert">{{ error }}</p>
          }

          <button class="boton" type="submit" [disabled]="enviando()">
            {{ creando() ? 'Crear cuenta' : 'Entrar' }}
          </button>
        </form>
      </section>
    </div>
  `,
  styles: `
    .tarjeta {
      max-width: 440px;
      margin: 2.5rem auto;
      padding: 1.75rem;
      border-radius: var(--radio);
      background: var(--superficie);
      box-shadow: var(--sombra);
    }
    .pestanas {
      display: grid;
      grid-template-columns: 1fr 1fr;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--linea);
    }
    .pestanas button {
      min-height: 44px;
      border: 0;
      border-bottom: 3px solid transparent;
      background: none;
      color: var(--texto-suave);
      font-weight: 700;
      cursor: pointer;
    }
    .pestanas button[aria-pressed='true'] {
      color: var(--texto);
      border-bottom-color: var(--acento);
    }
    h1 {
      font-size: 2rem;
    }
    .ayuda,
    .pista {
      color: var(--texto-suave);
    }
    .pista {
      margin: -0.6rem 0 1rem;
      font-size: 0.95rem;
    }
    label {
      display: grid;
      gap: 0.3rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    input {
      min-height: 44px;
      padding: 0.4em 0.7em;
      border: 2px solid var(--linea);
      border-radius: 8px;
      background: var(--fondo);
      font-weight: 400;
    }
    input:focus-visible {
      border-color: var(--acento);
      outline-offset: 1px;
    }
    .error {
      padding: 0.6em 0.8em;
      border-left: 4px solid var(--acento);
      background: var(--superficie-2);
      font-weight: 700;
    }
    .boton {
      width: 100%;
      margin-top: 0.5rem;
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
