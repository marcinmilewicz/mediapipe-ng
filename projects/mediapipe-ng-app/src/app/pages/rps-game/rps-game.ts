import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, signal } from '@angular/core';
import { GestureRecognizerResult } from '@mediapipe/tasks-vision';
import { gestureResultParser, GestureTracking, GestureTrackingService } from 'mediapipe-ng';
import { filter } from 'rxjs';
import { Camera } from '../../components/camera/camera';
import { GestureGuide } from '../../components/gesture-guide/gesture-guide';
import { GestureStatus } from '../../components/gesture-status/gesture-status';
import { createGestureMap } from '../../utils';
import { GameOverlay } from './game-overlay/game-overlay';
import { GameService } from './game.service';
import { Game } from './game/game';
import { ScoreBoard } from './score-board/score-board';

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
  imports: [Camera, CommonModule, GestureGuide, GestureStatus, ScoreBoard, Game, GameOverlay],
  templateUrl: './rps-game.html',
  styleUrls: ['./rps-game.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GameService],
})
export class RpsGame implements OnDestroy {
  private readonly handTrackingService = inject(GestureTrackingService);
  private readonly gamesService = inject(GameService);
  protected readonly allHandledGesture = signal(GAME_GESTURE.slice(0, -1));
  protected tracking?: GestureTracking;

  readonly currentGesture = signal(GESTURE_MAP['None']);
  readonly gameState = this.gamesService.gameState;
  readonly gameData = this.gamesService.gameData;
  readonly countdown = this.gamesService.countdown;

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
    this.gamesService.reset();
  }

  private processGestureResults(results: GestureRecognizerResult) {
    const gestureName = gestureResultParser()<GameChoice>(results);

    if (!gestureName) {
      this.currentGesture.set(GESTURE_MAP['None']);

      return;
    }

    this.currentGesture.set(GESTURE_MAP[gestureName]);

    if (this.gamesService.isPlaying()) {
      this.playerMadeChoice(gestureName);
    }
  }

  private playerMadeChoice(choice: GameChoice) {
    this.gamesService.playerMadeChoice(choice);
  }
}
