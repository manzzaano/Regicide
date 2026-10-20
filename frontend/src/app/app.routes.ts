import { Injectable, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterStateSnapshot, Routes, TitleStrategy } from '@angular/router';
import { Idioma, Lengua } from './idioma';
import { Sesion } from './sesion';

const TITULOS: Record<Lengua, Record<string, string>> = {
  es: {
    inicio: 'REGICIDE - Modo Solitario',
    partida: 'Partida · REGICIDE',
    reglas: 'Reglas · REGICIDE',
    clasificacion: 'Estadísticas · REGICIDE',
    entrar: 'Entrar · REGICIDE',
    cuenta: 'Tu cuenta · REGICIDE',
    restablecer: 'Contraseña nueva · REGICIDE',
    'confirmar-correo': 'Confirmar el correo · REGICIDE',
    privacidad: 'Privacidad · REGICIDE',
  },
  en: {
    inicio: 'REGICIDE - Solo Mode',
    partida: 'Game · REGICIDE',
    reglas: 'Rules · REGICIDE',
    clasificacion: 'Stats · REGICIDE',
    entrar: 'Sign in · REGICIDE',
    cuenta: 'Your account · REGICIDE',
    restablecer: 'New password · REGICIDE',
    'confirmar-correo': 'Confirm your email · REGICIDE',
    privacidad: 'Privacy · REGICIDE',
  },
};

/** El title de cada ruta es la clave de su título, que cambia con el idioma sin volver a navegar. */
@Injectable({ providedIn: 'root' })
export class Titulos extends TitleStrategy {
  private readonly clave = signal('inicio');

  constructor() {
    super();
    const titulo = inject(Title);
    const idioma = inject(Idioma);
    effect(() => titulo.setTitle(TITULOS[idioma.actual()][this.clave()]));
  }

  override updateTitle(estado: RouterStateSnapshot): void {
    this.clave.set(this.buildTitle(estado) ?? 'inicio');
  }
}

export const routes: Routes = [
  { path: '', title: 'inicio', loadComponent: () => import('./paginas/inicio').then((m) => m.Inicio) },
  { path: 'partida', title: 'partida', loadComponent: () => import('./paginas/partida').then((m) => m.Partida) },
  { path: 'reglas', title: 'reglas', loadComponent: () => import('./paginas/reglas').then((m) => m.Reglas) },
  {
    path: 'clasificacion',
    title: 'clasificacion',
    loadComponent: () => import('./paginas/clasificacion').then((m) => m.Clasificacion),
  },
  { path: 'entrar', title: 'entrar', loadComponent: () => import('./paginas/entrar').then((m) => m.Entrar) },
  {
    path: 'cuenta',
    title: 'cuenta',
    canActivate: [() => inject(Sesion).nombre() !== null || inject(Router).parseUrl('/entrar')],
    loadComponent: () => import('./paginas/cuenta').then((m) => m.Cuenta),
  },
  {
    path: 'restablecer',
    title: 'restablecer',
    loadComponent: () => import('./paginas/enlaces').then((m) => m.Restablecer),
  },
  {
    path: 'confirmar-correo',
    title: 'confirmar-correo',
    loadComponent: () => import('./paginas/enlaces').then((m) => m.ConfirmarCorreo),
  },
  {
    path: 'privacidad',
    title: 'privacidad',
    loadComponent: () => import('./paginas/privacidad').then((m) => m.Privacidad),
  },
  { path: '**', redirectTo: '' },
];
