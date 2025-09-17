import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RecognizedGesture } from './.././../utils';

@Component({
  selector: 'app-gesture-status',
  imports: [CommonModule],
  template: `<h3>Current Gesture</h3>

    <div class="gesture-display" [ngClass]="{ recognized: gesture()?.name !== 'None' }">
      <span class="gesture-icon">{{ gesture()?.icon }}</span>
      <span class="gesture-name">{{ gesture()?.description }}</span>
      <span> {{ information() }}</span>
    </div>`,
  styleUrls: ['./gesture-status.component.scss'],
})
export class GestureStatus {
  gesture = input<RecognizedGesture>();
  information = input<string>();
}
