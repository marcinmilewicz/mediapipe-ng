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

const BASIC_GESTURE = [
  {
    icon: '✊',
    description: 'Fist',
    name: 'Closed_Fist',
  },
  {
    icon: '✋',
    description: 'Open Hand',
    name: 'Open_Palm',
  },
  {
    icon: '👆',
    description: 'Pointing',
    name: 'Pointing_Up',
  },
  {
    icon: '👍',
    description: 'Thumb Up',
    name: 'Thumb_Up',
  },
  {
    icon: '👎',
    description: 'Thumb Down',
    name: 'Thumb_Down',
  },
  {
    icon: '✌️',
    description: 'Victory',
    name: 'Victory',
  },
  {
    icon: '❓️',
    description: 'None',
    name: 'None',
  },
];

const GESTURE_MAP = createGestureMap(BASIC_GESTURE);

@Component({
  selector: 'app-basic-gestures',
  standalone: true,
  imports: [CommonModule, GestureGuide, Camera, GestureStatus],
  templateUrl: './basic-gestures.html',
  styleUrls: ['./basic-gestures.scss'],
})
export class BasicGestures implements OnDestroy {
  private readonly handTrackingService = inject(GestureTrackingService);

  protected readonly currentGesture = signal(GESTURE_MAP['None']);
  protected readonly allHandledGesture = signal(BASIC_GESTURE.slice(0, -1));
  protected readonly currentGestureInformation = signal('');

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
    });

    this.tracking.gestureRecognizerResult.pipe(filter(Boolean)).subscribe((results) => {
      this.currentGestureInformation.set(informationResultParser()(results).description);
      this.currentGesture.set(GESTURE_MAP[gestureResultParser()(results) ?? 'None']);
      console.log(results);
    });
  }

  ngOnDestroy() {
    this.tracking?.stopTracking();
  }
}
