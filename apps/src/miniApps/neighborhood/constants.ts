export enum NeighborhoodSignalType {
  // Move the painter
  MOVE = 'MOVE',
  // Initialize the painter
  INITIALIZE_PAINTER = 'INITIALIZE_PAINTER',
  // Add paint to the current location
  PAINT = 'PAINT',
  // Remove all paint from current location
  REMOVE_PAINT = 'REMOVE_PAINT',
  // Take paint from the bucket
  TAKE_PAINT = 'TAKE_PAINT',
  // Hide the painter on the screen
  HIDE_PAINTER = 'HIDE_PAINTER',
  // Show the painter on the screen
  SHOW_PAINTER = 'SHOW_PAINTER',
  // Turn the painter left
  TURN_LEFT = 'TURN_LEFT',
  // Hide all paint buckets
  HIDE_BUCKETS = 'HIDE_BUCKETS',
  // Show all paint buckets
  SHOW_BUCKETS = 'SHOW_BUCKETS',
  // We will not receive any more commands
  DONE = 'DONE',
}

export enum NeighborhoodExceptionType {
  INVALID_GRID = 'INVALID_GRID',
  INVALID_DIRECTION = 'INVALID_DIRECTION',
  GET_SQUARE_FAILED = 'GET_SQUARE_FAILED',
  INVALID_COLOR = 'INVALID_COLOR',
  INVALID_LOCATION = 'INVALID_LOCATION',
  INVALID_MOVE = 'INVALID_MOVE',
  INVALID_PAINT_LOCATION = 'INVALID_PAINT_LOCATION',
}

export const NeighborhoodExceptionMessage: Record<
  NeighborhoodExceptionType,
  string
> = {
  [NeighborhoodExceptionType.INVALID_GRID]:
    'There was an error loading the neighborhood level. Please contact us at support@code.org, and be sure to include the URL to this page in your message.',
  [NeighborhoodExceptionType.INVALID_DIRECTION]:
    "The direction provided is not recognized. Supported directions are 'north', 'south', 'east', and 'west'.",
  [NeighborhoodExceptionType.GET_SQUARE_FAILED]:
    "The square specified isn't on the grid.",
  [NeighborhoodExceptionType.INVALID_COLOR]:
    'The provided color name is not recognized. Refer to the documentation to see what color names are supprted.',
  [NeighborhoodExceptionType.INVALID_LOCATION]:
    "The location specified isn't on the grid.",
  [NeighborhoodExceptionType.INVALID_MOVE]:
    'Painter tried to move off the grid or into an obstacle.',
  [NeighborhoodExceptionType.INVALID_PAINT_LOCATION]:
    'Painter tried to paint off the grid or over an obstacle.',
};
