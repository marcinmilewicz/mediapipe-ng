import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/basic-gestures', pathMatch: 'full' },
  {
    path: 'basic-gestures',
    loadComponent: () =>
      import('./pages/basic-gestures/basic-gestures').then(({ BasicGestures }) => BasicGestures),
  },
  {
    path: 'custom-gestures',
    loadComponent: () =>
      import('./pages/custom-gestures/custom-gestures').then(
        ({ CustomGestures }) => CustomGestures,
      ),
  },
  {
    path: 'both-gestures',
    loadComponent: () =>
      import('./pages/both-gestures/custom-gestures').then(({ CustomGestures }) => CustomGestures),
  },
  {
    path: 'rps-game',
    loadComponent: () => import('./pages/rps-game/rps-game').then((c) => c.RpsGame),
  },
];
