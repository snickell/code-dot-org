import React from 'react';

import {expect} from '../../../util/configuredChai';

const label = require('@cdo/apps/applab/designElements/label');
const library = require('@cdo/apps/applab/designElements/library');

function getRect(e) {
  return {
    left: parseInt(e.style.left, 10),
    top: parseInt(e.style.top, 10),
    width: parseInt(e.style.width, 10),
    height: parseInt(e.style.height, 10)
  };
}

function setText(e, newText) {
  const before = label.beforePropertyChange(e, 'text');
  e.innerHTML = newText;
  label.onPropertyChange(e, 'text', newText, before);
}

function setFontSize(e, newFontSize) {
  const before = label.beforePropertyChange(e, 'fontSize');
  e.style.fontSize = newFontSize + 'px';
  label.onPropertyChange(e, 'fontSize', newFontSize, before);
}

function expectWider(newRect, oldRect) {
  expect(newRect.top).is.equal(oldRect.top, 'top should be the same');
  expect(newRect.width).is.above(oldRect.width, 'should be wider');
}

function expectWiderAlignLeft(newRect, oldRect) {
  expectWider(newRect, oldRect);
  expect(newRect.left).is.equal(oldRect.left, 'left should be the same');
}

function expectWiderAlignCenter(newRect, oldRect) {
  expectWider(newRect, oldRect);
  expect(newRect.left).is.below(oldRect.left, 'should move left');
  const deltaWidth = newRect.width - oldRect.width;
  expect(newRect.left).is.above(oldRect.left - deltaWidth, 'should not move too far left');
}

function expectWiderAlignRight(newRect, oldRect) {
  expectWider(newRect, oldRect);
  const deltaWidth = newRect.width - oldRect.width;
  expect(newRect.left).is.equal(oldRect.left - deltaWidth, 'should move left');
}

describe('Applab designElements/label component', function () {

  let e;
  const NEW_TEXT = 'longer text';

  beforeEach(() => {
    e = library.createElement(library.ElementType.LABEL, 50 /* left */, 40 /* top */, true /* withoutId */);
  });

  it('changing text changes size to fit', () => {
    const oldRect = getRect(e);
    setText(e, NEW_TEXT);
    expectWiderAlignLeft(getRect(e), oldRect);
  });

  it('changing font size changes size to fit', () => {
    const oldRect = getRect(e);
    setFontSize(e, 28);
    expectWiderAlignLeft(getRect(e), oldRect);
  });

  it('changing text while center aligned retains alignment', () => {
    e.style.textAlign = 'center';
    const oldRect = getRect(e);
    setText(e, NEW_TEXT);
    expectWiderAlignCenter(getRect(e), oldRect);
  });

  it('changing font size while center aligned retains alignment', () => {
    e.style.textAlign = 'center';
    const oldRect = getRect(e);
    setFontSize(e, 28);
    expectWiderAlignCenter(getRect(e), oldRect);
  });

  it('changing text while right aligned retains alignment', () => {
    e.style.textAlign = 'right';
    const oldRect = getRect(e);
    setText(e, NEW_TEXT);
    expectWiderAlignRight(getRect(e), oldRect);
  });

  it('changing font size while right aligned retains alignment', () => {
    e.style.textAlign = 'right';
    const oldRect = getRect(e);
    setFontSize(e, 28);
    expectWiderAlignRight(getRect(e), oldRect);
  });

  it('after resizing, changing text does not change size to fit', () => {
    e.style.width = (getRect(e).width + 20) + 'px';
    const oldRect = getRect(e);
    setText(e, NEW_TEXT);
    expect(getRect(e)).to.deep.equal(oldRect);
  });

  it('after resizing, changing font size does not change size to fit', () => {
    e.style.width = (getRect(e).width + 20) + 'px';
    const oldRect = getRect(e);
    setFontSize(e, 28);
    expect(getRect(e)).to.deep.equal(oldRect);
  });

  it('after resizing close enough, changing text changes size to fit', () => {
    e.style.width = (getRect(e).width + 4) + 'px';
    const oldRect = getRect(e);
    setText(e, NEW_TEXT);
    expectWiderAlignLeft(getRect(e), oldRect);
  });

  it('after resizing close enough, changing font size changes size to fit', () => {
    e.style.width = (getRect(e).width + 4) + 'px';
    const oldRect = getRect(e);
    setFontSize(e, 28);
    expectWiderAlignLeft(getRect(e), oldRect);
  });
});