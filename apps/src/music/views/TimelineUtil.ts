// The width of one measure.
export const barWidth = 60;
// Leave some vertical space between each event block.
export const eventVerticalSpace = 2;
// A little room on the left.
export const paddingOffset = 10;

// The height of the primary timeline area for drawing events.  This is the height of each measure's
// vertical bar.
const timelineHeight = 130;

export const getEventHeight = (
  numUniqueRows: number,
  availableHeight = timelineHeight
) => {
  // While we might not actually have this many rows to show,
  // we will limit each row's height to the size that would allow
  // this many to be shown at once.
  const minVisible = 5;

  const maxVisible = 26;

  // We might not actually have this many rows to show, but
  // we will size the bars so that this many rows would show.
  const numSoundsToShow = Math.max(
    Math.min(numUniqueRows, maxVisible),
    minVisible
  );

  return Math.floor(availableHeight / numSoundsToShow);
};
