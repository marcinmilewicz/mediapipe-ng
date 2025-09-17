export function createGestureMap<T extends { name: string }>(gestures: T[]) {
  return gestures.reduce(
    (acc: Record<string, (typeof gestures)[number]>, gesture: T) => {
      acc[gesture.name] = gesture;
      return acc;
    },
    {} as Record<string, (typeof gestures)[number]>,
  );
}

export interface RecognizedGesture {
  description: string;
  icon: string;
  name: string;
}
