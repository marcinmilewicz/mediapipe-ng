import { GestureRecognizerResult } from '@mediapipe/tasks-vision';
import { GestureType } from '../gesture-tracking.model';

export const gestureResultParser = (results: GestureRecognizerResult): GestureType => {
  if (!results.gestures.length) {
    return 'None';
  }

  return results.gestures[0][0].categoryName as GestureType;
};
