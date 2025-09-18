import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GameService } from '../game.service';

const ICON_MAP = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
} as const;

const RESULT_ICON_MAP = {
  win: '🎉',
  lose: '😢',
  tie: '🤝',
} as const;

const RESULT_TEXT_MAP = {
  win: 'You Win!',
  lose: 'You Lose!',
  tie: "It's a Tie!",
} as const;

const GAME_STATE_MAP = {
  waiting: 'Start Game',
  countdown: 'Get Ready...',
  playing: 'Make Your Move',
  result: 'Game Over',
} as const;

const BUTTON_CLASS_MAP = {
  waiting: 'start',
  countdown: 'waiting',
  playing: 'waiting',
  result: 'restart',
  default: 'start',
} as const;

@Component({
  selector: 'app-game',
  imports: [CommonModule],
  templateUrl: './game.html',
  styleUrls: ['./game.scss'],
})
export class Game {
  private readonly gameService = inject(GameService);

  protected readonly gameData = this.gameService.gameData;
  protected readonly gameState = this.gameService.gameState;
  protected readonly countdown = this.gameService.countdown;

  startGame() {
    this.gameService.startGame();
  }

  getChoiceIcon(choice: GameChoice | null): string {
    const icon = choice ? ICON_MAP[choice] : null;
    return icon ? icon : '❓';
  }

  getChoiceName(choice: GameChoice | null): string {
    return choice ? choice.charAt(0).toUpperCase() + choice.slice(1) : 'Waiting...';
  }

  getResultIcon(): string {
    const result = this.gameData().result;
    const icon = result ? RESULT_ICON_MAP[result] : null;
    return icon ? icon : '';
  }

  getResultText(): string {
    const result = this.gameData().result;
    const text = result ? RESULT_TEXT_MAP[result] : null;

    return text ? text : '';
  }

  getButtonText(): string {
    const state = this.gameState();
    if (state === 'countdown') {
      return `Starting in ${this.countdown()}...`;
    }

    const text = GAME_STATE_MAP[state];

    return text ? text : 'Start Game';
  }

  getButtonClass(): string {
    const className = BUTTON_CLASS_MAP[this.gameState()];
    return className ? className : 'start';
  }
}
