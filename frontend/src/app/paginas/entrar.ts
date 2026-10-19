import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
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
  imports: [Menu],
  template: `
    <app-menu />
    <main>
      <section class="caja tarjeta">
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
            <input
              class="campo"
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
    </main>
  `,
  styles: `
    main {
      padding: 0 16px;
    }
    .tarjeta {
      max-width: 400px;
      margin: 40px auto;
    }
    .tarjeta {
      padding: 24px;
    }
    .pestanas {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
      margin-bottom: 20px;
      padding: 4px;
      border-radius: 10px;
      background: rgb(255 255 255 / 0.06);
    }
    .pestanas button {
      min-height: 38px;
      border: 0;
      border-radius: 7px;
      background: none;
      color: var(--texto-suave);
      font-weight: 500;
      cursor: pointer;
      transition: background 150ms, color 150ms;
    }
    .pestanas button[aria-pressed='true'] {
      background: var(--hover);
      color: var(--texto);
    }
    h1 {
      margin: 0 0 6px;
      color: var(--titulo);
      font-size: 28px;
      font-weight: 800;
    }
    .ayuda {
      margin: 0 0 20px;
      color: var(--texto-suave);
    }
    .pista {
      margin: -8px 0 14px;
      color: var(--texto-suave);
      font-size: 13px;
    }
    label {
      display: grid;
      gap: 6px;
      margin-bottom: 14px;
      font-size: 14px;
      font-weight: 600;
    }
    .campo {
      font-weight: normal;
    }
    .error {
      color: var(--rojo);
      font-weight: bold;
    }
    .boton {
      width: 100%;
      margin-top: 6px;
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
