import { Injectable, signal } from '@angular/core';
import {
  FilesetResolver,
  GestureRecognizer,
  GestureRecognizerOptions,
  GestureRecognizerResult,
} from '@mediapipe/tasks-vision';
import { BehaviorSubject } from 'rxjs';
import { drawLandmarkConnectors } from '../drawings/basic-hand-landmarks';
import { GestureTracking, GestureTrackingConfig } from './gesture-tracking.model';

const videoHeight = '360px';
const videoWidth = '480px';

const createGestureRecognizer = async (gestureRecognizerOptions?: GestureRecognizerOptions) => {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
  );

  const defaultOptions: GestureRecognizerOptions = {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
      delegate: 'GPU',
    },
    numHands: 1,
    runningMode: 'VIDEO',
  };

  const options: GestureRecognizerOptions = {
    ...defaultOptions,
    ...gestureRecognizerOptions,
    baseOptions: {
      ...defaultOptions.baseOptions,
      ...gestureRecognizerOptions?.baseOptions,
    },
  };

  return await GestureRecognizer.createFromOptions(vision, options);
};

const canHandleUserMedia = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

@Injectable({
  providedIn: 'root',
})
export class GestureTrackingService {
  async initializeTracking({
    videoElement,
    canvasElement,
    drawings = [drawLandmarkConnectors],
    recognizer,
    gestureRecognizerOptions,
  }: GestureTrackingConfig): Promise<GestureTracking> {
    if (!gestureRecognizerOptions && !recognizer) {
      recognizer = await createGestureRecognizer();
    }

    if (gestureRecognizerOptions && !recognizer) {
      recognizer = await createGestureRecognizer(gestureRecognizerOptions);
    }

    const canvasCtx = canvasElement.getContext('2d')!;
    const gestureRecognizerResult = new BehaviorSubject<GestureRecognizerResult | null>(null);
    const webcamRunning = signal(false);
    const predictionRunning = signal(false);
    let lastVideoTime = -1;

    if (canHandleUserMedia()) {
      enableCamera();
      webcamRunning.set(true);
    } else {
      console.warn('getUserMedia() is not supported by your browser');
    }

    return {
      gestureRecognizerResult: gestureRecognizerResult.asObservable(),
      webcamRunning,
      predictionRunning,
      stopTracking: () => {
        webcamRunning.set(false);
        if (videoElement?.srcObject) {
          (videoElement.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
        }
      },
    };

    function enableCamera() {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then((stream) => {
          if (!videoElement) {
            return;
          }

          videoElement.srcObject = stream;
          videoElement?.addEventListener('loadeddata', () => predictWebcam());

          predictionRunning.set(true);
        });
    }

    async function predictWebcam() {
      if (!canvasElement || !canvasCtx || !videoElement || !recognizer) {
        return;
      }

      if (videoElement?.currentTime !== lastVideoTime) {
        const nowInMs = Date.now();
        lastVideoTime = videoElement?.currentTime;
        const results = recognizer?.recognizeForVideo(videoElement as HTMLVideoElement, nowInMs);

        canvasCtx?.save();
        canvasCtx?.clearRect(0, 0, canvasElement?.width, canvasElement?.height);

        canvasElement.style.height = videoHeight;
        videoElement.style.height = videoHeight;
        canvasElement.style.width = videoWidth;
        videoElement.style.width = videoWidth;

        canvasCtx?.restore();

        gestureRecognizerResult.next(results);
        drawings?.forEach((draw) => draw(results, canvasCtx));
      }

      if (webcamRunning()) {
        window.requestAnimationFrame(() => predictWebcam());
      }
    }
  }
}
