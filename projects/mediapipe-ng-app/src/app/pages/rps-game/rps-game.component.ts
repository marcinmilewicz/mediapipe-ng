import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestureTrackingService } from 'mediapipe-ng';
import { Subscription } from 'rxjs';

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

@Component({
  selector: 'app-rps-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rps-container">
      <div class="section-header">
        <h2 class="section-title">Rock Paper Scissors</h2>
        <p class="section-description">
          Play Rock Paper Scissors using hand gestures! Make your gesture when the countdown
          finishes.
        </p>
      </div>

      <div class="demo-content">
        <div class="video-section">
          <div class="video-container">
            <video #videoElement autoplay playsinline muted class="video-element"></video>
            <canvas #canvasElement class="overlay-canvas"></canvas>

            <!-- Game overlay -->
            <div class="game-overlay">
              <div class="countdown" *ngIf="gameState === 'countdown'">
                <div class="countdown-number">{{ countdown }}</div>
              </div>
              <div class="gesture-detection" *ngIf="gameState === 'playing'">
                <div class="detection-prompt">Make your gesture!</div>
              </div>
            </div>

            <div class="loading-overlay" *ngIf="!isInitialized">
              <div class="loading-spinner"></div>
              <p>Initializing camera...</p>
            </div>
          </div>

          <div class="current-gesture">
            <h3>Detected Gesture</h3>
            <div class="gesture-display" [class]="gestureClass">
              <span class="gesture-icon">{{ gestureIcon }}</span>
              <span class="gesture-name">{{ currentGesture }}</span>
            </div>
          </div>
        </div>

        <div class="game-section">
          <div class="score-board">
            <h3>Score</h3>
            <div class="scores">
              <div class="score-item player">
                <span class="score-label">You</span>
                <span class="score-value">{{ gameData.playerScore }}</span>
              </div>
              <div class="score-divider">-</div>
              <div class="score-item computer">
                <span class="score-label">Computer</span>
                <span class="score-value">{{ gameData.computerScore }}</span>
              </div>
            </div>
          </div>

          <div class="game-area">
            <div class="game-choices">
              <div class="choice-container">
                <h4>Your Choice</h4>
                <div class="choice-display">
                  <div class="choice-icon" [class]="gameData.playerChoice || 'waiting'">
                    {{ getChoiceIcon(gameData.playerChoice) }}
                  </div>
                  <div class="choice-name">{{ getChoiceName(gameData.playerChoice) }}</div>
                </div>
              </div>

              <div class="vs-divider">VS</div>

              <div class="choice-container">
                <h4>Computer Choice</h4>
                <div class="choice-display">
                  <div class="choice-icon" [class]="gameData.computerChoice || 'waiting'">
                    {{ getChoiceIcon(gameData.computerChoice) }}
                  </div>
                  <div class="choice-name">{{ getChoiceName(gameData.computerChoice) }}</div>
                </div>
              </div>
            </div>

            <div class="game-result" *ngIf="gameState === 'result'">
              <div class="result-display" [class]="gameData.result">
                <div class="result-icon">{{ getResultIcon() }}</div>
                <div class="result-text">{{ getResultText() }}</div>
              </div>
            </div>

            <div class="game-controls">
              <button
                class="game-button"
                [class]="getButtonClass()"
                (click)="startGame()"
                [disabled]="gameState === 'countdown' || gameState === 'playing'"
              >
                {{ getButtonText() }}
              </button>
            </div>
          </div>

          <div class="gesture-guide">
            <h3>Gesture Guide</h3>
            <div class="guide-list">
              <div class="guide-item">
                <span class="guide-icon">✊</span>
                <span class="guide-name">Rock</span>
                <span class="guide-desc">Closed fist</span>
              </div>
              <div class="guide-item">
                <span class="guide-icon">✋</span>
                <span class="guide-name">Paper</span>
                <span class="guide-desc">Open hand</span>
              </div>
              <div class="guide-item">
                <span class="guide-icon">✌️</span>
                <span class="guide-name">Scissors</span>
                <span class="guide-desc">Index & middle fingers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .rps-container {
        padding: 2rem 0;
      }

      .section-header {
        text-align: center;
        margin-bottom: 3rem;
      }

      .section-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        background: linear-gradient(45deg, #3b82f6, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .section-description {
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.8);
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
      }

      .demo-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        align-items: start;
      }

      .video-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .video-container {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        background: #1e293b;
      }

      .video-element,
      .overlay-canvas {
        width: 640px;
        height: 480px;
        max-width: 100%;
        display: block;
      }

      .overlay-canvas {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
      }

      .game-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }

      .countdown {
        background: rgba(0, 0, 0, 0.8);
        border-radius: 50%;
        width: 120px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .countdown-number {
        font-size: 4rem;
        font-weight: 700;
        color: #3b82f6;
        text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        animation: pulse 1s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }

      .detection-prompt {
        background: rgba(139, 92, 246, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-size: 1.2rem;
        font-weight: 600;
        text-align: center;
        animation: flash 0.5s ease-in-out infinite alternate;
      }

      @keyframes flash {
        0% {
          opacity: 0.7;
        }
        100% {
          opacity: 1;
        }
      }

      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(30, 41, 59, 0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(59, 130, 246, 0.3);
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .current-gesture {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
      }

      .current-gesture h3 {
        margin-bottom: 1rem;
        color: #3b82f6;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .gesture-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        transition: all 0.3s ease;
      }

      .gesture-display.recognized {
        background: rgba(34, 197, 94, 0.2);
        border: 1px solid rgba(34, 197, 94, 0.3);
      }

      .gesture-icon {
        font-size: 2rem;
      }

      .gesture-name {
        font-weight: 600;
      }

      .game-section {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .score-board {
        background: rgba(139, 92, 246, 0.1);
        border: 1px solid rgba(139, 92, 246, 0.2);
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
      }

      .score-board h3 {
        margin-bottom: 1rem;
        color: #8b5cf6;
        font-size: 1.2rem;
        font-weight: 600;
      }

      .scores {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2rem;
      }

      .score-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .score-label {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
      }

      .score-value {
        font-size: 2rem;
        font-weight: 700;
        color: white;
      }

      .score-divider {
        font-size: 1.5rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.6);
      }

      .game-area {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.2);
        border-radius: 12px;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .game-choices {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .choice-container {
        text-align: center;
        flex: 1;
      }

      .choice-container h4 {
        margin-bottom: 1rem;
        color: #22c55e;
        font-weight: 600;
      }

      .choice-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .choice-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        background: rgba(0, 0, 0, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
      }

      .choice-icon.waiting {
        background: rgba(107, 114, 128, 0.2);
        border-color: rgba(107, 114, 128, 0.3);
      }

      .choice-icon.rock {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.4);
        animation: choiceReveal 0.5s ease;
      }

      .choice-icon.paper {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.4);
        animation: choiceReveal 0.5s ease;
      }

      .choice-icon.scissors {
        background: rgba(139, 92, 246, 0.2);
        border-color: rgba(139, 92, 246, 0.4);
        animation: choiceReveal 0.5s ease;
      }

      @keyframes choiceReveal {
        0% {
          transform: scale(0.8);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .choice-name {
        font-weight: 600;
        text-transform: capitalize;
      }

      .vs-divider {
        font-size: 1.5rem;
        font-weight: 700;
        color: #22c55e;
        margin: 0 1rem;
      }

      .game-result {
        text-align: center;
        margin: 1rem 0;
      }

      .result-display {
        padding: 1.5rem;
        border-radius: 12px;
        transition: all 0.5s ease;
      }

      .result-display.win {
        background: rgba(34, 197, 94, 0.2);
        border: 2px solid rgba(34, 197, 94, 0.4);
        animation: victoryPulse 1s ease-in-out;
      }

      .result-display.lose {
        background: rgba(239, 68, 68, 0.2);
        border: 2px solid rgba(239, 68, 68, 0.4);
      }

      .result-display.tie {
        background: rgba(107, 114, 128, 0.2);
        border: 2px solid rgba(107, 114, 128, 0.4);
      }

      @keyframes victoryPulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      .result-icon {
        font-size: 3rem;
        margin-bottom: 0.5rem;
      }

      .result-text {
        font-size: 1.3rem;
        font-weight: 700;
      }

      .game-controls {
        text-align: center;
      }

      .game-button {
        padding: 1rem 2rem;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .game-button.start {
        background: linear-gradient(45deg, #3b82f6, #8b5cf6);
        color: white;
      }

      .game-button.restart {
        background: linear-gradient(45deg, #22c55e, #10b981);
        color: white;
      }

      .game-button.waiting {
        background: rgba(107, 114, 128, 0.3);
        color: rgba(255, 255, 255, 0.6);
        cursor: not-allowed;
      }

      .game-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .game-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .gesture-guide {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 12px;
        padding: 1.5rem;
      }

      .gesture-guide h3 {
        margin-bottom: 1rem;
        color: #ef4444;
        font-size: 1.2rem;
        font-weight: 600;
      }

      .guide-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .guide-item {
        display: grid;
        grid-template-columns: 2rem 1fr 1fr;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 8px;
      }

      .guide-icon {
        font-size: 1.5rem;
      }

      .guide-name {
        font-weight: 600;
      }

      .guide-desc {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
      }

      @media (max-width: 1024px) {
        .demo-content {
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .video-element,
        .overlay-canvas {
          width: 100%;
          height: auto;
          max-width: 640px;
        }

        .game-choices {
          flex-direction: column;
          gap: 2rem;
        }

        .vs-divider {
          transform: rotate(90deg);
        }
      }

      @media (max-width: 768px) {
        .section-title {
          font-size: 2rem;
        }

        .scores {
          gap: 1rem;
        }

        .choice-icon {
          width: 60px;
          height: 60px;
          font-size: 2rem;
        }

        .guide-item {
          grid-template-columns: 2rem 1fr;
          gap: 0.5rem;
        }

        .guide-desc {
          grid-column: 2;
          margin-top: 0.25rem;
        }
      }
    `,
  ],
})
export class RpsGameComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElementRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElementRef!: ElementRef<HTMLCanvasElement>;

  isInitialized = false;
  currentGesture = 'No Hand Detected';
  gestureIcon = '👋';
  gestureClass = '';
  gameState: GameState = 'waiting';
  countdown = 3;

  gameData: GameData = {
    playerChoice: null,
    computerChoice: null,
    result: null,
    playerScore: 0,
    computerScore: 0,
  };

  private subscriptions: Subscription[] = [];
  private countdownInterval: any;
  private gameTimeout: any;

  constructor(private handTrackingService: GestureTrackingService) {}

  async ngOnInit() {
    // this.subscriptions.push(
    //   this.handTrackingService.isInitialized$.subscribe((initialized) => {
    //     this.isInitialized = initialized;
    //   }),
    // );

    // this.subscriptions.push(
    //   this.handTrackingService.handResults$.subscribe((results) => {
    //     this.processHandResults(results);
    //   }),
    // );

    setTimeout(async () => {
      try {
        await this.handTrackingService.initializeTracking({
          videoElement: this.videoElementRef.nativeElement,
          canvasElement: this.canvasElementRef.nativeElement,
        });
      } catch (error) {
        console.error('Failed to initialize hand tracking:', error);
      }
    }, 100);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    //this.handTrackingService.stopTracking();
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

  private processHandResults(results: any | null) {
    if (!results?.multiHandLandmarks?.length) {
      this.currentGesture = 'No Hand Detected';
      this.gestureIcon = '👋';
      this.gestureClass = '';
      return;
    }

    const landmarks = results.multiHandLandmarks[0];

    // Update current gesture display
    this.updateCurrentGesture(landmarks);

    // Process gesture for game if we're in playing state
    if (this.gameState === 'playing') {
      const choice = this.detectGameChoice(landmarks);
      if (choice) {
        this.playerMadeChoice(choice);
      }
    }
  }

  private updateCurrentGesture(landmarks: any[]) {
    // if (this.handTrackingService.isFist(landmarks)) {
    //   this.currentGesture = 'Rock';
    //   this.gestureIcon = '✊';
    //   this.gestureClass = 'recognized';
    // } else if (this.handTrackingService.isOpenHand(landmarks)) {
    //   this.currentGesture = 'Paper';
    //   this.gestureIcon = '✋';
    //   this.gestureClass = 'recognized';
    // } else if (this.handTrackingService.isScissorsGesture(landmarks)) {
    //   this.currentGesture = 'Scissors';
    //   this.gestureIcon = '✌️';
    //   this.gestureClass = 'recognized';
    // } else {
    //   this.currentGesture = 'Unknown Gesture';
    //   this.gestureIcon = '❓';
    //   this.gestureClass = '';
    // }
  }

  private detectGameChoice(landmarks: any[]): GameChoice | null {
    // if (this.handTrackingService.isFist(landmarks)) {
    //   return 'rock';
    // } else if (this.handTrackingService.isOpenHand(landmarks)) {
    //   return 'paper';
    // } else if (this.handTrackingService.isScissorsGesture(landmarks)) {
    //   return 'scissors';
    // }
    return null;
  }

  startGame() {
    this.gameState = 'countdown';
    this.gameData.playerChoice = null;
    this.gameData.computerChoice = null;
    this.gameData.result = null;
    this.countdown = 3;

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.countdownInterval);
        this.gameState = 'playing';

        // Generate computer choice
        const choices: GameChoice[] = ['rock', 'paper', 'scissors'];
        this.gameData.computerChoice = choices[Math.floor(Math.random() * choices.length)];

        // Set timeout for player input
        this.gameTimeout = setTimeout(() => {
          if (this.gameState === 'playing') {
            // Player didn't make a choice in time
            this.gameState = 'result';
            this.gameData.result = 'lose';
            this.gameData.computerScore++;

            setTimeout(() => {
              this.gameState = 'waiting';
            }, 3000);
          }
        }, 3000); // 3 seconds to make a choice
      }
    }, 1000);
  }

  private playerMadeChoice(choice: GameChoice) {
    if (this.gameState !== 'playing' || this.gameData.playerChoice) return;

    this.gameData.playerChoice = choice;
    this.calculateResult();
    this.gameState = 'result';

    if (this.gameTimeout) {
      clearTimeout(this.gameTimeout);
    }

    // Auto-restart after showing result
    setTimeout(() => {
      this.gameState = 'waiting';
    }, 3000);
  }

  private calculateResult() {
    const { playerChoice, computerChoice } = this.gameData;

    if (!playerChoice || !computerChoice) return;

    if (playerChoice === computerChoice) {
      this.gameData.result = 'tie';
    } else if (
      (playerChoice === 'rock' && computerChoice === 'scissors') ||
      (playerChoice === 'paper' && computerChoice === 'rock') ||
      (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
      this.gameData.result = 'win';
      this.gameData.playerScore++;
    } else {
      this.gameData.result = 'lose';
      this.gameData.computerScore++;
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
    switch (this.gameData.result) {
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
    switch (this.gameData.result) {
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
    switch (this.gameState) {
      case 'waiting':
        return 'Start Game';
      case 'countdown':
        return `Starting in ${this.countdown}...`;
      case 'playing':
        return 'Make Your Gesture!';
      case 'result':
        return 'Play Again';
      default:
        return 'Start Game';
    }
  }

  getButtonClass(): string {
    switch (this.gameState) {
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
