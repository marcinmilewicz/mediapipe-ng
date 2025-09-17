import { GestureRecognizerResult } from '@mediapipe/tasks-vision';
import { GestureType } from '../gesture-tracking.model';
type IncludesNone<T extends string> = 'None' extends T ? T : never;

export const gestureResultParser =
  (index = 0) =>
  <Type extends string = GestureType>(results: GestureRecognizerResult): IncludesNone<Type> => {
    if (!results.gestures.length || index >= results.gestures.length) {
      return 'None' as IncludesNone<Type>;
    }

    return results.gestures[index][0].categoryName as IncludesNone<Type>;
  };
