import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { GestureRecognizerResult } from '@mediapipe/tasks-vision';
import { gestureResultParser, GestureTracking, GestureTrackingService } from 'mediapipe-ng';
import { filter } from 'rxjs';
import { Camera } from '../../components/camera/camera.component';
import { GestureGuide } from '../../components/gesture-guide/gesture-guide.component';
import { GestureStatus } from '../../components/gesture-status/gesture-status.component';
import { createGestureMap } from '../../utils';
import { ScoreBoard } from './score-board/score-board.component';

type GameChoice = 'rock' | 'paper' | 'scissors';
type GameResult = 'win' | 'lose' | 'tie';
type GameState = 'waiting' | 'playing' | 'countdown' | 'result';

interface GameData {
  playerChoice: GameChoice | null;
  computerChoice: GameChoice | null;
  result: GameResult | null;
  playerScore: number;
  computerScore: number;
}

const GAME_GESTURE = [
  {
    icon: '✊',
    description: 'Rock - closed fist',
    name: 'rock',
  },
  {
    icon: '✋',
    description: 'Paper - Open hand',
    name: 'paper',
  },
  {
    icon: '✌️',
    description: 'Scissors - Index & middle fingers',
    name: 'scissors',
  },
  {
    icon: '❓️',
    description: 'None',
    name: 'None',
  },
];

const GESTURE_MAP = createGestureMap(GAME_GESTURE);

@Component({
  selector: 'app-rps-game',
  standalone: true,
  imports: [CommonModule, ScoreBoard, GestureGuide, Camera, GestureStatus],
  templateUrl: './rps-game.component.html',
  styleUrls: ['./rps-game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RpsGameComponent implements OnDestroy {
  private readonly handTrackingService = inject(GestureTrackingService);
  protected readonly allHandledGesture = signal(GAME_GESTURE.slice(0, -1));
  protected tracking?: GestureTracking;

  currentGesture = signal(GESTURE_MAP['None']);
  gameState = signal<GameState>('waiting');
  countdown = signal(3);

  gameData = signal<GameData>({
    playerChoice: null,
    computerChoice: null,
    result: null,
    playerScore: 0,
    computerScore: 0,
  });

  private countdownInterval: any;
  private gameTimeout: any;

  async onCameraReady({
    videoElement,
    canvasElement,
  }: {
    videoElement: HTMLVideoElement;
    canvasElement: HTMLCanvasElement;
  }) {
    this.tracking = await this.handTrackingService.initializeTracking({
      videoElement,
      canvasElement,
      gestureRecognizerOptions: {
        baseOptions: { modelAssetPath: 'gesture_rps_recognizer.task' },
      },
    });

    this.tracking.gestureRecognizerResult.pipe(filter(Boolean)).subscribe((results) => {
      this.processGestureResults(results);
    });
  }

  ngOnDestroy() {
    this.tracking?.stopTracking();
    this.clearTimers();
  }

  private clearTimers() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.gameTimeout) {
      clearTimeout(this.gameTimeout);
    }
  }

  private processGestureResults(results: GestureRecognizerResult) {
    const gestureName = gestureResultParser()<GameChoice>(results);

    if (!gestureName) {
      this.currentGesture.set(GESTURE_MAP['None']);

      return;
    }

    this.currentGesture.set(GESTURE_MAP[gestureName]);

    if (this.gameState() === 'playing') {
      this.playerMadeChoice(gestureName);
    }
  }

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

  private playerMadeChoice(choice: GameChoice) {
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

  getChoiceIcon(choice: GameChoice | null): string {
    switch (choice) {
      case 'rock':
        return '✊';
      case 'paper':
        return '✋';
      case 'scissors':
        return '✌️';
      default:
        return '❓';
    }
  }

  getChoiceName(choice: GameChoice | null): string {
    return choice ? choice.charAt(0).toUpperCase() + choice.slice(1) : 'Waiting...';
  }

  getResultIcon(): string {
    switch (this.gameData().result) {
      case 'win':
        return '🎉';
      case 'lose':
        return '😢';
      case 'tie':
        return '🤝';
      default:
        return '';
    }
  }

  getResultText(): string {
    switch (this.gameData().result) {
      case 'win':
        return 'You Win!';
      case 'lose':
        return 'You Lose!';
      case 'tie':
        return "It's a Tie!";
      default:
        return '';
    }
  }

  getButtonText(): string {
    switch (this.gameState()) {
      case 'waiting':
        return 'Start Game';
      case 'countdown':
        return `Starting in ${this.countdown()}...`;
      case 'playing':
        return 'Make Your Gesture!';
      case 'result':
        return 'Play Again';
      default:
        return 'Start Game';
    }
  }

  getButtonClass(): string {
    switch (this.gameState()) {
      case 'waiting':
        return 'start';
      case 'countdown':
        return 'waiting';
      case 'playing':
        return 'waiting';
      case 'result':
        return 'restart';
      default:
        return 'start';
    }
  }
}
