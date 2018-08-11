import React, { Component } from 'react';
import PopUpMenu from "../../lib/ui/PopUpMenu";
import i18n from '@cdo/locale';
import color from "../../util/color";
import {columnWidths, rowHeight} from "./AssignmentVersionMenuItem";

const cellStyle = {
  display: 'inline-block',
  marginTop: 11,
};

const style = {
  item: {
    backgroundColor: color.charcoal,
    ':hover': {
      backgroundColor: color.charcoal,
    },
    cursor: 'default',
  },
  wrapper: {
    fontSize: 16,
    height: rowHeight,
    color: 'white',
  },
  selectedColumn: {
    ...cellStyle,
    width: columnWidths.selected,
    marginLeft: -10,
  },
  titleColumn: {
    ...cellStyle,
    width: columnWidths.title,
  },
  statusColumn: {
    ...cellStyle,
    width: columnWidths.status,
    marginRight: -10,
  },
};

export default class AssignmentVersionMenuHeader extends Component {
  render() {
    return (
      <PopUpMenu.Item onClick={() => {}} style={style.item}>
        <div style={style.wrapper}>
          <span style={style.selectedColumn}/>
          <span style={style.titleColumn}>
            {i18n.version()}
          </span>
          <span style={style.statusColumn}/>
        </div>
      </PopUpMenu.Item>
    );
  }
}
