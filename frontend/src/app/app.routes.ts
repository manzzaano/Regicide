import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Regicide', loadComponent: () => import('./paginas/inicio').then((m) => m.Inicio) },
  { path: 'partida', title: 'Partida · Regicide', loadComponent: () => import('./paginas/partida').then((m) => m.Partida) },
  { path: 'reglas', title: 'Reglas · Regicide', loadComponent: () => import('./paginas/reglas').then((m) => m.Reglas) },
  {
    path: 'clasificacion',
    title: 'Clasificación · Regicide',
    loadComponent: () => import('./paginas/clasificacion').then((m) => m.Clasificacion),
  },
  { path: 'entrar', title: 'Entrar · Regicide', loadComponent: () => import('./paginas/entrar').then((m) => m.Entrar) },
  { path: '**', redirectTo: '' },
];
