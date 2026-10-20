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
      <div class="portada">
        <p class="terminal"><span>~/regicide $</span> cuenta</p>
        <p class="titulo" aria-hidden="true">REGICIDE<span class="punto">/</span></p>
        <p class="subtitulo">Guarda tu partida y entra en la clasificación. Como invitado también se juega, pero no queda nada.</p>
        <ul class="ventajas">
          @for (ventaja of ventajas; track ventaja.titulo) {
            <li>
              <span class="simbolo" aria-hidden="true">{{ ventaja.simbolo }}</span>
              <span class="nombre">{{ ventaja.titulo }}</span>
              <span class="efecto">{{ ventaja.texto }}</span>
            </li>
          }
        </ul>
      </div>

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
    /* Misma composición y escala que la portada, descontando el menú de arriba. */
    .entrar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) clamp(300px, 22em, 480px);
      align-items: center;
      gap: clamp(32px, 4vw, 96px);
      max-width: 1760px;
      min-height: calc(100dvh - 72px);
      margin: 0 auto;
      padding: clamp(24px, 4vh, 56px) clamp(20px, 5vw, 96px);
      font-size: clamp(15px, calc(0.55vw + 0.6vh + 4px), 24px);
    }
    .portada {
      display: grid;
      justify-items: start;
    }
    .terminal {
      margin: 0;
      padding: 0.3em 0.9em;
      border: 1px solid var(--linea);
      border-radius: 999px;
      background: var(--caja);
      color: var(--texto-suave);
      font-family: var(--mono);
      font-size: 0.7em;
    }
    .terminal span,
    .punto {
      color: var(--rojo);
    }
    .titulo {
      padding: 0.12em 0 0.06em;
      font-size: min(5.5em, 10vw);
      text-align: left;
    }
    .subtitulo {
      max-width: 30em;
      margin: 0 0 1.3em;
      color: var(--texto-suave);
      font-size: 1.1em;
      line-height: 1.6;
      text-wrap: pretty;
    }
    .ventajas {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.6em;
      width: min(100%, 34em);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .ventajas li {
      display: grid;
      align-content: start;
      gap: 0.25em;
      padding: 0.8em 0.9em;
      border: 1px solid var(--linea);
      border-radius: 0.5em;
      background: rgb(18 18 18 / 0.85);
      transition:
        transform 200ms var(--curva),
        border-color 200ms;
    }
    .ventajas li:hover {
      border-color: rgb(239 68 68 / 0.5);
      transform: translateY(-3px);
    }
    .simbolo {
      color: var(--rojo);
      font-size: 1.4em;
      line-height: 1.1;
    }
    .nombre {
      color: var(--texto-suave);
      font-family: var(--mono);
      font-size: 0.55em;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .efecto {
      font-size: 0.75em;
      font-weight: 500;
      line-height: 1.35;
    }
    .panel {
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
    @media (max-width: 860px) {
      .entrar {
        grid-template-columns: 1fr;
        align-content: start;
        justify-items: start;
        row-gap: 0;
      }
      /* En el móvil el formulario va justo después del título y las ventajas quedan debajo. */
      .portada {
        display: contents;
      }
      .titulo {
        font-size: min(5.5em, 18vw);
      }
      .panel {
        justify-self: stretch;
        margin-bottom: 1.3em;
      }
      .ventajas {
        order: 1;
        grid-template-columns: 1fr;
      }
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
  protected readonly ventajas = [
    { simbolo: '♥', titulo: 'Partida guardada', texto: 'Se guarda tras cada jugada; vuelve cuando quieras.' },
    { simbolo: '♦', titulo: 'Estadísticas', texto: 'Victorias, derrotas y enemigos derrotados.' },
    { simbolo: '♠', titulo: 'Clasificación', texto: 'Compárate con el resto de jugadores.' },
  ];

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
