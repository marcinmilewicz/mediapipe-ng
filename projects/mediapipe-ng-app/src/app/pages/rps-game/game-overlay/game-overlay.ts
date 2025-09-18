import { Component, inject } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game-overlay',
  templateUrl: './game-overlay.html',
  styleUrl: './game-overlay.scss',
})
export class GameOverlay {
  protected readonly gameService = inject(GameService);
}
