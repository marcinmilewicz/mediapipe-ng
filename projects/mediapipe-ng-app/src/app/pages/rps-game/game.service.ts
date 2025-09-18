import { computed, Injectable, signal } from '@angular/core';

const createInitialGameData = () => ({
  playerChoice: null,
  computerChoice: null,
  result: null,
  playerScore: 0,
  computerScore: 0,
});

@Injectable()
export class GameService {
  private countdownInterval: any;
  private gameTimeout: any;

  readonly gameState = signal<GameState>('waiting');
  readonly countdown = signal(3);
  readonly gameData = signal<GameData>(createInitialGameData());
  readonly isPlaying = computed(() => this.gameState() === 'playing');
  readonly isCountdown = computed(() => this.gameState() === 'countdown');

  startGame() {
    this.gameState.set('countdown');
    this.gameData.update((data) => ({
      ...data,
      playerChoice: null,
      computerChoice: null,
      result: null,
    }));
    this.countdown.set(3);

    this.countdownInterval = setInterval(() => {
      this.countdown.update((c) => c - 1);
      if (this.countdown() === 0) {
        clearInterval(this.countdownInterval);
        this.gameState.set('playing');

        const choices: GameChoice[] = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        this.gameData.update((data) => ({ ...data, computerChoice }));

        this.gameTimeout = setTimeout(() => {
          if (this.gameState() === 'playing') {
            this.gameState.set('result');
            this.gameData.update((data) => ({
              ...data,
              result: 'lose',
              computerScore: data.computerScore + 1,
            }));

            setTimeout(() => {
              this.gameState.set('waiting');
            }, 3000);
          }
        }, 3000);
      }
    }, 1000);
  }

  playerMadeChoice(choice: GameChoice) {
    if (this.gameState() !== 'playing' || this.gameData().playerChoice) return;

    this.gameData.update((data) => ({ ...data, playerChoice: choice }));
    this.calculateResult();
    this.gameState.set('result');

    if (this.gameTimeout) {
      clearTimeout(this.gameTimeout);
    }

    setTimeout(() => {
      this.gameState.set('waiting');
    }, 3000);
  }

  private calculateResult() {
    const { playerChoice, computerChoice } = this.gameData();

    if (!playerChoice || !computerChoice) return;

    if (playerChoice === computerChoice) {
      this.gameData.update((data) => ({ ...data, result: 'tie' }));
    } else if (
      (playerChoice === 'rock' && computerChoice === 'scissors') ||
      (playerChoice === 'paper' && computerChoice === 'rock') ||
      (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
      this.gameData.update((data) => ({
        ...data,
        result: 'win',
        playerScore: data.playerScore + 1,
      }));
    } else {
      this.gameData.update((data) => ({
        ...data,
        result: 'lose',
        computerScore: data.computerScore + 1,
      }));
    }
  }

  reset() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.gameTimeout) {
      clearTimeout(this.gameTimeout);
    }

    this.gameData.set(createInitialGameData());
    this.gameState.set('waiting');
  }
}
