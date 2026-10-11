import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  {
    path: 'inicio',
    loadComponent: () => import('./features/inicio/inicio.component').then(m => m.InicioComponent)
  },
  {
    path: 'juego',
    loadComponent: () => import('./features/juego/juego.component').then(m => m.JuegoComponent)
  },
  {
    path: 'reglas',
    loadComponent: () => import('./features/reglas/reglas.component').then(m => m.ReglasComponent)
  },
  {
    path: 'estadisticas',
    loadComponent: () => import('./features/estadisticas/estadisticas.component').then(m => m.EstadisticasComponent)
  },
  { path: '**', redirectTo: '/inicio' }
];
