import { DrawingUtils, GestureRecognizer, GestureRecognizerResult } from '@mediapipe/tasks-vision';

export const drawLandmarkConnectors = (
  results: GestureRecognizerResult,
  canvasCtx: CanvasRenderingContext2D,
) => {
  const drawingUtils = new DrawingUtils(canvasCtx);
  if (results?.landmarks) {
    for (const landmarks of results.landmarks) {
      drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 2,
      });
      drawingUtils.drawLandmarks(landmarks, {
        color: '#FF0000',
        lineWidth: 1,
        radius: 2,
      });
    }
  }
};
