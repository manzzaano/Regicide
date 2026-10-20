import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { Sesion } from './sesion';

export const routes: Routes = [
  { path: '', title: 'REGICIDE - Modo Solitario', loadComponent: () => import('./paginas/inicio').then((m) => m.Inicio) },
  { path: 'partida', title: 'Partida · REGICIDE', loadComponent: () => import('./paginas/partida').then((m) => m.Partida) },
  { path: 'reglas', title: 'Reglas · REGICIDE', loadComponent: () => import('./paginas/reglas').then((m) => m.Reglas) },
  {
    path: 'clasificacion',
    title: 'Estadísticas · REGICIDE',
    loadComponent: () => import('./paginas/clasificacion').then((m) => m.Clasificacion),
  },
  { path: 'entrar', title: 'Entrar · REGICIDE', loadComponent: () => import('./paginas/entrar').then((m) => m.Entrar) },
  {
    path: 'cuenta',
    title: 'Tu cuenta · REGICIDE',
    canActivate: [() => inject(Sesion).nombre() !== null || inject(Router).parseUrl('/entrar')],
    loadComponent: () => import('./paginas/cuenta').then((m) => m.Cuenta),
  },
  {
    path: 'restablecer',
    title: 'Contraseña nueva · REGICIDE',
    loadComponent: () => import('./paginas/enlaces').then((m) => m.Restablecer),
  },
  {
    path: 'confirmar-correo',
    title: 'Confirmar el correo · REGICIDE',
    loadComponent: () => import('./paginas/enlaces').then((m) => m.ConfirmarCorreo),
  },
  {
    path: 'privacidad',
    title: 'Privacidad · REGICIDE',
    loadComponent: () => import('./paginas/privacidad').then((m) => m.Privacidad),
  },
  { path: '**', redirectTo: '' },
];
