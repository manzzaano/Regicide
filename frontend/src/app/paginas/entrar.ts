import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Menu } from '../menu';
import { Idioma, Lengua } from '../idioma';
import { Sesion } from '../sesion';

/** El mensaje del servidor, que ya llega en el idioma pedido, o uno propio si no hay. */
export function mensajeDeError(error: unknown, lengua: Lengua): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return lengua === 'es' ? 'No se ha podido conectar con el servidor' : 'Could not connect to the server';
    }
    if (typeof error.error?.mensaje === 'string') {
      return error.error.mensaje;
    }
  }
  return lengua === 'es' ? 'Algo ha fallado. Inténtalo de nuevo.' : 'Something went wrong. Try again.';
}

type Modo = 'entrar' | 'crear' | 'recuperar';

const es = {
  opciones: 'Elige una opción',
  entrar: 'Entrar',
  crear: 'Crear cuenta',
  titulo: { entrar: 'Entra con tu cuenta', crear: 'Crea tu cuenta', recuperar: 'Recupera tu cuenta' },
  ayuda: {
    entrar: 'Sigue la partida donde la dejaste.',
    crear: 'Solo un nombre y una contraseña. El correo es opcional.',
    recuperar: 'Te enviaremos un enlace al correo de tu cuenta, si le añadiste uno.',
  },
  boton: { entrar: 'Entrar', crear: 'Crear cuenta', recuperar: 'Enviar enlace' },
  nombre: 'Nombre',
  pistaNombre: 'De 3 a 20 letras sin tildes, números o guiones bajos.',
  contrasena: 'Contraseña',
  ocultar: 'Ocultar',
  mostrar: 'Mostrar',
  pistaContrasena: 'De 15 a 128 caracteres. Mejor una frase que recuerdes.',
  correo: 'Correo',
  opcional: '(opcional)',
  pistaCorreo: 'Solo para recuperar la contraseña. Sin correo, si la olvidas no se puede recuperar la cuenta.',
  privacidad: 'Privacidad',
  volver: 'Volver a entrar',
  olvidada: '¿Has olvidado la contraseña?',
  invitado: 'Seguir como invitado',
};
const en: typeof es = {
  opciones: 'Choose an option',
  entrar: 'Sign in',
  crear: 'Create account',
  titulo: { entrar: 'Sign in to your account', crear: 'Create your account', recuperar: 'Recover your account' },
  ayuda: {
    entrar: 'Pick up your game where you left it.',
    crear: 'Just a name and a password. The email is optional.',
    recuperar: 'We will send a link to your account email, if you added one.',
  },
  boton: { entrar: 'Sign in', crear: 'Create account', recuperar: 'Send link' },
  nombre: 'Name',
  pistaNombre: '3 to 20 letters without accents, numbers or underscores.',
  contrasena: 'Password',
  ocultar: 'Hide',
  mostrar: 'Show',
  pistaContrasena: '15 to 128 characters. A sentence you remember works best.',
  correo: 'Email',
  opcional: '(optional)',
  pistaCorreo: 'Only to recover your password. Without an email, a forgotten password cannot be recovered.',
  privacidad: 'Privacy',
  volver: 'Back to sign in',
  olvidada: 'Forgot your password?',
  invitado: 'Play as a guest',
};

@Component({
  selector: 'app-entrar',
  imports: [Menu, RouterLink],
  template: `
    <app-menu />
    <img class="fondo-castillo" src="castillo.svg" alt="" width="1000" height="1000" />
    <main class="entrar">
      <section class="panel">
        <div class="pestanas" role="group" [attr.aria-label]="t().opciones">
          <button type="button" [attr.aria-pressed]="modo() === 'entrar'" (click)="cambiar('entrar')">{{ t().entrar }}</button>
          <button type="button" [attr.aria-pressed]="modo() === 'crear'" (click)="cambiar('crear')">{{ t().crear }}</button>
        </div>
        <h1>{{ t().titulo[modo()] }}</h1>

        <p class="ayuda">{{ t().ayuda[modo()] }}</p>
        <form (submit)="enviar($event)">
          <label>
            {{ t().nombre }}
            <input
              class="campo"
              name="nombre"
              autocomplete="username"
              required
              [attr.pattern]="modo() === 'crear' ? '[A-Za-z0-9_]{3,20}' : null"
              maxlength="20"
              [value]="nombre()"
              (input)="nombre.set($any($event.target).value)"
            />
          </label>
          @if (modo() === 'crear') {
            <p class="pista">{{ t().pistaNombre }}</p>
          }
          @if (modo() !== 'recuperar') {
            <label>
              {{ t().contrasena }}
              <!-- El campo va antes que el botón para que siga siendo el control de la etiqueta. -->
              <span class="clave">
                <input
                  class="campo"
                  name="contrasena"
                  [type]="visible() ? 'text' : 'password'"
                  [attr.autocomplete]="modo() === 'entrar' ? 'current-password' : 'new-password'"
                  required
                  [attr.minlength]="modo() === 'entrar' ? null : 15"
                  maxlength="128"
                  [value]="contrasena()"
                  (input)="contrasena.set($any($event.target).value)"
                />
                <button type="button" class="ver" [attr.aria-pressed]="visible()" (click)="visible.set(!visible())">
                  {{ visible() ? t().ocultar : t().mostrar }}
                </button>
              </span>
            </label>
          }
          @if (modo() === 'crear') {
            <p class="pista">{{ t().pistaContrasena }}</p>
            <label>
              <span>{{ t().correo }} <span class="opcional">{{ t().opcional }}</span></span>
              <input
                class="campo"
                name="correo"
                type="email"
                autocomplete="email"
                maxlength="254"
                [value]="correo()"
                (input)="correo.set($any($event.target).value)"
              />
            </label>
            <p class="pista">
              {{ t().pistaCorreo }}
              <a class="privacidad" routerLink="/privacidad">{{ t().privacidad }}</a>
            </p>
          }

          @if (error(); as error) {
            <p class="error" role="alert">{{ error }}</p>
          }
          @if (aviso(); as aviso) {
            <p class="aviso" role="status">{{ aviso }}</p>
          }

          <button class="boton-principal enviar" type="submit" [disabled]="enviando()">
            {{ t().boton[modo()] }} <span aria-hidden="true">→</span>
          </button>
        </form>

        <div class="pie">
          @if (modo() === 'recuperar') {
            <button type="button" class="enlace" (click)="cambiar('entrar')">
              <span aria-hidden="true">←</span> {{ t().volver }}
            </button>
          } @else {
            @if (modo() === 'entrar') {
              <button type="button" class="enlace" (click)="cambiar('recuperar')">{{ t().olvidada }}</button>
            }
            <a class="enlace" routerLink="/partida">{{ t().invitado }} <span aria-hidden="true">→</span></a>
          }
        </div>
      </section>
    </main>
  `,
  styles: `
    /* El formulario solo, centrado en lo que deja el menú y con la escala de la portada. */
    /* El main llena lo que deja el menú, sin restar su alto a mano, para que no aparezca scroll. */
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }
    .entrar {
      display: grid;
      flex: 1;
      place-items: center;
      padding: clamp(24px, 4vh, 56px) 16px;
      font-size: clamp(15px, calc(0.55vw + 0.6vh + 4px), 24px);
    }
    .panel {
      width: min(100%, 30em);
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
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.6em 1em;
      margin-top: 1.2em;
      padding-top: 1em;
      border-top: 1px solid var(--linea);
    }
    .enlace {
      padding: 0;
      border: 0;
      background: none;
      color: var(--rojo);
      font: 600 1em var(--sans);
      text-decoration: none;
      cursor: pointer;
    }
    .opcional {
      color: var(--texto-suave);
      font-weight: normal;
    }
    .aviso {
      color: var(--texto);
    }
    .privacidad {
      color: var(--texto-suave);
    }
  `,
})
export class Entrar {
  private readonly sesion = inject(Sesion);
  private readonly router = inject(Router);
  private readonly idioma = inject(Idioma);
  protected readonly t = this.idioma.textos({ es, en });

  protected readonly modo = signal<Modo>('entrar');
  protected readonly nombre = signal('');
  protected readonly contrasena = signal('');
  protected readonly correo = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly enviando = signal(false);
  protected readonly visible = signal(false);


  protected cambiar(modo: Modo): void {
    this.modo.set(modo);
    this.error.set(null);
    this.aviso.set(null);
  }

  protected enviar(evento: Event): void {
    evento.preventDefault();
    this.enviando.set(true);
    this.error.set(null);
    this.aviso.set(null);
    const fallo = (error: unknown) => {
      this.error.set(mensajeDeError(error, this.idioma.actual()));
      this.enviando.set(false);
    };
    const aLaPartida = () => void this.router.navigateByUrl('/partida');
    switch (this.modo()) {
      case 'entrar':
        this.sesion.entrar(this.nombre(), this.contrasena()).subscribe({ next: aLaPartida, error: fallo });
        break;
      case 'crear':
        this.sesion.registrarse(this.nombre(), this.contrasena(), this.correo().trim()).subscribe({ next: aLaPartida, error: fallo });
        break;
      case 'recuperar':
        this.sesion.olvide(this.nombre()).subscribe({
          next: (mensaje) => {
            this.aviso.set(mensaje);
            this.enviando.set(false);
          },
          error: fallo,
        });
    }
  }
}
