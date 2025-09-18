import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RecognizedGesture } from '../../utils';

@Component({
  selector: 'app-gesture-guide',
  imports: [CommonModule],
  template: `<h3>Try These Gestures</h3>
    <div class="gesture-list">
      @for (gesture of gestures(); track gesture.name) {
        <div class="gesture-item">
          <span class="item-icon">{{ gesture.icon }}</span>
          <span class="item-desc">{{ gesture.description }}</span>
        </div>
      }
    </div>`,
  styleUrls: ['./gesture-guide.scss'],
})
export class GestureGuide {
  gestures = input<RecognizedGesture[]>();
}
