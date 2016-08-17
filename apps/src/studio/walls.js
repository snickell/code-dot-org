export default class Walls {
  constructor(level, skin) {
    this.gridAlignedMovement = level.gridAlignedMovement;
    this.wallCollisionRectOffsetX = skin.wallCollisionRectOffsetX;
    this.wallCollisionRectOffsetY = skin.wallCollisionRectOffsetY;
    this.wallCollisionRectWidth = skin.wallCollisionRectWidth;
    this.wallCollisionRectHeight = skin.wallCollisionRectHeight;
  }

  setBackground(background) {
    this.background = background;
  }

  setWallMapRequested(wallMapRequested) {
    this.wallMapRequested = wallMapRequested;
  }

  willCollidableTouchWall(collidable, xCenter, yCenter) {
    var width = collidable.width;
    var height = collidable.height;

    if (!this.gridAlignedMovement) {
      xCenter += this.wallCollisionRectOffsetX;
      yCenter += this.wallCollisionRectOffsetY;
      width = this.wallCollisionRectWidth || width;
      height = this.wallCollisionRectHeight || height;
    }

    Studio.drawDebugRect("avatarCollision", xCenter, yCenter, width, height);
    return this.willRectTouchWall(xCenter, yCenter, width, height);
  }

  willRectTouchWall(xCenter, yCenter, width, height) {
    return false;
  }

  overlappingTest(x1, x2, xVariance, y1, y2, yVariance) {
    return (Math.abs(x1 - x2) < xVariance) && (Math.abs(y1 - y2) < yVariance);
  }

}
