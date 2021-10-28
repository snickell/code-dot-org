import React from 'react';
import PropTypes from 'prop-types';
import {Draggable} from 'react-beautiful-dnd';
import {grid} from './CodeReviewGroup';

// A CodeReviewGroupMember is a component that
// can be dragged between CodeReviewGroups
// as teachers arrange students in their section into groups.
// These are called "Draggables" in the package we're using (React Beautiful DnD).
// More information on React Beautiful DnD can be found here:
// https://github.com/atlassian/react-beautiful-dnd
export default function CodeReviewGroupMember({followerId, name, index}) {
  return (
    <Draggable
      key={followerId}
      draggableId={followerId.toString()}
      index={index}
      tab-index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getMemberStyle(
            snapshot.isDragging,
            provided.draggableProps.style
          )}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around'
            }}
          >
            {name}
          </div>
        </div>
      )}
    </Draggable>
  );
}

CodeReviewGroupMember.propTypes = {
  followerId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired
};

const getMemberStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the group members look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: grid,
  borderRadius: '30px',
  color: 'white',
  width: 'auto',
  height: '20px',

  // change background colour if dragging
  background: isDragging ? 'navy' : '#0094CA',

  // styles we need to apply on draggables
  ...draggableStyle
});
