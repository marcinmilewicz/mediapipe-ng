import { GestureRecognizerResult } from '@mediapipe/tasks-vision';
import { GestureType } from '../gesture-tracking.model';

export const gestureResultParser =
  (index = 0) =>
  (results: GestureRecognizerResult): GestureType => {
    if (!results.gestures.length || index >= results.gestures.length) {
      return 'None';
    }

    return results.gestures[index][0].categoryName as GestureType;
  };
