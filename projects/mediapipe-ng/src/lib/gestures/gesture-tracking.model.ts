import { Signal } from '@angular/core';
import { GestureRecognizer, GestureRecognizerOptions, GestureRecognizerResult } from '@mediapipe/tasks-vision';
import { Observable } from 'rxjs';

export interface GestureTrackingConfig {
  videoElement: HTMLVideoElement;
  canvasElement: HTMLCanvasElement;
  drawings?: ((
    results: GestureRecognizerResult,
    canvasContext: CanvasRenderingContext2D,
  ) => void)[];
  recognizer?: GestureRecognizer;
  gestureRecognizerOptions?: GestureRecognizerOptions
}

export interface GestureTracking {
  gestureRecognizerResult: Observable<GestureRecognizerResult | null>;
  webcamRunning: Signal<boolean>;
  predictionRunning: Signal<boolean>;
  stopTracking: () => void;
}

export type GestureType =
  | 'Closed_Fist'
  | 'ILoveYou'
  | 'None'
  | 'Open_Palm'
  | 'Pointing_Up'
  | 'Thumb_Down'
  | 'Thumb_Up'
  | 'Victory';
