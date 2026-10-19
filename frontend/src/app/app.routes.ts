import { Routes } from '@angular/router';

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
  { path: '**', redirectTo: '' },
];
