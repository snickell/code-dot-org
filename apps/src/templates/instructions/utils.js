import ReactDOM from 'react-dom';
import $ from 'jquery';

/**
 * @param {ReactComponent} component
 * @param {boolean} includeMargin
 * @returns {number} The current computed height in pixels of the specified component,
 * including padding, border, and (optionally) margins.
 */
export function getOuterHeight(component, includeMargin=false) {
  return $(ReactDOM.findDOMNode(component)).outerHeight(includeMargin);
}

/**
 * Manually scrolls the specified element by the specified delta
 * @param {Element} element The element to scroll
 * @param {number} deltaY The distance (positive or negative) in pixels
 *        to scroll by
 * @param {number} animate If specified, the animation time in ms
 */
export function scrollBy(element, deltaY, animate=400) {
  const newScrollTop = element.scrollTop + deltaY;
  scrollTo(element, newScrollTop, animate);
}

export function scrollTo(element, scrollTop, animate=400) {
  if (animate) {
    let $elem = $(element);
    if (!$elem.is(':animated')) {
      $elem.animate({
        scrollTop: scrollTop
      }, animate);
    }
  } else {
    element.scrollTop = scrollTop;
  }
}

/**
 * Shrink the DOM element containing the given blockSpace to the minimum size
 * required to contain the block space
 * @param {BlockSpace} blockSpace - the Blockly BlockSpace to resize
 * @param {boolean} withPadding - whether or not to include padding
 * @see convertXmlToBlockly
 */
export function shrinkBlockSpaceContainer(blockSpace, withPadding) {
  const container = blockSpace.blockSpaceEditor.getSVGElement().parentNode;

  // calculate the minimum required size for the container
  const metrics = blockSpace.getMetrics();
  let height = metrics.contentHeight;
  let width = metrics.contentWidth;

  if (withPadding) {
    height += metrics.contentTop * 2;
    width += metrics.contentLeft;
  }

  // and shrink it, triggering a blockspace resize when we do so
  container.style.height = height + "px";
  container.style.width = width + "px";
  blockSpace.blockSpaceEditor.svgResize();
}

/**
 * Converts any inline XML in the container element into embedded
 * readonly BlockSpaces
 * @param {Element} xmlContainer The element in which to search for XML
 */
export function convertXmlToBlockly(xmlContainer) {
  const xmls = xmlContainer.getElementsByTagName('xml');

  Array.prototype.forEach.call(xmls, function (xml) {
    // embedded blocks can be displayed either "inline" as part of a paragraph
    // or "block" all on their own. "block" is the default.
    const inline = xml.parentNode.tagName === "P";

    // create a container and insert the blockspace into it
    const blockSpaceContainer = document.createElement(inline ? 'span' : 'div');
    if (inline) {
      // SVGs don't play nicely if they're rendered into purely inline elements,
      // so if our container is a span it should be inline-block
      blockSpaceContainer.style.display = "inline-block";
    }
    xml.parentNode.insertBefore(blockSpaceContainer, xml);
    const blockSpace = Blockly.BlockSpace.createReadOnlyBlockSpace(blockSpaceContainer, xml, {
      noScrolling: true,
      inline: inline
    });

    // give block embeds more padding than inline
    const withPadding = !inline;

    // finally, shrink the container to exactly contain the blockspace. Note
    // that some blocks (like K1 harvester blocks, which use FieldImages) can
    // resize after initial render, so we also want to resize the container
    // whenever a blockSpaceChange results in the content size changing.
    let metrics = blockSpace.getMetrics();
    blockSpace.getCanvas().addEventListener('blocklyBlockSpaceChange', function () {
      const oldHeight = metrics.contentHeight;
      const oldWidth = metrics.contentWidth;
      const newHeight = blockSpace.getMetrics().contentHeight;
      const newWidth = blockSpace.getMetrics().contentWidth;

      // if the blockspace's content size has changed, kick off another sync and
      // save the new metrics as the old ones
      if (newHeight !== oldHeight || newWidth !== oldWidth) {
        shrinkBlockSpaceContainer(blockSpace, withPadding);
        metrics = blockSpace.getMetrics();
      }
    });

    shrinkBlockSpaceContainer(blockSpace, withPadding);
  });
}

export function shouldDisplayChatTips(skinId) {
  /*eslint-disable no-fallthrough*/
  switch (skinId) {
    // skins without avatars
    case 'calc':
    case 'eval':
    case 'jigsaw':
    // skins with licensed avatars
    case 'infinity':
    case 'anna':
    case 'elsa':
    case 'craft':
    // star wars
    case 'hoc2015':
    case 'hoc2015x':
      return false;
    default:
      return true;
  }
  /*eslint-enable no-fallthrough*/
}
