import fontConstants from '@cdo/apps/fontConstants';
import color from '@cdo/apps/util/color';

import {BlocklyWrapperType} from '../types';
export default function initializeCss(blocklyWrapper: BlocklyWrapperType) {
  blocklyWrapper.Css.register(
    `.fieldGridDropDownContainer.blocklyMenu .blocklyMenuItem {
      padding: 0px;
      border: none;
    }
    .fieldGridDropDownContainer .blocklyMenuItem.blocklyMenuItemSelected {
      background-color: white;
    }
    /* A special class for image dropdown fields with all-white images */
    .transparentContainer .blocklyMenuItem.blocklyMenuItemSelected {
      background-color: rgba(1, 1, 1, 0.25);
    }
    /* Change look of focus/highlighted cell */
    .fieldGridDropDownContainer .blocklyMenuItem.blocklyMenuItemHighlight {
      box-shadow: 0 0 0 4px hsla(0.57, 10%, 34%, .2);
    }
    .blocklyMenuItemContent > img {
      object-fit: contain;
    }

    .blocklyFlyoutButton {
      fill: ${color.brand_secondary_default};
      cursor: pointer;
    }
    .blocklyFlyoutButtonShadow {
      fill: none;
    }
    .blocklyFlyoutButton:hover {
      fill: ${color.brand_secondary_dark};
    }
    /* Change look of the editor in angle fields */
    .blocklyAngleCircle {
      fill: ${color.white};
    }
    .blocklyAngleGauge {
      fill: ${color.brand_secondary_default};
    }
    .blocklyAngleLine {
      stroke: ${color.brand_secondary_dark};
      stroke-width: 3;
    }
    .blocklyLimit rect {
      fill: ${color.brand_accent_default};
    }
    .blocklyLimit.overLimit rect {
      fill: ${color.product_caution_default};
    }
    .blocklyLimit.overLimit text {
      fill: ${color.neutral_dark} !important;
    }
    .fieldAngleDropDownContainer .blocklyAngleHelperContainer {
      box-shadow: 4px 4px 6px #bbb;
      border-width: 1px;
      float: right;
    }
    .fieldAngleDropDownContainer .blocklyMenu{
      float: left;
    }
    .fieldAngleDropDownContainer .blocklyMenu::after {
      content: '';
      border-left: 1px solid #949ca2;
      position: absolute;
      height: 80%;
      right: 0;
      top: 10%;
    }
    .fieldAngleDropDownContainer .blocklyMenuItem{
      min-width: 0em;
    }
    .k1ColourDropdown>tr>td {
      height: 35px;
      width: 45px;
    }
    .blocklyDropDownDiv .blocklyMenu {
      font-family: ${fontConstants['main-font']};
      font-weight: 400 !important; // Noto Sans Math only supports the normal font-weight
    }
    `
  );
}
