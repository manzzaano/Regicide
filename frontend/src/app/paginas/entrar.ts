import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CodigoRecuperacion } from '../codigo-recuperacion';
import { Menu } from '../menu';
import { Sesion } from '../sesion';

export function mensajeDeError(error: unknown): string {
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

type Modo = 'entrar' | 'crear' | 'recuperar';

@Component({
  selector: 'app-entrar',
  imports: [CodigoRecuperacion, Menu, RouterLink],
  template: `
    <app-menu />
    <img class="fondo-castillo" src="castillo.svg" alt="" width="1000" height="1000" />
    <main class="entrar">
      <section class="panel">
        <div class="pestanas" role="group" aria-label="Elige una opción">
          <button type="button" [attr.aria-pressed]="modo() === 'entrar'" (click)="cambiar('entrar')">Entrar</button>
          <button type="button" [attr.aria-pressed]="modo() === 'crear'" (click)="cambiar('crear')">Crear cuenta</button>
        </div>
        <h1>{{ titulo() }}</h1>

        @if (codigo(); as codigo) {
          <app-codigo-recuperacion [codigo]="codigo" (guardado)="continuar()" />
        } @else {
          <p class="ayuda">{{ ayuda() }}</p>
          <form (submit)="enviar($event)">
            <label>
              Nombre
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
              <p class="pista">De 3 a 20 letras sin tildes, números o guiones bajos.</p>
            }
            @if (modo() === 'recuperar') {
              <label>
                Código de recuperación
                <input
                  class="campo codigo"
                  name="codigo"
                  autocomplete="off"
                  spellcheck="false"
                  required
                  maxlength="24"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  [value]="codigoEscrito()"
                  (input)="codigoEscrito.set($any($event.target).value)"
                />
              </label>
            }
            <label>
              {{ modo() === 'recuperar' ? 'Contraseña nueva' : 'Contraseña' }}
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
                  {{ visible() ? 'Ocultar' : 'Mostrar' }}
                </button>
              </span>
            </label>
            @if (modo() !== 'entrar') {
              <p class="pista">De 15 a 128 caracteres. Mejor una frase que recuerdes, como cuatro palabras al azar.</p>
            }

            @if (error(); as error) {
              <p class="error" role="alert">{{ error }}</p>
            }

            <button class="boton-principal enviar" type="submit" [disabled]="enviando()">
              {{ boton() }} <span aria-hidden="true">→</span>
            </button>
          </form>

          <div class="pie">
            @if (modo() === 'recuperar') {
              <button type="button" class="enlace" (click)="cambiar('entrar')">
                <span aria-hidden="true">←</span> Volver a entrar
              </button>
            } @else {
              @if (modo() === 'entrar') {
                <button type="button" class="enlace" (click)="cambiar('recuperar')">¿Has olvidado la contraseña?</button>
              }
              <a class="enlace" routerLink="/partida">Seguir como invitado <span aria-hidden="true">→</span></a>
            }
          </div>
        }
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
    .codigo {
      font-family: var(--mono);
      letter-spacing: 0.06em;
    }
  `,
})
export class Entrar {
  private readonly sesion = inject(Sesion);
  private readonly router = inject(Router);

  protected readonly modo = signal<Modo>('entrar');
  protected readonly nombre = signal('');
  protected readonly contrasena = signal('');
  protected readonly codigoEscrito = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly enviando = signal(false);
  protected readonly visible = signal(false);
  /** El código de recuperación nuevo, tras crear la cuenta o recuperarla. */
  protected readonly codigo = signal<string | null>(null);
  private readonly recienRecuperada = signal(false);

  protected readonly titulo = computed(() => {
    const titulos = this.codigo()
      ? { entrar: '', crear: 'Cuenta creada', recuperar: 'Contraseña cambiada' }
      : { entrar: 'Entra con tu cuenta', crear: 'Crea tu cuenta', recuperar: 'Recupera tu cuenta' };
    return titulos[this.modo()];
  });
  protected readonly ayuda = computed(() => {
    switch (this.modo()) {
      case 'crear':
        return 'Solo un nombre y una contraseña, sin correo.';
      case 'recuperar':
        return 'Con el código que guardaste al crear la cuenta.';
      default:
        return this.recienRecuperada() ? 'Ya puedes entrar con tu contraseña nueva.' : 'Sigue la partida donde la dejaste.';
    }
  });
  protected readonly boton = computed(() => ({ entrar: 'Entrar', crear: 'Crear cuenta', recuperar: 'Cambiar contraseña' })[this.modo()]);

  protected cambiar(modo: Modo): void {
    this.modo.set(modo);
    this.error.set(null);
    this.recienRecuperada.set(false);
  }

  protected enviar(evento: Event): void {
    evento.preventDefault();
    this.enviando.set(true);
    this.error.set(null);
    const terminar = {
      error: (error: unknown) => {
        this.error.set(mensajeDeError(error));
        this.enviando.set(false);
      },
    };
    switch (this.modo()) {
      case 'entrar':
        this.sesion.entrar(this.nombre(), this.contrasena()).subscribe({
          ...terminar,
          next: () => void this.router.navigateByUrl('/partida'),
        });
        break;
      case 'crear':
        this.sesion.registrarse(this.nombre(), this.contrasena()).subscribe({ ...terminar, next: (codigo) => this.mostrar(codigo) });
        break;
      case 'recuperar':
        this.sesion
          .recuperar(this.nombre(), this.codigoEscrito(), this.contrasena())
          .subscribe({ ...terminar, next: (codigo) => this.mostrar(codigo) });
    }
  }

  /** Tras guardar el código: a jugar si acaba de crear la cuenta, o a entrar con la contraseña nueva. */
  protected continuar(): void {
    this.codigo.set(null);
    if (this.modo() === 'crear') {
      void this.router.navigateByUrl('/partida');
      return;
    }
    this.contrasena.set('');
    this.codigoEscrito.set('');
    this.modo.set('entrar');
    this.recienRecuperada.set(true);
  }

  private mostrar(codigo: string): void {
    this.codigo.set(codigo);
    this.enviando.set(false);
  }
}
