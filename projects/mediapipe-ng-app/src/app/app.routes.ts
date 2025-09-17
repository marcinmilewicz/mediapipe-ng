import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/basic-gestures', pathMatch: 'full' },
  {
    path: 'basic-gestures',
    loadComponent: () =>
      import('./pages/basic-gestures/basic-gestures.component').then(
        ({ BasicGesturesComponent }) => BasicGesturesComponent,
      ),
  },
  {
    path: 'custom-gestures',
    loadComponent: () =>
      import('./pages/custom-gestures/custom-gestures.component').then(({ CustomGesturesComponent }) => CustomGesturesComponent),
  },
  {
    path: 'rps-game',
    loadComponent: () =>
      import('./pages/rps-game/rps-game.component').then((c) => c.RpsGameComponent),
  },
];
