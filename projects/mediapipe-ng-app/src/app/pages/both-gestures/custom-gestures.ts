import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import {
  gestureResultParser,
  GestureTracking,
  GestureTrackingService,
  informationResultParser,
} from 'mediapipe-ng';
import { filter } from 'rxjs';
import { Camera } from '../../components/camera/camera';
import { GestureGuide } from '../../components/gesture-guide/gesture-guide';
import { GestureStatus } from '../../components/gesture-status/gesture-status';
import { createGestureMap } from '../../utils';

const EXTENDED_GESTURE = [
  {
    icon: '🤙',
    description: 'Call',
    name: 'call',
  },
  {
    icon: '👎',
    description: 'Dislike',
    name: 'dislike',
  },
  { icon: '✊', description: 'Fist', name: 'fist' },
  {
    icon: '👍',
    description: 'Like',
    name: 'like',
  },
  {
    icon: '🤫',
    description: 'Mute',
    name: 'mute',
  },
  {
    icon: '🖐️',
    description: 'Palm',
    name: 'palm',
  },
  {
    icon: '✋',
    description: 'Stop',
    name: 'stop',
  },
  {
    icon: '✋',
    description: 'Stop',
    name: 'stop_inverted',
  },
  {
    icon: '✌️',
    description: 'Peace',
    name: 'peace',
  },
  {
    icon: '✌️',
    description: 'Peace inverted',
    name: 'peace_inverted',
  },
  {
    icon: '👌',
    description: 'Ok',
    name: 'ok',
  },
  {
    icon: '❓️',
    description: 'None',
    name: 'None',
  },
];

const GESTURE_MAP = createGestureMap(EXTENDED_GESTURE);

@Component({
  selector: 'app-custom-gestures',
  standalone: true,
  imports: [CommonModule, GestureGuide, Camera, GestureStatus],
  templateUrl: './custom-gestures.html',
  styleUrls: ['./custom-gestures.scss'],
})
export class CustomGestures implements OnDestroy {
  private readonly handTrackingService = inject(GestureTrackingService);

  protected readonly allHandledGesture = signal(EXTENDED_GESTURE.slice(0, -1));
  protected readonly currentGesture = signal(GESTURE_MAP['None']);
  protected readonly currentGesture2 = signal(GESTURE_MAP['None']);
  protected readonly currentGestureInformation = signal('');
  protected readonly currentGestureInformation2 = signal('');

  protected tracking: GestureTracking | undefined;

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
        baseOptions: { modelAssetPath: 'gesture_extended_2_recognizer.task' },
        numHands: 3,
      },
    });

    this.tracking.gestureRecognizerResult.pipe(filter(Boolean)).subscribe((results) => {
      this.currentGestureInformation.set(informationResultParser()(results).description);
      this.currentGestureInformation2.set(informationResultParser(1)(results).description);
      this.currentGesture.set(GESTURE_MAP[gestureResultParser()(results) ?? 'None']);
      this.currentGesture2.set(GESTURE_MAP[gestureResultParser(1)(results) ?? 'None']);
    });
  }

  ngOnDestroy() {
    this.tracking?.stopTracking();
  }
}
