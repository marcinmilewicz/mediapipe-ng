import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-score-board',
  imports: [CommonModule],
  template: ` <h3>Score</h3>
    <div class="scores">
      <div class="score-item player">
        <span class="score-label">You</span>
        <span class="score-value">{{ playerScore() }}</span>
      </div>
      <div class="score-divider">-</div>
      <div class="score-item computer">
        <span class="score-label">Computer</span>
        <span class="score-value">{{ computerScore() }}</span>
      </div>
    </div>`,
  styleUrls: ['./score-board.scss'],
})
export class ScoreBoard {
  playerScore = input();
  computerScore = input();
}
