import { GestureRecognizerResult } from '@mediapipe/tasks-vision';
import { GestureType } from './../gesture-tracking.model';

interface InformationResult<Type> {
  categoryName: Type | 'None';
  categoryScore: number;
  handedness?: 'Right' | 'Left';
  description: string;
}

export const informationResultParser =
  (index = 0) =>
  <Type = GestureType>(results: GestureRecognizerResult): InformationResult<Type> => {
    if (!results.gestures.length || index >= results.gestures.length) {
      return { categoryName: 'None', categoryScore: 100, description: '' };
    }

    const categoryName = results.gestures[index][0].categoryName as Type;
    const categoryScore = results.gestures[index][0].score * 100;
    const handedness = results.handedness[index][0].displayName as 'Right' | 'Left';
    const description = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore.toFixed(2)} %\n Handedness: ${handedness}`;
    console.log(results);
    return { categoryName, categoryScore, handedness, description };
  };
