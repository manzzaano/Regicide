import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Menu } from '../menu';
import { Idioma } from '../idioma';
import { DatosDeCuenta, Sesion } from '../sesion';
import { mensajeDeError } from './entrar';

type Accion = 'contrasena' | 'correo' | 'borrar';

const es = {
  cuenta: 'Tu cuenta',
  cambiarContrasena: 'Cambiar la contraseña',
  otrosDispositivos: 'Se cerrará la sesión en tus otros dispositivos.',
  actual: 'Contraseña actual',
  nueva: 'Contraseña nueva',
  pistaContrasena: 'De 15 a 128 caracteres. Mejor una frase que recuerdes.',
  contrasenaCambiada: 'Contraseña cambiada.',
  botonContrasena: 'Cambiar contraseña',
  correo: 'Correo de recuperación',
  confirmado: 'Confirmado:',
  sinConfirmar: 'Sin confirmar:',
  abreElEnlace: 'Abre el enlace que te hemos enviado.',
  sinCorreo: 'Solo sirve para recuperar la contraseña. Sin correo, si la olvidas no se puede recuperar la cuenta.',
  correoNuevo: 'Correo nuevo',
  pistaCorreo: 'Déjalo vacío para quitar el correo.',
  botonCorreo: 'Guardar correo',
  borrar: 'Borrar la cuenta',
  avisoBorrar: 'Se borran tu cuenta, tu partida guardada y tus estadísticas. No se puede deshacer.',
  botonBorrar: 'Borrar mi cuenta',
};
const en: typeof es = {
  cuenta: 'Your account',
  cambiarContrasena: 'Change your password',
  otrosDispositivos: 'You will be signed out on your other devices.',
  actual: 'Current password',
  nueva: 'New password',
  pistaContrasena: '15 to 128 characters. A sentence you remember works best.',
  contrasenaCambiada: 'Password changed.',
  botonContrasena: 'Change password',
  correo: 'Recovery email',
  confirmado: 'Confirmed:',
  sinConfirmar: 'Not confirmed:',
  abreElEnlace: 'Open the link we sent you.',
  sinCorreo: 'Only used to recover your password. Without an email, a forgotten password cannot be recovered.',
  correoNuevo: 'New email',
  pistaCorreo: 'Leave it empty to remove the email.',
  botonCorreo: 'Save email',
  borrar: 'Delete your account',
  avisoBorrar: 'Your account, saved game and stats are deleted. This cannot be undone.',
  botonBorrar: 'Delete my account',
};

/** Cambiar la contraseña, el correo de recuperación o borrar la cuenta. Todo pide la contraseña actual. */
@Component({
  selector: 'app-cuenta',
  imports: [Menu],
  template: `
    <app-menu />
    <main class="cuenta">
      <header class="cabecera">
        <p class="eyebrow">{{ t().cuenta }}</p>
        <h1>{{ sesion.nombre() }}</h1>
      </header>

      <div class="columnas">
        <section class="panel" aria-labelledby="titulo-contrasena">
          <h2 id="titulo-contrasena">{{ t().cambiarContrasena }}</h2>
          <p class="ayuda">{{ t().otrosDispositivos }}</p>
          <form (submit)="cambiarContrasena($event)">
            <!-- Para que el gestor de contraseñas sepa de qué cuenta es. -->
            <input type="hidden" name="nombre" autocomplete="username" [value]="sesion.nombre()" />
            <label>
              {{ t().actual }}
              <input class="campo" name="actual" type="password" autocomplete="current-password" required maxlength="128" (input)="actual.set($any($event.target).value)" [value]="actual()" />
            </label>
            <label>
              {{ t().nueva }}
              <input class="campo" name="nueva" type="password" autocomplete="new-password" required minlength="15" maxlength="128" (input)="nueva.set($any($event.target).value)" [value]="nueva()" />
            </label>
            <p class="pista">{{ t().pistaContrasena }}</p>
            @if (resultado()?.accion === 'contrasena' && !errorDe('contrasena')) {
              <p class="hecho" role="status">{{ t().contrasenaCambiada }}</p>
            }
            @if (errorDe('contrasena'); as error) {
              <p class="error" role="alert">{{ error }}</p>
            }
            <button class="boton-principal" type="submit" [disabled]="enviando()">{{ t().botonContrasena }}</button>
          </form>
        </section>

        <div class="lateral">
          <section class="panel" aria-labelledby="titulo-correo">
            <h2 id="titulo-correo">{{ t().correo }}</h2>
            @if (datos(); as datos) {
              @if (datos.correo) {
                <p class="ayuda">{{ t().confirmado }} <strong>{{ datos.correo }}</strong></p>
              }
              @if (datos.correoPendiente) {
                <p class="ayuda">{{ t().sinConfirmar }} <strong>{{ datos.correoPendiente }}</strong>. {{ t().abreElEnlace }}</p>
              }
              @if (!datos.correo && !datos.correoPendiente) {
                <p class="ayuda">{{ t().sinCorreo }}</p>
              }
            }
            <form (submit)="cambiarCorreo($event)">
              <label>
                {{ t().correoNuevo }}
                <input class="campo" name="correo" type="email" autocomplete="email" maxlength="254" (input)="correo.set($any($event.target).value)" [value]="correo()" />
              </label>
              <p class="pista">{{ t().pistaCorreo }}</p>
              <label>
                {{ t().actual }}
                <input class="campo" name="contrasena-correo" type="password" autocomplete="current-password" required maxlength="128" (input)="paraCorreo.set($any($event.target).value)" [value]="paraCorreo()" />
              </label>
              @if (errorDe('correo'); as error) {
                <p class="error" role="alert">{{ error }}</p>
              }
              <button class="boton" type="submit" [disabled]="enviando()">{{ t().botonCorreo }}</button>
            </form>
          </section>

          <section class="panel peligro" aria-labelledby="titulo-borrar">
            <h2 id="titulo-borrar">{{ t().borrar }}</h2>
            <p class="ayuda">{{ t().avisoBorrar }}</p>
            <form (submit)="borrar($event)">
              <label>
                {{ t().actual }}
                <input class="campo" name="contrasena-borrar" type="password" autocomplete="current-password" required maxlength="128" (input)="paraBorrar.set($any($event.target).value)" [value]="paraBorrar()" />
              </label>
              @if (errorDe('borrar'); as error) {
                <p class="error" role="alert">{{ error }}</p>
              }
              <button class="boton borrar" type="submit" [disabled]="enviando()">{{ t().botonBorrar }}</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }
    .cuenta {
      width: min(100%, 1000px);
      margin: 0 auto;
      padding: 0 16px 32px;
      font-size: 15px;
    }
    .eyebrow {
      margin: 0;
      color: var(--rojo);
      font: 500 12px var(--mono);
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0.1em 0 0.8em;
      color: var(--titulo);
      font: 800 clamp(28px, 4vw, 40px) var(--display);
    }
    .columnas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr));
      gap: 16px;
      align-items: start;
    }
    .lateral {
      display: grid;
      gap: 16px;
    }
    .panel {
      padding: 20px;
      border: 1px solid var(--borde-caja);
      border-radius: var(--radio);
      background: rgb(18 18 18 / 0.85);
    }
    .peligro {
      border-color: rgb(239 68 68 / 0.35);
    }
    h2 {
      margin: 0 0 0.2em;
      color: var(--titulo);
      font-size: 1.15em;
    }
    .ayuda,
    .pista {
      margin: 0 0 1em;
      color: var(--texto-suave);
      font-size: 0.9em;
    }
    .pista {
      margin-top: -0.4em;
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
    .error {
      color: var(--rojo);
      font-weight: bold;
    }
    .ayuda strong {
      color: var(--texto);
      overflow-wrap: anywhere;
    }
    .hecho {
      color: var(--texto);
    }
    .borrar {
      border-color: var(--rojo);
      color: var(--rojo);
    }
  `,
})
export class Cuenta {
  protected readonly sesion = inject(Sesion);
  private readonly router = inject(Router);
  private readonly idioma = inject(Idioma);
  protected readonly t = this.idioma.textos({ es, en });

  protected readonly actual = signal('');
  protected readonly nueva = signal('');
  protected readonly correo = signal('');
  protected readonly paraCorreo = signal('');
  protected readonly paraBorrar = signal('');
  protected readonly datos = signal<DatosDeCuenta | null>(null);
  protected readonly enviando = signal(false);
  protected readonly resultado = signal<{ accion: Accion; error?: string } | null>(null);

  constructor() {
    this.sesion.cuenta().subscribe({ next: (datos) => this.datos.set(datos), error: () => {} });
  }

  protected errorDe(accion: Accion): string | undefined {
    const resultado = this.resultado();
    return resultado?.accion === accion ? resultado.error : undefined;
  }

  protected cambiarContrasena(evento: Event): void {
    this.hacer(evento, 'contrasena', this.sesion.cambiarContrasena(this.actual(), this.nueva()), () => {
      this.actual.set('');
      this.nueva.set('');
    });
  }

  protected cambiarCorreo(evento: Event): void {
    this.hacer(evento, 'correo', this.sesion.cambiarCorreo(this.correo().trim(), this.paraCorreo()), (datos) => {
      this.correo.set('');
      this.paraCorreo.set('');
      this.datos.set(datos);
    });
  }

  protected borrar(evento: Event): void {
    this.hacer(evento, 'borrar', this.sesion.borrarCuenta(this.paraBorrar()), () => void this.router.navigateByUrl('/'));
  }

  private hacer<T>(evento: Event, accion: Accion, peticion: Observable<T>, alTerminar: (valor: T) => void): void {
    evento.preventDefault();
    this.enviando.set(true);
    this.resultado.set(null);
    peticion.subscribe({
      next: (valor) => {
        alTerminar(valor);
        this.resultado.set({ accion });
        this.enviando.set(false);
      },
      error: (error: unknown) => {
        this.resultado.set({ accion, error: mensajeDeError(error, this.idioma.actual()) });
        this.enviando.set(false);
      },
    });
  }
}
